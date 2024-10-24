const admin = require("firebase-admin");
const db = admin.firestore();
const { isImageUrl, validateAccessDate } = require("../utils");
const { v4: uuidv4 } = require("uuid");

const createCourse = async (req, res) => {
  try {
    const { nome, modulos, externalId, userId } = req.body;

    if (!nome) {
      return res.status(400).send("O campo nome é obrigatório");
    }

    if (modulos && !Array.isArray(modulos)) {
      return res.status(400).send("O campo modulos deve ser um array");
    }

    const courseId = uuidv4();
    const posicoesUtilizadas = new Set();
    const modulosComPosicaoEspecifica = [];
    const modulosSemPosicao = [];

    if (modulos) {
      for (let i = 0; i < modulos.length; i++) {
        const modulo = modulos[i];
        modulo.id = uuidv4();
        if (!modulo.nome) {
          return res
            .status(400)
            .send(`O módulo na posição ${i + 1} não tem nome`);
        }
        modulo.dataCriacao = new Date();

        if (modulo.capa && !isImageUrl(modulo.capa)) {
          return res
            .status(400)
            .send(`A capa do módulo '${modulo.nome}' não é uma URL válida`);
        }

        if (
          typeof modulo.posicao === "number" &&
          !posicoesUtilizadas.has(modulo.posicao)
        ) {
          posicoesUtilizadas.add(modulo.posicao);
          modulosComPosicaoEspecifica.push(modulo);
        } else {
          modulosSemPosicao.push(modulo);
        }
      }

      modulosComPosicaoEspecifica.sort((a, b) => a.posicao - b.posicao);
    }

    const maiorPosicaoEspecifica =
      modulosComPosicaoEspecifica.length > 0
        ? modulosComPosicaoEspecifica[modulosComPosicaoEspecifica.length - 1]
          .posicao
        : 0;

    let posicaoAtual = maiorPosicaoEspecifica;
    const modulosSemPosicaoComPosicao = modulosSemPosicao.map((modulo) => ({
      ...modulo,
      posicao: ++posicaoAtual,
    }));

    const modulosOrdenados = [
      ...modulosComPosicaoEspecifica,
      ...modulosSemPosicaoComPosicao,
    ];

    const newDocRef = db.collection("cursos").doc(courseId);

    await newDocRef.set({
      nome,
      externalId,
      userId,
      dataCriacao: new Date(),
      modulos: modulosOrdenados,
    });

    return res.status(201).send({
      id: newDocRef.id,
      nome,
      externalId,
      userId,
      dataCriacao: new Date(),
    });
  } catch (error) {
    console.error("Error creating course: ", error);
    return res.status(500).send({
      message: "Erro ao criar curso",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const user = req.user;

    const chunkSize = 30;

    // Firebase has a limit of 30 for "in" clauses
    // Function to split array into chunks
    const chunkArray = (arr, size) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
      );

    // Function to get courses by chunks of externalIds
    const getCoursesByExternalIds = async (externalIds) => {
      const chunks = chunkArray(externalIds, chunkSize);
      const courses = [];
      for (const chunk of chunks) {
        const coursesSnapshot = await db
          .collection("cursos")
          .where("externalId", "in", chunk)
          .get();
        coursesSnapshot.forEach((doc) => {
          courses.push({
            id: doc.id,
            ...doc.data(),
            dataCriacao: doc.data().dataCriacao.toDate().toISOString(),
          });
        });
      }
      return courses;
    };

    if (user && user.isAdmin) {
      if (req.query.externalId) {
        const externalIds = req.query.externalId.split(',');
        const courses = await getCoursesByExternalIds(externalIds);
        return res.status(200).json(courses);
      } else {
        const coursesSnapshot = await db
          .collection("cursos")
          .orderBy("dataCriacao")
          .get();
        const courses = [];
        coursesSnapshot.forEach((doc) => {
          courses.push({
            id: doc.id,
            ...doc.data(),
            dataCriacao: doc.data().dataCriacao.toDate().toISOString(),
          });
        });
        return res.status(200).json(courses);
      }
    }

    if (!(user && user.cursos)) {
      return res.status(200).json([]);
    }

    const accessibleCourseIds = user.cursos
      .filter((curso) => validateAccessDate(curso.acesso))
      .map((curso) => curso.cursoId);

    if (!(accessibleCourseIds.length > 0)) {
      return res.status(200).json([]);
    }

    const courses = await getCoursesByExternalIds(accessibleCourseIds);

    if (!req.query.externalId) {
      return res.status(200).json(courses);
    }

    const filteredCourses = courses.filter(course =>
      req.query.externalId.split(',').includes(course.externalId)
    );
    return res.status(200).json(filteredCourses);
  } catch (error) {
    console.error("Error getting courses: ", error);
    return res.status(500).send("Erro ao buscar cursos");
  }
};

const addModulesToCourse = async (req, res) => {
  try {
    const { modulos } = req.body;
    const cursoDoc = req.cursoDoc;
    const cursoData = req.cursoData;

    if (!Array.isArray(modulos) || modulos.length === 0) {
      return res
        .status(400)
        .send("O campo modulos deve ser um array não vazio");
    }

    const posicoesUtilizadas = new Set(
      cursoData.modulos.map((m) => m.posicao),
    );
    const novosModulosComPosicaoEspecifica = [];
    const novosModulosSemPosicao = [];

    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];
      modulo.id = uuidv4();
      if (!modulo.nome) {
        return res
          .status(400)
          .send(`O módulo na posição ${i + 1} não tem nome`);
      }
      modulo.dataCriacao = new Date();

      if (modulo.capa && !isImageUrl(modulo.capa)) {
        return res
          .status(400)
          .send(`A capa do módulo '${modulo.nome}' não é uma URL válida`);
      }

      if (
        typeof modulo.posicao === "number" &&
        !posicoesUtilizadas.has(modulo.posicao)
      ) {
        posicoesUtilizadas.add(modulo.posicao);
        novosModulosComPosicaoEspecifica.push(modulo);
      } else {
        novosModulosSemPosicao.push(modulo);
      }
    }

    novosModulosComPosicaoEspecifica.sort((a, b) => a.posicao - b.posicao);

    const maiorPosicaoEspecifica =
      novosModulosComPosicaoEspecifica.length > 0
        ? novosModulosComPosicaoEspecifica[
          novosModulosComPosicaoEspecifica.length - 1
        ].posicao
        : Math.max(0, ...cursoData.modulos.map((m) => m.posicao));

    let posicaoAtual = maiorPosicaoEspecifica;
    const novosModulosSemPosicaoComPosicao = novosModulosSemPosicao.map(
      (modulo) => ({
        ...modulo,
        posicao: ++posicaoAtual,
      }),
    );

    const modulosAtualizados = [
      ...cursoData.modulos,
      ...novosModulosComPosicaoEspecifica,
      ...novosModulosSemPosicaoComPosicao,
    ];

    await cursoDoc.ref.update({
      modulos: modulosAtualizados,
    });

    return res.status(200).send("Módulos adicionados com sucesso");
  } catch (error) {
    console.error("Error adding modules: ", error);
    return res.status(500).send("Erro ao adicionar módulos");
  }
};

const updateCourseModules = async (req, res) => {
  try {
    const updatedModules = req.body.modulos;
    const cursoDoc = req.cursoDoc;
    let cursoData = req.cursoData;

    if (!updatedModules || !Array.isArray(updatedModules)) {
      return res.status(400).send("O campo modulos deve ser um array");
    }

    let existingModules = cursoData.modulos || [];
    let existingModulesMap = new Map(existingModules.map((m) => [m.id, m]));

    const posicoesUtilizadas = new Set(
      existingModules
        .filter((m) => !updatedModules.find((mod) => mod.id === m.id))
        .map((m) => m.posicao),
    );

    const aulasCollectionRef = db.collection('aulas');

    updatedModules.forEach((mod) => {
      if (mod.id && existingModulesMap.has(mod.id)) {
        let existingMod = existingModulesMap.get(mod.id);

        if (mod.nome === "") {
          mod.nome = existingMod.nome;
        }

        const newAulas =
          existingMod.aulas?.map((aula) => {
            const newAula = mod.aulas.find((a) => a.id === aula.id);
            const aulaDocRef = aulasCollectionRef.doc(aula.id);
            if (newAula && newAula.posicao) {
              aulaDocRef.update({ posicao: newAula.posicao });
            }
            if (newAula) {
              return {
                ...aula,
                ...newAula,
                posicao: newAula.posicao || aula.posicao || 0,
              };
            } else {
              return aula;
            }
          }) || [];
        existingMod = {
          ...existingMod,
          ...mod,
          nome: mod.nome || existingMod.nome,
          aulas: newAulas,
          dataCriacao: existingMod.dataCriacao,
        };

        if (mod.capa !== undefined) {
          if (mod.capa === "") delete existingMod.capa;
          else if (!isImageUrl(mod.capa)) {
            return res.status(400).send("O campo capa deve ser uma URL válida");
          }
        }

        if (mod.posicao === "") {
          delete existingMod.posicao;
        } else if (
          typeof mod.posicao === "number" &&
          !posicoesUtilizadas.has(mod.posicao)
        ) {
          posicoesUtilizadas.add(mod.posicao);
        }

        existingModulesMap.set(mod.id, existingMod);
      }
    });

    let maiorPosicaoEspecifica = Math.max(...posicoesUtilizadas, 0);
    existingModulesMap.forEach((mod, id) => {
      if (mod.posicao === undefined) {
        mod.posicao = ++maiorPosicaoEspecifica;
      }
    });

    existingModules = Array.from(existingModulesMap.values());
    existingModules.sort((a, b) => a.posicao - b.posicao);

    // Update modules in course
    await cursoDoc.ref.update({
      modulos: existingModules,
    });

    response_data = existingModules.map((module) => {
      module.aulas = (module.aulas || []).map((aula) => ({
        id: aula.id,
        nome: aula.nome,
        posicao: aula.posicao,
      }));
      return {
        id: module.id,
        nome: module.nome,
        posicao: module.posicao,
        capa: module.capa,
        aulas: module.aulas,
      };
    });

    return res.status(200).json(response_data);
  } catch (error) {
    console.error("Error updating course modules: ", error);
    return res.status(500).send("Erro ao atualizar módulos do curso");
  }
};

const removeModulesFromCourse = async (req, res) => {
  try {
    const { moduloIds } = req.body;
    const cursoDoc = req.cursoDoc;
    const cursoData = req.cursoData;

    if (!Array.isArray(moduloIds) || moduloIds.length === 0) {
      return res
        .status(400)
        .send("O campo moduloIds deve ser um array não vazio de IDs");
    }

    const modulosAtualizados = cursoData.modulos.filter(
      (modulo) => !moduloIds.includes(modulo.id),
    );

    if (modulosAtualizados.length === cursoData.modulos.length) {
      return res.status(404).send("Nenhum módulo foi encontrado para remover");
    }

    await cursoDoc.ref.update({
      modulos: modulosAtualizados,
    });

    return res.status(200).send("Módulos removidos com sucesso");
  } catch (error) {
    console.error("Error removing modules: ", error);
    return res.status(500).send("Erro ao remover módulos");
  }
};

const updateCourse = async (req, res) => {
  try {
    const { capa, nome } = req.body;
    const cursoDoc = req.cursoDoc;
    const cursoData = req.cursoData;

    if (capa) {
      if (!isImageUrl(capa)) {
        return res.status(400).send("O campo capa deve ser uma URL válida");
      }
    }

    if (capa) {
      cursoData.capa = capa
    } else if (cursoData.capa && (capa === null || capa === undefined)) {
      delete cursoData.capa;
    }

    if (nome) cursoData.nome = nome;

    await cursoDoc.ref.update(cursoData);

    return res.status(200).send("Curso atualizado com sucesso");
  } catch (error) {
    console.error("Error updating course: ", error);
    return res.status(500).send("Erro ao atualizar curso");
  }
};

const deleteCourse = async (req, res) => {
  try {
    const cursoDoc = req.cursoDoc;
    await cursoDoc.ref.delete();

    return res.status(200).send("Curso deletado com sucesso");
  } catch (error) {
    console.error("Error deleting course: ", error);
    return res.status(500).send("Erro ao deletar curso");
  }
};

const listCourseUsers = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { lastEmail } = req.query;
    const { limit } = req.query;
    const { search } = req.query;

    if (!cursoId) {
      return res.status(400).send("ID do curso é necessário.");
    }

    let query = db
      .collection("usuarios")
      .where("cursosIds", "array-contains", cursoId)
      .orderBy('email', 'desc')

    if (search) {
      query = query.where("email", ">=", search).where("email", "<=", search + "\uf8ff");
    }
    const count = await query.count().get()

    if (lastEmail) {
      query = query.startAfter(lastEmail);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    usersSnapshot = await query.get();


    let users = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const acesso = userData.cursos.find(c => c.cursoId === cursoId)?.acesso;
      users.push({
        id: doc.id,
        name: userData.name,
        email: userData.email,
        acesso: acesso === 'lifetime' ? acesso : acesso.toDate().toISOString(),
      });
    });

    return res.status(200).json({ count: count.data().count, results: users });
  } catch (error) {
    console.error("Erro ao listar usuários do curso:", error);
    res.status(500).send("Erro interno no servidor.");
  }
};

module.exports = {
  createCourse,
  addModulesToCourse,
  updateCourseModules,
  removeModulesFromCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  listCourseUsers,
};

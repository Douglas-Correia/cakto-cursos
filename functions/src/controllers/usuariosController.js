const admin = require("firebase-admin");
const db = admin.firestore();
exports.db = db;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validarEmail } = require("../utils");

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (req.user.isAdmin) {
      return res
        .status(500)
        .send("Não é possível obter dados de um administrador.");
    }
    const cursoId = req.query.cursoId;

    if (cursoId && user.cursos) {
      const curso = user.cursos.find((curso) => curso.cursoId === cursoId);
      if (curso) {
        user.cursos = [curso];
      }
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário administrador:", error);
    res.status(500).send("Erro interno no servidor.");
  }
};

const evaluateLesson = async (req, res) => {
  try {
    const { cursoId, aulaId, nota } = req.body;

    if (!cursoId || !aulaId) {
      return res
        .status(400)
        .send("Dados necessários para a operação não foram fornecidos.");
    }

    if (nota !== undefined && (nota < 1 || nota > 5)) {
      return res.status(400).send("A nota deve estar entre 1 e 5.");
    }

    const userData = req.user;
    const curso = userData.cursos.find((c) => c.cursoId === cursoId);

    if (!curso) {
      return res.status(404).send("Curso não encontrado.");
    }

    const aulaIndex = curso.aulasConcluidas.findIndex(
      (a) => a.aulaId === aulaId,
    );

    if (aulaIndex > -1) {
      if (!nota) {
        curso.aulasConcluidas.splice(aulaIndex, 1);
      } else {
        curso.aulasConcluidas[aulaIndex].nota = nota;
      }
    } else {
      const novaAula = { aulaId, dataConclusao: new Date() };
      if (nota !== undefined) {
        novaAula.nota = nota;
      }
      curso.aulasConcluidas.push(novaAula);
    }

    let updatedAulasConcluidasIds = [];
    if ((userData.aulasConcluidasIds || []).includes(aulaId)) {
      updatedAulasConcluidasIds = userData.aulasConcluidasIds;
    } else {
      updatedAulasConcluidasIds = [...userData.aulasConcluidasIds, aulaId];
    }

    const userRef = db.collection("usuarios").doc(userData.id);
    await userRef.update({
      cursos: userData.cursos,
      aulasConcluidasIds: updatedAulasConcluidasIds,
    });

    res.status(200).json(userData);
  } catch (error) {
    console.error("Erro ao avaliar a aula:", error);
    res.status(500).send("Erro interno no servidor.");
  }
};

const setAdminPassword = async (req, res) => {
  try {
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).send("Senha não fornecida");
    }

    const adminQuerySnapshot = await db
      .collection("usuarios")
      .where("isAdmin", "==", true)
      .limit(1)
      .get();

    if (adminQuerySnapshot.empty) {
      const adminDocRef = await db.collection("usuarios").add({
        isAdmin: true,
        senha: bcrypt.hashSync(senha, 10),
      });

      return res.status(201).send("Administrador criado com sucesso");
    } else {
      const adminUserDoc = adminQuerySnapshot.docs[0];
      const adminUser = adminUserDoc.data();

      if (!adminUser.senha) {
        await adminUserDoc.ref.update({
          senha: bcrypt.hashSync(senha, 10),
        });

        return res
          .status(200)
          .send("Senha do administrador configurada com sucesso");
      } else {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
          return res
            .status(401)
            .send(
              "Acesso negado. É necessário autenticação para alterar a senha.",
            );
        }

        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          if (!payload.isAdmin || payload.userId !== adminUserDoc.id) {
            return res
              .status(401)
              .send(
                "Ação não permitida. Usuário autenticado não é o administrador.",
              );
          }
        } catch (error) {
          return res.status(400).send("Token inválido ou expirado.");
        }

        await adminUserDoc.ref.update({
          senha: bcrypt.hashSync(senha, 10),
        });

        return res
          .status(200)
          .send("Senha do administrador alterada com sucesso");
      }
    }
  } catch (error) {
    return res.status(500).send("Erro no servidor: " + error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send("ID do usuário não fornecido");
    }

    const userSnapshot = await db.collection("usuarios").doc(userId).get();

    if (!userSnapshot.exists) {
      return res.status(404).send("Usuário não encontrado");
    }

    const user = userSnapshot.data();

    const token = jwt.sign(
      { userId: userSnapshot.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).send({ token });
  } catch (error) {
    return res.status(500).send("Erro no servidor: " + error.message);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).send("Senha não fornecida");
    }

    const adminQuerySnapshot = await db
      .collection("usuarios")
      .where("isAdmin", "==", true)
      .limit(1)
      .get();

    if (adminQuerySnapshot.empty) {
      return res.status(401).send("Credenciais inválidas");
    }

    const adminDoc = adminQuerySnapshot.docs[0];
    const adminUser = adminDoc.data();

    const senhaCorreta = bcrypt.compareSync(senha, adminUser.senha);
    if (!senhaCorreta) {
      return res.status(401).send("Credenciais inválidas");
    }

    const token = jwt.sign(
      { userId: adminDoc.id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send("Erro no servidor: " + error.message);
  }
};

const createUser = async (req, res) => {
  try {
    const { email, foto, idExterno } = req.body;

    if (!email || !validarEmail(email)) {
      return res.status(400).send("Email inválido ou não fornecido");
    }

    if (idExterno) {
      const usuarioComId = await db.collection("usuarios").doc(idExterno).get();
      if (usuarioComId.exists) {
        return res.status(400).send("Um usuário com esse ID já existe");
      }
    }

    const usuarioExistente = await db
      .collection("usuarios")
      .where("email", "==", email)
      .get();
    if (!usuarioExistente.empty) {
      return res.status(400).send("Um usuário com esse email já existe");
    }

    let userData = {
      email,
      cursos: [],
      cursosIds: [],
      aulasConcluidasIds: [],
      externalId: idExterno,
    };

    if (foto) userData.foto = foto;

    let userId;
    if (idExterno) {
      await db.collection("usuarios").doc(idExterno).set(userData);
      userId = idExterno;
    } else {
      const usuarioDocRef = await db.collection("usuarios").add(userData);
      userId = usuarioDocRef.id;
    }

    res.status(201).send({ userId, ...userData });
  } catch (error) {
    res.status(500).send("Erro ao criar o usuário: " + error.message);
  }
};

const editUser = async (req, res) => {
  try {
    const { userId, email, foto, idExterno } = req.body;

    if (!userId) {
      return res.status(400).send("ID do usuário é necessário.");
    }
    if (email && !validarEmail(email)) {
      return res.status(400).send("Email fornecido é inválido.");
    }

    const userRef = db.collection("usuarios").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("Usuário não encontrado.");
    }

    const atualizacoes = {};
    if (email) atualizacoes.email = email;
    if (foto) atualizacoes.foto = foto;
    if (idExterno) atualizacoes.idExterno = idExterno;

    await userRef.update(atualizacoes);
    return res.status(200).send("Usuário atualizado com sucesso.");
  } catch (error) {
    console.error("Erro ao editar o usuário:", error);
    res.status(500).send("Erro interno no servidor.");
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send("ID do usuário é necessário.");
    }
    if (req.user.id === userId) {
      return res
        .status(400)
        .send("Não é possível deletar a própria conta administradora.");
    }

    const userRef = db.collection("usuarios").doc(userId);
    await userRef.delete();
    return res.status(200).send("Usuário deletado com sucesso.");
  } catch (error) {
    console.error("Erro ao deletar o usuário:", error);
    res.status(500).send("Erro interno no servidor.");
  }
};

const addCourseToUser = async (req, res) => {
  try {
    const { userId, cursoId, acesso } = req.body;

    if (!userId || !cursoId) {
      return res.status(400).send("Dados necessários não foram fornecidos.");
    }

    const userRef = db.collection("usuarios").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("Usuário não encontrado.");
    }

    const user = userDoc.data();
    const existeCurso = user.cursos.some((curso) => curso.cursoId === cursoId);

    if (existeCurso) {
      // userRef.update({
      //   cursos: user.cursos.filter((curso) => curso.cursoId !== cursoId),
      //   cursosIds: user.cursosIds.filter((cursoId) => cursoId !== cursoId),
      // })
      user.cursos = user.cursos.filter((curso) => curso.cursoId !== cursoId);
      user.cursosIds = user.cursosIds.filter((cursoId) => cursoId !== cursoId);
    }

    let dataAcesso;
    if (acesso && acesso !== "lifetime") {
      let dataEnviada = new Date(acesso);
      if (!isNaN(dataEnviada.getTime())) {
        dataAcesso = dataEnviada;
      } else {
        return res.status(400).send("A data de acesso fornecida é inválida.");
      }
    } else {
      dataAcesso = "lifetime";
    }

    const novoCurso = {
      cursoId,
      aulasConcluidas: [],
      inscricao: new Date(),
      acesso: dataAcesso,
    };

    await userRef.update({
      cursos: [...user.cursos, novoCurso],
      cursosIds: [...user.cursosIds, cursoId],
    });
    return res.status(200).send("Curso adicionado ao usuário com sucesso.");
  } catch (error) {
    console.error("Erro ao adicionar curso ao usuário:", error);
    res.status(500).send("Erro interno no servidor.");
  }
};

const removeCourseFromUser = async (req, res) => {
  try {
    const { userId, cursoId } = req.body;

    if (!userId || !cursoId) {
      return res.status(400).send("Dados necessários não foram fornecidos.");
    }

    const userRef = db.collection("usuarios").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("Usuário não encontrado.");
    }

    const user = userDoc.data();
    const cursosAtualizados = user.cursos.filter(
      (curso) => curso.cursoId !== cursoId,
    );
    const cursosIdsAtualizados = user.cursosIds.filter(
      (cursoId) => cursoId !== cursoId,
    );

    await userRef.update({
      cursos: cursosAtualizados,
      cursosIds: cursosIdsAtualizados,
    });
    return res.status(200).send("Curso removido do usuário com sucesso.");
  } catch (error) {
    console.error("Erro ao remover curso do usuário:", error);
    res.status(500).send("Erro interno no servidor.");
  }
};

const editUserCourse = async (req, res) => {
  try {
    const { userId, cursoId, inscricao, acesso } = req.body;

    if (!userId || !cursoId) {
      return res.status(400).send("Dados necessários não foram fornecidos.");
    }

    const userRef = db.collection("usuarios").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("Usuário não encontrado.");
    }

    const user = userDoc.data();
    const cursoIndex = user.cursos.findIndex(
      (curso) => curso.cursoId === cursoId,
    );

    if (cursoIndex === -1) {
      return res.status(404).send("Curso não encontrado no usuário.");
    }

    const cursoAtualizado = { ...user.cursos[cursoIndex] };
    if (inscricao) cursoAtualizado.inscricao = inscricao;
    if (acesso) cursoAtualizado.acesso = acesso;

    user.cursos[cursoIndex] = cursoAtualizado;

    await userRef.update({
      cursos: user.cursos,
    });
    return res
      .status(200)
      .send("Informações do curso do usuário atualizadas com sucesso.");
  } catch (error) {
    console.error("Erro ao editar informações do curso do usuário:", error);
    res.status(500).send("Erro interno no servidor.");
  }
};

module.exports = {
  getCurrentUser,
  evaluateLesson,
  setAdminPassword,
  loginUser,
  createUser,
  loginAdmin,
  editUser,
  deleteUser,
  addCourseToUser,
  removeCourseFromUser,
  editUserCourse,
};

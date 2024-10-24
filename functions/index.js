require("dotenv").config();

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
admin.initializeApp();

const app = express();

const usuariosRoutes = require("./src/routes/usuariosRoutes");
const cursosRoutes = require("./src/routes/cursosRoutes");
const aulasRoutes = require("./src/routes/aulasRoutes");
const { getCourseDoc } = require("./src/utils");

app.use(cors({ origin: true }));

app.use(express.json());

app.use("/usuarios", usuariosRoutes);
app.use("/cursos", cursosRoutes);
app.use("/aulas", aulasRoutes);

exports.api = functions.https.onRequest(app);

exports.onCourseDeleted = functions.firestore
  .document("cursos/{cursoId}")
  .onDelete(async (snap, context) => {
    const beforeData = snap.data();
    const externalId = beforeData.externalId
    const batch = admin.firestore().batch();

    const aulasRef = admin
      .firestore()
      .collection("aulas")
      .where("cursoId", "==", externalId);
    const aulasSnapshot = await aulasRef.get();
    aulasSnapshot.forEach((aulaDoc) => {
      batch.delete(aulaDoc.ref);
    });

    const usuariosRef = admin
      .firestore()
      .collection("usuarios")
      .where("cursosIds", "array-contains", externalId);
    const usuariosSnapshot = await usuariosRef.get();
    usuariosSnapshot.forEach((userDoc) => {
      const cursosAtualizados = userDoc
        .data()
        .cursos.filter((curso) => curso.cursoId !== externalId);
      const cursosIdsAtualizados = userDoc
        .data()
        .cursosIds.filter((id) => id !== externalId);

      batch.update(userDoc.ref, { cursos: cursosAtualizados, cursosIds: cursosIdsAtualizados }
      );
    });

    return batch.commit();
  });

exports.onCourseUpdated = functions.firestore
  .document("cursos/{cursoId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    const batch = admin.firestore().batch();
    let changesMade = false;

    const modulosAntes = new Set((before.modulos || []).map((mod) => mod.id));
    const modulosDepois = new Set((after.modulos || []).map((mod) => mod.id));

    const modulosExcluidos = new Set([...modulosAntes].filter(
      (id) => !modulosDepois.has(id),
    ));

    for (const modId of modulosExcluidos) {
      const aulasRef = admin
        .firestore()
        .collection("aulas")
        .where("moduloId", "==", modId);
      const aulasSnapshot = await aulasRef.get();
      aulasSnapshot.forEach((aulaDoc) => {
        batch.delete(aulaDoc.ref);
        changesMade = true;
      });
    }

    before.modulos.forEach((moduloAntes) => {
      if (modulosExcluidos.has(moduloAntes.id)) {
        const moduloDepois = after.modulos.find(
          (mod) => mod.id === moduloAntes.id,
        );
        if (moduloDepois) {
          const aulasAntes = new Set(
            (moduloAntes.aulas || []).map((aula) => aula.id),
          );
          const aulasDepois = new Set(
            (moduloDepois.aulas || []).map((aula) => aula.id),
          );

          const aulasRemovidasModulo = [...aulasAntes].filter(
            (id) => !aulasDepois.has(id),
          );

          for (const aulaId of aulasRemovidasModulo) {
            batch.delete(admin.firestore().collection("aulas").doc(aulaId));
            changesMade = true;
          }
        }
      }
    });

    return changesMade ? batch.commit() : null;
  });

exports.addLessonToModule = functions.firestore
  .document("aulas/{aulaId}")
  .onCreate(async (snap, context) => {
    const newLessonData = snap.data();
    const cursoId = newLessonData.cursoId;
    const moduloId = newLessonData.moduloId;

    try {
      const courseDoc = await getCourseDoc(cursoId);
      if (!courseDoc) {
        console.log("Curso não encontrado para adicionar aulas");
        return null;
      }

      const cursoData = courseDoc.data();
      const modulo = cursoData.modulos.find((mod) => mod.id === moduloId);

      if (!modulo) {
        console.log("Módulo não encontrado no curso.");
        return null;
      }

      const newLesson = {
        id: snap.id,
        nome: newLessonData.nome,
        posicao: newLessonData.posicao,
        dataCriacao: newLessonData.dataCriacao,
      };

      if (newLessonData.capa) newLesson.capa = newLessonData.capa;

      modulo.aulas = [...(modulo.aulas || []), newLesson];

      modulo.aulas.sort((a, b) => {
        if (a.posicao !== b.posicao) {
          return a.posicao - b.posicao;
        }
        return a.dataCriacao.toMillis() - b.dataCriacao.toMillis();
      });

      await courseDoc.ref.update({ modulos: cursoData.modulos });

      console.log("Aula adicionada e módulo reordenado com sucesso.");
      return null;
    } catch (error) {
      console.error("Erro ao adicionar e reordenar aulas:", error);
      return null;
    }
  });

exports.updateLessonInModule = functions.firestore
  .document("aulas/{aulaId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const cursoId = afterData.cursoId;
    const moduloId = afterData.moduloId;
    const aulaId = context.params.aulaId;

    if (
      beforeData.nome === afterData.nome &&
      beforeData.posicao === afterData.posicao &&
      beforeData.capa === afterData.capa &&
      beforeData.dataCriacao === afterData.dataCriacao
    ) {
      console.log(
        "Nenhuma alteração relevante na aula para atualizar no curso.",
      );
      return null;
    }

    try {
      const courseDoc = await getCourseDoc(cursoId);
      if (!courseDoc) {
        console.log("Curso não encontrado para atualizar aulas.");
        return null;
      }

      const cursoData = courseDoc.data();
      const moduloIndex = cursoData.modulos.findIndex(
        (mod) => mod.id === moduloId,
      );

      if (moduloIndex === -1) {
        console.log("Módulo não encontrado no curso.");
        return null;
      }

      const aulaRef = admin.firestore().collection("aulas").doc(aulaId);
      const aulaDoc = await aulaRef.get();
      const updatedLesson = aulaDoc.data();
      updatedLesson.id = aulaId;

      const aulaIndex = cursoData.modulos[moduloIndex].aulas.findIndex(
        (aula) => aula.id === aulaId,
      );
      if (aulaIndex > -1) {
        cursoData.modulos[moduloIndex].aulas[aulaIndex] = updatedLesson;

        cursoData.modulos[moduloIndex].aulas.sort((a, b) => {
          if (a.posicao !== b.posicao) {
            return a.posicao - b.posicao;
          }
          return a.dataCriacao.toMillis() - b.dataCriacao.toMillis();
        });
      } else {
        console.log("Aula não encontrada no módulo.");
        return null;
      }

      await courseDoc.ref.update(cursoData);

      console.log("Aula atualizada no módulo com sucesso.");
      return null;
    } catch (error) {
      console.error("Erro ao atualizar aula no módulo:", error);
      return null;
    }
  });

exports.removeLessonFromModule = functions.firestore
  .document("aulas/{aulaId}")
  .onDelete(async (snap, context) => {
    const deletedLessonId = context.params.aulaId;
    const deletedLessonData = snap.data();
    const cursoId = deletedLessonData.cursoId;
    const moduloId = deletedLessonData.moduloId;

    const updateCourse = async () => {
      const courseDoc = await getCourseDoc(cursoId);
      if (!courseDoc) {
        console.log("Curso não encontrado para remover aulas.");
        return null;
      }

      const cursoData = courseDoc.data();
      const moduloIndex = cursoData.modulos.findIndex(
        (mod) => mod.id === moduloId,
      );
      if (moduloIndex === -1) {
        console.log(
          "Módulo não encontrado no curso. Nenhuma ação necessária no curso.",
        );
        return;
      }

      const modulo = cursoData.modulos[moduloIndex];
      modulo.aulas = (modulo.aulas || []).filter(
        (aula) => aula.id !== deletedLessonId,
      );

      await courseDoc.ref.update({ modulos: cursoData.modulos });
      console.log("Aula removida do módulo com sucesso.");
    };

    const updateUserProgress = async () => {
      const usersSnapshot = await admin
        .firestore()
        .collection("usuarios")
        .where("aulasConcluidasIds", "array-contains", deletedLessonId)
        .get();

      for (const userDoc of usersSnapshot.docs) {
        const userRef = userDoc.ref;
        const userData = userDoc.data();

        const cursosAtualizados = userData.cursos.map((curso) => {
          if (curso.aulasConcluidas) {
            curso.aulasConcluidas = curso.aulasConcluidas.filter(
              (aula) => aula.aulaId !== deletedLessonId,
            );
          }
          return curso;
        });

        await userRef.update({
          cursos: cursosAtualizados,
          aulasConcluidasIds: userData.aulasConcluidasIds.filter((id) => id !== deletedLessonId),
        });
      }

      console.log("Referências à aula removida dos usuários com sucesso.");
    };

    await Promise.all([updateCourse(), updateUserProgress()]);
  });

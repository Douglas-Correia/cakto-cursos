const admin = require("firebase-admin");
const db = admin.firestore();

const getCourseById = async (externalId) => {
  const querySnapshot = await db
  .collection("cursos")
  .where("externalId", "==", externalId)
  .limit(1)
  .get();

  if (querySnapshot.empty) {
    return null;
  }
  const course = querySnapshot.docs[0].data();

  // Replace course.modules.aulas with the actual lesson data
  const modulos = await Promise.all(
    course.modulos.map(async (modulo) => {
      if (modulo.aulas) {
        const aulas = await Promise.all(
          modulo.aulas.map(async (aula) => {
            const aulaRef = db.collection("aulas").doc(aula.id);
            const aulaDoc = await aulaRef.get();
            return {
              id: aula.id,
              nome: aulaDoc.data().nome,
              capa: aulaDoc.data().capa,
              posicao: aulaDoc.data().posicao,
            };
          }),
        );
        modulo.aulas = aulas;
      }
      return {
        id: modulo.id,
        capa: modulo.capa,
        nome: modulo.nome,
        posicao: modulo.posicao,
        aulas: modulo.aulas,
      };
    }),
  );

  course.modulos = modulos;
  return {
    nome: course.nome,
    capa: course.capa,
    externalId: course.externalId,
    modulos: course.modulos,
  };
};

module.exports = { getCourseById };

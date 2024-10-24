const admin = require("firebase-admin");
const db = admin.firestore();

exports.isImageUrl = (url) => {
  try {
    url = new URL(url);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

async function getCourseDoc(externalId) {
  const querySnapshot = await db.collection("cursos")
    .where("externalId", "==", externalId)
    .limit(1)
    .get();
  if (querySnapshot.empty) {
    return false;
  }
  return querySnapshot.docs[0];
}

async function getLessonDoc(lessonId) {
  const lessonDoc = await db.collection("aulas").doc(lessonId).get();
  if (!lessonDoc.exists) {
    return false;
  }
  return lessonDoc;
}

async function userTemAcessoAoCurso(user, cursoId) {
  if (!user.cursos) return false;
  return user.cursos.some(
    (curso) => curso.cursoId === cursoId
      && validateAccessDate(curso.acesso)
  );
}

async function userIsOwner(user, cursoData) {
  if (!user.cursos) return false;
  return String(cursoData.userId) === String(user.id);
}

const validarEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const validateAccessDate = (acesso) => {
  if (acesso === "lifetime") {
    return true;
  }

  return new Date(acesso.toDate()) >= new Date();
}

exports.getCourseDoc = getCourseDoc;
exports.userTemAcessoAoCurso = userTemAcessoAoCurso;
exports.userIsOwner = userIsOwner;
exports.getLessonDoc = getLessonDoc;
exports.validarEmail = validarEmail;
exports.validateAccessDate = validateAccessDate;

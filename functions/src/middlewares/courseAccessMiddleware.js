const { getCourseDoc, getLessonDoc, userTemAcessoAoCurso } = require("../utils");

async function courseAccessMidleware(req, res, next) {
    let { lessonId } = req.params;
    if (!lessonId) {
        lessonId = req.body.aulaId;
    }
    let cursoDoc = null;
    let lessonDoc = null;

    externalId = req.body.cursoId || req.params.cursoId || req.query.cursoId;

    if (lessonId) {
        lessonDoc = await getLessonDoc(lessonId);
        if (!lessonDoc) {
            return res.status(404).send("Aula não encontrada");
        }
        cursoDoc = await getCourseDoc(lessonDoc.data().cursoId);
    }

    if (!cursoDoc && externalId) {
        cursoDoc = await getCourseDoc(externalId);
    }

    if (!cursoDoc) {
        return res.status(404).send("Recurso não encontrado");
    }
    const cursoData = cursoDoc.data()

    const temAcesso = await userTemAcessoAoCurso(req.user, cursoData.externalId) || req.user.isAdmin;
    if (!temAcesso) {
        return res.status(403).send("Acesso negado.");
    }

    // If the user has access, add the cursoData to the request object
    req.cursoData = cursoData;
    req.cursoDoc = cursoDoc;

    if (lessonDoc) {
        req.lessonData = lessonDoc.data();
        req.lessonDoc = lessonDoc;
    }

    // Call the next middleware function
    next();
}

module.exports = courseAccessMidleware;

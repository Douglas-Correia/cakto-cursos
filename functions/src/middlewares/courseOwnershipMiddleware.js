const { getCourseDoc, getLessonDoc, userIsOwner } = require("../utils");

async function courseOwnershipMiddleware(req, res, next) {
    let { cursoId: externalId, lessonId } = req.params;
    let cursoDoc = null;
    let lessonDoc = null;

    if (!externalId) {
        externalId = req.body.externalId;
    }

    if (lessonId) {
        lessonDoc = await getLessonDoc(lessonId);
        if (!lessonDoc) {
            return res.status(404).send("Aula não encontrada");
        }
        cursoDoc = await getCourseDoc(lessonDoc.data().cursoId);
    }

    if (!cursoDoc) {
        cursoDoc = await getCourseDoc(externalId);
        if (!cursoDoc) {
            return res.status(404).send("Curso não encontrado");
        }
    }

    const cursoData = cursoDoc.data()

    const temAcesso = await userIsOwner(req.user, cursoData) || req.user.isAdmin;
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

module.exports = courseOwnershipMiddleware;

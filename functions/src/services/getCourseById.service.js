const coursesRepository = require("../repositories/courses.repository");
const { validateAccessDate } = require("../utils");

const execute = async ({ id, isAdmin, courses }) => {
  try {
    if (!isAdmin) {
      const courseAccess = courses.find((curso) => curso.cursoId === id && validateAccessDate(curso.acesso));

      if (!courseAccess) {
        const error = new Error("Acesso ao curso negado");
        error.statusCode = 403;
        return error;
      }
    }

    const courseSnapshot = await coursesRepository.getCourseById(id);

    if (!courseSnapshot) {
      const error = new Error("Curso não encontrado");
      error.statusCode = 404;
      return error;
    }

    return { id: courseSnapshot.id, ...courseSnapshot };
  } catch (error) {
    console.error("Error getting course by id: ", error);
    return error;
  }
};

module.exports = { execute };

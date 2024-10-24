const getCourseByIdService = require('../services/getCourseById.service');

const getCourseById = async (req, res) => {
    const id = req.params.cursoId;
    const courses = req?.user?.cursos
    const isAdmin = req?.user?.isAdmin
    const response = await getCourseByIdService.execute({ id, courses, isAdmin })
    return response?.statusCode
        ? res.status(response.statusCode).send(response.message)
        : res.status(200).json({ data: response });
}

module.exports = { getCourseById }

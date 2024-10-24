const functions = require('firebase-functions');
const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");
const { userIsOwner, isImageUrl } = require("../utils");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const crypto = require("crypto");
const queryString = require("querystring");

const getVideoToken = (req, res) => {
  const securityKey = process.env.BUNNY_TOKEN;
  const path = req.body.path;

  if (!path) {
    return res.status(500).send("Insira o path do vídeo");
  }

  const signedUrl = signUrl(
    `https://cakto.b-cdn.net${path}`,
    securityKey,
    10,
    "",
    false,
    "/",
  );

  return res.status(200).send(signedUrl);
};

const getFileToken = async (req, res) => {
  const fileKey = req.query.fileKey;
  const lessonId = req.params.lessonId;

  if (!fileKey) {
    return res.status(400).send("fileKey é obrigatório.");
  } else if (!lessonId) {
    return res.status(400).send("aulaId é obrigatório.");
  }

  const lessonData = req.lessonData

  if ((!lessonData.files?.includes(fileKey))) {
    return res.status(404).send("Arquivo não encontrado.");
  }

  const clientParams = {
    credentials: {
      accessKeyId: functions.config().aws.access_key_id,
      secretAccessKey: functions.config().aws.secret_access_key,
    },
    endpoint: functions.config().aws.s3_endpoint_url,
    region: functions.config().aws.s3_region_name,
  };
  const getObjectParams = {
    Bucket: functions.config().aws.storage_bucket_name,
    Key: fileKey
  };

  const client = new S3Client(clientParams);
  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  return res.status(200).send({ url: url });
};

const createLesson = async (req, res) => {
  try {
    const { nome, video, capa, descricao, moduloId, files, startIn, startDate, startDays } = req.body;
    const cursoData = req.cursoData;

    if (!nome || !moduloId) {
      return res
        .status(400)
        .send("Os campos nome, cursoId e moduloId são obrigatórios");
    }

    const modulo = cursoData.modulos.find((m) => m.id === moduloId);
    if (!modulo) {
      return res.status(404).send("Módulo não encontrado no curso");
    }

    const maxPosicao =
      modulo.aulas && modulo.aulas.length > 0
        ? Math.max(...modulo.aulas.map((aula) => aula.posicao))
        : 0;
    const posicao = maxPosicao + 1;

    let newLesson = {
      nome,
      moduloId,
      cursoId: cursoData.externalId,
      posicao,
      dataCriacao: new Date(),
    };

    if (video) newLesson.video = video;
    if (files) newLesson.files = files;
    if (descricao) newLesson.descricao = descricao;
    if (capa) newLesson.capa = capa;

    newLesson.startIn = startIn ? startIn : null;
    newLesson.startDate = startDate ? new Date(startDate) : null;
    newLesson.startDays = startDays ? startDays : null;

    const lessonId = uuidv4();
    await db.collection("aulas").doc(lessonId).set(newLesson);

    return res.status(201).json({
      id: lessonId,
      ...newLesson,
      dataCriacao: newLesson.dataCriacao.toISOString(),
    });
  } catch (error) {
    console.error("Error creating lesson: ", error);
    return res.status(500).send("Erro ao criar aula");
  }
};

const getAllLessons = async (req, res) => {
  try {
    const { moduloId } = req.query;

    let query = db.collection("aulas");

    if (moduloId) {
      query = query.where("moduloId", "==", moduloId);
    }

    query = query.orderBy("posicao", "asc").orderBy("dataCriacao", "asc");

    const lessonsSnapshot = await query.get();
    const lessons = [];

    lessonsSnapshot.forEach((doc) =>
      lessons.push({ id: doc.id, ...doc.data() }),
    );

    return res.status(200).json(lessons);
  } catch (error) {
    console.error("Error getting lessons: ", error);
    return res.status(500).send("Erro ao buscar aulas");
  }
};

const getLessonById = async (req, res) => {
  try {
    const lessonDoc = req.lessonDoc;
    const lessonData = req.lessonData;

    return res.status(200).json({ id: lessonDoc.id, ...lessonData });
  } catch (error) {
    console.error("Error getting lesson by ID: ", error);
    return res.status(500).send("Erro ao buscar aula pelo ID");
  }
};

const getLessonWatch = async (req, res) => {
  try {
    const lessonDoc = req.lessonDoc;
    const lessonData = req.lessonData;
    const courseId = lessonData.cursoId;

    let releaseDate;
    const hasAccess = (() => {
      if (!lessonData.startIn || lessonData.startIn === 'immediately') return true;

      if (lessonData.startIn === 'fix_date' && lessonData.startDate) {
        releaseDate = lessonData.startDate.toDate();
        return new Date() >= lessonData.startDate.toDate();
      }

      if (lessonData.startIn === 'after_days' && lessonData.startDays) {
        const user = req.user;
        if (user.isAdmin) return true;

        const userCourse = user.cursos.find((c) => c.cursoId === courseId);

        const inscricaoDate = userCourse.inscricao.toDate();
        const startDate = new Date(inscricaoDate);
        startDate.setDate(inscricaoDate.getDate() + parseInt(lessonData.startDays));

        startDate.setMinutes(startDate.getMinutes() + 1);
        releaseDate = startDate;
        return new Date() >= startDate;
      }
    })();

    if (!hasAccess) {
      return res.status(423).send({
        'nome': lessonData.nome,
        'error': 'Data de liberação da aula ainda não foi atingida.',
        'releaseDate': releaseDate.toISOString(),
      });
    }

    return res.status(200).json({ id: lessonDoc.id, ...lessonData });
  } catch (error) {
    console.error("Error getting lesson by ID: ", error);
    return res.status(500).send("Erro ao buscar aula pelo ID");
  }
};

const updateLesson = async (req, res) => {
  try {
    const { nome, video, capa, posicao, descricao, files } = req.body;

    const lessonDoc = req.lessonDoc;
    let lessonData = lessonDoc.data();

    if (nome) lessonData.nome = nome;

    if (video !== undefined) {
      if (video === "") {
        delete lessonData.video;
      } else {
        lessonData.video = video;
      }
    }

    if (files !== undefined) {
      if (lessonData.files == "") {
        delete lessonData.files;
      }
      lessonData.files = files;
    }

    if (capa !== undefined) {
      if (capa === "") delete lessonData.capa;
      else if (!isImageUrl(capa)) {
        return res.status(400).send("O campo capa deve ser uma URL válida");
      } else {
        lessonData.capa = capa;
      }
    }

    if (descricao !== undefined) {
      if (descricao === "") {
        delete lessonData.descricao;
      } else {
        lessonData.descricao = descricao;
      }
    }

    if (posicao !== undefined) {
      if (posicao === "") {
        delete lessonData.posicao;
      } else {
        lessonData.posicao = posicao;
      }
    }

    lessonData.startIn = 'startIn' in req.body ? req.body.startIn : lessonData.startIn || null;
    lessonData.startDate = req.body.startDate ? new Date(req.body.startDate) : lessonData.startDate || null;
    lessonData.startDays = req.body.startDays ? req.body.startDays : lessonData.startDays || null;

    await lessonDoc.ref.set(lessonData);

    return res.status(200).send("Aula atualizada com sucesso");
  } catch (error) {
    console.error("Error updating lesson: ", error);
    return res.status(500).send("Erro ao atualizar aula");
  }
};

const deleteLesson = async (req, res) => {
  try {
    const lessonDoc = req.lessonDoc;

    await lessonDoc.ref.delete();

    return res.status(200).send("Aula deletada com sucesso");
  } catch (error) {
    console.error("Error deleting lesson: ", error);
    return res.status(500).send("Erro ao deletar aula");
  }
};

function signUrl(
  url,
  securityKey,
  expirationTime = 3600,
  userIp,
  isDirectory = false,
  pathAllowed,
) {
  let parameterData = "",
    parameterDataUrl = "",
    signaturePath = "",
    hashableBase = "",
    token = "";
  const expires = Math.floor(new Date() / 1000) + expirationTime;
  const parsedUrl = new URL(url);
  const parameters = new URL(url).searchParams;
  if (pathAllowed != "") {
    signaturePath = pathAllowed;
    parameters.set("token_path", signaturePath);
  } else {
    signaturePath = decodeURIComponent(parsedUrl.pathname);
  }
  parameters.sort();
  if (Array.from(parameters).length > 0) {
    parameters.forEach(function (value, key) {
      if (value == "") {
        return;
      }
      if (parameterData.length > 0) {
        parameterData += "&";
      }
      parameterData += key + "=" + value;
      parameterDataUrl += "&" + key + "=" + queryString.escape(value);
    });
  }
  hashableBase =
    securityKey +
    signaturePath +
    expires +
    (userIp != null ? userIp : "") +
    parameterData;
  token = Buffer.from(
    crypto.createHash("sha256").update(hashableBase).digest(),
  ).toString("base64");
  token = token
    .replace(/\n/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  if (isDirectory) {
    return (
      parsedUrl.protocol +
      "//" +
      parsedUrl.host +
      "/bcdn_token=" +
      token +
      parameterDataUrl +
      "&expires=" +
      expires +
      parsedUrl.pathname
    );
  } else {
    return (
      parsedUrl.protocol +
      "//" +
      parsedUrl.host +
      parsedUrl.pathname +
      "?token=" +
      token +
      parameterDataUrl +
      "&expires=" +
      expires
    );
  }
}

module.exports = {
  createLesson,
  getAllLessons,
  getLessonById,
  getLessonWatch,
  updateLesson,
  deleteLesson,
  getVideoToken,
  getFileToken,
};

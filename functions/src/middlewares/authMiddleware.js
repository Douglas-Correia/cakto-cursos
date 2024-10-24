const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const db = admin.firestore();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).send("Acesso negado. Nenhum token fornecido.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const userSnapshot = await db.collection("usuarios").doc(userId).get();
    const user = userSnapshot.data();
    user.id = userSnapshot.id;

    if (user) {
      req.user = user;
      next();
    } else {
      return res
        .status(403)
        .send("Acesso negado. Você não tem as permissões necessárias.");
    }
  } catch (error) {
    res.status(400).send("Token inválido.");
  }
};

module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const db = admin.firestore();

const isAdminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(403).send('Acesso negado. Nenhum token fornecido.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userSnapshot = await db.collection('usuarios').doc(decoded.userId).get();
    const user = userSnapshot.data();

    if (user && user.isAdmin) {
      req.user = user;
      next();
    } else {
      return res.status(403).send('Acesso negado. Você não tem as permissões necessárias.');
    }
  } catch (error) {
    res.status(400).send('Token inválido.');
  }
};

module.exports = isAdminMiddleware;

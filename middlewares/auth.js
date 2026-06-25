const jwt = require("jsonwebtoken");
const { response } = require("../helpers/response.formatter");
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json(response(401, "Akses ditolak. Token tidak ditemukan"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(response(401, "Token tidak valid atau sudah kadaluarsa"));
  }
};
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json(response(403, "Akses ditolak. Hanya admin yang diizinkan"));
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };

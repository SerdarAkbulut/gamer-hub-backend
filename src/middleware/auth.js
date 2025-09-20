const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Yetkiniz yok, token gerekli" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, "fb715973770b7d2093581ba055502c48");
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Hatalı veya süresi dolmuş token" });
  }
};

module.exports = auth;

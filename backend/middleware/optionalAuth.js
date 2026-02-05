const jwt = require("jsonwebtoken");

module.exports = function optionalAuth(req, res, next) {
  const hdr = req.headers.authorization;
  if (hdr && hdr.toLowerCase().startsWith("bearer ")) {
    const token = hdr.split(" ")[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET); // { userId, role }
    } catch (_) {}
  }
  next();
};
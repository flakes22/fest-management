const jwt = require("jsonwebtoken");

module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { userId, role }
    } catch (_) {
      // ignore invalid tokens for public routes
    }
  }
  next();
};
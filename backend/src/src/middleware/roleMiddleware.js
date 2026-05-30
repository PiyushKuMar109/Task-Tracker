const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.role) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!allowedRoles || allowedRoles.length === 0) {
        return next();
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
};

module.exports = roleMiddleware;


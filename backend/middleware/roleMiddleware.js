/* Role-based access control middleware */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    const userRoles = req.user.roles || [req.user.role];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this page.'
      });
    }

    next();
  };
};

module.exports = { authorize };

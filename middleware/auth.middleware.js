const jwt = require('jsonwebtoken');

const verifyAccessToken = (entity) => (req, res, next) => {
  const auth = req.header('Authorization')?.replace('Bearer ', '');
  if (!auth) return res.status(401).json({ message: 'Token missing',status:401  });

  const secret = entity === 'admin'
    ? process.env.JWT_SECRET_ADMIN
    : process.env.JWT_SECRET_USER;

  jwt.verify(auth, secret, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token',status:401 });
    req.user = decoded;
    next();
  });
};

module.exports = {
  verifyAdmin: verifyAccessToken('admin'),
  verifyUser: verifyAccessToken('user')
};

const Session = require('../models/Session');

const { verifyJWT } = require('../services/jwtauth');

const tokenAuth = async (req, res, next) => {
   let token = req.headers['tokenstring'];

   if (!token) {
      return res.status(400).json({
         message: 'Token not found',
         isExpired: true,
      });
   }

   let result = verifyJWT(token);

   if (!result) {
      return res.status(400).json({
         message: 'Invalid token',
         isExpired: true,
      });
   }

   let { session, err } = await Session.checkSession(token);

   if (err) {
      return res.status(500).json({
         message: 'Internal Server Error',
         error: err.message,
         isExpired: true,
      });
   }

   if (!session) {
      return res.status(400).json({
         message: 'Invalid session',
         isExpired: true,
      });
   }

   if (session.is_expired) {
      // remove session
      const res = await Session.removeSession(token);

      if (res) {
         return res.status(500).json({
            message: 'Internal Server Error',
            error: res.message,
            isExpired: true,
         });
      }

      return res.status(400).json({
         message: 'Session expired',
         isExpired: true,
      });
   }

   next();
};

module.exports = tokenAuth;

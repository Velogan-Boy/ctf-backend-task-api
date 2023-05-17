const prisma = require('../prisma/prisma');

const checkSession = async (token) => {
   try {
      const session = await prisma.sessions.findUnique({
         where: { user_token: token },
         select: { is_expired: true, user_id: true },
      });

      return { session, err: null };
   } catch (err) {
      return { session: null, err };
   }
};

const createNewSession = async (userID, token) => {
   try {
      await prisma.$executeRaw`INSERT INTO sessions (user_id,user_token,is_expired, last_login) VALUES(${userID},${token},${false}, now()) \ ON CONFLICT (user_id) DO UPDATE SET user_token=${token}, is_expired=${false}, last_login=now()`;
      return null;
   } catch (err) {
      return err;
   }
};

const expireSession = async (token) => {
   try {
      await prisma.sessions.update({
         where: { user_token: token },
         data: { is_expired: true },
      });

      return null;
   } catch (err) {
      return err;
   }
};

const removeSession = async (token) => {
   try {
      await prisma.sessions.delete({
         where: { user_token: token },
      });

      return null;
   } catch (err) {
      return err;
   }
};

const getUserBySession = async (token) => {
   try {
      const user = await prisma.sessions.findUnique({
         where: { user_token: token },
         select: {
            users: {
               select: {
                  id: true,
                  email: true,
               },
            },
         },
      });

      return { user: user.users, err: null };
   } catch (err) {
      return { user: null, err };
   }
};

module.exports = {
   checkSession,
   createNewSession,
   expireSession,
   removeSession,
   getUserBySession,
};

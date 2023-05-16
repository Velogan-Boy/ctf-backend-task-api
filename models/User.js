const prisma = require('../prisma/prisma');

// HELPER FUNCTIONS
const getUser = async (email) => {
   try {
      const user = await prisma.users.findUnique({
         where: {
            email: email,
         },
         select: {
            id: true,
            email: true,
            is_email_verified: true,
            password: true,
         },
      });

      if (!user) {
         return { user: { id: 0 }, err: null };
      }

      return { user, err: null };
   } catch (err) {
      return { user: null, err: err };
   }
};

const createUser = async (user) => {
   let result, userId;

   try {
      result = await prisma.users.create({
         data: { email: user.email, password: user.pass },
      });
      userId = result.id;

      return { userID: userId, err: null };
   } catch (err) {
      return { userID: null, err: err };
   }
};

const updatePassword = async (userID, password) => {
   try {
      await prisma.users.update({
         where: { id: userID },
         data: { password: password },
      });

      return { err: null };
   } catch (err) {
      return { err };
   }
};

const markEmailAsVerified = async (email) => {
   try {
      await prisma.$executeRaw`UPDATE users SET is_email_verified=${true} WHERE email=${email}`;
   } catch (err) {
      return err;
   }

   return null;
};

module.exports = {
   getUser,
   createUser,
   updatePassword,
   markEmailAsVerified,
};

import { PrismaClient, type User } from '@prisma/client';

export const getUserByEmail = async (email: string) => {
  const prisma = new PrismaClient();
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const addUser = async (
  id: string,
  email: string,
  data: Partial<User>
) => {
  const prisma = new PrismaClient();
  return await prisma.user.create({
    data: {
      ...data,
      id,
      email,
    },
  });
};

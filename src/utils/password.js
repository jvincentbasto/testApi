import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const hash = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};
export const compare = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

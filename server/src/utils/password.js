import bcrypt from 'bcryptjs';

// bcrypt cost factor. 10 is a reasonable default for a web API.
const SALT_ROUNDS = 10;

export const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

export const verifyPassword = (plainPassword, passwordHash) =>
  bcrypt.compare(plainPassword, passwordHash);

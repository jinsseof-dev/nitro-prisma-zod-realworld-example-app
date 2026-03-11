import jwt from 'jsonwebtoken';
import { getJwtSecret } from './jwt-secret';

export const useGenerateToken = (id: number): string =>
  jwt.sign({ user: { id } }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: '60d',
  });

import jwt from 'jsonwebtoken';
import HttpException from '~/models/http-exception.model';
import { getJwtSecret } from './jwt-secret';

export const useVerifyToken = (token: string): { id: number } => {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { user: { id: number } };
    return { id: Number(decoded.user.id) };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpException(401, { errors: { token: ['has expired'] } });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpException(401, { errors: { token: ['is invalid'] } });
    }
    throw error;
  }
};

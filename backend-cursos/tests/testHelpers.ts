import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Genera un token JWT para el administrador
 * Usuario: admin@cursos.com (id: 1)
 */
export const getAdminToken = (): string => {
  const token = jwt.sign(
    { id: 1, rol: 'admin' },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );
  return token;
};

/**
 * Genera un token JWT para un estudiante
 * Usuario: maria@email.com (id: 2)
 */
export const getStudentToken = (): string => {
  const token = jwt.sign(
    { id: 2, rol: 'estudiante' },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );
  return token;
};
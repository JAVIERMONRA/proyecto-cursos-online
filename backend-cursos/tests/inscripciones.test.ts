import request from 'supertest';
import express from 'express';
import inscripcionesRoutes from '../routes/inscripcionesRoutes';
import { getStudentToken } from './testHelpers';

const app = express();
app.use(express.json());
app.use('/inscripciones', inscripcionesRoutes);

describe('✍️ Inscripciones Controller Tests', () => {
  
  let studentToken: string;

  beforeAll(() => {
    studentToken = getStudentToken();
  });

  // Test 7: Inscribirse a un curso
  test('POST /inscripciones/:cursoId - Debe inscribir al estudiante', async () => {
    const response = await request(app)
      .post('/inscripciones/1')
      .set('Authorization', `Bearer ${studentToken}`);

    expect([200, 400]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body).toHaveProperty('message');
    }
  }, 10000);

  // Test 8: Obtener mis cursos
  test('GET /inscripciones/mis-cursos - Debe retornar cursos del estudiante', async () => {
    const response = await request(app)
      .get('/inscripciones/mis-cursos')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  }, 10000);
});
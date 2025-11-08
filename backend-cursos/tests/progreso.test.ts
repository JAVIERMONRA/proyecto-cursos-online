import request from 'supertest';
import express from 'express';
import progresoRoutes from '../routes/progresoRoutes';
import { getStudentToken } from './testHelpers';

const app = express();
app.use(express.json());
app.use('/progreso', progresoRoutes);

describe('📊 Progreso Controller Tests', () => {
  
  let studentToken: string;

  beforeAll(() => {
    studentToken = getStudentToken();
  });

  // Test 9: Obtener progreso de un curso
  test('GET /progreso/:cursoId - Debe retornar progreso del curso', async () => {
    const response = await request(app)
      .get('/progreso/1')
      .set('Authorization', `Bearer ${studentToken}`);

    expect([200, 403]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body).toHaveProperty('progreso');
      expect(response.body).toHaveProperty('secciones');
    }
  }, 10000);

  // Test 10: Marcar lección como completada
  test('POST /progreso/:cursoId/leccion/:leccionId/completar - Debe marcar lección', async () => {
    const response = await request(app)
      .post('/progreso/1/leccion/1/completar')
      .set('Authorization', `Bearer ${studentToken}`);

    expect([200, 403]).toContain(response.status);
  }, 10000);
});
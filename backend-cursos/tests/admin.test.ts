import request from 'supertest';
import express from 'express';
import adminRoutes from '../routes/adminRoutes';
import { getAdminToken } from './testHelpers';

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('👨‍💼 Admin Controller Tests', () => {
  
  let adminToken: string;

  beforeAll(() => {
    adminToken = getAdminToken();
  });

  // Test 11: Obtener estadísticas
  test('GET /admin/estadisticas - Debe retornar estadísticas del sistema', async () => {
    const response = await request(app)
      .get('/admin/estadisticas')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('cursos');
    expect(response.body).toHaveProperty('usuarios');
    expect(response.body).toHaveProperty('inscripciones');
  }, 10000);

  // Test 12: Obtener lista de usuarios
  test('GET /admin/usuarios - Debe retornar lista de usuarios', async () => {
    const response = await request(app)
      .get('/admin/usuarios')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  }, 10000);
});
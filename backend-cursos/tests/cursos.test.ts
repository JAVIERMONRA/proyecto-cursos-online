import request from 'supertest';
import express from 'express';
import cursosRoutes from '../routes/cursosRoutes';
import { getAdminToken } from './testHelpers';

const app = express();
app.use(express.json());
app.use('/cursos', cursosRoutes);

describe('📚 Cursos Controller Tests', () => {
  
  let authToken: string;

  beforeAll(() => {
    authToken = getAdminToken();
  });

  // Test 4: Listar cursos
  test('GET /cursos - Debe retornar lista de cursos', async () => {
    const response = await request(app)
      .get('/cursos');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  }, 10000);

  // Test 5: Obtener curso por ID
  test('GET /cursos/:id - Debe retornar un curso específico', async () => {
    const response = await request(app)
      .get('/cursos/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('titulo');
  }, 10000);

  // Test 6: Crear curso (solo admin)
  test('POST /cursos - Admin debe poder crear curso', async () => {
    const newCurso = {
      titulo: 'Test Course',
      descripcion: 'Descripción de prueba',
      nivel: 'principiante',
      duracion: 10
    };

    const response = await request(app)
      .post('/cursos')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newCurso);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('cursoId');
  }, 10000);
});
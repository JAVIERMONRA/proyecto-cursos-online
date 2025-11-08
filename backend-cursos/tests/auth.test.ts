import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('🔐 Auth Controller Tests', () => {
  
  // Test 1: Registro exitoso
  test('POST /auth/register - Debe registrar un nuevo usuario', async () => {
    const newUser = {
      nombre: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      rol: 'estudiante'
    };

    const response = await request(app)
      .post('/auth/register')
      .send(newUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  }, 10000);

  // Test 2: Login exitoso
  test('POST /auth/login - Debe iniciar sesión correctamente', async () => {
    const credentials = {
      email: 'admin@cursos.com',
      password: 'admin123'
    };

    const response = await request(app)
      .post('/auth/login')
      .send(credentials);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('rol');
  }, 10000);

  // Test 3: Login con credenciales incorrectas
  test('POST /auth/login - Debe fallar con contraseña incorrecta', async () => {
    const credentials = {
      email: 'admin@cursos.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/auth/login')
      .send(credentials);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  }, 10000);
});
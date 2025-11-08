import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminCursos from '../pages/AdminCursos';

jest.mock('axios');

describe('⚙️ AdminCursos Component Tests', () => {
  
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol', 'admin');
  });

  test('Debe renderizar el título de gestión de cursos', () => {
    render(
      <BrowserRouter>
        <AdminCursos />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Gestión de Cursos/i)).toBeInTheDocument();
  });
});
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MisCursos from '../pages/MisCursos';
import { AuthProvider } from '../context/AuthContext';

// Mock de axios
jest.mock('axios');

describe('📚 MisCursos Component Tests', () => {
  
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol', 'estudiante');
  });

  const renderMisCursos = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <MisCursos />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('Debe mostrar loader mientras carga', () => {
    renderMisCursos();
    
    expect(screen.getByText(/Cargando tus cursos/i)).toBeInTheDocument();
  });

  test('Debe renderizar el título de la página', async () => {
    renderMisCursos();
    
    await waitFor(() => {
      expect(screen.getByText(/Mis Cursos/i)).toBeInTheDocument();
    });
  });
});
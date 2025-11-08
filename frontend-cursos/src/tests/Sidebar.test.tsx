import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

describe('🎨 Sidebar Component Tests', () => {
  
  test('Debe renderizar sidebar de estudiante', () => {
    render(
      <BrowserRouter>
        <Sidebar rol="estudiante" />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Mis Cursos/i)).toBeInTheDocument();
    expect(screen.getByText(/Explorar Cursos/i)).toBeInTheDocument();
    expect(screen.getByText(/Mi Perfil/i)).toBeInTheDocument();
  });

  test('Debe renderizar sidebar de admin', () => {
    render(
      <BrowserRouter>
        <Sidebar rol="admin" />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Gestionar Cursos/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear Curso/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuarios/i)).toBeInTheDocument();
  });
});
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CursoDetalle from '../pages/CursoDetalle';

jest.mock('axios');

describe('📖 CursoDetalle Component Tests', () => {
  
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol', 'estudiante');
  });

  test('Debe renderizar el componente de detalle del curso', () => {
    render(
      <MemoryRouter initialEntries={['/curso/1']}>
        <Routes>
          <Route path="/curso/:cursoId" element={<CursoDetalle />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Cargando curso/i)).toBeInTheDocument();
  });
});
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExplorarCursos from '../pages/ExplorarCursos';

jest.mock('axios');

describe('🔍 ExplorarCursos Component Tests', () => {
  
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
  });

  test('Debe renderizar el título de explorar cursos', () => {
    render(
      <BrowserRouter>
        <ExplorarCursos />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Explorar Cursos/i)).toBeInTheDocument();
  });
});
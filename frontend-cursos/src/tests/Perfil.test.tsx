import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Perfil from '../pages/Perfil';

jest.mock('axios');

describe('👤 Perfil Component Tests', () => {
  
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('rol', 'estudiante');
  });

  test('Debe renderizar el componente de perfil', () => {
    render(
      <BrowserRouter>
        <Perfil />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Mi Perfil/i)).toBeInTheDocument();
  });
});
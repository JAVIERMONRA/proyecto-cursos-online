import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';

describe('📝 Register Component Tests', () => {
  
  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  test('Debe renderizar el formulario de registro', () => {
    renderRegister();
    
    expect(screen.getByText(/Crear Cuenta/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Juan Pérez/i)).toBeInTheDocument();
    expect(screen.getByText(/Tipo de Cuenta/i)).toBeInTheDocument();
  });

  test('Debe permitir seleccionar rol de usuario', () => {
    renderRegister();
    
    const estudianteButton = screen.getByText(/Estudiante/i);
    const adminButton = screen.getByText(/Administrador/i);

    fireEvent.click(adminButton);
    expect(adminButton.parentElement).toHaveClass('active');

    fireEvent.click(estudianteButton);
    expect(estudianteButton.parentElement).toHaveClass('active');
  });
});
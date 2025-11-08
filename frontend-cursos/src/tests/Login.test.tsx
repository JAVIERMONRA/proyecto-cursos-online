import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

// Test 13: Renderizado de Login
describe('🔐 Login Component Tests', () => {
  
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('Debe renderizar el formulario de login correctamente', () => {
    renderLogin();
    
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tu@email.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
  });

  test('Debe validar campos requeridos', async () => {
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(submitButton);

    // Verifica que el formulario no se envíe sin datos
    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText(/tu@email.com/i) as HTMLInputElement;
      expect(emailInput.validity.valid).toBe(false);
    });
  });

  test('Debe alternar visibilidad de contraseña', () => {
    renderLogin();
    
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleButton = screen.getAllByRole('button')[0];
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');
  });
});
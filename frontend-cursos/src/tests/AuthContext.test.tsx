import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

describe('🔐 AuthContext Tests', () => {
  
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  test('Debe proporcionar funciones de autenticación', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
  });

  test('Debe manejar login correctamente', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('fake-token', 'estudiante');
    });

    expect(result.current.user).toEqual({
      token: 'fake-token',
      role: 'estudiante'
    });
  });

  test('Debe manejar logout correctamente', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('fake-token', 'estudiante');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
# Documentación de Pruebas - Plataforma de Cursos Online

## Resumen de Pruebas Implementadas

### Backend (12 pruebas)
1. Registro de usuario exitoso
2. Login exitoso con credenciales válidas
3. Login fallido con credenciales incorrectas
4. Listar todos los cursos
5. Obtener curso específico por ID
6. Crear nuevo curso (solo admin)
7. Inscribirse a un curso
8. Obtener mis cursos inscritos
9. Obtener progreso de un curso
10. Marcar lección como completada
11. Obtener estadísticas del sistema (admin)
12. Obtener lista de usuarios (admin)

### Frontend (15 pruebas)
13. Renderizado del formulario de login
14. Validación de campos en login
15. Toggle de visibilidad de contraseña
16. Renderizado del formulario de registro
17. Selección de rol en registro
18. Renderizado de MisCursos con loader
19. Renderizado de Sidebar para estudiante
20. Renderizado de Sidebar para admin
21. Renderizado del Navbar público
22. Funciones de AuthContext
23. Login en AuthContext
24. Logout en AuthContext
25. Renderizado de ExplorarCursos
26. Renderizado de Perfil
27. Renderizado de AdminCursos

## Comandos para ejecutar pruebas

### Backend
cd backend-cursos
npm test

### Frontend
cd frontend-cursos
npm test  

### Todas las pruebas
# Desde la raíz del proyecto
npm run test:all         # Backend + Frontend
npm run test:coverage    # Con cobertura completa
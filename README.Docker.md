# Guía de Docker - Cursos Online

## Pre-requisitos
- Docker Desktop instalado
- Docker Compose instalado

## Inicio rápido

### 1. Clonar el repositorio
git clone https://github.com/JAVIERMONRA/proyecto-cursos-online.git
cd proyecto-cursos-online


### 2. Configurar variables de entorno (opcional)
Edita `docker-compose.yml` para cambiar contraseñas y secretos.

### 3. Iniciar la aplicación
docker-compose up --build

### 4. Acceder a la aplicación
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MySQL: localhost:3307

## Credenciales por defecto
- **Admin:** admin@cursos.com / admin123
- **Estudiante:** maria@email.com / 123456

## Comandos útiles

### Construcción
docker-compose build
docker-compose up --build

### Logs
docker-compose logs -f
docker-compose logs -f backend

### Detener
docker-compose down

### Reset completo (⚠️ elimina datos)
docker-compose down -v
docker-compose up --build

## Estructura de servicios
- **db**: MySQL 8.0
- **backend**: Node.js + Express (Puerto 4000)
- **frontend**: React + Nginx (Puerto 3000)

## Persistencia de datos
Los datos de MySQL se guardan en un volumen Docker: `mysql_data`

## Troubleshooting

### Error de conexión a la base de datos
docker-compose restart backend

### Reimportar base de datos
docker-compose down -v
docker-compose up --build

### Ver logs de MySQL
docker-compose logs -f db

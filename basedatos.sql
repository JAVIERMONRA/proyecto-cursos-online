-- Crear base de datos
CREATE DATABASE IF NOT EXISTS plataforma_cursos CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE plataforma_cursos;

-- ==========================
-- 👤 Tabla de usuarios
-- ==========================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'estudiante') DEFAULT 'estudiante',
  fotoPerfil LONGTEXT,
  fechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol)
);

-- ==========================
-- 🎓 Tabla de cursos
-- ==========================
CREATE TABLE cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  profesorId INT,
  imagen VARCHAR(255),
  duracion INT DEFAULT 0,
  nivel ENUM('principiante', 'intermedio', 'avanzado') DEFAULT 'principiante',
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profesorId) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_profesor (profesorId)
);

-- ==========================
-- 📚 Tabla de secciones
-- ==========================
CREATE TABLE secciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cursoId INT NOT NULL,
  subtitulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  orden INT DEFAULT 0,
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cursoId) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso (cursoId)
);

-- ==========================
-- 📖 Tabla de lecciones 
-- ==========================
CREATE TABLE lecciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seccionId INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  contenido TEXT,
  orden INT DEFAULT 0,
  duracion INT DEFAULT 0,
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seccionId) REFERENCES secciones(id) ON DELETE CASCADE,
  INDEX idx_seccion (seccionId)
);

-- ==========================
-- 📎 Tabla de archivos
-- ==========================
CREATE TABLE archivos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seccionId INT NOT NULL,
  nombreArchivo VARCHAR(255) NOT NULL,
  rutaArchivo VARCHAR(255) NOT NULL,
  tipoArchivo VARCHAR(100),
  tamanio BIGINT,
  fechaSubida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seccionId) REFERENCES secciones(id) ON DELETE CASCADE,
  INDEX idx_seccion (seccionId)
);

-- ==========================
-- 🧾 Tabla de inscripciones
-- ==========================
CREATE TABLE inscripciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  cursoId INT NOT NULL,
  progreso DECIMAL(5,2) DEFAULT 0.00,
  completado BOOLEAN DEFAULT FALSE,
  fechaInscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fechaCompletado TIMESTAMP NULL,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (cursoId) REFERENCES cursos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_inscripcion (usuarioId, cursoId),
  INDEX idx_usuario (usuarioId),
  INDEX idx_curso (cursoId)
);

-- ==========================
-- 📊 Tabla de progreso por sección
-- ==========================
CREATE TABLE progreso_secciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inscripcionId INT NOT NULL,
  seccionId INT NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  tiempoEstudio INT DEFAULT 0,
  fechaCompletado TIMESTAMP NULL,
  FOREIGN KEY (inscripcionId) REFERENCES inscripciones(id) ON DELETE CASCADE,
  FOREIGN KEY (seccionId) REFERENCES secciones(id) ON DELETE CASCADE,
  UNIQUE KEY unique_progreso (inscripcionId, seccionId),
  INDEX idx_inscripcion (inscripcionId)
);

-- ==========================
-- 📖 Tabla de progreso por lección 
-- ==========================
CREATE TABLE progreso_lecciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inscripcionId INT NOT NULL,
  leccionId INT NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  tiempoEstudio INT DEFAULT 0,
  fechaCompletado TIMESTAMP NULL,
  FOREIGN KEY (inscripcionId) REFERENCES inscripciones(id) ON DELETE CASCADE,
  FOREIGN KEY (leccionId) REFERENCES lecciones(id) ON DELETE CASCADE,
  UNIQUE KEY unique_progreso_leccion (inscripcionId, leccionId),
  INDEX idx_inscripcion (inscripcionId)
);

-- ==========================
-- 🎖️ Tabla de certificados
-- ==========================
CREATE TABLE certificados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inscripcionId INT NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  fechaEmision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inscripcionId) REFERENCES inscripciones(id) ON DELETE CASCADE,
  INDEX idx_codigo (codigo)
);

-- ==========================
-- 📝 Insertar datos de prueba
-- ==========================

-- Insertar usuario administrador (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@cursos.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

-- Insertar usuarios estudiantes (password: 123456)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('María González', 'maria@email.com', '$2a$10$8K1p/a0dL3ynL3y4gZpz1eZXf9rW8ZRF5YCq5FKp5qEaZk5J5DXzK', 'estudiante'),
('Carlos Rodríguez', 'carlos@email.com', '$2a$10$8K1p/a0dL3ynL3y4gZpz1eZXf9rW8ZRF5YCq5FKp5qEaZk5J5DXzK', 'estudiante'),
('Ana Martínez', 'ana@email.com', '$2a$10$8K1p/a0dL3ynL3y4gZpz1eZXf9rW8ZRF5YCq5FKp5qEaZk5J5DXzK', 'estudiante');

-- Insertar cursos de ejemplo
INSERT INTO cursos (titulo, descripcion, profesorId, nivel, duracion) VALUES 
('Introducción a JavaScript', 'Aprende los fundamentos de JavaScript desde cero', 1, 'principiante', 20),
('React Avanzado', 'Domina React y sus características avanzadas', 1, 'avanzado', 40),
('Node.js y Express', 'Desarrollo backend con Node.js', 1, 'intermedio', 30),
('Python para Data Science', 'Análisis de datos con Python', 1, 'intermedio', 35),
('Diseño UX/UI', 'Fundamentos de diseño de experiencia de usuario', 1, 'principiante', 25);

-- Insertar secciones para el primer curso
INSERT INTO secciones (cursoId, subtitulo, descripcion, orden) VALUES 
(1, 'Variables y Tipos de Datos', 'Aprende sobre variables, let, const y tipos de datos', 1),
(1, 'Funciones', 'Funciones declarativas, expresivas y arrow functions', 2),
(1, 'Arrays y Objetos', 'Estructuras de datos fundamentales en JavaScript', 3);

-- Insertar lecciones para las secciones 
INSERT INTO lecciones (seccionId, titulo, contenido, orden, duracion) VALUES 
(1, 'Declaración de Variables', 'Aprende a declarar variables con var, let y const', 1, 15),
(1, 'Tipos de Datos', 'Conoce los diferentes tipos de datos en JavaScript', 2, 20),
(2, 'Funciones Declarativas', 'Cómo declarar y usar funciones', 1, 18),
(2, 'Arrow Functions', 'Sintaxis moderna de funciones', 2, 15),
(3, 'Trabajar con Arrays', 'Operaciones comunes con arrays', 1, 25),
(3, 'Objetos en JavaScript', 'Crear y manipular objetos', 2, 20);

-- Insertar inscripciones de ejemplo
INSERT INTO inscripciones (usuarioId, cursoId, progreso) VALUES 
(2, 1, 65.00),
(2, 2, 30.00),
(3, 1, 100.00),
(3, 3, 45.00),
(4, 1, 20.00);

-- Insertar progreso de lecciones 
INSERT INTO progreso_lecciones (inscripcionId, leccionId, completado, tiempoEstudio) VALUES 
(1, 1, 1, 15),
(1, 2, 1, 20),
(1, 3, 0, 0),
(3, 1, 1, 15),
(3, 2, 1, 20),
(3, 3, 1, 18),
(3, 4, 1, 15),
(3, 5, 1, 25),
(3, 6, 1, 20);
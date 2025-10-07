export interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  profesorId?: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "estudiante";
}

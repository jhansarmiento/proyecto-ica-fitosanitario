import { z } from 'zod';

export const createUsuarioSchema = z.object({
  numeroIdentificacion: z.string().min(1, 'numeroIdentificacion es obligatorio'),
  nombre: z.string().min(1, 'nombre es obligatorio'),
  apellidos: z.string().min(1, 'apellidos es obligatorio'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correoElectronico: z.string().email('correoElectronico inválido'),
  ingresoUsuario: z.string().min(1, 'ingresoUsuario es obligatorio'),
  ingresoContrasena: z.string().min(1, 'ingresoContrasena es obligatoria'),
  tarjetaProfesional: z.string().nullable().optional(),
  idRol: z.string().min(1, 'idRol es obligatorio'),
});

export const updateUsuarioSchema = z
  .object({
    numeroIdentificacion: z.string().min(1).optional(),
    nombre: z.string().min(1).optional(),
    apellidos: z.string().min(1).optional(),
    direccion: z.string().optional(),
    telefono: z.string().optional(),
    correoElectronico: z.string().email('correoElectronico inválido').optional(),
    ingresoUsuario: z.string().min(1).optional(),
    ingresoContrasena: z.string().min(1).optional(),
    tarjetaProfesional: z.string().nullable().optional(),
    idRol: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export type CreateUsuarioSchema = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioSchema = z.infer<typeof updateUsuarioSchema>;

import { z } from 'zod';

export const createRolSchema = z.object({
  nombre_rol: z.string().min(1, 'nombre_rol es obligatorio'),
  descripcion: z.string().min(1, 'descripcion es obligatoria'),
});

export const updateRolSchema = z
  .object({
    nombre_rol: z.string().min(1).optional(),
    descripcion: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export type CreateRolSchema = z.infer<typeof createRolSchema>;
export type UpdateRolSchema = z.infer<typeof updateRolSchema>;

import { z } from 'zod';

export const createRolSchema = z.object({
  nombreRol: z.string().min(1, 'nombreRol es obligatorio'),
  descripcion: z.string().min(1, 'descripcion es obligatoria'),
});

export const updateRolSchema = z
  .object({
    nombreRol: z.string().min(1).optional(),
    descripcion: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export type CreateRolSchema = z.infer<typeof createRolSchema>;
export type UpdateRolSchema = z.infer<typeof updateRolSchema>;

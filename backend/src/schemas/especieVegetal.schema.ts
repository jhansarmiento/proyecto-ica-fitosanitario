import { z } from 'zod';

/**
 * Schema de validación para creación de especie vegetal.
 * Entrada esperada en capa API (camelCase), independiente del modelo físico.
 */
export const createEspecieVegetalSchema = z.object({
  nombreEspecie: z
    .string()
    .min(2, 'nombreEspecie debe tener al menos 2 caracteres')
    .max(150, 'nombreEspecie no debe exceder 150 caracteres'),
  nombreComun: z
    .string()
    .min(2, 'nombreComun debe tener al menos 2 caracteres')
    .max(150, 'nombreComun no debe exceder 150 caracteres'),
  cicloCultivo: z
    .string()
    .min(2, 'cicloCultivo debe tener al menos 2 caracteres')
    .max(100, 'cicloCultivo no debe exceder 100 caracteres'),
  imagenEspecieVegetal: z
    .string()
    .url('imagenEspecieVegetal debe ser una URL válida')
    .optional(),
});

/**
 * Schema de validación para actualización parcial.
 */
export const updateEspecieVegetalSchema = z
  .object({
    nombreEspecie: z
      .string()
      .min(2, 'nombreEspecie debe tener al menos 2 caracteres')
      .max(150, 'nombreEspecie no debe exceder 150 caracteres')
      .optional(),
    nombreComun: z
      .string()
      .min(2, 'nombreComun debe tener al menos 2 caracteres')
      .max(150, 'nombreComun no debe exceder 150 caracteres')
      .optional(),
    cicloCultivo: z
      .string()
      .min(2, 'cicloCultivo debe tener al menos 2 caracteres')
      .max(100, 'cicloCultivo no debe exceder 100 caracteres')
      .optional(),
    imagenEspecieVegetal: z
      .string()
      .url('imagenEspecieVegetal debe ser una URL válida')
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export type CreateEspecieVegetalSchema = z.infer<typeof createEspecieVegetalSchema>;
export type UpdateEspecieVegetalSchema = z.infer<typeof updateEspecieVegetalSchema>;

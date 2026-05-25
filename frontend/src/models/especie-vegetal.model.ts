/**
 * Representa una especie vegetal en el frontend (contrato de dominio UI).
 *
 * Convenciones:
 * - Frontend/TypeScript: camelCase
 * - Backend/BD: snake_case (mapeado en capa API)
 */
export type EspecieVegetal = {
  id: string;
  nombreEspecie: string;
  nombreComun: string;
  cicloCultivo: string;
  imagenEspecieVegetal?: string | null;
};

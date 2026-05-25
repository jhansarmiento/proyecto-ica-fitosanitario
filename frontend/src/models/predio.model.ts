export type Predio = {
  id: string;
  numeroPredial: string;
  numeroIdentificacionProductor?: string | null;
  nombrePredio: string;
  departamento: string;
  municipio: string;
  vereda: string;
  areaTotal: number;
  propietarioId: string;
};

export type LugarProduccionEstado = 'Activo' | 'Pendiente' | 'Inactivo';

export type LugarProduccion = {
  id: string;
  nombreLugarProduccion: string;
  numeroRegistroIca: string;
  estado: LugarProduccionEstado;
};

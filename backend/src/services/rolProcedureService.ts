import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';

type CreateRolProcedureInput = {
  nombreRol: string;
  descripcion?: string;
};

type UpdateRolProcedureInput = {
  id_rol: string;
  nombreRol?: string;
  descripcion?: string;
};

export type RolFunctionRow = {
  id_rol: string;
  nombreRol: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
};

export async function listRolesByFunction(): Promise<RolFunctionRow[]> {
  return sequelize.query<RolFunctionRow>(
    `SELECT * FROM fn_listar_roles();`,
    { type: QueryTypes.SELECT },
  );
}

export async function createRolByProcedure(input: CreateRolProcedureInput): Promise<void> {
  await sequelize.query(
    `CALL sp_crear_rol(:p_nombreRol, :p_descripcion);`,
    {
      replacements: {
        p_nombreRol: input.nombreRol,
        p_descripcion: input.descripcion ?? '',
      },
      type: QueryTypes.RAW,
    },
  );
}

export async function updateRolByProcedure(input: UpdateRolProcedureInput): Promise<void> {
  await sequelize.query(
    `CALL sp_actualizar_rol(:p_id_rol, :p_nombreRol, :p_descripcion);`,
    {
      replacements: {
        p_id_rol: input.id_rol,
        p_nombreRol: input.nombreRol ?? '',
        p_descripcion: input.descripcion ?? '',
      },
      type: QueryTypes.RAW,
    },
  );
}

export async function deleteRolByProcedure(idRol: string): Promise<void> {
  await sequelize.query(
    `CALL sp_eliminar_rol(:p_id_rol);`,
    {
      replacements: { p_id_rol: idRol },
      type: QueryTypes.RAW,
    },
  );
}

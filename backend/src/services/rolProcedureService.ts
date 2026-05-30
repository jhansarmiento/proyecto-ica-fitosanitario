import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';

/**
 * Payload de entrada para creación de rol por procedimiento almacenado.
 */
type CreateRolProcedureInput = {
  nombreRol: string;
  descripcion?: string;
};

/**
 * Payload de entrada para actualización de rol por procedimiento almacenado.
 */
type UpdateRolProcedureInput = {
  id_rol: string;
  nombreRol?: string;
  descripcion?: string;
};

/**
 * Fila retornada por la función SQL `fn_listar_roles`.
 */
export type RolFunctionRow = {
  id_rol: string;
  nombreRol: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Lista roles desde la función SQL `fn_listar_roles`.
 *
 * @returns {Promise<RolFunctionRow[]>} Colección tipada de roles.
 */
export async function listRolesByFunction(): Promise<RolFunctionRow[]> {
  return sequelize.query<RolFunctionRow>(
    `SELECT * FROM fn_listar_roles();`,
    { type: QueryTypes.SELECT },
  );
}

/**
 * Crea un rol ejecutando el procedimiento `sp_crear_rol`.
 *
 * @param {CreateRolProcedureInput} input Datos del rol a crear.
 * @returns {Promise<void>}
 */
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

/**
 * Actualiza un rol ejecutando el procedimiento `sp_actualizar_rol`.
 *
 * @param {UpdateRolProcedureInput} input Identificador y campos del rol.
 * @returns {Promise<void>}
 */
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

/**
 * Elimina un rol ejecutando el procedimiento `sp_eliminar_rol`.
 *
 * @param {string} idRol Identificador del rol a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteRolByProcedure(idRol: string): Promise<void> {
  await sequelize.query(
    `CALL sp_eliminar_rol(:p_id_rol);`,
    {
      replacements: { p_id_rol: idRol },
      type: QueryTypes.RAW,
    },
  );
}

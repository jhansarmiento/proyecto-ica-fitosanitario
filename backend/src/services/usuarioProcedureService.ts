import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';

/**
 * Tipos de datos usados por los procedimientos almacenados de usuario.
 */

type CreateUsuarioProcedureInput = {
  /** Número de identificación del usuario. */
  numero_identificacion: string;
  /** Nombre del usuario. */
  nombre: string;
  /** Apellidos del usuario. */
  apellidos: string;
  /** Dirección opcional del usuario. */
  direccion?: string;
  /** Teléfono opcional del usuario. */
  telefono?: string;
  /** Correo electrónico obligatorio del usuario. */
  correo_electronico: string;
  /** Nombre de usuario para el ingreso. */
  ingreso_usuario: string;
  /** Contraseña para el ingreso. */
  ingreso_contrasena: string;
  /** Tarjeta profesional, puede ser nula si no aplica. */
  tarjeta_profesional?: string | null;
  /** Identificador del rol asignado al usuario. */
  id_rol: string;
};

type UpdateUsuarioProcedureInput = {
  /** Identificador único del usuario a actualizar. */
  id_usuario: string;
  /** Número de identificación del usuario. */
  numero_identificacion?: string;
  /** Nombre del usuario. */
  nombre?: string;
  /** Apellidos del usuario. */
  apellidos?: string;
  /** Dirección del usuario. */
  direccion?: string;
  /** Teléfono del usuario. */
  telefono?: string;
  /** Correo electrónico del usuario. */
  correo_electronico?: string;
  /** Nombre de usuario para login. */
  ingreso_usuario?: string;
  /** Contraseña para login. */
  ingreso_contrasena?: string;
  /** Tarjeta profesional, puede ser nula si no aplica. */
  tarjeta_profesional?: string | null;
  /** Identificador del rol asignado al usuario. */
  id_rol?: string;
};

/**
 * Crea un nuevo usuario usando el procedimiento almacenado `sp_crear_usuario`.
 *
 * @param input - Datos del nuevo usuario.
 */
export async function createUsuarioByProcedure(input: CreateUsuarioProcedureInput): Promise<void> {
  await sequelize.query(
    `
    CALL sp_crear_usuario(
      :numero_identificacion,
      :nombre,
      :apellidos,
      :direccion,
      :telefono,
      :correo_electronico,
      :ingreso_usuario,
      :ingreso_contrasena,
      :tarjeta_profesional,
      :id_rol
    );
    `,
    {
      replacements: {
        numero_identificacion: input.numero_identificacion,
        nombre: input.nombre,
        apellidos: input.apellidos,
        direccion: input.direccion ?? null,
        telefono: input.telefono ?? null,
        correo_electronico: input.correo_electronico,
        ingreso_usuario: input.ingreso_usuario,
        ingreso_contrasena: input.ingreso_contrasena,
        tarjeta_profesional: input.tarjeta_profesional ?? null,
        id_rol: input.id_rol,
      },
      type: QueryTypes.RAW,
    },
  );
}

/**
 * Actualiza los datos de un usuario existente usando `sp_actualizar_usuario`.
 *
 * @param input - Datos del usuario a actualizar.
 */
export async function updateUsuarioByProcedure(input: UpdateUsuarioProcedureInput): Promise<void> {
  await sequelize.query(
    `
    CALL sp_actualizar_usuario(
      :id_usuario,
      :numero_identificacion,
      :nombre,
      :apellidos,
      :direccion,
      :telefono,
      :correo_electronico,
      :ingreso_usuario,
      :ingreso_contrasena,
      :tarjeta_profesional,
      :id_rol
    );
    `,
    {
      replacements: {
        id_usuario: input.id_usuario,
        numero_identificacion: input.numero_identificacion ?? null,
        nombre: input.nombre ?? null,
        apellidos: input.apellidos ?? null,
        direccion: input.direccion ?? null,
        telefono: input.telefono ?? null,
        correo_electronico: input.correo_electronico ?? null,
        ingreso_usuario: input.ingreso_usuario ?? null,
        ingreso_contrasena: input.ingreso_contrasena ?? null,
        tarjeta_profesional: input.tarjeta_profesional ?? null,
        id_rol: input.id_rol ?? null,
      },
      type: QueryTypes.RAW,
    },
  );
}

/**
 * Elimina un usuario existente usando `sp_eliminar_usuario`.
 *
 * @param idUsuario - Identificador del usuario a eliminar.
 */
export async function deleteUsuarioByProcedure(idUsuario: string): Promise<void> {
  await sequelize.query(
    `
    CALL sp_eliminar_usuario(:id_usuario);
    `,
    {
      replacements: { id_usuario: idUsuario },
      type: QueryTypes.RAW,
    },
  );
}

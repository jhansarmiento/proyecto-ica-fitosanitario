// backend/src/services/usuarioProcedureService.ts
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';

// Este servicio se encarga de ejecutar los procedimientos almacenados relacionados con la gestión de usuarios (crear, actualizar, eliminar) 
// utilizando Sequelize para interactuar con la base de datos.
type CreateUsuarioProcedureInput = {
  numero_identificacion: string;
  nombre: string;
  apellidos: string;
  direccion?: string;
  telefono?: string;
  correo_electronico: string;
  ingreso_usuario: string;
  ingreso_contrasena: string;
  tarjeta_profesional?: string | null;
  id_rol: string;
};

/**
 * Datos de entrada para actualizar un usuario mediante un procedimiento almacenado.
 *
 * @typedef {Object} UpdateUsuarioProcedureInput
 * @property {string} id_usuario Identificador del usuario a actualizar.
 * @property {string} [numero_identificacion] Documento de identificación.
 * @property {string} [nombre] Nombre del usuario.
 * @property {string} [apellidos] Apellidos del usuario.
 * @property {string} [direccion] Dirección del usuario.
 * @property {string} [telefono] Teléfono de contacto.
 * @property {string} [correo_electronico] Correo electrónico del usuario.
 * @property {string} [ingreso_usuario] Nombre de usuario para acceso.
 * @property {string} [ingreso_contrasena] Contraseña para acceso.
 * @property {string|null} [tarjeta_profesional] Tarjeta profesional si aplica.
 * @property {string} [id_rol] Identificador del rol asignado.
 */
type UpdateUsuarioProcedureInput = {
  id_usuario: string;
  numero_identificacion?: string;
  nombre?: string;
  apellidos?: string;
  direccion?: string;
  telefono?: string;
  correo_electronico?: string;
  ingreso_usuario?: string;
  ingreso_contrasena?: string;
  tarjeta_profesional?: string | null;
  id_rol?: string;
};

/**
 * Crea un usuario en la base de datos mediante el procedimiento almacenado
 * `sp_crear_usuario`.
 *
 * @param {CreateUsuarioProcedureInput} input Datos del usuario a crear.
 * @returns {Promise<void>} Promesa que se resuelve cuando el procedimiento termina.
 */
export async function createUsuarioByProcedure(input: CreateUsuarioProcedureInput): Promise<void> {
  const rows = await sequelize.query(
    `CALL sp_crear_usuario(
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
    );`,
    {
      replacements: {
        ...input,
        direccion: input.direccion ?? null,
        telefono: input.telefono ?? null,
        tarjeta_profesional: input.tarjeta_profesional ?? null,
      },
      type: QueryTypes.RAW,
    },
  );

  void rows;
}

/**
 * Actualiza un usuario existente mediante el procedimiento almacenado
 * `sp_actualizar_usuario`.
 *
 * @param {UpdateUsuarioProcedureInput} input Campos del usuario a actualizar.
 * @returns {Promise<void>} Promesa que se resuelve cuando el procedimiento termina.
 */
export async function updateUsuarioByProcedure(input: UpdateUsuarioProcedureInput): Promise<void> {
  const rows = await sequelize.query(
    `CALL sp_actualizar_usuario(
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
    );`,
    {
      replacements: {
        ...input,
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

  void rows;
}

/**
 * Elimina un usuario mediante el procedimiento almacenado `sp_eliminar_usuario`.
 *
 * @param {string} idUsuario Identificador del usuario a eliminar.
 * @returns {Promise<void>} Promesa que se resuelve cuando el procedimiento termina.
 */
export async function deleteUsuarioByProcedure(idUsuario: string): Promise<void> {
  const rows = await sequelize.query(`CALL sp_eliminar_usuario(:id_usuario);`, {
    replacements: { id_usuario: idUsuario },
    type: QueryTypes.RAW,
  });

  void rows;
}

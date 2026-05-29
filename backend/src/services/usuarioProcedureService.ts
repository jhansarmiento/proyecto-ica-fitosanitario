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
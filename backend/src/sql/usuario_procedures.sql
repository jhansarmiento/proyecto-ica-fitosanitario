-- Procedimientos almacenados para gestión de usuarios
-- PostgreSQL 11+ (CALL)
-- Nota: Se crean en schema public y usan nombres de columnas reales en snake_case.

DROP PROCEDURE IF EXISTS sp_crear_usuario(
  varchar, varchar, varchar, varchar, varchar, varchar, varchar, varchar, varchar, uuid
);

CREATE OR REPLACE PROCEDURE sp_crear_usuario(
  IN p_numero_identificacion varchar,
  IN p_nombre varchar,
  IN p_apellidos varchar,
  IN p_direccion varchar,
  IN p_telefono varchar,
  IN p_correo_electronico varchar,
  IN p_ingreso_usuario varchar,
  IN p_ingreso_contrasena varchar,
  IN p_tarjeta_profesional varchar,
  IN p_id_rol uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO usuario (
    id_usuario,
    numero_identificacion,
    nombre,
    apellidos,
    direccion,
    telefono,
    correo_electronico,
    ingreso_usuario,
    ingreso_contrasena,
    tarjeta_profesional,
    id_rol,
    "createdAt",
    "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    p_numero_identificacion,
    p_nombre,
    p_apellidos,
    NULLIF(p_direccion, ''),
    NULLIF(p_telefono, ''),
    p_correo_electronico,
    p_ingreso_usuario,
    p_ingreso_contrasena,
    NULLIF(p_tarjeta_profesional, ''),
    p_id_rol,
    NOW(),
    NOW()
  );
END;
$$;

DROP PROCEDURE IF EXISTS sp_actualizar_usuario(
  uuid, varchar, varchar, varchar, varchar, varchar, varchar, varchar, varchar, varchar, uuid
);

CREATE OR REPLACE PROCEDURE sp_actualizar_usuario(
  IN p_id_usuario uuid,
  IN p_numero_identificacion varchar,
  IN p_nombre varchar,
  IN p_apellidos varchar,
  IN p_direccion varchar,
  IN p_telefono varchar,
  IN p_correo_electronico varchar,
  IN p_ingreso_usuario varchar,
  IN p_ingreso_contrasena varchar,
  IN p_tarjeta_profesional varchar,
  IN p_id_rol uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE usuario
  SET
    numero_identificacion = COALESCE(NULLIF(p_numero_identificacion, ''), numero_identificacion),
    nombre = COALESCE(NULLIF(p_nombre, ''), nombre),
    apellidos = COALESCE(NULLIF(p_apellidos, ''), apellidos),
    direccion = COALESCE(p_direccion, direccion),
    telefono = COALESCE(p_telefono, telefono),
    correo_electronico = COALESCE(NULLIF(p_correo_electronico, ''), correo_electronico),
    ingreso_usuario = COALESCE(NULLIF(p_ingreso_usuario, ''), ingreso_usuario),
    ingreso_contrasena = COALESCE(NULLIF(p_ingreso_contrasena, ''), ingreso_contrasena),
    tarjeta_profesional = COALESCE(p_tarjeta_profesional, tarjeta_profesional),
    id_rol = COALESCE(p_id_rol, id_rol),
    "updatedAt" = NOW()
  WHERE id_usuario = p_id_usuario;
END;
$$;

DROP PROCEDURE IF EXISTS sp_eliminar_usuario(uuid);

CREATE OR REPLACE PROCEDURE sp_eliminar_usuario(
  IN p_id_usuario uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM usuario
  WHERE id_usuario = p_id_usuario;
END;
$$;

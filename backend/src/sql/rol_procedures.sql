-- ============================================================
-- MÓDULO: ROLES
-- Archivo: backend/src/sql/rol_procedures.sql
--
-- Estructura estándar documentada:
-- - Funciones (consulta)
-- - Procedimientos (crear/actualizar/eliminar)
-- - Idempotencia con CREATE OR REPLACE / DROP IF EXISTS
--
-- Nota técnica (error actual de lotes):
-- Si aparece "no existe la columna predio.id", alinear consultas/includes
-- a los nombres reales de columnas del modelo/tabla:
--   predio.id_predio (PK real), nombre_predio, numero_predial, etc.
-- Evitar usar "id" genérico si el modelo no lo mapea explícitamente.
-- ============================================================

-- ============================================================
-- 1) FUNCIÓN: fn_listar_roles()
--    Retorna todos los roles ordenados alfabéticamente.
--    Uso: SELECT * FROM fn_listar_roles();
-- ============================================================
CREATE OR REPLACE FUNCTION fn_listar_roles()
RETURNS TABLE (
  id_rol       uuid,
  "nombreRol"  varchar,
  descripcion  varchar,
  "createdAt"  timestamp,
  "updatedAt"  timestamp
)
LANGUAGE sql
AS $$
  SELECT
    id_rol,
    "nombreRol",
    descripcion,
    "createdAt",
    "updatedAt"
  FROM rol
  ORDER BY "nombreRol" ASC;
$$;

-- ============================================================
-- 2) PROCEDIMIENTO: sp_crear_rol
--    Inserta un nuevo rol con UUID generado automáticamente.
--    Uso: CALL sp_crear_rol('INSPECTOR', 'Descripción del rol');
-- ============================================================
DROP PROCEDURE IF EXISTS sp_crear_rol(varchar, varchar);
CREATE OR REPLACE PROCEDURE sp_crear_rol(
  IN p_nombreRol  varchar,
  IN p_descripcion varchar
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO rol (
    id_rol,
    "nombreRol",
    descripcion,
    "createdAt",
    "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    p_nombreRol,
    COALESCE(NULLIF(p_descripcion, ''), ''),
    NOW(),
    NOW()
  );
END;
$$;

-- ============================================================
-- 3) PROCEDIMIENTO: sp_actualizar_rol
--    Actualiza nombre y/o descripción de un rol existente.
--    Uso: CALL sp_actualizar_rol('<uuid>', 'NUEVO_NOMBRE', 'Nueva desc');
-- ============================================================
DROP PROCEDURE IF EXISTS sp_actualizar_rol(uuid, varchar, varchar);
CREATE OR REPLACE PROCEDURE sp_actualizar_rol(
  IN p_id_rol      uuid,
  IN p_nombreRol   varchar,
  IN p_descripcion varchar
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE rol
  SET
    "nombreRol" = COALESCE(NULLIF(p_nombreRol, ''), "nombreRol"),
    descripcion = COALESCE(NULLIF(p_descripcion, ''), descripcion),
    "updatedAt" = NOW()
  WHERE id_rol = p_id_rol;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rol con id % no encontrado', p_id_rol;
  END IF;
END;
$$;

-- ============================================================
-- 4) PROCEDIMIENTO: sp_eliminar_rol
--    Elimina un rol por su PK.
--    Uso: CALL sp_eliminar_rol('<uuid>');
-- ============================================================
DROP PROCEDURE IF EXISTS sp_eliminar_rol(uuid);
CREATE OR REPLACE PROCEDURE sp_eliminar_rol(
  IN p_id_rol uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM rol
  WHERE id_rol = p_id_rol;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rol con id % no encontrado', p_id_rol;
  END IF;
END;
$$;

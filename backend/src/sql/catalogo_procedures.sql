-- ============================================================
-- MÓDULO: Catálogo (Especies / Plagas)
-- Propósito:
--   Referencia SQL documentada para consultas agregadas, funciones
--   y ejemplo de trigger asociado al dominio de catálogo.
-- Nota:
--   Este archivo documenta y facilita despliegues SQL manuales.
--   El backend actual consulta con SQL embebido en service.
-- ============================================================

-- ------------------------------------------------------------
-- 1) FUNCIÓN: fn_catalogo_especies()
-- Devuelve especies con variedades y plagas agregadas.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_catalogo_especies()
RETURNS TABLE (
  id uuid,
  nombre_comun text,
  nombre_cientifico text,
  ciclo text,
  imagen text,
  variedades text[],
  plagas jsonb
)
LANGUAGE sql
AS $$
  SELECT
    ev.id_especie_vegetal AS id,
    ev.nombre_comun,
    ev.nombre_especie AS nombre_cientifico,
    ev.ciclo_cultivo AS ciclo,
    ev.imagen_especie_vegetal AS imagen,
    COALESCE(
      ARRAY_AGG(DISTINCT ve.nombre_variedad) FILTER (WHERE ve.nombre_variedad IS NOT NULL),
      ARRAY[]::text[]
    ) AS variedades,
    COALESCE(
      JSONB_AGG(
        DISTINCT JSONB_BUILD_OBJECT(
          'id_plaga', p.id_plaga,
          'nombre_comun', p.nombre_comun,
          'nombre_cientifico', p.nombre_cientifico
        )
      ) FILTER (WHERE p.id_plaga IS NOT NULL),
      '[]'::jsonb
    ) AS plagas
  FROM especie_vegetal ev
  LEFT JOIN variedad_especie ve
    ON ve.id_especie_vegetal = ev.id_especie_vegetal
  LEFT JOIN especie_plaga ep
    ON ep.id_especie_vegetal = ev.id_especie_vegetal
  LEFT JOIN plaga p
    ON p.id_plaga = ep.id_plaga
  GROUP BY
    ev.id_especie_vegetal,
    ev.nombre_comun,
    ev.nombre_especie,
    ev.ciclo_cultivo,
    ev.imagen_especie_vegetal
  ORDER BY ev.nombre_especie ASC;
$$;

-- ------------------------------------------------------------
-- 2) FUNCIÓN: fn_catalogo_plagas()
-- Devuelve plagas con especies afectadas agregadas.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_catalogo_plagas()
RETURNS TABLE (
  id_plaga uuid,
  nombre_comun text,
  nombre_cientifico text,
  tipo_plaga text,
  imagen_plaga text,
  especies_afectadas text[]
)
LANGUAGE sql
AS $$
  SELECT
    p.id_plaga,
    p.nombre_comun,
    p.nombre_cientifico,
    COALESCE(p.tipo_plaga, 'N/A') AS tipo_plaga,
    p.imagen_plaga,
    COALESCE(
      ARRAY_AGG(DISTINCT ev.nombre_comun) FILTER (WHERE ev.nombre_comun IS NOT NULL),
      ARRAY[]::text[]
    ) AS especies_afectadas
  FROM plaga p
  LEFT JOIN especie_plaga ep
    ON ep.id_plaga = p.id_plaga
  LEFT JOIN especie_vegetal ev
    ON ev.id_especie_vegetal = ep.id_especie_vegetal
  GROUP BY
    p.id_plaga,
    p.nombre_comun,
    p.nombre_cientifico,
    p.tipo_plaga,
    p.imagen_plaga
  ORDER BY p.nombre_comun ASC;
$$;

-- ------------------------------------------------------------
-- 3) TRIGGER (Plantilla opcional)
-- Ejemplo para actualizar fecha de modificación en plaga.
-- Requiere columna updated_at en tabla plaga.
-- ------------------------------------------------------------

-- CREATE OR REPLACE FUNCTION trg_set_updated_at()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$;

-- DROP TRIGGER IF EXISTS tr_plaga_set_updated_at ON plaga;
-- CREATE TRIGGER tr_plaga_set_updated_at
-- BEFORE UPDATE ON plaga
-- FOR EACH ROW
-- EXECUTE FUNCTION trg_set_updated_at();

-- ------------------------------------------------------------
-- 4) Verificación manual
-- ------------------------------------------------------------
-- SELECT * FROM fn_catalogo_especies();
-- SELECT * FROM fn_catalogo_plagas();

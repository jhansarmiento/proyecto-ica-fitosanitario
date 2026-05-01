# TODO - Interfaz Frontend FitoGestor

## Fase 1 - Estructura modular + UI base
- [x] Crear estructura modular en `frontend/src`:
  - [x] `components/ui`
  - [x] `pages`
  - [x] `services`
  - [x] `hooks`
  - [x] `schemas`
- [x] Implementar componentes reutilizables UI:
  - [x] `FeatureItem.tsx`
  - [x] `StatItem.tsx`
  - [x] `TextInput.tsx`
  - [x] `CheckboxField.tsx`
  - [x] `PrimaryButton.tsx`
- [x] Implementar página `LoginPage.tsx` con layout base.
- [x] Integrar `LoginPage` en `App.tsx`.
- [x] Definir estilos globales en `index.css`.
- [x] Agregar placeholders estructurales:
  - [x] `services/api.ts`
  - [x] `hooks/useAuthForm.ts`
  - [x] `schemas/auth.schema.ts`

## Fase 2 - Conversión a Tailwind real
- [x] Configurar Tailwind + PostCSS.
- [x] Migrar componentes y página a clases Tailwind.
- [x] Resolver errores de build de Tailwind v4.

## Fase 3 - Refinamiento visual SaaS moderno (en progreso)
- [x] Rebalancear layout general en `LoginPage`.
- [x] Mejorar tipografía/jerarquía visual.
- [x] Mejorar card de login (glassmorphism, contraste, sombra).
- [x] Mejorar `TextInput` (focus + transiciones).
- [x] Mejorar `PrimaryButton` (hover/active moderno).
- [x] Mejorar `FeatureItem`, `StatItem`, `CheckboxField`.
- [ ] Validar responsive y estado final en `http://localhost:5173/`.

## Fase 4 - Vista de Inicio (Dashboard UI)
- [x] Crear `HomePage.tsx` con layout principal.
- [x] Crear componentes UI reutilizables:
  - [x] `SidebarItem.tsx`
  - [x] `KpiCard.tsx`
  - [x] `PanelCard.tsx`
- [x] Integrar Home en `App.tsx` para visualización.
- [ ] Ajustes finos visuales según feedback.

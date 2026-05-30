import type { InputHTMLAttributes, ReactNode } from 'react';

/**
 * Props del componente TextInput.
 *
 * Extiende todos los atributos nativos de `<input>` para máxima flexibilidad,
 * añadiendo las props propias del componente.
 */
type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Texto de la etiqueta visible encima del campo. */
  label: string;
  /**
   * Elemento opcional renderizado dentro del campo, alineado a la derecha.
   * Útil para botones de acción como mostrar/ocultar contraseña.
   */
  rightElement?: ReactNode;
};

/**
 * Campo de texto estilizado con soporte para etiqueta y elemento derecho opcional.
 *
 * Envuelve un `<input>` nativo con estilos glassmorphism coherentes con el
 * diseño de la aplicación. Acepta todas las props nativas de `<input>` mediante
 * spread, por lo que puede usarse como `type="text"`, `type="password"`, etc.
 *
 * @example
 * // Campo de texto simple
 * <TextInput label="Usuario" placeholder="Tu usuario" value={val} onChange={...} />
 *
 * @example
 * // Campo contraseña con botón de toggle
 * <TextInput
 *   label="Contraseña"
 *   type={show ? "text" : "password"}
 *   rightElement={<button onClick={toggle}>...</button>}
 * />
 */
function TextInput({ label, rightElement, ...props }: TextInputProps) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-[1rem] font-medium text-emerald-50/90">{label}</span>
      <div className="relative flex items-center">
        <input
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none placeholder:text-emerald-50/50 transition-all duration-300 focus:border-emerald-300/70 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.18)] pr-12"
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </label>
  );
}

export default TextInput;

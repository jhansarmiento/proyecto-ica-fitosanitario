import { useState } from "react";
import { Sprout, Eye, EyeOff } from "lucide-react";
import FeatureItem from "../components/ui/FeatureItem";
import StatItem from "../components/ui/StatItem";
import TextInput from "../components/ui/TextInput";
import CheckboxField from "../components/ui/CheckboxField";
import PrimaryButton from "../components/ui/PrimaryButton";
import ForgotPasswordModal from "../components/ui/ForgotPasswordModal";
import {
  IconTrazabilidad,
  IconInspeccion,
  IconInforme,
} from "../components/ui/icons";
import { authService } from '../services/auth.service';
import type { SessionUser } from "../types/auth.types";

/**
 * Props del componente LoginPage.
 */
type LoginPageProps = {
  /**
   * Callback invocado tras un inicio de sesión exitoso.
   * Recibe el objeto `SessionUser` con los datos básicos del usuario autenticado
   * (nombre, apellidos, rol) para actualizar el estado global de la aplicación.
   */
  onLoginSuccess?: (user: SessionUser) => void;
  /**
   * Callback invocado cuando el usuario pulsa "Registrarse como Productor".
   * Debe cambiar la vista activa en `App.tsx` hacia la pantalla de registro.
   */
  onGoRegister?: () => void;
};

/**
 * Página de inicio de sesión de FitoGestor.
 *
 * ## Layout
 * Pantalla completa dividida en dos columnas (en escritorio):
 * - **Columna izquierda (branding):** Logo, título, descripción, lista de
 *   características clave y estadísticas de la plataforma.
 * - **Columna derecha (formulario):** Tarjeta glassmorphism con campos de
 *   usuario y contraseña, opción "Recordarme", enlace de contraseña olvidada,
 *   botón de submit y acceso al registro de productores.
 *
 * ## Flujo de autenticación
 * 1. El usuario completa los campos y envía el formulario.
 * 2. Se llama a `authService.login()` con las credenciales en formato snake_case
 *    (`ingreso_usuario`, `ingreso_contrasena`) según el contrato del backend.
 * 3. Si la respuesta es exitosa, se persisten el `token` JWT y los datos del
 *    usuario en `localStorage`, y se notifica al padre mediante `onLoginSuccess`.
 * 4. Si ocurre un error, se muestra el mensaje devuelto por la API o un texto
 *    de fallback genérico.
 *
 * ## Funcionalidades del formulario
 * - Validación básica de campos vacíos antes de llamar a la API.
 * - Estado de carga (`isLoading`) que deshabilita el botón y cambia su texto.
 * - Toggle de visibilidad de contraseña mediante el botón con icono ojo.
 * - Modal de recuperación de contraseña (`ForgotPasswordModal`).
 *
 * @param props - {@link LoginPageProps}
 */
function LoginPage({ onLoginSuccess, onGoRegister }: LoginPageProps) {
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [ingresoUsuario, setIngresoUsuario] = useState("");
  const [ingresoContrasena, setIngresoContrasena] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  /** Controla si el texto de la contraseña es visible o está enmascarado. */
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!ingresoUsuario.trim() || !ingresoContrasena.trim()) {
      setErrorMessage("Ingresa usuario y contraseña.");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Enviamos los datos adaptados al formato snake_case del Backend
      const response = await authService.login({
        ingreso_usuario: ingresoUsuario.trim(),
        ingreso_contrasena: ingresoContrasena.trim(),
      });

      // 2. Extraemos el token y el objeto usuario de la respuesta estructurada del backend
      const { token, usuario } = response;

      // 3. Almacenamos el token JWT en el navegador para autenticar futuras consultas
      localStorage.setItem("token", token);
      localStorage.setItem('user', JSON.stringify({
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        rol: usuario.rol
      }));

      // 4. Enviamos al estado global del Frontend lo que espera recibir
      onLoginSuccess?.({
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos || '',
        correo_electronico: usuario.correo_electronico ?? '',
        rol: usuario.rol ?? '',
      });
    } catch (error: any) {
      // Capturamos el mensaje de error real enviado por el Backend (ej: "Contraseña incorrecta")
      const apiMessage = error.response?.data?.message;
      setErrorMessage(apiMessage || "No fue posible iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_25%,#00b06a_0%,#00784b_30%,#014f35_55%,#02241a_78%,#050d0a_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(16,185,129,0.18),transparent_45%)]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 gap-10 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-14 lg:py-12">
        {/* ── Columna izquierda: branding ── */}
        <section className="flex flex-col justify-center gap-8 lg:pr-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-[14px] bg-white/95 shadow-md" />
            <span className="text-[2.9rem] font-bold tracking-tight">
              FitoGestor
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-[620px] text-[2.6rem] font-bold leading-[1.02] sm:text-[3.2rem] lg:text-[4.15rem]">
              Control de Calidad <br />
              <span className="text-emerald-300">Fitosanitaria</span>
            </h1>

            <p className="max-w-[610px] text-[1.05rem] font-semibold leading-[1.35] text-emerald-50 sm:text-[1.2rem] lg:text-[1.35rem]">
              Plataforma integral para la gestión en inspecciones de productos
              agrícolas colombianos con los más altos estándares
              internacionales.
            </p>
          </div>

          <div className="mt-2 flex flex-col gap-3.5">
            <FeatureItem
              text="Trazabilidad Completa"
              icon={<IconTrazabilidad />}
            />
            <FeatureItem
              text="Inspecciones Digitalizadas"
              icon={<IconInspeccion />}
            />
            <FeatureItem
              text="Informes Especializados"
              icon={<IconInforme />}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-20 border-t border-white/20 pt-5">
            <StatItem value="10K+" label="Inspecciones" />
            <StatItem value="5K+" label="Usuarios" />
            <StatItem value="99%" label="Satisfacción" />
          </div>
        </section>

        {/* ── Columna derecha: formulario de login ── */}
        <section className="flex items-center justify-center">
          <div className="w-full max-w-[560px] rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
            <h2 className="mb-2 text-center text-[2.2rem] font-bold leading-none sm:text-[2.6rem]">
              Iniciar Sesión
            </h2>
            <p className="mb-7 text-center text-[1.1rem] text-emerald-50/85">
              Ingresa a tu cuenta
            </p>

            <form className="flex flex-col gap-4.5" onSubmit={handleSubmit}>
              {/* Campo: usuario */}
              <TextInput
                label="Usuario"
                placeholder="Usuario"
                type="text"
                value={ingresoUsuario}
                onChange={(e) => setIngresoUsuario(e.target.value)}
              />

              {/* Campo: contraseña con toggle de visibilidad */}
              <TextInput
                label="Contraseña"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={ingresoContrasena}
                onChange={(e) => setIngresoContrasena(e.target.value)}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="text-emerald-50/60 transition-colors duration-200 hover:text-emerald-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <div className="my-0.5 flex flex-wrap items-center justify-between gap-2">
                <CheckboxField id="remember" label="Recordarme" />
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[0.96rem] font-medium text-emerald-50/90 transition-colors duration-300 hover:text-emerald-200"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {errorMessage ? (
                <p className="rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">
                  {errorMessage}
                </p>
              ) : null}

              <PrimaryButton type="submit" disabled={isLoading}>
                {isLoading ? "Validando..." : "Iniciar Sesión"}
              </PrimaryButton>
            </form>

            <div className="mt-6 border-t border-white/15 pt-5 flex flex-col gap-4">
              {/* Registro de productor */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-[0.95rem] text-emerald-50/75">
                  ¿No tienes cuenta?
                </p>
                <button
                  type="button"
                  onClick={onGoRegister}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-emerald-400/40 bg-transparent px-5 py-3 text-[0.97rem] font-semibold text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:border-emerald-300/70 hover:bg-emerald-400/10 hover:text-white hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] active:scale-[0.98]"
                >
                  <Sprout
                    size={18}
                    className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  />
                  Registrarse como Productor
                </button>
              </div>
              <p className="text-center text-[0.9rem] text-emerald-50/60">
                ¿Necesitas ayuda? Contacta soporte
              </p>
            </div>
          </div>
        </section>
      </div>

      <p className="relative pb-5 text-center text-sm text-emerald-50/85">
        © 2026 Instituto Colombiano Agropecuario (ICA)
      </p>

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </main>
  );
}

export default LoginPage;

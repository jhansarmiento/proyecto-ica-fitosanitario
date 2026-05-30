/**
 * Modal para solicitar el restablecimiento de contraseña.
 *
 * Permite al usuario ingresar su correo electrónico, validar su formato y
 * solicitar al backend el envío de instrucciones de recuperación.
 *
 * @module ForgotPasswordModal
 */
import { useState } from 'react';
import { authService } from '../../services/auth.service';

/**
 * Props del componente ForgotPasswordModal.
 *
 * @typedef {Object} ForgotPasswordModalProps
 * @property {boolean} isOpen Indica si el modal está abierto.
 * @property {() => void} onClose Callback para cerrar el modal.
 */
type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Componente del modal que maneja la petición de correo de recuperación.
 *
 * Valida el email ingresado y muestra mensajes de éxito o error según la
 * respuesta del servicio de autenticación.
 *
 * @param {ForgotPasswordModalProps} props Props del componente.
 * @returns {JSX.Element | null} Elemento JSX del modal o null si está cerrado.
 */
function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.forgotPassword(normalizedEmail);

      setSuccessMessage(
        response?.message ??
          'Si el correo existe en el sistema, recibirás instrucciones para restablecer tu contraseña.',
      );
      setEmail('');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'No fue posible procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setErrorMessage('');
    setSuccessMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[760px] rounded-[30px] border border-white/15 bg-white/10 p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="mb-6 flex flex-col items-center">
          <div className="h-11 w-11 rounded-[12px] bg-white/95 shadow-md" />
          <h2 className="mt-2 text-4xl font-bold tracking-tight">FitoGestor</h2>
          <p className="text-lg text-emerald-100/90">Sistema de Inspección Fitosanitaria</p>
        </div>

        <h3 className="text-center text-3xl font-bold leading-tight">¿Olvidaste tu contraseña?</h3>
        <p className="mx-auto mt-4 max-w-[620px] text-center text-2xl font-semibold leading-tight text-emerald-50/95">
          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
        </p>

        <form className="mx-auto mt-10 max-w-[640px]" onSubmit={handleSubmit}>
          <label className="mb-3 block text-2xl font-semibold text-emerald-50">Correo Electrónico</label>
          <div className="rounded-xl border border-white/15 bg-white/15 px-4 py-4">
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-2xl text-emerald-50 placeholder:text-emerald-200/70 outline-none"
            />
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-4 rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 py-4 text-2xl font-extrabold text-white shadow-lg transition hover:from-emerald-300 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="mx-auto mt-8 flex items-center gap-3 text-xl font-semibold text-emerald-50/95 transition hover:text-emerald-200"
          >
            <span aria-hidden="true">←</span>
            Volver al inicio de sesión
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-emerald-50/85">
          © 2026 Instituto Colombiano Agropecuario (ICA)
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;

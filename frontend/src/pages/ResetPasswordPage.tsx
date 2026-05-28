/**
 * Página para restablecer la contraseña del usuario.
 *
 * Esta página lee el token de recuperación desde los parámetros de la URL,
 * permite al usuario ingresar y confirmar una nueva contraseña, y llama al
 * servicio de autenticación para completar el cambio en el backend.
 *
 * @module ResetPasswordPage
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { authService } from '../services/auth.service';

function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Envía el formulario de restablecimiento de contraseña.
   *
   * Valida que exista el token, que la contraseña tenga al menos 8 caracteres
   * y que la confirmación coincida. Si la validación es correcta, llama al
   * servicio de autenticación para actualizar la contraseña en el backend.
   *
   * @param {FormEvent<HTMLFormElement>} event Evento de envío del formulario.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!token) {
      setErrorMessage('Token de recuperación no encontrado.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.resetPassword({
        token,
        nueva_contrasena: password,
      });

      setSuccessMessage(response?.message ?? 'Contraseña actualizada exitosamente.');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'No fue posible restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-700 p-6 text-white">
      <div className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <h1 className="text-center text-3xl font-bold">Restablecer contraseña</h1>
        <p className="mt-3 text-center text-sm text-emerald-100/90">
          Ingresa tu nueva contraseña para completar la recuperación de acceso.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-emerald-100">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-emerald-200/70 focus:border-emerald-300"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-emerald-100">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-emerald-200/70 focus:border-emerald-300"
              placeholder="Repite tu contraseña"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  if (!isOpen) return null;

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

        <form className="mx-auto mt-10 max-w-[640px]">
          <label className="mb-3 block text-2xl font-semibold text-emerald-50">Correo Electrónico</label>
          <div className="rounded-xl border border-white/15 bg-white/15 px-4 py-4">
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full bg-transparent text-2xl text-emerald-50 placeholder:text-emerald-200/70 outline-none"
            />
          </div>

          <button
            type="button"
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 py-4 text-2xl font-extrabold text-white shadow-lg transition hover:from-emerald-300 hover:to-emerald-400"
          >
            Enviar
          </button>

          <button
            type="button"
            onClick={onClose}
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

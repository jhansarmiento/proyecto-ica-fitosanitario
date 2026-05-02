import { UserPlus, X } from 'lucide-react';

type NewUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const steps = ['Datos Personales', 'Cuenta y Credenciales', 'Registro ICA', 'Confirmación'];

function NewUserModal({ isOpen, onClose }: NewUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-8 backdrop-blur-[1px]">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="bg-emerald-900 px-5 py-3 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-bold leading-none">Nuevo Usuario</h3>
                <p className="mt-1 text-sm text-emerald-100">Paso 1 de 4 - Datos Personales</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg text-emerald-100 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {steps.map((step, index) => {
              const active = index === 0;
              return (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                      active ? 'bg-white text-emerald-900' : 'bg-emerald-800 text-emerald-200'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={`text-xs ${active ? 'text-white' : 'text-emerald-200/80'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <h4 className="mb-4 text-2xl font-semibold text-slate-800">Datos Personales</h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Número identificación</span>
              <input
                type="text"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="Ej: 1032456789"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Teléfono</span>
              <input
                type="text"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="Ej: 3001234567"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Nombres</span>
              <input
                type="text"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="Ej: Laura"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Apellidos</span>
              <input
                type="text"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="Ej: Pineda"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Dirección</span>
            <input
              type="text"
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              placeholder="Ej: Calle 123 #45-67"
            />
          </label>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewUserModal;

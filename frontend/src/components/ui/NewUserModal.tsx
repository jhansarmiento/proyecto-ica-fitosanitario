import { ShieldCheck, UserCheck, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type NewUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormData = {
  identificacion: string;
  telefono: string;
  nombres: string;
  apellidos: string;
  direccion: string;
  usuario: string;
  correo: string;
  rol: string;
  registroIca: string;
  tarjetaProfesional: string;
};

const steps = ['Datos Personales', 'Cuenta y Credenciales', 'Registro ICA', 'Confirmación'];

const initialForm: FormData = {
  identificacion: '',
  telefono: '',
  nombres: '',
  apellidos: '',
  direccion: '',
  usuario: '',
  correo: '',
  rol: '',
  registroIca: '',
  tarjetaProfesional: '',
};

function NewUserModal({ isOpen, onClose }: NewUserModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setForm(initialForm);
    }
  }, [isOpen]);

  const stepTitle = useMemo(() => steps[currentStep - 1], [currentStep]);

  if (!isOpen) return null;

  const updateField =
    (key: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleClose = () => {
    onClose();
  };

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
                <p className="mt-1 text-sm text-emerald-100">
                  Paso {currentStep} de 4 — {stepTitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="grid h-9 w-9 place-items-center rounded-lg text-emerald-100 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {steps.map((step, index) => {
              const number = index + 1;
              const active = number === currentStep;
              const done = number < currentStep;

              return (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                      active
                        ? 'bg-white text-emerald-900'
                        : done
                          ? 'bg-emerald-400 text-emerald-950'
                          : 'bg-emerald-800 text-emerald-200'
                    }`}
                  >
                    {number}
                  </span>
                  <span
                    className={`text-xs ${
                      active ? 'text-white' : done ? 'text-emerald-100' : 'text-emerald-200/80'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {currentStep === 1 ? (
            <>
              <h4 className="mb-4 text-2xl font-semibold text-slate-800">Datos Personales</h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Número identificación</span>
                  <input
                    type="text"
                    value={form.identificacion}
                    onChange={updateField('identificacion')}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: 1032456789"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Teléfono</span>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={updateField('telefono')}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: 3001234567"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Nombres</span>
                  <input
                    type="text"
                    value={form.nombres}
                    onChange={updateField('nombres')}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: Laura"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Apellidos</span>
                  <input
                    type="text"
                    value={form.apellidos}
                    onChange={updateField('apellidos')}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: Pineda"
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Dirección</span>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={updateField('direccion')}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Ej: Calle 123 #45-67"
                />
              </label>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <h4 className="mb-4 text-2xl font-semibold text-slate-800">Cuenta y Credenciales</h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Usuario</span>
                  <input
                    type="text"
                    value={form.usuario}
                    onChange={updateField('usuario')}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: lpineda"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Correo electrónico</span>
                  <input
                    type="email"
                    value={form.correo}
                    onChange={updateField('correo')}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="correo@empresa.com"
                  />
                </label>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:col-span-2">
                  <p className="text-sm font-semibold text-emerald-900">Contraseña en primer acceso</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    El usuario creará su contraseña al ingresar por primera vez desde el flujo de restablecimiento.
                  </p>
                </div>
              </div>

              <label className="mt-4 block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Rol</span>
                <select
                  value={form.rol}
                  onChange={updateField('rol')}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Seleccione un rol...</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Asistente Tecnico">Asistente Tecnico</option>
                  <option value="Productor">Productor</option>
                </select>
              </label>
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              <h4 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-slate-800">
                <ShieldCheck size={24} className="text-emerald-700" />
                Registro ICA y Credenciales Profesionales
              </h4>

              <div className="grid gap-4">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Número de Registro ICA</span>
                  <input
                    type="text"
                    value={form.registroIca}
                    onChange={updateField('registroIca')}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: ICA-2026-00123"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Tarjeta Profesional</span>
                  <input
                    type="text"
                    value={form.tarjetaProfesional}
                    onChange={updateField('tarjetaProfesional')}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: TP-54879"
                  />
                </label>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Nota: Los campos de Registro ICA y Tarjeta Profesional son requeridos para Técnicos. Para el rol de Productor, estos campos son opcionales.
                </div>
              </div>
            </>
          ) : null}

          {currentStep === 4 ? (
            <>
              <h4 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-slate-800">
                <UserCheck size={24} className="text-emerald-700" />
                Confirmación
              </h4>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xl font-semibold text-emerald-900">Usuario listo para crear</p>
                <p className="mt-1 text-sm text-emerald-800">
                  Verifica que la información sea correcta antes de continuar.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Nombres</p>
                  <p className="text-sm font-semibold text-slate-800">{form.nombres || '-'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Apellidos</p>
                  <p className="text-sm font-semibold text-slate-800">{form.apellidos || '-'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Identificación</p>
                  <p className="text-sm font-semibold text-slate-800">{form.identificacion || '-'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Usuario</p>
                  <p className="text-sm font-semibold text-slate-800">{form.usuario || '-'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Correo</p>
                  <p className="text-sm font-semibold text-slate-800">{form.correo || '-'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Rol</p>
                  <p className="text-sm font-semibold text-slate-800">{form.rol || '-'}</p>
                </div>
              </div>
            </>
          ) : null}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Anterior
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                {currentStep === 4 ? 'Crear Usuario' : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewUserModal;

import { ShieldCheck, UserCheck, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type NewUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  roles: { id: string; nombreRol: string }[];
  onCreate: (payload: FormData) => Promise<void> | void;
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

type StepErrors = Partial<Record<keyof FormData, string>>;

// Pasos fijos — el paso 3 (ICA) se muestra u oculta según el rol
const ALL_STEPS = ['Datos Personales', 'Cuenta y Credenciales', 'Registro ICA', 'Confirmación'];
const STEPS_NO_ICA = ['Datos Personales', 'Cuenta y Credenciales', 'Confirmación'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function NewUserModal({ isOpen, onClose, roles, onCreate }: NewUserModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<StepErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  // ¿El rol seleccionado es ASISTENTE?
  const isAsistente = useMemo(() => {
    if (!form.rol) return false;
    const found = roles.find((r) => r.id === form.rol);
    return found?.nombreRol?.toUpperCase().includes('ASISTENTE') ?? false;
  }, [form.rol, roles]);

  // Pasos visibles y total según rol
  const visibleSteps = isAsistente ? ALL_STEPS : STEPS_NO_ICA;
  const totalSteps = visibleSteps.length;

  // Título del paso actual
  const stepTitle = visibleSteps[currentStep - 1] ?? '';

  // Paso lógico: qué contenido renderizar (1=DatosPersonales 2=Cuenta 3=ICA 4=Confirmación)
  const logicalStep = useMemo(() => {
    const title = visibleSteps[currentStep - 1];
    return ALL_STEPS.indexOf(title) + 1;
  }, [currentStep, visibleSteps]);

  // Nombre legible del rol para la confirmación
  const rolNombre = useMemo(() => {
    if (!form.rol) return '-';
    return roles.find((r) => r.id === form.rol)?.nombreRol ?? '-';
  }, [form.rol, roles]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setForm(initialForm);
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateField =
    (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  // ── Validación por paso lógico ────────────────────────────────────────────
  const validate = (logical: number): StepErrors => {
    const e: StepErrors = {};
    if (logical === 1) {
      if (!form.identificacion.trim()) e.identificacion = 'La identificación es obligatoria.';
      if (!form.nombres.trim())        e.nombres        = 'El nombre es obligatorio.';
      if (!form.apellidos.trim())      e.apellidos      = 'Los apellidos son obligatorios.';
      if (!form.telefono.trim())       e.telefono       = 'El teléfono es obligatorio.';
      if (!form.direccion.trim())      e.direccion      = 'La dirección es obligatoria.';
    }
    if (logical === 2) {
      if (!form.usuario.trim()) e.usuario = 'El usuario es obligatorio.';
      if (!form.correo.trim()) {
        e.correo = 'El correo es obligatorio.';
      } else if (!EMAIL_RE.test(form.correo.trim())) {
        e.correo = 'El correo no tiene un formato válido (ej: nombre@dominio.com).';
      }
      if (!form.rol) e.rol = 'Debe seleccionar un rol.';
    }
    return e;
  };

  const handleNext = async () => {
    const errs = validate(logicalStep);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Último paso → crear
    if (saving) return;
    try {
      setSaving(true);
      setSubmitError('');
      await onCreate(form);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'Ocurrió un error al crear el usuario. Verifica los datos e intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setErrors({});
      setSubmitError('');
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Clases de input: borde rojo si hay error, normal si no
  const inputCls = (field: keyof FormData) =>
    `h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:ring-4 ${
      errors[field]
        ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100'
        : 'border-slate-300 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

  const ErrorMsg = ({ field }: { field: keyof FormData }) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-600">⚠ {errors[field]}</p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-8 backdrop-blur-[1px]">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

        {/* ── Header ── */}
        <div className="bg-emerald-900 px-5 py-3 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-bold leading-none">Nuevo Usuario</h3>
                <p className="mt-1 text-sm text-emerald-100">
                  Paso {currentStep} de {totalSteps} — {stepTitle}
                </p>
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

          {/* Stepper dinámico */}
          <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}>
            {visibleSteps.map((step, index) => {
              const number = index + 1;
              const active = number === currentStep;
              const done   = number < currentStep;
              return (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-xs font-bold ${
                      active ? 'bg-white text-emerald-900'
                      : done  ? 'bg-emerald-400 text-emerald-950'
                              : 'bg-emerald-800 text-emerald-200'
                    }`}
                  >
                    {number}
                  </span>
                  <span className={`text-xs ${active ? 'text-white' : done ? 'text-emerald-100' : 'text-emerald-200/80'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-5 sm:px-6">

          {/* Paso 1 — Datos Personales */}
          {logicalStep === 1 && (
            <>
              <h4 className="mb-4 text-2xl font-semibold text-slate-800">Datos Personales</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Número identificación <span className="text-red-500">*</span></span>
                  <input type="text" value={form.identificacion} onChange={updateField('identificacion')} className={inputCls('identificacion')} placeholder="Ej: 1032456789" />
                  <ErrorMsg field="identificacion" />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Teléfono <span className="text-red-500">*</span></span>
                  <input type="text" value={form.telefono} onChange={updateField('telefono')} className={inputCls('telefono')} placeholder="Ej: 3001234567" />
                  <ErrorMsg field="telefono" />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Nombres <span className="text-red-500">*</span></span>
                  <input type="text" value={form.nombres} onChange={updateField('nombres')} className={inputCls('nombres')} placeholder="Ej: Laura" />
                  <ErrorMsg field="nombres" />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Apellidos <span className="text-red-500">*</span></span>
                  <input type="text" value={form.apellidos} onChange={updateField('apellidos')} className={inputCls('apellidos')} placeholder="Ej: Pineda" />
                  <ErrorMsg field="apellidos" />
                </label>
              </div>

              <label className="mt-4 block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Dirección <span className="text-red-500">*</span></span>
                <input type="text" value={form.direccion} onChange={updateField('direccion')} className={inputCls('direccion')} placeholder="Ej: Calle 123 #45-67" />
                <ErrorMsg field="direccion" />
              </label>
            </>
          )}

          {/* Paso 2 — Cuenta y Credenciales */}
          {logicalStep === 2 && (
            <>
              <h4 className="mb-4 text-2xl font-semibold text-slate-800">Cuenta y Credenciales</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Usuario <span className="text-red-500">*</span></span>
                  <input type="text" value={form.usuario} onChange={updateField('usuario')} className={inputCls('usuario')} placeholder="Ej: lpineda" />
                  <ErrorMsg field="usuario" />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Correo electrónico <span className="text-red-500">*</span></span>
                  <input type="email" value={form.correo} onChange={updateField('correo')} className={inputCls('correo')} placeholder="correo@empresa.com" />
                  <ErrorMsg field="correo" />
                </label>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:col-span-2">
                  <p className="text-sm font-semibold text-emerald-900">Contraseña en primer acceso</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    El usuario creará su contraseña al ingresar por primera vez desde el flujo de restablecimiento.
                  </p>
                </div>
              </div>

              <label className="mt-4 block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Rol <span className="text-red-500">*</span></span>
                <select value={form.rol} onChange={updateField('rol')} className={`${inputCls('rol')} bg-white text-slate-700`}>
                  <option value="">Seleccione un rol...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.nombreRol}</option>
                  ))}
                </select>
                <ErrorMsg field="rol" />
              </label>
            </>
          )}

          {/* Paso 3 — Registro ICA (solo ASISTENTE) */}
          {logicalStep === 3 && (
            <>
              <h4 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-slate-800">
                <ShieldCheck size={24} className="text-emerald-700" />
                Registro ICA y Credenciales Profesionales
              </h4>
              <div className="grid gap-4">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Número de Registro ICA</span>
                  <input type="text" value={form.registroIca} onChange={updateField('registroIca')} className={inputCls('registroIca')} placeholder="Ej: ICA-2026-00123" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Tarjeta Profesional</span>
                  <input type="text" value={form.tarjetaProfesional} onChange={updateField('tarjetaProfesional')} className={inputCls('tarjetaProfesional')} placeholder="Ej: TP-54879" />
                </label>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Nota: Los campos de Registro ICA y Tarjeta Profesional son requeridos para Asistentes. Para otros roles, estos campos son opcionales.
                </div>
              </div>
            </>
          )}

          {/* Paso 4 — Confirmación */}
          {logicalStep === 4 && (
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

              {/* Error del backend */}
              {submitError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  ⚠ {submitError}
                </div>
              )}

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
                  <p className="text-xs uppercase tracking-wide text-slate-500">Teléfono</p>
                  <p className="text-sm font-semibold text-slate-800">{form.telefono || '-'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Dirección</p>
                  <p className="text-sm font-semibold text-slate-800">{form.direccion || '-'}</p>
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
                  <p className="text-sm font-semibold text-slate-800">{rolNombre}</p>
                </div>
                {isAsistente && (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Registro ICA</p>
                      <p className="text-sm font-semibold text-slate-800">{form.registroIca || '—'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Tarjeta Profesional</p>
                      <p className="text-sm font-semibold text-slate-800">{form.tarjetaProfesional || '—'}</p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── Footer ── */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Anterior
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
              >
                {currentStep === totalSteps ? (saving ? 'Creando...' : 'Crear Usuario') : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewUserModal;

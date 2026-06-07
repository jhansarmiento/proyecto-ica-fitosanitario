import { useState, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sprout,
  IdCard,
  AtSign,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { IconTrazabilidad, IconInspeccion, IconInforme } from '../components/ui/icons';
import FeatureItem from '../components/ui/FeatureItem';
import { request } from '../services/apiClient';


type RegisterProductorPageProps = {
  onGoLogin: () => void;
  onRegisterSuccess?: () => void;
};

type FormData = {
  numeroIdentificacion: string;
  nombres: string;
  apellidos: string;
  direccion: string;
  telefono: string;
  correoElectronico: string;
  ingresoUsuario: string;
  ingresoContrasena: string;
  confirmarContrasena: string;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{7,15}$/;

const initialForm: FormData = {
  numeroIdentificacion: '',
  nombres: '',
  apellidos: '',
  direccion: '',
  telefono: '',
  correoElectronico: '',
  ingresoUsuario: '',
  ingresoContrasena: '',
  confirmarContrasena: '',
};

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: 'Muy débil', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Débil', color: 'bg-orange-400' };
  if (score === 3) return { score, label: 'Regular', color: 'bg-yellow-400' };
  if (score === 4) return { score, label: 'Fuerte', color: 'bg-emerald-400' };
  return { score, label: 'Muy fuerte', color: 'bg-emerald-500' };
}

function InputField({
  label,
  icon,
  error,
  success,
  type = 'text',
  ...props
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  success?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-emerald-50/90">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300/70">
          {icon}
        </span>
        <input
          type={type}
          className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm text-white outline-none placeholder:text-emerald-50/40 transition-all duration-300 ${
            error
              ? 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)]'
              : success
                ? 'border-emerald-400/60 bg-emerald-500/10 focus:border-emerald-300 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.18)]'
                : 'border-white/10 bg-white/10 focus:border-emerald-300/70 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.18)]'
          }`}
          {...props}
        />
        {success && !error && (
          <CheckCircle2
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400"
          />
        )}
        {error && (
          <AlertCircle
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-red-400"
          />
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-300">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  icon,
  error,
  success,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  success?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-emerald-50/90">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300/70">
          {icon}
        </span>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm text-white outline-none placeholder:text-emerald-50/40 transition-all duration-300 ${
            error
              ? 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)]'
              : success
                ? 'border-emerald-400/60 bg-emerald-500/10 focus:border-emerald-300 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.18)]'
                : 'border-white/10 bg-white/10 focus:border-emerald-300/70 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.18)]'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-300/70 transition hover:text-emerald-200"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-300">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// reCAPTCHA visual simulado (sin clave real, solo UI)
function RecaptchaWidget({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (checked) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onChange(true);
    }, 900);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/8 px-4 py-3 shadow-inner backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-all duration-300 ${
            checked
              ? 'border-emerald-400 bg-emerald-500'
              : 'border-white/30 bg-white/10 hover:border-emerald-300'
          }`}
        >
          {loading ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : checked ? (
            <CheckCircle2 size={14} className="text-white" />
          ) : null}
        </button>
        <span className="text-sm font-medium text-emerald-50/90">No soy un robot</span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
          <ShieldCheck size={20} className="text-emerald-300" />
        </div>
        <span className="text-[9px] text-emerald-50/50">reCAPTCHA</span>
        <span className="text-[8px] text-emerald-50/40">Privacidad · Términos</span>
      </div>
    </div>
  );
}

export default function RegisterProductorPage({ onGoLogin, onRegisterSuccess }: RegisterProductorPageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [captchaDone, setCaptchaDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const pwdStrength = getPasswordStrength(form.ingresoContrasena);

  const update = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    [],
  );

  const validateStep1 = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!form.numeroIdentificacion.trim()) e.numeroIdentificacion = 'La identificación es obligatoria.';
    if (!form.nombres.trim()) e.nombres = 'El nombre es obligatorio.';
    if (!form.apellidos.trim()) e.apellidos = 'Los apellidos son obligatorios.';
    if (!form.direccion.trim()) e.direccion = 'La dirección es obligatoria.';
    if (!form.telefono.trim()) {
      e.telefono = 'El teléfono es obligatorio.';
    } else if (!PHONE_RE.test(form.telefono.trim())) {
      e.telefono = 'Ingresa un teléfono válido (solo números, 7-15 dígitos).';
    }
    if (!form.correoElectronico.trim()) {
      e.correoElectronico = 'El correo es obligatorio.';
    } else if (!EMAIL_RE.test(form.correoElectronico.trim())) {
      e.correoElectronico = 'Ingresa un correo electrónico válido.';
    }
    return e;
  };

  const validateStep2 = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!form.ingresoUsuario.trim()) {
      e.ingresoUsuario = 'El usuario es obligatorio.';
    } else if (form.ingresoUsuario.trim().length < 4) {
      e.ingresoUsuario = 'El usuario debe tener al menos 4 caracteres.';
    }
    if (!form.ingresoContrasena) {
      e.ingresoContrasena = 'La contraseña es obligatoria.';
    } else if (form.ingresoContrasena.length < 8) {
      e.ingresoContrasena = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!form.confirmarContrasena) {
      e.confirmarContrasena = 'Confirma tu contraseña.';
    } else if (form.ingresoContrasena !== form.confirmarContrasena) {
      e.confirmarContrasena = 'Las contraseñas no coinciden.';
    }
    return e;
  };

  const handleNextStep = () => {
    const errs = validateStep1();
    setErrors(errs);
    const allTouched: Partial<Record<keyof FormData, boolean>> = {};
    (Object.keys(initialForm) as (keyof FormData)[]).forEach((k) => { allTouched[k] = true; });
    setTouched(allTouched);
    if (Object.keys(errs).length === 0) {
      setStep(2);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep2();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!captchaDone) {
      setSubmitError('Por favor completa la verificación reCAPTCHA.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      await request<{ message: string }>('/auth/register-productor', {
        method: 'POST',
        body: JSON.stringify({
          numeroIdentificacion: form.numeroIdentificacion.trim(),
          nombre: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          direccion: form.direccion.trim(),
          telefono: form.telefono.trim(),
          correoElectronico: form.correoElectronico.trim(),
          ingresoUsuario: form.ingresoUsuario.trim(),
          ingresoContrasena: form.ingresoContrasena,
        }),
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        onRegisterSuccess?.();
        onGoLogin();
      }, 2500);
    } catch (err: any) {
      setSubmitError(err.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldOk = (field: keyof FormData) =>
    touched[field] && !errors[field] && form[field].trim().length > 0;

  if (submitSuccess) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_25%,#00b06a_0%,#00784b_30%,#014f35_55%,#02241a_78%,#050d0a_100%)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(16,185,129,0.18),transparent_45%)]" />
        <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-400/30">
            <CheckCircle2 size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-4xl font-extrabold">¡Cuenta creada!</h2>
          <p className="max-w-md text-lg text-emerald-100/80">
            Tu cuenta de productor fue registrada exitosamente. Serás redirigido al inicio de sesión en un momento.
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="h-full animate-[progress_2.5s_linear_forwards] rounded-full bg-emerald-400" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_25%,#00b06a_0%,#00784b_30%,#014f35_55%,#02241a_78%,#050d0a_100%)] text-white">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(16,185,129,0.18),transparent_45%)]" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-emerald-400/8 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-350 grid-cols-1 gap-10 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-14 lg:py-12">

        {/* ── Panel izquierdo ── */}
        <section className="flex flex-col justify-center gap-8 lg:pr-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="FitoGestor Logo" className="h-12 w-12 rounded-[14px] shadow-md object-cover" />
            <span className="text-[2.9rem] font-bold tracking-tight">FitoGestor</span>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-155 text-[2.6rem] font-bold leading-[1.02] sm:text-[3.2rem] lg:text-[4.15rem]">
              Únete como{' '}
              <span className="text-emerald-300">Productor</span>
            </h1>
            <p className="max-w-152.5 text-[1.05rem] font-semibold leading-[1.35] text-emerald-50 sm:text-[1.2rem] lg:text-[1.35rem]">
              Registra tus cultivos, solicita inspecciones fitosanitarias y accede a reportes especializados del ICA.
            </p>
          </div>

          <div className="mt-2 flex flex-col gap-3.5">
            <FeatureItem text="Trazabilidad Completa" icon={<IconTrazabilidad />} />
            <FeatureItem text="Inspecciones Digitalizadas" icon={<IconInspeccion />} />
            <FeatureItem text="Informes Especializados" icon={<IconInforme />} />
          </div>

          {/* Pasos visuales */}
          <div className="mt-2 flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300/80">
              Proceso de registro
            </p>
            <div className="flex flex-col gap-2">
              {[
                { n: 1, label: 'Información personal', active: step === 1 },
                { n: 2, label: 'Acceso al sistema', active: step === 2 },
              ].map(({ n, label, active }) => (
                <div key={n} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                      active
                        ? 'bg-emerald-400 text-emerald-950 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                        : step > n
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/10 text-emerald-200/60'
                    }`}
                  >
                    {step > n ? <CheckCircle2 size={14} /> : n}
                  </span>
                  <span
                    className={`text-base font-medium transition-colors duration-300 ${
                      active ? 'text-white' : step > n ? 'text-emerald-200' : 'text-emerald-50/50'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Panel derecho — Formulario ── */}
        <section className="flex items-center justify-center">
          <div className="w-full max-w-140 rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">

            {/* Header del formulario */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[1.9rem] font-bold leading-none sm:text-[2.2rem]">
                  {step === 1 ? 'Información Personal' : 'Acceso al Sistema'}
                </h2>
                <p className="mt-1.5 text-sm text-emerald-50/70">
                  Paso {step} de 2 — {step === 1 ? 'Datos de identificación' : 'Credenciales de acceso'}
                </p>
              </div>
              {/* Indicador de progreso circular */}
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - step / 2)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="text-sm font-bold text-emerald-300">{step}/2</span>
              </div>
            </div>

            {/* ── PASO 1: Información personal ── */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <InputField
                  label="Número de identificación *"
                  icon={<IdCard size={16} />}
                  placeholder="Ej: 1032456789"
                  value={form.numeroIdentificacion}
                  onChange={update('numeroIdentificacion')}
                  error={touched.numeroIdentificacion ? errors.numeroIdentificacion : undefined}
                  success={isFieldOk('numeroIdentificacion')}
                  autoComplete="off"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Nombres *"
                    icon={<User size={16} />}
                    placeholder="Ej: Carlos"
                    value={form.nombres}
                    onChange={update('nombres')}
                    error={touched.nombres ? errors.nombres : undefined}
                    success={isFieldOk('nombres')}
                    autoComplete="given-name"
                  />
                  <InputField
                    label="Apellidos *"
                    icon={<User size={16} />}
                    placeholder="Ej: Restrepo"
                    value={form.apellidos}
                    onChange={update('apellidos')}
                    error={touched.apellidos ? errors.apellidos : undefined}
                    success={isFieldOk('apellidos')}
                    autoComplete="family-name"
                  />
                </div>

                <InputField
                  label="Dirección *"
                  icon={<MapPin size={16} />}
                  placeholder="Ej: Vereda La Suiza, Km 3"
                  value={form.direccion}
                  onChange={update('direccion')}
                  error={touched.direccion ? errors.direccion : undefined}
                  success={isFieldOk('direccion')}
                  autoComplete="street-address"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Teléfono *"
                    icon={<Phone size={16} />}
                    placeholder="Ej: 3001234567"
                    value={form.telefono}
                    onChange={update('telefono')}
                    error={touched.telefono ? errors.telefono : undefined}
                    success={isFieldOk('telefono')}
                    autoComplete="tel"
                  />
                  <InputField
                    label="Correo electrónico *"
                    icon={<Mail size={16} />}
                    placeholder="correo@ejemplo.com"
                    value={form.correoElectronico}
                    onChange={update('correoElectronico')}
                    error={touched.correoElectronico ? errors.correoElectronico : undefined}
                    success={isFieldOk('correoElectronico')}
                    autoComplete="email"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-base font-bold text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_8px_28px_rgba(16,185,129,0.45)] active:translate-y-0"
                >
                  Continuar
                  <ChevronRight size={18} />
                </button>

                <div className="mt-1 border-t border-white/10 pt-4 text-center">
                  <p className="text-sm text-emerald-50/70">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={onGoLogin}
                      className="font-semibold text-emerald-300 underline-offset-2 transition hover:text-emerald-200 hover:underline"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ── PASO 2: Acceso al sistema ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <InputField
                  label="Nombre de usuario *"
                  icon={<AtSign size={16} />}
                  placeholder="Ej: crestrepo_prod"
                  value={form.ingresoUsuario}
                  onChange={update('ingresoUsuario')}
                  error={touched.ingresoUsuario ? errors.ingresoUsuario : undefined}
                  success={isFieldOk('ingresoUsuario')}
                  autoComplete="username"
                />

                <div className="flex flex-col gap-1.5">
                  <PasswordField
                    label="Contraseña *"
                    icon={<Lock size={16} />}
                    placeholder="Mínimo 8 caracteres"
                    value={form.ingresoContrasena}
                    onChange={update('ingresoContrasena')}
                    error={touched.ingresoContrasena ? errors.ingresoContrasena : undefined}
                    success={isFieldOk('ingresoContrasena') && pwdStrength.score >= 3}
                    autoComplete="new-password"
                  />
                  {/* Indicador de fortaleza */}
                  {form.ingresoContrasena && (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i <= pwdStrength.score ? pwdStrength.color : 'bg-white/15'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-emerald-50/60">
                        Fortaleza:{' '}
                        <span
                          className={`font-semibold ${
                            pwdStrength.score <= 2
                              ? 'text-red-300'
                              : pwdStrength.score === 3
                                ? 'text-yellow-300'
                                : 'text-emerald-300'
                          }`}
                        >
                          {pwdStrength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <PasswordField
                  label="Confirmar contraseña *"
                  icon={<Lock size={16} />}
                  placeholder="Repite tu contraseña"
                  value={form.confirmarContrasena}
                  onChange={update('confirmarContrasena')}
                  error={touched.confirmarContrasena ? errors.confirmarContrasena : undefined}
                  success={
                    isFieldOk('confirmarContrasena') &&
                    form.ingresoContrasena === form.confirmarContrasena &&
                    form.confirmarContrasena.length > 0
                  }
                  autoComplete="new-password"
                />

                {/* Requisitos de contraseña */}
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
                    Requisitos de contraseña
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { ok: form.ingresoContrasena.length >= 8, label: 'Mínimo 8 caracteres' },
                      { ok: /[A-Z]/.test(form.ingresoContrasena), label: 'Una mayúscula' },
                      { ok: /[0-9]/.test(form.ingresoContrasena), label: 'Un número' },
                      { ok: /[^A-Za-z0-9]/.test(form.ingresoContrasena), label: 'Un símbolo especial' },
                    ].map(({ ok, label }) => (
                      <p
                        key={label}
                        className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                          ok ? 'text-emerald-300' : 'text-emerald-50/40'
                        }`}
                      >
                        <CheckCircle2 size={11} className={ok ? 'opacity-100' : 'opacity-30'} />
                        {label}
                      </p>
                    ))}
                  </div>
                </div>

                {/* reCAPTCHA */}
                <RecaptchaWidget checked={captchaDone} onChange={setCaptchaDone} />

                {submitError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
                    <AlertCircle size={16} className="shrink-0" />
                    {submitError}
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting || !captchaDone}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-base font-bold text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_8px_28px_rgba(16,185,129,0.45)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <Sprout size={18} />
                        Crear Cuenta
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrors({}); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent py-3 text-sm font-semibold text-emerald-100 transition-all duration-300 hover:border-emerald-300/40 hover:bg-white/8 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Volver al paso anterior
                  </button>
                </div>

                <div className="border-t border-white/10 pt-3 text-center">
                  <button
                    type="button"
                    onClick={onGoLogin}
                    className="text-sm text-emerald-50/70 transition hover:text-emerald-200"
                  >
                    ← Volver al Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      <p className="relative pb-5 text-center text-sm text-emerald-50/60">
        © 2026 Instituto Colombiano Agropecuario (ICA) · Al registrarte aceptas los términos de uso
      </p>
    </main>
  );
}

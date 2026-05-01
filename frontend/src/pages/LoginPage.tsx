import FeatureItem from '../components/ui/FeatureItem';
import StatItem from '../components/ui/StatItem';
import TextInput from '../components/ui/TextInput';
import CheckboxField from '../components/ui/CheckboxField';
import PrimaryButton from '../components/ui/PrimaryButton';
import { IconTrazabilidad, IconInspeccion, IconInforme } from "../components/ui/icons";

function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_25%,#00b06a_0%,#00784b_30%,#014f35_55%,#02241a_78%,#050d0a_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(16,185,129,0.18),transparent_45%)]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 gap-10 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-14 lg:py-12">
        <section className="flex flex-col justify-center gap-8 lg:pr-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-[14px] bg-white/95 shadow-md" />
            <span className="text-[2.9rem] font-bold tracking-tight">FitoGestor</span>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-[620px] text-[2.6rem] font-bold leading-[1.02] sm:text-[3.2rem] lg:text-[4.15rem]">
              Control de Calidad <br />
              <span className="text-emerald-300">Fitosanitaria</span>
            </h1>

            <p className="max-w-[610px] text-[1.05rem] font-semibold leading-[1.35] text-emerald-50 sm:text-[1.2rem] lg:text-[1.35rem]">
              Plataforma integral para la gestión en inspecciones de productos agrícolas colombianos con
              los más altos estándares internacionales.
            </p>
          </div>

          <div className="mt-2 flex flex-col gap-3.5">
            <FeatureItem text="Trazabilidad Completa" icon={<IconTrazabilidad />}/>
            <FeatureItem text="Inspecciones Digitalizadas" icon={<IconInspeccion />}/>
            <FeatureItem text="Informes Especializados" icon={<IconInforme />}/>
          </div>

          <div className="mt-4 flex flex-wrap gap-20 border-t border-white/20 pt-5">
            <StatItem value="10K+" label="Inspecciones" />
            <StatItem value="5K+" label="Usuarios" />
            <StatItem value="99%" label="Satisfacción" />
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-[560px] rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
            <h2 className="mb-2 text-center text-[2.2rem] font-bold leading-none sm:text-[2.6rem]">Iniciar Sesión</h2>
            <p className="mb-7 text-center text-[1.1rem] text-emerald-50/85">Ingresa a tu cuenta</p>

            <form className="flex flex-col gap-4.5">
              <TextInput label="Usuario" placeholder="Usuario" type="text" />
              <TextInput label="Contraseña" placeholder="••••••••" type="password" />

              <div className="my-0.5 flex flex-wrap items-center justify-between gap-2">
                <CheckboxField id="remember" label="Recordarme" />
                <button
                  type="button"
                  className="text-[0.96rem] font-medium text-emerald-50/90 transition-colors duration-300 hover:text-emerald-200"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <PrimaryButton type="button">Iniciar Sesión</PrimaryButton>
            </form>

            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="text-center text-[1rem] text-emerald-50/90">¿Necesitas ayuda? Contacta soporte</p>
            </div>
          </div>
        </section>
      </div>

      <p className="relative pb-5 text-center text-sm text-emerald-50/85">
        © 2026 Instituto Colombiano Agropecuario (ICA)
      </p>
    </main>
  );
}

export default LoginPage;

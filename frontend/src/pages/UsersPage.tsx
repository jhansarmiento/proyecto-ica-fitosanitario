import { useEffect, useState } from 'react';
import { Home, Users, Layers, Folder, ShieldCheck, BarChart3, Bell, ChevronDown, Search, Pencil, Trash2, Plus } from 'lucide-react';
import SidebarItem from '../components/ui/SidebarItem';
import NewUserModal from '../components/ui/NewUserModal';
import EditUserModal, { type EditableUser } from '../components/ui/EditUserModal';
import { api } from '../services/api';


type UsersPageProps = {
  onGoHome?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
};

function UsersPage({ onGoHome, onGoRoles, onGoAgricultural }: UsersPageProps) {
  const [isUsersOpen, setIsUsersOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EditableUser | null>(null);
  const [success, setSuccess] = useState('');
  const [rolesOptions, setRolesOptions] = useState<{ id: string; nombreRol: string }[]>([]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.identificacion.toLowerCase().includes(q) ||
      u.nombres.toLowerCase().includes(q) ||
      u.apellidos.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    );
  });

  const handleEditClick = (user: EditableUser) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersResponse, rolesResponse] = await Promise.all([api.getUsuarios(), api.getRoles()]);
      const roleMap = new Map(rolesResponse.data.map((r) => [r.id, r.nombreRol]));
      setRolesOptions(rolesResponse.data.map((r) => ({ id: r.id, nombreRol: r.nombreRol })));

      const mapped: EditableUser[] = usersResponse.data.map((u, idx) => ({
        id: ((u.id as unknown as string) || `tmp-${idx}`) as any,
        identificacion: u.numeroIdentificacion || '',
        telefono: u.telefono || '',
        nombres: u.nombre || '',
        apellidos: u.apellidos || '',
        direccion: u.direccion || '',
        usuario: u.ingresoUsuario || '',
        correo: u.correoElectronico || '',
        rol: (u.idRol && roleMap.get(u.idRol)) || u.Rol?.nombreRol || 'Sin rol',
        registroIca: u.registroICA || '',
        tarjetaProfesional: u.tarjetaProfesional || '',
      }));
      setUsers(mapped);
    } catch (e: any) {
      setError(e.message || 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaveUser = async (payload: EditableUser) => {
    try {
      await api.updateUsuario(String(payload.id), {
        numeroIdentificacion: payload.identificacion,
        nombre: payload.nombres,
        apellidos: payload.apellidos,
        direccion: payload.direccion,
        telefono: payload.telefono,
        ingresoUsuario: payload.usuario,
        correoElectronico: payload.correo,
        registroICA: payload.registroIca,
        tarjetaProfesional: payload.tarjetaProfesional,
      });
      await loadUsers();
      setSuccess('Usuario actualizado correctamente');
    } catch (e: any) {
      setError(e.message || 'No se pudo actualizar el usuario');
    }
  };

  const handleCreateUser = async (payload: {
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
  }) => {
    try {
      setError('');
      await api.createUsuario({
        numeroIdentificacion: payload.identificacion,
        telefono: payload.telefono,
        nombre: payload.nombres,
        apellidos: payload.apellidos,
        direccion: payload.direccion,
        ingresoUsuario: payload.usuario,
        correoElectronico: payload.correo,
        idRol: payload.rol,
        registroICA: payload.registroIca || null,
        tarjetaProfesional: payload.tarjetaProfesional || null,
        ingresoContrasena: payload.identificacion || 'Temporal123*',
      });
      await loadUsers();
      setSuccess('Usuario creado correctamente');
    } catch (e: any) {
      setError(e.message || 'No se pudo crear el usuario');
      throw e;
    }
  };

  const handleDeleteUser = async (id: string | number) => {
    try {
      await api.deleteUsuario(String(id));
      await loadUsers();
      setSuccess('Usuario eliminado correctamente');
    } catch (e: any) {
      setError(e.message || 'No se pudo eliminar el usuario');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="relative flex flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white">
          <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="h-12 w-12 rounded-xl bg-white/95 shadow-md" />
            <div>
              <p className="text-2xl font-bold leading-none">FitoGestor</p>
              <p className="mt-1 text-sm text-emerald-100/90">Sistema Fitosanitario</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            <button
              type="button"
              onClick={onGoHome}
              className="w-full"
            >
              <SidebarItem label="Inicio" icon={<Home size={20} />} />
            </button>

            <button
              type="button"
              onClick={() => setIsUsersOpen((prev) => !prev)}
              className="group relative flex w-full items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-left text-white transition-all duration-300 hover:bg-white/15"
            >
              <Users size={20} className="text-emerald-200" />
              <span className="flex-1 text-[1.02rem] font-semibold tracking-tight">Gestión de Usuarios</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${isUsersOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isUsersOpen ? (
              <div className="ml-3 mt-1 space-y-1">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl bg-white px-3 py-2 text-left text-base font-semibold text-emerald-900 shadow-sm"
                >
                  <Users size={18} />
                  Usuarios
                </button>
                <button
                  type="button"
                  onClick={onGoRoles}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base font-medium text-emerald-100 transition hover:bg-white/10 hover:text-white"
                >
                  <ShieldCheck size={18} />
                  Roles
                </button>
              </div>
            ) : null}

            {/* <SidebarItem label="Gestión de Catálogos" hasChevron icon={<FileText size={20} />} /> */}
            <button type="button" onClick={onGoAgricultural} className="w-full">
              <SidebarItem label="Gestión Agrícola" icon={<Layers size={20} />} />
            </button>
            <SidebarItem label="Mis Solicitudes" icon={<Folder size={20} />} />
            <SidebarItem label="Inspecciones" hasChevron icon={<ShieldCheck size={20} />} />
            <SidebarItem label="Reportes" icon={<BarChart3 size={20} />} />
          </nav>

          <button
            type="button"
            className="mt-4 flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-3 text-base font-bold text-red-300 transition hover:bg-red-500/20"
          >
            <span>↪</span>
            Cerrar Sesion
          </button>
        </aside>

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex min-h-[84px] flex-wrap items-center justify-between gap-3 border-b border-emerald-800/40 bg-emerald-900/95 px-5 py-3 text-white backdrop-blur sm:px-8">
            <div>
              <h1 className="text-3xl font-bold leading-none">Gestión de Usuarios</h1>
              <p className="mt-1 text-sm text-emerald-100">Sistema de Inspección Fitosanitaria</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-900/40 text-emerald-300 transition-all duration-300 hover:bg-emerald-700/80 hover:text-white">
                <Bell size={18} />
              </button>
              <div className="text-right">
                <p className="text-base font-bold leading-none">Pepito Perez</p>
                <p className="text-xs text-emerald-200">Administrador</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700 text-sm font-bold">PP</div>
            </div>
          </header>

          <section className="flex-1 p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Listado de Usuarios</h2>

              <button
                type="button"
                onClick={() => setIsNewUserOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md"
              >
                <Plus size={18} />
                Nuevo Usuario
              </button>
            </div>

            <div className="mb-4 flex w-full max-w-xl items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar usuarios"
                className="w-full bg-transparent text-base text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>

            {error ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600">
                <p>Identificación</p>
                <p>Nombres</p>
                <p>Apellidos</p>
                <p>Rol</p>
                <p className="text-right">Acciones</p>
              </div>

              {loading ? (
                <div className="px-5 py-6 text-sm text-slate-500">Cargando usuarios...</div>
              ) : filteredUsers.map((row, idx) => (
                <div
                  key={row.id}
                  className={`grid grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr] items-center px-5 py-3 text-sm transition hover:bg-emerald-50/40 ${
                    idx !== filteredUsers.length - 1 ? 'border-b border-slate-200' : ''
                  }`}
                >
                  <p className="font-medium text-slate-700">{row.identificacion}</p>
                  <p className="text-slate-700">{row.nombres}</p>
                  <p className="text-slate-700">{row.apellidos}</p>
                  <p className="text-slate-600">{row.rol}</p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      title="Editar usuario"
                      onClick={() => handleEditClick(row)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      title="Eliminar usuario"
                      onClick={() => handleDeleteUser(row.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <p>Mostrando 1-{filteredUsers.length} de {users.length} resultados</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 font-medium transition hover:bg-slate-50"
                >
                  Anterior
                </button>
                <button type="button" className="rounded-xl bg-emerald-900 px-3 py-1.5 font-semibold text-white">
                  1
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 font-medium transition hover:bg-slate-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <NewUserModal
        isOpen={isNewUserOpen}
        onClose={() => setIsNewUserOpen(false)}
        roles={rolesOptions}
        onCreate={handleCreateUser}
      />
      <EditUserModal
        isOpen={isEditUserOpen}
        user={selectedUser}
        onClose={() => setIsEditUserOpen(false)}
        onSave={handleSaveUser}
      />
    </main>
  );
}

export default UsersPage;

import { useEffect, useState } from 'react';
import { Search, Pencil, Trash2, Plus, AlertTriangle, X } from 'lucide-react';
import NewUserModal from '../components/ui/NewUserModal';
import EditUserModal, { type EditableUser } from '../components/ui/EditUserModal';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { SessionUser } from '../App';

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
};

function ConfirmDeleteModal({ isOpen, userName, onConfirm, onCancel, isDeleting }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-[1px]">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center gap-3 bg-red-600 px-5 py-4 text-white">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-red-500 ring-1 ring-white/20">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold leading-none">Eliminar usuario</h3>
            <p className="mt-0.5 text-sm text-red-100">Esta acción no se puede deshacer</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center rounded-lg text-red-100 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-base text-slate-700">
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            <span className="font-bold text-slate-900">"{userName}"</span>?
          </p>
          <p className="mt-2 text-sm text-slate-500">Se eliminarán permanentemente todos los datos asociados a este usuario.</p>
          <div className="my-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">⚠ Advertencia:</span> Esta operación es irreversible.
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={15} />
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type UsersPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoCatalog?: () => void;
  onGoApprovalPlaces?: () => void;
  onLogout?: () => void;
};

function UsersPage({
  sessionUser,
  onGoHome,
  onGoRoles,
  onGoAgricultural,
  onGoCatalog,
  onGoApprovalPlaces,
  onLogout,
}: UsersPageProps) {
  const [search, setSearch] = useState('');
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EditableUser | null>(null);
  const [success, setSuccess] = useState('');
  const [rolesOptions, setRolesOptions] = useState<{ id: string; nombreRol: string }[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<EditableUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        rol: (u.idRol && roleMap.get(u.idRol)) || u.rol?.nombreRol || 'Sin rol',
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
    await api.updateUsuario(String(payload.id), {
      numeroIdentificacion: payload.identificacion,
      nombre: payload.nombres,
      apellidos: payload.apellidos,
      direccion: payload.direccion,
      telefono: payload.telefono,
      ingresoUsuario: payload.usuario,
      correoElectronico: payload.correo,
      idRol: payload.rol || undefined,
      registroICA: payload.registroIca,
      tarjetaProfesional: payload.tarjetaProfesional,
    });
    await loadUsers();
    setSuccess('Usuario actualizado correctamente');
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

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteUsuario(String(deleteTarget.id));
      await loadUsers();
      setSuccess('Usuario eliminado correctamente');
      setDeleteTarget(null);
    } catch (e: any) {
      setError(e.message || 'No se pudo eliminar el usuario');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title="Gestión de Usuarios"
      sessionUser={sessionUser}
      activeView="users"
      onNavigate={(view) => {
        if (view === 'home') onGoHome?.();
        if (view === 'roles') onGoRoles?.();
        if (view === 'agricultural') onGoAgricultural?.();
        if (view === 'catalog') onGoCatalog?.();
        if (view === 'approval-places') onGoApprovalPlaces?.();
      }}
      onLogout={onLogout}
    >
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

      {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600">
          <p>Identificación</p><p>Nombres</p><p>Apellidos</p><p>Rol</p><p className="text-right">Acciones</p>
        </div>

        {loading ? (
          <div className="px-5 py-6 text-sm text-slate-500">Cargando usuarios...</div>
        ) : (
          filteredUsers.map((row, idx) => (
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
                  onClick={() => {
                    setSelectedUser(row);
                    setIsEditUserOpen(true);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  title="Eliminar usuario"
                  onClick={() => setDeleteTarget(row)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <NewUserModal isOpen={isNewUserOpen} onClose={() => setIsNewUserOpen(false)} roles={rolesOptions} onCreate={handleCreateUser} />
      <EditUserModal isOpen={isEditUserOpen} user={selectedUser} roles={rolesOptions} onClose={() => setIsEditUserOpen(false)} onSave={handleSaveUser} />
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        userName={deleteTarget ? `${deleteTarget.nombres} ${deleteTarget.apellidos}` : ''}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
}

export default UsersPage;

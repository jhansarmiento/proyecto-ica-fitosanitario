import { useEffect, useState } from 'react';
import { Search, Pencil, Trash2, Plus, AlertTriangle, X } from 'lucide-react';
import NewRoleModal from '../components/ui/NewRoleModal';
import EditRoleModal, { type EditableRole } from '../components/ui/EditRoleModal';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { SessionUser } from '../App';

type ConfirmDeleteRoleModalProps = {
  isOpen: boolean;
  roleName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
};

function ConfirmDeleteRoleModal({ isOpen, roleName, onConfirm, onCancel, isDeleting }: ConfirmDeleteRoleModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-[1px]">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center gap-3 bg-red-600 px-5 py-4 text-white">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-red-500 ring-1 ring-white/20">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold leading-none">Eliminar rol</h3>
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
            ¿Estás seguro de que deseas eliminar el rol <span className="font-bold text-slate-900">"{roleName}"</span>?
          </p>
          <p className="mt-2 text-sm text-slate-500">Los usuarios con este rol quedarán sin rol asignado.</p>
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

type RolesPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoAgricultural?: () => void;
  onGoApprovalPlaces?: () => void;
  onLogout?: () => void;
};

function RolesPage({ sessionUser, onGoHome, onGoUsers, onGoAgricultural, onGoApprovalPlaces, onLogout }: RolesPageProps) {
  const [search, setSearch] = useState('');
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  const [roles, setRoles] = useState<EditableRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<EditableRole | null>(null);
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<EditableRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredRoles = roles.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return r.rol.toLowerCase().includes(q) || r.descripcion.toLowerCase().includes(q);
  });

  const handleEditClick = (role: EditableRole) => {
    setSelectedRole(role);
    setIsEditRoleOpen(true);
  };

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getRoles();
      const mapped: EditableRole[] = response.data.map((r) => ({
        id: r.id as any,
        rol: r.nombreRol,
        descripcion: r.descripcion || '',
      }));
      setRoles(mapped);
    } catch (e: any) {
      setError(e.message || 'No se pudieron cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleSaveRole = async (payload: EditableRole) => {
    await api.updateRole(String(payload.id), {
      nombreRol: payload.rol,
      descripcion: payload.descripcion,
    });
    await loadRoles();
    setSuccess('Rol actualizado correctamente');
  };

  const handleCreateRole = async (payload: { rol: string; descripcion: string }) => {
    try {
      setError('');
      await api.createRole({
        nombreRol: payload.rol,
        descripcion: payload.descripcion,
      });
      await loadRoles();
      setSuccess('Rol creado correctamente');
    } catch (e: any) {
      setError(e.message || 'No se pudo crear el rol');
      throw e;
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteRole(String(deleteTarget.id));
      await loadRoles();
      setSuccess('Rol eliminado correctamente');
      setDeleteTarget(null);
    } catch (e: any) {
      setError(e.message || 'No se pudo eliminar el rol');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title="Gestión de Roles"
      sessionUser={sessionUser}
      activeView="roles"
      onNavigate={(view) => {
        if (view === 'home') onGoHome?.();
        if (view === 'users') onGoUsers?.();
        if (view === 'agricultural') onGoAgricultural?.();
        if (view === 'approval-places') onGoApprovalPlaces?.();
      }}
      onLogout={onLogout}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Listado de Roles</h2>
        <button
          type="button"
          onClick={() => setIsNewRoleOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md"
        >
          <Plus size={18} />
          Nuevo Rol
        </button>
      </div>

      <div className="mb-4 flex w-full max-w-xl items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar roles"
          className="w-full bg-transparent text-base text-slate-700 placeholder:text-slate-400 outline-none"
        />
      </div>

      {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_2fr_0.8fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600">
          <p>Rol</p>
          <p>Descripción</p>
          <p className="text-right">Acciones</p>
        </div>

        {loading ? (
          <div className="px-5 py-6 text-sm text-slate-500">Cargando roles...</div>
        ) : (
          filteredRoles.map((row, idx) => (
            <div
              key={row.id}
              className={`grid grid-cols-[1fr_2fr_0.8fr] items-center px-5 py-3 text-sm transition hover:bg-emerald-50/40 ${
                idx !== filteredRoles.length - 1 ? 'border-b border-slate-200' : ''
              }`}
            >
              <p className="font-medium text-slate-700">{row.rol}</p>
              <p className="text-slate-700">{row.descripcion}</p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  title="Editar rol"
                  onClick={() => handleEditClick(row)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  title="Eliminar rol"
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <p>Mostrando 1-{filteredRoles.length} de {roles.length} resultados</p>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 font-medium transition hover:bg-slate-50">
            Anterior
          </button>
          <button type="button" className="rounded-xl bg-emerald-900 px-3 py-1.5 font-semibold text-white">
            1
          </button>
          <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 font-medium transition hover:bg-slate-50">
            Siguiente
          </button>
        </div>
      </div>

      <NewRoleModal isOpen={isNewRoleOpen} onClose={() => setIsNewRoleOpen(false)} onCreate={handleCreateRole} />
      <EditRoleModal isOpen={isEditRoleOpen} role={selectedRole} onClose={() => setIsEditRoleOpen(false)} onSave={handleSaveRole} />
      <ConfirmDeleteRoleModal
        isOpen={deleteTarget !== null}
        roleName={deleteTarget?.rol ?? ''}
        onConfirm={handleDeleteRole}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
}

export default RolesPage;

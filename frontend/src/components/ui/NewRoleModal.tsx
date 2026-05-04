import { Shield, X } from "lucide-react";
import { useEffect, useState } from "react";

type NewRoleModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (payload: { rol: string; descripcion: string }) => Promise<void> | void;
};

function NewRoleModal({ isOpen, onClose, onCreate }: NewRoleModalProps) {
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setRoleName("");
            setDescription("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const canSubmit = roleName.trim().length > 0;

    const handleCreate = async () => {
        if (!canSubmit || saving) return;
        try {
            setSaving(true);
            await onCreate({
                rol: roleName.trim(),
                descripcion: description.trim(),
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-8 backdrop-blur-[1px]">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                <div className="bg-emerald-900 px-6 py-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold leading-none">Nuevo Rol</h3>
                                <p className="mt-1 text-sm text-emerald-100">
                                    Completa los datos del nuevo rol
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
                </div>

                <div className="px-6 py-6">
                    <h4 className="mb-5 text-2xl font-semibold tracking-tight text-slate-900">
                        Información Rol
                    </h4>

                    <div className="space-y-4">
                        <label className="block space-y-1.5">
                            <span className="text-sm font-medium text-slate-700">Rol</span>
                            <input
                                type="text"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="Ej: Coordinador Regional"
                                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                            />
                        </label>

                        <label className="block space-y-1.5">
                            <span className="text-sm font-medium text-slate-700">
                                Descripción
                            </span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe los permisos y responsabilidades del rol..."
                                className="min-h-[130px] w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                            />
                        </label>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={!canSubmit || saving}
                            className="rounded-xl bg-emerald-900 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
                        >
                            {saving ? 'Creando...' : 'Crear rol'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewRoleModal;

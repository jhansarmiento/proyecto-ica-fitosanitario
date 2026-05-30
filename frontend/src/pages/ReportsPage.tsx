import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Filter, Search, XCircle } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import type { DashboardViewKey } from "../types/dashboard.types";
import type { SessionUser } from "../types/auth.types";
import { fincaService } from "../services/finca.service";
import jsPDF from "jspdf";
import "jspdf-autotable";

type ReportsPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoCatalog?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoInspectionsHistory?: () => void;
  onLogout?: () => void;
};

export default function ReportsPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoCatalog,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onGoInspectionsHistory,
  onLogout,
}: ReportsPageProps) {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filtros ──
  const [filterLugar, setFilterLugar] = useState("");
  const [filterLote, setFilterLote] = useState("");
  const [filterEspecie, setFilterEspecie] = useState("");
  const [filterFechaInicio, setFilterFechaInicio] = useState("");
  const [filterFechaFin, setFilterFechaFin] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        setLoading(true);
        const res = await fincaService.getReportesFitosanitarios();
        setReportes(res.data || []);
      } catch (error) {
        console.error("Error al cargar reportes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportes();
  }, []);

  const handleNavigate = (view: DashboardViewKey) => {
    const map: Record<DashboardViewKey, (() => void) | undefined> = {
      home: onGoHome,
      users: onGoUsers,
      roles: onGoRoles,
      agricultural: onGoAgricultural,
      catalog: onGoCatalog,
      "approval-places": onGoApprovalPlaces,
      "inspections-agenda": onGoInspectionsAgenda,
      "inspections-history": onGoInspectionsHistory,
      reports: undefined,
      'mis-solicitudes': undefined,
    };
    map[view]?.();
  };

  // ── Filtrado Múltiple ──
  const filtered = useMemo(() => {
    return reportes.filter((i) => {
      const q = search.toLowerCase();
      // Búsqueda en texto de plagas
      const txtPlagas = i.plagas
        .map((p: any) => p.nombre.toLowerCase())
        .join(" ");

      const matchSearch =
        !q ||
        i.lugar_produccion.toLowerCase().includes(q) ||
        i.lote.toLowerCase().includes(q) ||
        i.cultivo.toLowerCase().includes(q) ||
        i.tecnico.toLowerCase().includes(q) ||
        txtPlagas.includes(q);
      const matchLugar =
        !filterLugar ||
        i.lugar_produccion.toLowerCase().includes(filterLugar.toLowerCase());
      const matchLote =
        !filterLote || i.lote.toLowerCase().includes(filterLote.toLowerCase());
      const matchEspecie =
        !filterEspecie ||
        i.cultivo.toLowerCase().includes(filterEspecie.toLowerCase());
      const matchInicio = !filterFechaInicio || i.fecha >= filterFechaInicio;
      const matchFin = !filterFechaFin || i.fecha <= filterFechaFin;

      return (
        matchSearch &&
        matchLugar &&
        matchLote &&
        matchEspecie &&
        matchInicio &&
        matchFin
      );
    });
  }, [
    reportes,
    search,
    filterLugar,
    filterLote,
    filterEspecie,
    filterFechaInicio,
    filterFechaFin,
  ]);

  const resetFilters = () => {
    setFilterLugar("");
    setFilterLote("");
    setFilterEspecie("");
    setFilterFechaInicio("");
    setFilterFechaFin("");
    setSearch("");
  };
  const hasActiveFilters =
    filterLugar ||
    filterLote ||
    filterEspecie ||
    filterFechaInicio ||
    filterFechaFin ||
    search;

  // 🌟 GENERADOR DE PDF PROFESIONAL
  const exportarPDF = () => {
    const doc = new jsPDF("landscape"); // Formato horizontal para que quepan las columnas

    // Título y Cabeceras
    doc.setFontSize(16);
    doc.text("Reporte Oficial de Trazabilidad Fitosanitaria", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Generado el: ${new Date().toLocaleDateString()} - Sistema FitoGestor`,
      14,
      22,
    );

    // Mapeo de datos para la tabla
    const tableData = filtered.map((r) => {
      // Convertir el arreglo de plagas en un string legible "Broca (5), Roya (2)"
      const textoPlagas =
        r.plagas.map((p: any) => `${p.nombre} (${p.cantidad})`).join(", ") ||
        "Sin hallazgos";

      return [
        r.fecha,
        r.lugar_produccion,
        r.lote,
        r.cultivo,
        r.tecnico,
        r.plantas_totales.toString(),
        textoPlagas,
        `${r.porcentaje_infestacion}%`,
      ];
    });

    // Inyectar tabla en el PDF
    (doc as any).autoTable({
      startY: 30,
      head: [
        [
          "Fecha",
          "Lugar de Producción",
          "Lote",
          "Cultivo",
          "Técnico",
          "Total Plantas",
          "Plagas Halladas (Cant.)",
          "% Infestación",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [1, 92, 75],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      }, // Color Emerald-800
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 6: { cellWidth: 50 } }, // Darle más espacio a las plagas
    });

    doc.save(`Reporte_FitoGestor_${new Date().getTime()}.pdf`);
  };

  return (
    <DashboardLayout
      title="Reportes Fitosanitarios"
      subtitle="Trazabilidad y análisis oficial de inspecciones agrícolas"
      sessionUser={sessionUser}
      activeView="reports"
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        {/* ── Panel de filtros ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-700">
                Filtros de Reporte
              </h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <XCircle size={13} /> Limpiar filtros
              </button>
            )}
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Búsqueda global..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                Lugar Producción
              </label>
              <input
                type="text"
                value={filterLugar}
                onChange={(e) => setFilterLugar(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                Lote
              </label>
              <input
                type="text"
                value={filterLote}
                onChange={(e) => setFilterLote(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                Cultivo
              </label>
              <input
                type="text"
                value={filterEspecie}
                onChange={(e) => setFilterEspecie(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                Desde Fecha
              </label>
              <input
                type="date"
                value={filterFechaInicio}
                onChange={(e) => setFilterFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                Hasta Fecha
              </label>
              <input
                type="date"
                value={filterFechaFin}
                onChange={(e) => setFilterFechaFin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── Exportador Exclusivo PDF ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="text-rose-600" /> Reporte Oficial PDF
            </h3>
            <p className="text-sm text-slate-500">
              Genera un documento oficial con los {filtered.length} lotes
              listados en la vista previa.
            </p>
          </div>
          <button
            onClick={exportarPDF}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-8 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-95 disabled:opacity-50"
          >
            <Download size={18} /> Exportar Documento PDF
          </button>
        </div>

        {/* ── Tabla de Previsualización (CRÍTICO PARA UX) ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">
              Vista Previa de Datos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Lugar / Lote</th>
                  <th className="px-5 py-4">Cultivo</th>
                  <th className="px-5 py-4">Técnico</th>
                  <th className="px-5 py-4">Estado Fenológico</th>
                  <th className="px-5 py-4 bg-rose-50/50">Plagas Halladas</th>
                  <th className="px-5 py-4 bg-rose-50/50">Infestación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-slate-500 animate-pulse"
                    >
                      Cargando datos...
                    </td>
                  </tr>
                ) : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-slate-500 italic"
                    >
                      No hay reportes que coincidan con los filtros.
                    </td>
                  </tr>
                ) : null}
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">
                        {r.lugar_produccion}
                      </p>
                      <p className="text-xs text-slate-500">
                        Lote: {r.lote} • {r.fecha}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {r.cultivo}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{r.tecnico}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {r.estado_fenologico}
                    </td>
                    <td className="px-5 py-4 bg-rose-50/20">
                      {r.plagas.length === 0 ? (
                        <span className="text-slate-400 italic text-xs">
                          Sin plagas
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {r.plagas.map((p: any, i: number) => (
                            <span
                              key={i}
                              className="text-xs font-semibold text-rose-700"
                            >
                              {p.nombre}:{" "}
                              <span className="text-slate-600">
                                {p.cantidad} pl.
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 bg-rose-50/20 font-black text-rose-600">
                      {r.porcentaje_infestacion}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

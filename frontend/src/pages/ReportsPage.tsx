import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Filter,
  MapPin,
  XCircle,
  ChevronRight,
  Bug,
  Sprout,
} from "lucide-react";
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
  const [filterLugar, setFilterLugar] = useState("Todos");
  const [filterFechaInicio, setFilterFechaInicio] = useState("");
  const [filterFechaFin, setFilterFechaFin] = useState("");

  // ── Modal de Detalle ──
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

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
      "mis-solicitudes": undefined,
    };
    map[view]?.();
  };

  // 🌟 OBTENER LUGARES ÚNICOS PARA EL DROPDOWN
  const lugaresUnicos = useMemo(() => {
    const lugares = reportes.map((r) => r.lugar_produccion);
    return [...new Set(lugares)];
  }, [reportes]);

  // ── Filtrado Múltiple ──
  const filtered = useMemo(() => {
    return reportes.filter((i) => {
      const matchLugar =
        filterLugar === "Todos" || i.lugar_produccion === filterLugar;
      const matchInicio = !filterFechaInicio || i.fecha >= filterFechaInicio;
      const matchFin = !filterFechaFin || i.fecha <= filterFechaFin;
      return matchLugar && matchInicio && matchFin;
    });
  }, [reportes, filterLugar, filterFechaInicio, filterFechaFin]);

  const resetFilters = () => {
    setFilterLugar("Todos");
    setFilterFechaInicio("");
    setFilterFechaFin("");
  };
  const hasActiveFilters =
    filterLugar !== "Todos" || filterFechaInicio || filterFechaFin;

  // 🌟 GENERADOR DE PDF PROFESIONAL (Aplana los datos para la tabla)
  const exportarPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.text("Reporte Oficial de Inspecciones Fitosanitarias", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Generado el: ${new Date().toLocaleDateString()} - Sistema FitoGestor`,
      14,
      22,
    );

    // Aplanamos la data: Por cada inspección, creamos una fila por cada lote
    const tableData: any[] = [];
    filtered.forEach((reporte) => {
      reporte.detalle_lotes.forEach((lote: any) => {
        const textoPlagas =
          lote.plagas
            .map((p: any) => `${p.nombre} (${p.cantidad})`)
            .join(", ") || "Ninguna";
        tableData.push([
          reporte.fecha,
          reporte.lugar_produccion,
          reporte.tecnico,
          lote.numero_lote,
          lote.cultivo,
          lote.plantas_totales.toString(),
          textoPlagas,
          `${lote.porcentaje_infestacion}%`,
        ]);
      });
    });

    (doc as any).autoTable({
      startY: 30,
      head: [
        [
          "Fecha",
          "Lugar Producción",
          "Técnico",
          "Lote",
          "Cultivo",
          "Plantas",
          "Plagas Halladas",
          "% Infestación",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [1, 92, 75] },
      styles: { fontSize: 8, cellPadding: 3 },
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase text-slate-500">
                Lugar de Producción
              </label>
              <select
                value={filterLugar}
                onChange={(e) => setFilterLugar(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="Todos">Todos los lugares</option>
                {lugaresUnicos.map((lugar, idx) => (
                  <option key={idx} value={lugar}>
                    {lugar}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase text-slate-500">
                Desde Fecha
              </label>
              <input
                type="date"
                value={filterFechaInicio}
                onChange={(e) => setFilterFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase text-slate-500">
                Hasta Fecha
              </label>
              <input
                type="date"
                value={filterFechaFin}
                onChange={(e) => setFilterFechaFin(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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
              Genera un documento oficial con las {filtered.length} inspecciones
              listadas en la vista previa.
            </p>
          </div>
          <button
            onClick={exportarPDF}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-8 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <Download size={18} /> Exportar Documento PDF
          </button>
        </div>

        {/* ── Tabla Principal (Por Inspección/Lugar) ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">
              Inspecciones Realizadas
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Lugar Producción</th>
                  <th className="px-5 py-4">Fecha Inspección</th>
                  <th className="px-5 py-4">Técnico Asignado</th>
                  <th className="px-5 py-4 text-center">Lotes Revisados</th>
                  <th className="px-5 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-slate-500 animate-pulse"
                    >
                      Cargando datos...
                    </td>
                  </tr>
                ) : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-slate-500 italic"
                    >
                      No hay reportes que coincidan con los filtros.
                    </td>
                  </tr>
                ) : null}
                {filtered.map((r) => (
                  <tr
                    key={r.id_solicitud}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />{" "}
                        {r.lugar_produccion}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {r.fecha}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{r.tecnico}</td>
                    <td className="px-5 py-4 text-center font-black text-emerald-700">
                      {r.cantidad_lotes}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="rounded-lg bg-emerald-50 text-emerald-700 px-4 py-2 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1 mx-auto"
                      >
                        Ver Detalles <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🌟 MODAL DE DETALLE DE LOTES */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="bg-linear-to-r from-emerald-900 to-emerald-700 p-6 text-white flex justify-between items-start">
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Reporte de Inspección
                </span>
                <h2 className="text-2xl font-black mt-2">
                  {selectedReport.lugar_produccion}
                </h2>
                <p className="text-emerald-100 text-sm mt-1 flex items-center gap-2">
                  Fecha: {selectedReport.fecha} • Técnico:{" "}
                  {selectedReport.tecnico}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Contenido (Scrollable) */}
            <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Desglose por Lotes ({selectedReport.cantidad_lotes})
              </h3>

              {selectedReport.detalle_lotes.map((lote: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-900">
                        {lote.numero_lote}
                      </h4>
                      <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
                        <Sprout size={14} /> {lote.cultivo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Total Plantas
                      </p>
                      <p className="text-2xl font-black text-slate-700">
                        {lote.plantas_totales}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1">
                        <Bug size={14} className="text-rose-500" /> Plagas
                        Detectadas
                      </p>
                      {lote.plagas.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">
                          Sin hallazgos.
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {lote.plagas.map((p: any, i: number) => (
                            <li
                              key={i}
                              className="text-sm font-medium text-slate-700 flex justify-between"
                            >
                              <span>{p.nombre}</span>{" "}
                              <span className="font-bold text-rose-600">
                                {p.cantidad} afectadas
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-rose-600 uppercase">
                          Índice de Infestación
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Plantas afectadas vs. Totales
                        </p>
                      </div>
                      <p className="text-3xl font-black text-rose-600">
                        {lote.porcentaje_infestacion}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

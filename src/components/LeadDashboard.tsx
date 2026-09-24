// src/components/LeadDashboard.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getBrandsAction, getRepliesAction, getBrandTrendsAction } from '@/app/actions/audit';
import { Brand, SupportReply, User, BrandTrendMetrics, AuditFlag } from '@/types/database';
import AuditForm from './AuditForm';

interface LeadDashboardProps {
  currentUser: User;
}

// Mapeo amigable y profesional en español para presentación externa
const FLAG_LABELS: Record<AuditFlag, { label: string; desc: string; color: string; barColor: string }> = {
  flawless: {
    label: 'Respuestas Impecables (Alineadas al Manual)',
    desc: 'Adherencia total al procedimiento y tono corporativo.',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    barColor: 'bg-emerald-500',
  },
  wrong_tone: {
    label: 'Desviación de Tono de Marca',
    desc: 'Estilo inadecuado (demasiado informal o poco empático).',
    color: 'text-amber-800 bg-amber-50 border-amber-200',
    barColor: 'bg-amber-500',
  },
  no_order_history_check: {
    label: 'Omisión del Historial de Pedido',
    desc: 'Cierre de ticket sin verificación de antecedentes del cliente.',
    color: 'text-rose-800 bg-rose-50 border-rose-200',
    barColor: 'bg-rose-500',
  },
  wrong_question: {
    label: 'Respuesta a Pregunta No Formulada',
    desc: 'Información desalineada con la duda real del comprador.',
    color: 'text-orange-800 bg-orange-50 border-orange-200',
    barColor: 'bg-orange-500',
  },
  too_slow: {
    label: 'Tiempo Excesivo de Respuesta',
    desc: 'Demora fuera del estándar de tiempo acordado.',
    color: 'text-yellow-800 bg-yellow-50 border-yellow-200',
    barColor: 'bg-yellow-500',
  },
  technically_correct_poor_retention: {
    label: 'Técnicamente Correcta pero Induce Recontacto',
    desc: 'Respuesta exacta pero incompleta que genera dudas adicionales.',
    color: 'text-slate-800 bg-slate-100 border-slate-200',
    barColor: 'bg-slate-500',
  },
};

export default function LeadDashboard({ currentUser }: LeadDashboardProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [replies, setReplies] = useState<SupportReply[]>([]);
  const [selectedReply, setSelectedReply] = useState<SupportReply | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeMode, setActiveMode] = useState<'audit' | 'coaching' | 'proof'>('audit');
  const [brandTrends, setBrandTrends] = useState<BrandTrendMetrics | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [fetchedBrands, fetchedReplies] = await Promise.all([
      getBrandsAction(),
      getRepliesAction(currentUser.id, selectedBrandId),
    ]);

    setBrands(fetchedBrands);
    setReplies(fetchedReplies);

    if (selectedBrandId !== 'all') {
      const trends = await getBrandTrendsAction(selectedBrandId);
      setBrandTrends(trends);
    } else {
      setBrandTrends(null);
    }

    if (selectedReply) {
      const updated = fetchedReplies.find((r) => r.id === selectedReply.id);
      if (updated) setSelectedReply(updated);
    }
    setLoading(false);
  }, [currentUser.id, selectedBrandId, selectedReply?.id]);

  useEffect(() => {
    loadData();
  }, [selectedBrandId]);

  const currentBrandDetails = brands.find((b) => b.id === selectedBrandId);

  // Casos para Coaching
  const auditedReplies = replies.filter((r) => Boolean(r.audit_reviews));
  const goldenExamples = auditedReplies.filter((r) => r.audit_reviews?.flag === 'flawless');
  const criticalExamples = auditedReplies.filter((r) => (r.audit_reviews?.score || 5) <= 2);

  // Traducir el principal foco de mitigación al español
  const getTopIssueSpanish = (issueKey: string) => {
    if (issueKey in FLAG_LABELS) {
      return FLAG_LABELS[issueKey as AuditFlag].label;
    }
    return 'Sin desviaciones críticas recurrentes';
  };

  return (
    <div className="space-y-8">
      {/* Barra de Control Superior */}
      <div className="bg-[#F1F3F5] border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Consola de Control de Calidad</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200 shadow-sm">
              Líder de Equipo: {currentUser.name}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">Supervisión post-soporte, formación de agentes e informes corporativos</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-white p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => setActiveMode('audit')} 
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeMode === 'audit' ? 'bg-[#F1F3F5] text-slate-900 shadow-inner' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Auditoría Diaria
            </button>
            <button 
              onClick={() => setActiveMode('coaching')} 
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeMode === 'coaching' ? 'bg-[#F1F3F5] text-indigo-900 shadow-inner' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Biblioteca de Formación ({auditedReplies.length})
            </button>
            <button 
              onClick={() => setActiveMode('proof')} 
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeMode === 'proof' ? 'bg-[#F1F3F5] text-emerald-900 shadow-inner' : 'text-slate-600 hover:text-slate-900'
              }`}
              disabled={selectedBrandId === 'all'}
              title={selectedBrandId === 'all' ? 'Selecciona una marca para ver su informe ejecutivo' : ''}
            >
              Informe para el Cliente
            </button>
          </div>

          <select 
            className="bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer shadow-sm"
            value={selectedBrandId}
            onChange={(e) => {
              setSelectedBrandId(e.target.value);
              setSelectedReply(null);
            }}
          >
            <option value="all">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directriz de Tono Oficial */}
      {currentBrandDetails && (
        <div className="bg-[#F1F3F5] border border-slate-200/90 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
            {currentBrandDetails.name.charAt(0)}
          </div>
          <div className="text-slate-700 leading-relaxed">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Guía de Voz y Tono: {currentBrandDetails.name}
            </h3>
            <p className="text-base text-slate-700">{currentBrandDetails.tone_guidelines}</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: AUDITORÍA DIARIA */}
      {/* ========================================================================= */}
      {activeMode === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-5 bg-[#F1F3F5] rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Bandeja de Muestreo ({replies.length} respuestas)
              </h3>
              {loading && <span className="loading loading-spinner loading-xs text-slate-800"></span>}
            </div>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {replies.map((reply) => {
                const isSelected = selectedReply?.id === reply.id;
                const isAudited = Boolean(reply.audit_reviews);

                return (
                  <div
                    key={reply.id}
                    onClick={() => setSelectedReply(reply)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all text-left ${
                      isSelected
                        ? 'border-slate-900 bg-white shadow-md'
                        : 'border-slate-200 bg-white/90 hover:border-slate-300 hover:bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs px-2.5 py-1 rounded bg-[#F1F3F5] text-slate-800 border border-slate-200">
                        {reply.brands?.name}
                      </span>
                      {isAudited ? (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Nota: {reply.audit_reviews?.score}/5
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-700">Especialista: {reply.users?.name}</span>
                      {reply.audit_reviews?.auditor && (
                        <span className="text-[11px] italic text-slate-500">Evaluado por: {reply.audit_reviews.auditor.name}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 mt-1">
                      "{reply.customer_query}"
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-7">
            {selectedReply ? (
              <div className="bg-[#F1F3F5] rounded-2xl border border-slate-200/90 p-8 shadow-sm space-y-6">
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                        {selectedReply.brands?.name}
                      </span>
                      <h3 className="font-extrabold text-2xl text-slate-900 mt-0.5">
                        Especialista: {selectedReply.users?.name}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(selectedReply.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Consulta del Cliente:</span>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl text-base text-slate-800 leading-relaxed shadow-sm">
                      {selectedReply.customer_query}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Respuesta Enviada:</span>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl text-base text-slate-800 leading-relaxed shadow-sm">
                      {selectedReply.specialist_reply}
                    </div>
                  </div>

                  {selectedReply.ticket_context && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 shadow-sm">
                      <strong>Contexto operacional:</strong> {selectedReply.ticket_context}
                    </div>
                  )}
                </div>

                <AuditForm 
                  key={selectedReply.id} 
                  reply={selectedReply} 
                  auditorId={currentUser.id} 
                  onAuditSaved={loadData} 
                />
              </div>
            ) : (
              <div className="bg-[#F1F3F5] rounded-2xl border border-dashed border-slate-300 p-16 text-center h-[460px] flex flex-col items-center justify-center text-slate-500 shadow-sm">
                <p className="text-base font-medium">Selecciona un ticket de la lista izquierda para iniciar la auditoría.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: BIBLIOTECA DE FORMACIÓN (COACHING) */}
      {/* ========================================================================= */}
      {activeMode === 'coaching' && (
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Biblioteca Pedagógica para Nuevos Especialistas</h3>
            <p className="text-sm text-slate-600 mt-1">
              Casos reales documentados con su razonamiento de marca para capacitar al equipo sin búsquedas manuales previas.
            </p>
          </div>

          {/* Ejemplos de Oro */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <h4 className="text-lg font-bold text-slate-900">Respuestas Modelo (5/5 Impecables)</h4>
            </div>

            {goldenExamples.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No hay casos clasificados como impecables en este filtro.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goldenExamples.map((item) => (
                  <div key={item.id} className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-bold text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.brands?.name}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">Agente: {item.users?.name}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Situación / Pregunta:</span>
                      <p className="text-sm bg-slate-50 p-3 rounded-xl text-slate-800">{item.customer_query}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Respuesta Modelo:</span>
                      <p className="text-sm bg-slate-50 p-3 rounded-xl text-slate-800 font-medium">{item.specialist_reply}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>Lección de Entrenamiento:</span>
                        <span className="font-normal opacity-75">Por: {item.audit_reviews?.auditor?.name}</span>
                      </div>
                      <p className="leading-relaxed italic">"{item.audit_reviews?.feedback}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Antipatrones */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <h4 className="text-lg font-bold text-slate-900">Errores Críticos (Peligro de Pérdida de Cuenta — Calificación &le; 2)</h4>
            </div>

            {criticalExamples.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No hay casos críticos registrados en este filtro.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {criticalExamples.map((item) => (
                  <div key={item.id} className="bg-white border-2 border-rose-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-bold text-xs px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200">
                        {item.brands?.name} — {FLAG_LABELS[item.audit_reviews?.flag as AuditFlag]?.label || item.audit_reviews?.flag}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">Agente: {item.users?.name}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Situación del Cliente:</span>
                      <p className="text-sm bg-slate-50 p-3 rounded-xl text-slate-800">{item.customer_query}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-1">Respuesta No Permitida:</span>
                      <p className="text-sm bg-rose-50/40 border border-rose-200 p-3 rounded-xl text-slate-800">{item.specialist_reply}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>Por qué rompe el acuerdo con la marca:</span>
                        <span className="font-normal opacity-75">Por: {item.audit_reviews?.auditor?.name}</span>
                      </div>
                      <p className="leading-relaxed italic">"{item.audit_reviews?.feedback}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: INFORME PARA EL CLIENTE EXTERNO (DEMOSTRACIÓN CON BARRAS) */}
      {/* ========================================================================= */}
      {activeMode === 'proof' && brandTrends && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
          {/* Encabezado Corporativo en Español */}
          <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200">
                Informe Trimestral de Calidad y Rendimiento
              </span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-3">
                Informe Ejecutivo: {brandTrends.brandName}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Evidencia de evolución de servicio y aseguramiento de voz de marca provisto por Sellervate Operations.
              </p>
            </div>
            <div className="text-left md:text-right bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Estado de Auditoría</span>
              <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Muestreo Continuo Activo
              </span>
            </div>
          </div>

          {/* Tarjetas KPI Superiores en Español */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#F1F3F5] border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Muestreo Auditado</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {brandTrends.auditedCount} <span className="text-lg font-normal text-slate-500">/ {brandTrends.totalReplies}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {brandTrends.totalReplies > 0 ? Math.round((brandTrends.auditedCount / brandTrends.totalReplies) * 100) : 0}% de cobertura analizada
              </p>
            </div>

            <div className="bg-[#F1F3F5] border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Índice de Calidad (Promedio)</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {brandTrends.averageScore} <span className="text-lg font-normal text-slate-500">/ 5</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Acuerdo de Nivel de Servicio: &ge; 4.5</p>
            </div>

            <div className="bg-[#F1F3F5] border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Respuestas Impecables</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">{brandTrends.exemplaryCount}</div>
              <p className="text-xs text-slate-500 mt-1">100% de adherencia a la marca</p>
            </div>

            <div className="bg-[#F1F3F5] border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Principal Foco de Mitigación</div>
              <div className="text-base font-bold text-amber-800 truncate mt-2">
                {getTopIssueSpanish(brandTrends.topIssue)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Bajo plan de acción correctivo</p>
            </div>
          </div>

          {/* Gráfico de Barras Proporcionales de Distribución */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h4 className="font-bold text-lg text-slate-900">
                Distribución de Calidad por Diagnóstico
              </h4>
              <span className="text-xs text-slate-500">
                Porcentaje sobre {brandTrends.auditedCount} respuestas auditadas
              </span>
            </div>

            <div className="space-y-5">
              {(Object.keys(FLAG_LABELS) as AuditFlag[]).map((flagKey) => {
                const info = FLAG_LABELS[flagKey];
                const count = brandTrends.flagDistribution[flagKey] || 0;
                const percentage = brandTrends.auditedCount > 0 
                  ? Math.round((count / brandTrends.auditedCount) * 100) 
                  : 0;

                return (
                  <div key={flagKey} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-semibold text-slate-800">{info.label}</span>
                        <span className="text-xs text-slate-500 ml-2 hidden sm:inline">({info.desc})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-500">{count} casos</span>
                        <span className="font-bold text-slate-900 w-12 text-right">{percentage}%</span>
                      </div>
                    </div>

                    {/* Barra de progreso visual */}
                    <div className="w-full bg-[#F1F3F5] h-3.5 rounded-full overflow-hidden border border-slate-200/80">
                      <div 
                        className={`h-full transition-all duration-500 ${info.barColor}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Declaración Ejecutiva para Presentar al Cliente */}
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
            <h4 className="font-bold text-base text-slate-900">
              Resumen Ejecutivo para Presentar a la Marca
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              "Para la cuenta <strong>{brandTrends.brandName}</strong>, mantenemos una tasa de auditoría activa. 
              El principal patrón de fricción identificado fue <strong>{getTopIssueSpanish(brandTrends.topIssue)}</strong>. 
              Como medida correctiva inmediata, hemos incorporado estos tickets a nuestra 
              <strong> Biblioteca de Formación</strong> para que ningún especialista vuelva a incurrir en este desvío y 
              garantizar que el estándar de servicio converja hacia la meta acordada de <strong>4.5 / 5</strong>."
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
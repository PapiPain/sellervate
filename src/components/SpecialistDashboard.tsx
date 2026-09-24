// src/components/SpecialistDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { getRepliesAction } from '@/app/actions/audit';
import { SupportReply, User, AuditFlag } from '@/types/database';

interface SpecialistDashboardProps {
  currentUser: User;
}

// Mapeo en español para las etiquetas del especialista
const FLAG_NAMES: Record<AuditFlag, string> = {
  flawless: 'Impecable - Para Onboarding',
  wrong_tone: 'Tono incorrecto',
  no_order_history_check: 'Sin historial de pedido',
  wrong_question: 'Respondió algo diferente',
  too_slow: 'Demasiado lento',
  technically_correct_poor_retention: 'Genera recontacto',
};

// Función para asignar los colores solicitados según la nota (1 al 5)
function getScoreBadgeStyle(score: number) {
  switch (score) {
    case 5:
      // 5: Verde oscuro
      return 'bg-emerald-800 text-white border border-emerald-900';
    case 4:
      // 4: Verde claro
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    case 3:
      // 3: Amarillo
      return 'bg-amber-100 text-amber-900 border border-amber-300';
    case 2:
      // 2: Rojo claro
      return 'bg-rose-100 text-rose-800 border border-rose-300';
    case 1:
      // 1: Rojo oscuro
      return 'bg-rose-800 text-white border border-rose-900';
    default:
      return 'bg-slate-100 text-slate-800 border border-slate-300';
  }
}

export default function SpecialistDashboard({ currentUser }: SpecialistDashboardProps) {
  const [myReplies, setMyReplies] = useState<SupportReply[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReplies = async () => {
      setLoading(true);
      const replies = await getRepliesAction(currentUser.id);
      setMyReplies(replies);
      setLoading(false);
    };

    fetchReplies();
  }, [currentUser.id]);

  const auditedCount = myReplies.filter((r) => r.audit_reviews).length;
  const avgScore = auditedCount > 0
    ? (myReplies.reduce((acc, r) => acc + (r.audit_reviews?.score || 0), 0) / auditedCount).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-8">
      {/* Tarjetas de Métricas con fondo #F1F3F5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F1F3F5] border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tus Respuestas Enviadas</div>
          <div className="text-4xl font-extrabold text-slate-900 mt-2">{myReplies.length}</div>
          <p className="text-xs text-slate-500 mt-1">Registradas en el sistema</p>
        </div>

        <div className="bg-[#F1F3F5] border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Auditadas por Team Lead</div>
          <div className="text-4xl font-extrabold text-slate-900 mt-2">{auditedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Evaluadas con retroalimentación</p>
        </div>

        <div className="bg-[#F1F3F5] border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Calificación Promedio</div>
          <div className="text-4xl font-extrabold text-emerald-700 mt-2">
            {avgScore} <span className="text-lg font-normal text-slate-500">/ 5</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Objetivo de calidad: &ge; 4.5</p>
        </div>
      </div>

      {/* Contenedor principal con fondo #F1F3F5 */}
      <div className="bg-[#F1F3F5] border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tus Tickets y Evaluaciones de Calidad</h2>
          <p className="text-base text-slate-600 mt-1">
            Consulta el feedback constructivo y el cumplimiento de tono de las marcas asignadas
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-slate-800"></span>
          </div>
        ) : myReplies.length === 0 ? (
          <p className="text-slate-500 text-center py-12">No tienes tickets asignados en este momento.</p>
        ) : (
          <div className="space-y-6">
            {myReplies.map((reply) => {
              const review = reply.audit_reviews;

              return (
                <div 
                  key={reply.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-slate-300 transition-all shadow-sm"
                >
                  {/* Fila superior: Marca, Score con color dinámico y Flag en español */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-semibold text-sm px-3 py-1 rounded-lg bg-[#F1F3F5] border border-slate-200 text-slate-800">
                      {reply.brands?.name}
                    </span>

                    {review ? (
                      <div className="flex items-center gap-2">
                        {/* Nota con color según escala 1 a 5 */}
                        <span className={`font-bold text-xs sm:text-sm px-3 py-1 rounded-full shadow-sm ${getScoreBadgeStyle(review.score)}`}>
                          Nota: {review.score} / 5
                        </span>
                        {/* Flag en español */}
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                          {FLAG_NAMES[review.flag as AuditFlag] || review.flag}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        Pendiente de auditoría
                      </span>
                    )}
                  </div>

                  {/* Consulta del Cliente */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Consulta del Cliente
                    </span>
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-base text-slate-800 leading-relaxed">
                      {reply.customer_query}
                    </div>
                  </div>

                  {/* Tu Respuesta Enviada */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Tu Respuesta Enviada
                    </span>
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-base text-slate-800 leading-relaxed">
                      {reply.specialist_reply}
                    </div>
                  </div>

                  {/* Feedback firmado de la líder */}
                  {review && (
                    <div className="p-5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-indigo-950">Retroalimentación de Calidad:</span>
                        {review.auditor && (
                          <span className="text-indigo-800 font-medium text-xs">
                            Auditado por: <strong>{review.auditor.name}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-base text-slate-700 italic leading-relaxed">
                        "{review.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
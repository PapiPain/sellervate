// src/components/SpecialistDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { getRepliesAction } from '@/app/actions/audit';
import { SupportReply, User } from '@/types/database';

interface SpecialistDashboardProps {
  currentUser: User;
}

export default function SpecialistDashboard({ currentUser }: SpecialistDashboardProps) {
  const [myReplies, setMyReplies] = useState<SupportReply[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReplies = async () => {
      setLoading(true);
      // El servidor solo devuelve las respuestas correspondientes a este especialista
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-box border border-base-300">
          <div className="stat-title text-xs">Mis Respuestas Registradas</div>
          <div className="stat-value text-2xl">{myReplies.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-box border border-base-300">
          <div className="stat-title text-xs">Auditadas por Team Lead</div>
          <div className="stat-value text-2xl text-primary">{auditedCount}</div>
        </div>
        <div className="stat bg-base-100 rounded-box border border-base-300">
          <div className="stat-title text-xs">Calificación Promedio</div>
          <div className="stat-value text-2xl text-success">{avgScore} / 5</div>
        </div>
      </div>

      <div className="bg-base-100 rounded-box border border-base-300 p-6 space-y-4">
        <h3 className="font-bold text-base">Mis Tickets y Evaluaciones Recibidas</h3>

        {loading ? (
          <div className="flex justify-center p-8">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        ) : myReplies.length === 0 ? (
          <p className="text-sm opacity-50 text-center py-6">No tienes tickets registrados en este momento.</p>
        ) : (
          <div className="space-y-4">
            {myReplies.map((reply) => {
              const review = reply.audit_reviews;

              return (
                <div key={reply.id} className="p-4 rounded-lg border border-base-200 bg-base-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-outline badge-sm font-semibold">{reply.brands?.name}</span>
                    {review ? (
                      <span className="badge badge-success text-white badge-sm">Score: {review.score}/5 ({review.flag})</span>
                    ) : (
                      <span className="badge badge-ghost badge-sm opacity-70">Pendiente de auditoría</span>
                    )}
                  </div>

                  <div className="text-sm space-y-1">
                    <p className="font-semibold opacity-70 text-xs">Consulta del Cliente:</p>
                    <p className="bg-base-200/50 p-2 rounded">{reply.customer_query}</p>
                  </div>

                  <div className="text-sm space-y-1">
                    <p className="font-semibold opacity-70 text-xs">Tu Respuesta:</p>
                    <p className="bg-base-200/50 p-2 rounded">{reply.specialist_reply}</p>
                  </div>

                  {review && (
                    <div className="bg-info/10 border-l-4 border-info p-3 rounded-r text-sm">
                      <span className="font-bold text-info block text-xs mb-1">Feedback de tu Team Lead:</span>
                      <p className="italic text-base-content/90">"{review.feedback}"</p>
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
// src/components/LeadDashboard.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getBrandsAction, getRepliesAction } from '@/app/actions/audit';
import { Brand, SupportReply, User } from '@/types/database';
import AuditForm from './AuditForm';

interface LeadDashboardProps {
  currentUser: User;
}

export default function LeadDashboard({ currentUser }: LeadDashboardProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [replies, setReplies] = useState<SupportReply[]>([]);
  const [selectedReply, setSelectedReply] = useState<SupportReply | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [fetchedBrands, fetchedReplies] = await Promise.all([
      getBrandsAction(),
      getRepliesAction(currentUser.id, selectedBrandId),
    ]);

    setBrands(fetchedBrands);
    setReplies(fetchedReplies);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-100 p-4 rounded-box border border-base-300">
        <div>
          <h2 className="text-lg font-bold">Consola de Auditoría y Calidad</h2>
          <p className="text-xs opacity-60">Supervisa las interacciones y evalúa el cumplimiento de directrices</p>
        </div>
        <div className="form-control w-full md:w-64">
          <select 
            className="select select-bordered select-sm w-full"
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

      {currentBrandDetails && (
        <div className="alert alert-info text-sm py-2 shadow-sm">
          <span><strong>Guía de Tono ({currentBrandDetails.name}):</strong> {currentBrandDetails.tone_guidelines}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 bg-base-100 rounded-box border border-base-300 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <h3 className="font-semibold text-xs uppercase tracking-wide opacity-70">
              Tickets Disponibles ({replies.length})
            </h3>
            {loading && <span className="loading loading-spinner loading-xs text-primary"></span>}
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {replies.map((reply) => {
              const isSelected = selectedReply?.id === reply.id;
              const isAudited = Boolean(reply.audit_reviews);

              return (
                <div
                  key={reply.id}
                  onClick={() => setSelectedReply(reply)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-base-200 bg-base-100 hover:border-base-300 hover:bg-base-200/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="badge badge-ghost badge-xs font-semibold">{reply.brands?.name}</span>
                    {isAudited ? (
                      <span className="badge badge-success badge-xs text-white">Score: {reply.audit_reviews?.score}/5</span>
                    ) : (
                      <span className="badge badge-warning badge-xs">Pendiente</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold opacity-80">Especialista: {reply.users?.name}</p>
                  <p className="text-xs line-clamp-2 mt-1 opacity-90">"{reply.customer_query}"</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-7">
          {selectedReply ? (
            <div className="bg-base-100 rounded-box border border-base-300 p-6 space-y-6">
              <div className="space-y-3">
                <div className="border-b border-base-200 pb-2 flex justify-between items-center">
                  <h3 className="font-bold text-base">Ticket de {selectedReply.users?.name}</h3>
                  <span className="text-xs opacity-50">{new Date(selectedReply.sent_at).toLocaleString()}</span>
                </div>

                <div className="bg-base-200/60 p-3 rounded text-sm">
                  <span className="block text-xs font-bold opacity-60 mb-1">Consulta del Cliente:</span>
                  <p>{selectedReply.customer_query}</p>
                </div>

                <div className="bg-base-200/60 p-3 rounded text-sm">
                  <span className="block text-xs font-bold opacity-60 mb-1">Respuesta del Agente:</span>
                  <p>{selectedReply.specialist_reply}</p>
                </div>

                {selectedReply.ticket_context && (
                  <div className="bg-base-300/40 p-2 rounded text-xs opacity-75">
                    <span className="font-semibold">Contexto interno:</span> {selectedReply.ticket_context}
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
            <div className="bg-base-100 rounded-box border border-dashed border-base-300 p-12 text-center h-[400px] flex flex-col items-center justify-center text-sm opacity-60">
              Selecciona un ticket de la lista para auditarlo.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
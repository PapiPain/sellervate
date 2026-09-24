// src/components/AuditForm.tsx
'use client';

import { useState } from 'react';
import { saveAuditReviewAction } from '@/app/actions/audit';
import { SupportReply, AuditFlag } from '@/types/database';

interface AuditFormProps {
  reply: SupportReply;
  auditorId: string;
  onAuditSaved: () => void;
}

export default function AuditForm({ reply, auditorId, onAuditSaved }: AuditFormProps) {
  const [score, setScore] = useState<number>(reply.audit_reviews?.score ?? 5);
  const [flag, setFlag] = useState<AuditFlag>(reply.audit_reviews?.flag ?? 'flawless');
  const [feedback, setFeedback] = useState<string>(reply.audit_reviews?.feedback ?? '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    const result = await saveAuditReviewAction({
      replyId: reply.id,
      auditorId,
      score,
      flag,
      feedback,
    });

    setSubmitting(false);

    if (!result.success) {
      setNotification({ type: 'error', message: result.error || 'Error al guardar.' });
    } else {
      setNotification({ type: 'success', message: 'Evaluación registrada en el servidor correctamente.' });
      onAuditSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-6 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-base text-slate-900">
          {reply.audit_reviews ? 'Actualizar Evaluación' : 'Registrar Evaluación de Calidad'}
        </h4>
        {reply.audit_reviews?.auditor && (
          <span className="text-xs text-slate-500 font-medium">
            Última auditoría por: <strong className="text-slate-800">{reply.audit_reviews.auditor.name}</strong>
          </span>
        )}
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-sm font-semibold ${
          notification.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Puntaje (1 al 5)</label>
          <select 
            className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded-xl p-3 focus:ring-2 focus:ring-slate-900 outline-none"
            value={score} 
            onChange={(e) => setScore(Number(e.target.value))}
          >
            <option value={5}>5 - Excelente (Alineado a la marca)</option>
            <option value={4}>4 - Bueno (Detalles menores)</option>
            <option value={3}>3 - Regular (Requiere ajustes)</option>
            <option value={2}>2 - Deficiente (Afecta la percepción)</option>
            <option value={1}>1 - Inaceptable (Riesgo de cuenta)</option>
          </select>
        </div>

        <div className="space-y-1">
  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnóstico / Clasificación</label>
  <select 
    className="w-full bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded-xl p-3 focus:ring-2 focus:ring-slate-900 outline-none"
    value={flag} 
    onChange={(e) => setFlag(e.target.value as AuditFlag)}
  >
    <option value="flawless">Impecable - Para Onboarding</option>
    <option value="wrong_tone">Tono incorrecto</option>
    <option value="no_order_history_check">Sin historial de pedido</option>
    <option value="wrong_question">Respondió algo diferente</option>
    <option value="too_slow">Demasiado lento</option>
    <option value="technically_correct_poor_retention">Genera recontacto</option>
  </select>
</div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Retroalimentación para el Especialista
        </label>
        <textarea 
          className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl p-4 h-28 focus:ring-2 focus:ring-slate-900 outline-none leading-relaxed"
          placeholder="Comenta por qué no se cumplió la directriz o qué procedimiento debió seguirse..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm"
        disabled={submitting}
      >
        {submitting ? 'Guardando evaluación...' : 'Firmar y Guardar Auditoría'}
      </button>
    </form>
  );
}
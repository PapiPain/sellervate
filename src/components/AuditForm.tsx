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
      setNotification({ type: 'error', message: result.error || 'Ocurrió un error.' });
    } else {
      setNotification({ type: 'success', message: 'Evaluación registrada correctamente en el servidor.' });
      onAuditSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-base-200">
      <h4 className="font-bold text-sm uppercase tracking-wider">
        {reply.audit_reviews ? 'Actualizar Evaluación' : 'Registrar Evaluación de Calidad'}
      </h4>

      {notification && (
        <div className={`alert text-sm py-2 ${notification.type === 'error' ? 'alert-error' : 'alert-success text-white'}`}>
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium text-xs">Puntaje (1 al 5)</span>
          </label>
          <select 
            className="select select-bordered select-sm w-full"
            value={score} 
            onChange={(e) => setScore(Number(e.target.value))}
          >
            <option value={5}>5 - Excelente</option>
            <option value={4}>4 - Bueno</option>
            <option value={3}>3 - Regular</option>
            <option value={2}>2 - Deficiente</option>
            <option value={1}>1 - Inaceptable</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium text-xs">Clasificación / Bandera</span>
          </label>
          <select 
            className="select select-bordered select-sm w-full"
            value={flag} 
            onChange={(e) => setFlag(e.target.value as AuditFlag)}
          >
            <option value="flawless">flawless (Impecable)</option>
            <option value="wrong_tone">wrong_tone (Tono inadecuado)</option>
            <option value="wrong_question">wrong_question (Pregunta errónea)</option>
            <option value="too_slow">too_slow (Demasiado lento)</option>
            <option value="unresolved_risk">unresolved_risk (Riesgo sin resolver)</option>
          </select>
        </div>
      </div>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text font-medium text-xs">Retroalimentación para el Especialista</span>
        </label>
        <textarea 
          className="textarea textarea-bordered h-24 text-sm w-full"
          placeholder="Comenta aciertos o directrices a corregir..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary btn-sm w-full font-bold"
        disabled={submitting}
      >
        {submitting ? 'Guardando en servidor...' : 'Guardar Auditoría'}
      </button>
    </form>
  );
}
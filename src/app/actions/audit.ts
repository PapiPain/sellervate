// src/app/actions/audit.ts
'use server';

import { supabase } from '@/lib/supabase';
import { AuditFlag, SupportReply, Brand, BrandTrendMetrics } from '@/types/database';

// 1. Obtener todas las marcas
export async function getBrandsAction(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
  return data as Brand[];
}

// 2. Obtener respuestas auditables (Restricción por Rol + firma del Auditor)
export async function getRepliesAction(userId: string, brandId: string = 'all'): Promise<SupportReply[]> {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('No autorizado: Usuario no encontrado.');
  }

  let query = supabase
    .from('replies')
    .select(`
      *,
      brands (*),
      users:specialist_id (*),
      audit_reviews (
        *,
        auditor:auditor_id (id, name, email, role)
      )
    `)
    .order('sent_at', { ascending: false });

  // Si es especialista, solo puede consultar sus propias respuestas
  if (user.role === 'specialist') {
    query = query.eq('specialist_id', userId);
  }

  if (brandId !== 'all') {
    query = query.eq('brand_id', brandId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching replies:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    audit_reviews: Array.isArray(item.audit_reviews) 
      ? item.audit_reviews[0] || null 
      : item.audit_reviews,
  })) as SupportReply[];
}

// 3. Registrar o actualizar auditoría (Validando rol de Team Lead)
export async function saveAuditReviewAction(params: {
  replyId: string;
  auditorId: string;
  score: number;
  flag: AuditFlag;
  feedback: string;
}) {
  const { replyId, auditorId, score, flag, feedback } = params;

  const { data: auditor, error: auditorError } = await supabase
    .from('users')
    .select('role')
    .eq('id', auditorId)
    .single();

  if (auditorError || !auditor || auditor.role !== 'team_lead') {
    return { success: false, error: 'Acceso denegado: Solo los Team Leads pueden calificar.' };
  }

  const auditPayload = {
    reply_id: replyId,
    auditor_id: auditorId,
    score,
    flag,
    feedback,
    reviewed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('audit_reviews')
    .upsert(auditPayload, { onConflict: 'reply_id' });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 4. Analítica de Tendencias por Marca (Para reportes a clientes corporativos)
export async function getBrandTrendsAction(brandId: string): Promise<BrandTrendMetrics | null> {
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  if (!brand) return null;

  const { data: replies } = await supabase
    .from('replies')
    .select(`
      id,
      audit_reviews (
        score,
        flag
      )
    `)
    .eq('brand_id', brandId);

  const allReplies = replies || [];
  const auditedReplies = allReplies
    .map((r: any) => (Array.isArray(r.audit_reviews) ? r.audit_reviews[0] : r.audit_reviews))
    .filter(Boolean);

  const flagDistribution: Record<AuditFlag, number> = {
    flawless: 0,
    wrong_tone: 0,
    no_order_history_check: 0,
    wrong_question: 0,
    too_slow: 0,
    technically_correct_poor_retention: 0,
  };

  let totalScore = 0;

  auditedReplies.forEach((rev: any) => {
    totalScore += rev.score;
    if (flagDistribution[rev.flag as AuditFlag] !== undefined) {
      flagDistribution[rev.flag as AuditFlag]++;
    }
  });

  const auditedCount = auditedReplies.length;
  const averageScore = auditedCount > 0 ? Number((totalScore / auditedCount).toFixed(1)) : 0;

  // Detectar el problema más recurrente excluyendo 'flawless'
  let topIssue = 'Ninguno detectado';
  let maxIssueCount = 0;
  Object.entries(flagDistribution).forEach(([flagKey, count]) => {
    if (flagKey !== 'flawless' && count > maxIssueCount) {
      maxIssueCount = count;
      topIssue = flagKey;
    }
  });

  return {
    brandId: brand.id,
    brandName: brand.name,
    totalReplies: allReplies.length,
    auditedCount,
    averageScore,
    flagDistribution,
    topIssue: maxIssueCount > 0 ? topIssue : 'Sin fallos críticos recurrentes',
    exemplaryCount: flagDistribution.flawless,
  };
}
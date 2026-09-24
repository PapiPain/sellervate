// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/database';
import LeadDashboard from '@/components/LeadDashboard';
import SpecialistDashboard from '@/components/SpecialistDashboard';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select('*').order('name');
      if (data && data.length > 0) {
        setUsers(data as User[]);
        const defaultLead = data.find((u) => u.role === 'team_lead') || data[0];
        setActiveUser(defaultLead as User);
      }
    };

    fetchUsers();
  }, []);

  if (!activeUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-slate-900"></span>
          <p className="text-slate-500 font-medium">Cargando Sellervate QA...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-8 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabecera estilo Sellervate Brand */}
        <header className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-full tracking-wider uppercase">
              Sellervate QA
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Control de Calidad & Auditoría
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">Rol activo:</span>
            <select
              className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
              value={activeUser.id}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) setActiveUser(selected);
              }}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — ({u.role === 'team_lead' ? 'Team Lead' : 'Especialista'})
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Dashboards según rol */}
        {activeUser.role === 'team_lead' ? (
          <LeadDashboard currentUser={activeUser} />
        ) : (
          <SpecialistDashboard currentUser={activeUser} />
        )}
      </div>
    </main>
  );
}
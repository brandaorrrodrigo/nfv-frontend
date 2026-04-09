'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, Search, X, Check, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { api } from '@/lib/api';
import type { NFVPatient } from '@/lib/api/types';

interface AthleteSelectorProps {
  selectedId: string | null;
  onSelect: (patient: NFVPatient) => void;
}

export default function AthleteSelector({
  selectedId,
  onSelect,
}: AthleteSelectorProps) {
  const [patients, setPatients] = useState<NFVPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listPatients()
      .then((res) => setPatients(res.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = patients.find((p) => p.id === selectedId);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const patient = await api.createPatient({
        name: newName.trim(),
        gender: 'MALE',
        height: 175,
        weight: 80,
      });
      setPatients((prev) => [patient, ...prev]);
      onSelect(patient);
      setShowCreate(false);
      setNewName('');
      setNewEmail('');
    } catch {
      setError('Erro ao criar atleta. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 text-nfv-ice-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando atletas...
      </div>
    );

  return (
    <div className="space-y-3">
      {/* Atleta selecionado */}
      {selected && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-nfv-cyan/5 border border-nfv-cyan/20">
          <div className="w-9 h-9 rounded-xl bg-nfv-aurora/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-nfv-aurora" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-nfv-ice">
              {selected.name}
            </p>
            {selected.email && (
              <p className="text-xs text-nfv-ice-muted">{selected.email}</p>
            )}
          </div>
          <Check className="w-4 h-4 text-nfv-cyan" />
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nfv-ice-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar atleta..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#f5f8fb] border border-[#d0dbe6] rounded-xl text-sm text-nfv-ice placeholder:text-nfv-ice-muted focus:outline-none focus:border-nfv-cyan/50"
        />
      </div>

      {/* Lista */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {filtered.length === 0 && !showCreate && (
          <p className="text-xs text-nfv-ice-muted text-center py-4">
            {search ? 'Nenhum atleta encontrado' : 'Nenhum atleta cadastrado'}
          </p>
        )}
        {filtered.map((patient) => (
          <button
            key={patient.id}
            onClick={() => onSelect(patient)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
              patient.id === selectedId
                ? 'bg-nfv-cyan/10 border border-nfv-cyan/30'
                : 'bg-white border border-[#d0dbe6] hover:border-nfv-cyan/20'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#f5f8fb] flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-nfv-ice-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-nfv-ice truncate">
                {patient.name}
              </p>
              {patient.email && (
                <p className="text-xs text-nfv-ice-muted truncate">
                  {patient.email}
                </p>
              )}
            </div>
            {patient.id === selectedId && (
              <Check className="w-4 h-4 text-nfv-cyan flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Criar novo */}
      {!showCreate ? (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[#d0dbe6] text-sm text-nfv-ice-muted hover:border-nfv-cyan/30 hover:text-nfv-cyan transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo atleta
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-nfv-ice">
                  Novo atleta
                </p>
                <button onClick={() => setShowCreate(false)}>
                  <X className="w-4 h-4 text-nfv-ice-muted" />
                </button>
              </div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome completo *"
                className="w-full px-4 py-2.5 bg-[#f5f8fb] border border-[#d0dbe6] rounded-xl text-sm focus:outline-none focus:border-nfv-cyan/50"
              />
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email (opcional)"
                type="email"
                className="w-full px-4 py-2.5 bg-[#f5f8fb] border border-[#d0dbe6] rounded-xl text-sm focus:outline-none focus:border-nfv-cyan/50"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="w-full py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Criar atleta
              </button>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

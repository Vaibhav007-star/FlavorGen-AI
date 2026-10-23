import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, Filter, FlaskConical, Apple, Copy, Check } from 'lucide-react';
import { api } from '../../services/api';
import { CompoundItem, IngredientItem } from '../../types/sensory';
import { PolarRadarChart } from '../charts/PolarRadarChart';

export const DataExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compounds' | 'ingredients'>('compounds');
  const [compounds, setCompounds] = useState<CompoundItem[]>([]);
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [selectedCompound, setSelectedCompound] = useState<CompoundItem | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientItem | null>(null);
  const [copiedSmiles, setCopiedSmiles] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [compData, ingData] = await Promise.all([
        api.getCompounds(100),
        api.getIngredients(),
      ]);
      setCompounds(compData);
      setIngredients(ingData);
      if (compData.length > 0) setSelectedCompound(compData[0]);
      if (ingData.length > 0) setSelectedIngredient(ingData[0]);
    } catch (err: any) {
      console.error('Failed to load dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySmiles = (smiles: string) => {
    navigator.clipboard.writeText(smiles);
    setCopiedSmiles(smiles);
    setTimeout(() => setCopiedSmiles(null), 2000);
  };

  // Extract unique chemical classes and ingredient categories safely
  const safeCompounds = Array.isArray(compounds) ? compounds : [];
  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];

  const chemicalClasses = ['all', ...Array.from(new Set(safeCompounds.map((c) => c.chemical_class).filter(Boolean)))];
  const ingredientCategories = ['all', ...Array.from(new Set(safeIngredients.map((i) => i.category).filter(Boolean)))];

  // Filtered lists
  const filteredCompounds = safeCompounds.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.smiles.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.cas && c.cas.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.chemical_class && c.chemical_class.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = selectedClass === 'all' || c.chemical_class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const filteredIngredients = safeIngredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ing.botanical_name && ing.botanical_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || ing.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
              Knowledge Repository
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
            <Database className="w-6 h-6 text-[#0D9488]" />
            Chemo-Sensory Knowledge Base
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            Browse verified chemical scaffolds, physicochemical properties, and food matrix constituent profiles.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-[#161920] p-1 rounded-full flex gap-1 border border-white/10 shadow-sm">
            <button
              onClick={() => setActiveTab('compounds')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'compounds'
                  ? 'bg-gradient-to-r from-[#D99738] to-[#C28328] text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Molecules ({safeCompounds.length})
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'ingredients'
                  ? 'bg-gradient-to-r from-[#D99738] to-[#C28328] text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              Ingredients ({safeIngredients.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'compounds' ? 'Search molecule, SMILES, CAS...' : 'Search ingredient or category...'}
            className="w-full bg-[#101217] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D99738] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-xs text-stone-400 font-medium">Class:</span>
          {activeTab === 'compounds' ? (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-[#101217] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-[#D99738] font-mono shadow-xs"
            >
              {chemicalClasses.map((cls: any) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#101217] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-[#D99738] font-mono shadow-xs"
            >
              {ingredientCategories.map((cat: any) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table / List View */}
        <div className="lg:col-span-7 space-y-2">
          {loading ? (
            <div className="p-16 text-center text-stone-400 bg-[#161920]/80 rounded-2xl border border-white/[0.08]">
              <div className="w-8 h-8 border-2 border-[#D99738] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium">Loading chemo-sensory database records...</p>
            </div>
          ) : activeTab === 'compounds' ? (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#161920]/85 backdrop-blur-xl shadow-2xl max-h-[620px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#101217] z-10 border-b border-white/[0.08] text-stone-400 font-mono">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Molecule</th>
                    <th className="py-3 px-3 font-semibold">Class</th>
                    <th className="py-3 px-3 font-semibold">MW</th>
                    <th className="py-3 px-3 font-semibold">LogP</th>
                    <th className="py-3 px-3 font-semibold">Threshold</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredCompounds.map((c) => {
                    const isSelected = selectedCompound?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCompound(c)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-950/30 text-white font-medium border-l-4 border-[#D99738]'
                            : 'hover:bg-white/[0.03] text-stone-300'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="text-white font-semibold">{c.name}</div>
                          <div className="text-[10px] font-mono text-stone-500 truncate max-w-[140px]">
                            {c.smiles}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-stone-400">{c.chemical_class || '—'}</td>
                        <td className="py-3 px-3 font-mono text-stone-300">{c.molecular_weight?.toFixed(1)}</td>
                        <td className="py-3 px-3 font-mono text-stone-300">{c.logp?.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono text-teal-400 font-semibold">
                          {c.odor_threshold_ug_l ? `${c.odor_threshold_ug_l} µg/L` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopySmiles(c.smiles);
                            }}
                            title="Copy SMILES"
                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-stone-400 hover:text-white transition-colors inline-flex items-center"
                          >
                            {copiedSmiles === c.smiles ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#161920]/85 backdrop-blur-xl shadow-2xl max-h-[620px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#101217] z-10 border-b border-white/[0.08] text-stone-400 font-mono">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Ingredient</th>
                    <th className="py-3 px-3 font-semibold">Category</th>
                    <th className="py-3 px-3 font-semibold">Botanical Name</th>
                    <th className="py-3 px-3 font-semibold">Key Volatiles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredIngredients.map((ing) => {
                    const isSelected = selectedIngredient?.id === ing.id;
                    return (
                      <tr
                        key={ing.id}
                        onClick={() => setSelectedIngredient(ing)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-950/30 text-white font-medium border-l-4 border-[#D99738]'
                            : 'hover:bg-white/[0.03] text-stone-300'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-white">{ing.name}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono font-medium">
                            {ing.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 italic text-stone-400">{ing.botanical_name || '—'}</td>
                        <td className="py-3.5 px-3 font-mono text-stone-300 font-semibold">
                          {ing.constituents?.length || 0} molecules
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Side Panel */}
        <div className="lg:col-span-5">
          {activeTab === 'compounds' && selectedCompound && (
            <div className="p-6 rounded-2xl bg-[#161920]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-4 sticky top-20">
              <div className="border-b border-white/[0.08] pb-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#F95D4A] font-bold">
                    Chemical Molecule Profile
                  </span>
                  <span className="text-xs font-mono text-stone-500">ID #{selectedCompound.id}</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">{selectedCompound.name}</h3>
                <p className="text-xs font-mono text-stone-400 break-all mt-0.5">{selectedCompound.smiles}</p>
              </div>

              {/* Physicochemical stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#101217] p-2.5 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-stone-500 block">MW</span>
                  <span className="font-mono text-xs font-bold text-white">
                    {selectedCompound.molecular_weight?.toFixed(1)}
                  </span>
                </div>
                <div className="bg-[#101217] p-2.5 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-stone-500 block">LogP</span>
                  <span className="font-mono text-xs font-bold text-white">
                    {selectedCompound.logp?.toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#101217] p-2.5 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-stone-500 block">TPSA</span>
                  <span className="font-mono text-xs font-bold text-white">
                    {selectedCompound.tpsa?.toFixed(1)} Å²
                  </span>
                </div>
                <div className="bg-[#101217] p-2.5 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-stone-500 block">Volatility</span>
                  <span className="font-mono text-xs font-bold text-[#0D9488]">
                    {selectedCompound.volatility_index?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Radar Chart */}
              {selectedCompound.aroma_vector && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wider font-mono">
                    Aroma Vector (12-D)
                  </span>
                  <PolarRadarChart
                    primaryData={selectedCompound.aroma_vector}
                    title={selectedCompound.name}
                    primaryColor="#F95D4A"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && selectedIngredient && (
            <div className="p-6 rounded-2xl bg-[#161920]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-4 sticky top-20">
              <div className="border-b border-white/[0.08] pb-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#70B814] font-bold">
                    Ingredient Matrix
                  </span>
                  <span className="text-xs font-mono text-stone-500">{selectedIngredient.category}</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">{selectedIngredient.name}</h3>
                {selectedIngredient.botanical_name && (
                  <p className="text-xs italic text-stone-400 mt-0.5">{selectedIngredient.botanical_name}</p>
                )}
                {selectedIngredient.description && (
                  <p className="text-xs text-stone-300 mt-2.5 leading-relaxed">{selectedIngredient.description}</p>
                )}
              </div>

              {/* Key Constituents List */}
              {selectedIngredient.constituents && selectedIngredient.constituents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wider font-mono">
                    Key Volatile Constituents
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedIngredient.constituents.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs bg-[#101217] p-2.5 rounded-xl border border-white/[0.06]"
                      >
                        <div>
                          <div className="text-white font-semibold">{item.compound_name}</div>
                          <div className="text-[10px] text-stone-500">{item.role || 'Character impact'}</div>
                        </div>
                        <span className="font-mono text-[#0D9488] text-xs font-bold">
                          {item.concentration_mg_kg} mg/kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Radar Chart */}
              {selectedIngredient.aroma_profile && (
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wider font-mono">
                    Aggregated Olfactory Fingerprint
                  </span>
                  <PolarRadarChart
                    primaryData={selectedIngredient.aroma_profile}
                    title={selectedIngredient.name}
                    primaryColor="#70B814"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

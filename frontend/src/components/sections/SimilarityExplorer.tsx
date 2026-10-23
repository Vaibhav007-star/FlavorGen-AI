import React, { useState, useEffect } from 'react';
import { Compass, Search, AlertCircle, Sparkles, Info } from 'lucide-react';
import { api } from '../../services/api';
import { IngredientItem } from '../../types/sensory';
import { PolarRadarChart } from '../charts/PolarRadarChart';

export const SimilarityExplorer: React.FC = () => {
  const [targetType, setTargetType] = useState<'ingredient' | 'smiles'>('ingredient');
  const [targetIngredient, setTargetIngredient] = useState<string>('Vanilla Extract');
  const [targetSmiles, setTargetSmiles] = useState<string>('O=Cc1ccc(O)c(OC)c1');
  const [searchMode, setSearchMode] = useState<'sensory' | 'chemical' | 'multimodal' | 'contrastive'>('multimodal');
  const [topK, setTopK] = useState<number>(5);

  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await api.getIngredients();
      setIngredients(data);
      if (data.length > 0 && !targetIngredient) {
        setTargetIngredient(data[0].name);
      }
    } catch (err) {
      console.error('Failed to load ingredients for similarity search', err);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        mode: searchMode,
        top_k: topK,
      };

      if (targetType === 'ingredient') {
        payload.target_ingredient = targetIngredient;
      } else {
        payload.target_smiles = targetSmiles;
      }

      const res = await api.searchSimilarity(payload);
      const items = Array.isArray(res) ? res : ((res as any)?.matches || []);
      setResults(items);
      if (items && items.length > 0) {
        setSelectedMatch(items[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Similarity search failed');
    } finally {
      setLoading(false);
    }
  };

  const sampleSmiles = [
    { label: 'Vanillin', smiles: 'O=Cc1ccc(O)c(OC)c1' },
    { label: 'D-Limonene', smiles: 'CC1=CCC(CC1)C(=C)C' },
    { label: 'Benzyl Acetate', smiles: 'CC(=O)OCC1=CC=CC=C1' },
    { label: 'Eugenol (Clove)', smiles: 'COc1cc(CC=C)ccc1O' },
    { label: 'Furaneol (Strawberry)', smiles: 'CC1=C(C(=O)C(O1)(C)O)C' },
  ];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-sans tracking-tight">
            <Compass className="w-6 h-6 text-teal-400" />
            Similarity & Analog Explorer
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Multimodal nearest neighbor search across sensory vector spaces, Tanimoto Morgan fingerprints, and contrastive bio-isosteric bridges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#161920] border border-white/10 rounded-full text-xs font-mono text-teal-300 shadow-sm">
            Modes: Sensory | Chemical | Multimodal | Bio-isosteric
          </span>
        </div>
      </div>

      {/* Query Configuration Card */}
      <div className="p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Target Type Selector */}
          <div className="flex items-center bg-[#101217] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setTargetType('ingredient')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                targetType === 'ingredient'
                  ? 'bg-teal-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Ingredient Query
            </button>
            <button
              onClick={() => setTargetType('smiles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                targetType === 'smiles'
                  ? 'bg-teal-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Chemical SMILES Query
            </button>
          </div>

          {/* Search Metric Mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-400">Metric Mode:</span>
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as any)}
              className="bg-[#101217] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-teal-400 font-mono"
            >
              <option value="multimodal">Multimodal Latent SVD (64D)</option>
              <option value="sensory">Sensory Cosine (Aroma + Flavor)</option>
              <option value="chemical">Chemical Tanimoto (Morgan FP)</option>
              <option value="contrastive">Contrastive Bio-Isosteric Scaffold</option>
            </select>
          </div>

          {/* Top-K */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-400">Top-K:</span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-[#101217] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-teal-400 font-mono"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>

        {/* Input Field Row */}
        <div className="space-y-3">
          {targetType === 'ingredient' ? (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Select Target Ingredient
                </label>
                <select
                  value={targetIngredient}
                  onChange={(e) => setTargetIngredient(e.target.value)}
                  className="w-full bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-medium"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.name}>
                      {ing.name} ({ing.category})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full sm:w-auto mt-auto px-6 py-2.5 bg-gradient-to-r from-[#D99738] to-[#C28328] hover:from-[#E5A852] hover:to-[#D99738] active:scale-98 text-stone-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-stone-950" />
                )}
                <span>Execute Similarity Query</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="w-full sm:flex-1">
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Target Molecule SMILES
                  </label>
                  <input
                    type="text"
                    value={targetSmiles}
                    onChange={(e) => setTargetSmiles(e.target.value)}
                    placeholder="e.g. O=Cc1ccc(O)c(OC)c1"
                    className="w-full bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-teal-400 shadow-inner"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !targetSmiles.trim()}
                  className="w-full sm:w-auto mt-auto px-6 py-2.5 bg-gradient-to-r from-[#D99738] to-[#C28328] hover:from-[#E5A852] hover:to-[#D99738] active:scale-98 text-stone-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-stone-950" />
                  )}
                  <span>Execute Molecular Search</span>
                </button>
              </div>

              {/* Quick sample chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-stone-500 font-medium">Sample SMILES:</span>
                {sampleSmiles.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setTargetSmiles(s.smiles)}
                    className="px-2.5 py-1 rounded-lg bg-[#101217] hover:bg-white/[0.06] text-[11px] font-mono text-stone-300 hover:text-white border border-white/10 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Workspace */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Matches List */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">
                Analog Candidates ({results.length} Matches Found)
              </h2>
              <span className="text-xs text-teal-400 font-mono font-bold">
                Metric: {searchMode.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2.5">
              {results.map((item, idx) => {
                const isSelected = selectedMatch?.name === item.name;
                const scorePct = Math.round(item.score * 100);

                return (
                  <div
                    key={item.name}
                    onClick={() => setSelectedMatch(item)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1E27] border-teal-500/80 shadow-lg shadow-teal-950/30'
                        : 'bg-[#161920]/80 border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-white/[0.06] text-stone-300 flex items-center justify-center text-xs font-mono font-bold border border-white/[0.08]">
                          #{idx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-sm">{item.name}</h3>
                          <span className="text-xs text-stone-400 font-medium">{item.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800/60 text-xs text-teal-300 font-bold font-mono">
                          {scorePct}% Match
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 mt-2.5 leading-relaxed bg-[#101217] p-3 rounded-2xl border border-white/[0.06]">
                      {item.explanation}
                    </p>

                    {/* Breakdown metrics pill row */}
                    <div className="flex flex-wrap gap-3 mt-2.5 pt-2 border-t border-white/[0.08] text-[11px] font-mono">
                      <span className="text-stone-400">
                        Sensory:{' '}
                        <span className="text-teal-400 font-bold">{Math.round(item.sensory_similarity * 100)}%</span>
                      </span>
                      {item.chemical_similarity !== undefined && (
                        <span className="text-stone-400">
                          Chemical FP:{' '}
                          <span className="text-[#E5A852] font-bold">
                            {Math.round(item.chemical_similarity * 100)}%
                          </span>
                        </span>
                      )}
                      {item.multimodal_similarity !== undefined && (
                        <span className="text-stone-400">
                          Multimodal Latent:{' '}
                          <span className="text-emerald-400 font-bold">
                            {Math.round(item.multimodal_similarity * 100)}%
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Candidate Detailed Inspection & Radar */}
          <div className="lg:col-span-6 space-y-4">
            {selectedMatch ? (
              <div className="p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-4 sticky top-20">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                      Detailed Analog Profile
                    </span>
                    <h3 className="text-lg font-bold text-white font-sans">{selectedMatch.name}</h3>
                    <p className="text-xs text-stone-400 font-medium">{selectedMatch.category}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-400 block font-medium">Composite Score</span>
                    <span className="text-2xl font-mono font-extrabold text-teal-400">
                      {Math.round(selectedMatch.score * 100)}%
                    </span>
                  </div>
                </div>

                {/* Radar visualization if sensory vector available */}
                {selectedMatch.aroma_profile && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-300 uppercase tracking-wider font-mono">
                      12-Dimensional Aroma Fingerprint
                    </span>
                    <PolarRadarChart
                      primaryData={selectedMatch.aroma_profile}
                      title={`${selectedMatch.name} - Aroma Projection`}
                      primaryColor="#0D9488"
                    />
                  </div>
                )}

                {/* Flavor Vector bars if available */}
                {selectedMatch.flavor_profile && (
                  <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                    <span className="text-xs font-bold text-stone-300 uppercase tracking-wider font-mono">
                      Taste & Mouthfeel Dimensions
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedMatch.flavor_profile).map(([key, val]) => (
                        <div key={key} className="bg-[#101217] p-2.5 rounded-2xl border border-white/[0.06]">
                          <div className="flex justify-between text-[11px] mb-1 font-medium">
                            <span className="text-stone-300 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-mono text-teal-400 font-bold">{Number(val).toFixed(2)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, Number(val) * 20))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio-isosteric substitution note */}
                <div className="p-4 bg-teal-950/40 border border-teal-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-teal-200">
                  <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Formulation Suggestion:</strong> This candidate shares key olfactory receptors with your query
                    while offering distinct volatility and molecular stability characteristics.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-[#161920]/80 border border-white/[0.08] text-center text-stone-400 shadow-2xl">
                <Info className="w-8 h-8 mx-auto mb-2 text-stone-500" />
                <p className="text-sm">Select an analog candidate from the list to view its full sensory profile and comparative radar chart.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State when no search executed yet */}
      {!loading && results.length === 0 && (
        <div className="p-16 rounded-3xl bg-[#161920]/80 border border-white/[0.08] text-center space-y-3 shadow-2xl">
          <Compass className="w-12 h-12 text-stone-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Ready to Explore Molecular & Sensory Analogs</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Select an ingredient or enter a SMILES chemical formula above to discover bio-isosteric alternatives, cross-category pairings, and multimodal neighbors.
          </p>
        </div>
      )}
    </div>
  );
};

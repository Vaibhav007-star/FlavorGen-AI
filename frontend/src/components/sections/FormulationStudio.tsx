import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { PolarRadarChart } from '../charts/PolarRadarChart';

const AVAILABLE_INGREDIENTS = [
  'Strawberry',
  'Vanilla Extract',
  'Lemon Peel',
  'Roasted Coffee',
  'Peppermint',
  'Cinnamon Bark',
  'Dark Chocolate (70%)',
  'Green Tea',
  'Fresh Butter',
  'Bell Pepper',
  'Pineapple',
  'Banana',
];

export const FormulationStudio: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'generative' | 'custom'>('generative');

  // Generative state
  const [prompt, setPrompt] = useState(
    'A refreshing citrus beverage with strong lemon top-notes, moderate sweet body, and a cool menthol finish'
  );
  const [maxIngredients, setMaxIngredients] = useState<number>(3);
  const [genLoading, setGenLoading] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Custom Blender state
  const [recipeItems, setRecipeItems] = useState<Array<{ ingredient_name: string; proportion: number }>>([
    { ingredient_name: 'Strawberry', proportion: 40 },
    { ingredient_name: 'Vanilla Extract', proportion: 20 },
    { ingredient_name: 'Fresh Butter', proportion: 40 },
  ]);
  const [customLoading, setCustomLoading] = useState<boolean>(false);
  const [customResult, setCustomResult] = useState<any>(null);

  const handleGenerate = async () => {
    setGenLoading(true);
    setGenError(null);
    try {
      const data = await api.generateFormulation(prompt, [], maxIngredients);
      if (data && data.candidates) {
        setCandidates(data.candidates);
        if (data.candidates.length > 0) setSelectedCandidate(data.candidates[0]);
      }
    } catch (err: any) {
      setGenError(err.message || 'Failed to generate formulation');
    } finally {
      setGenLoading(false);
    }
  };

  const handleAnalyzeCustom = async () => {
    setCustomLoading(true);
    try {
      const data = await api.analyzeFormulation(recipeItems, true);
      setCustomResult(data);
    } catch (err: any) {
      alert(err.message || 'Analysis failed');
    } finally {
      setCustomLoading(false);
    }
  };

  const handleAddCustomItem = () => {
    const unused = AVAILABLE_INGREDIENTS.find(
      (ing) => !recipeItems.some((i) => i.ingredient_name === ing)
    );
    if (unused) {
      setRecipeItems([...recipeItems, { ingredient_name: unused, proportion: 10 }]);
    }
  };

  const handleRemoveCustomItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const handleUpdateCustomProportion = (index: number, val: number) => {
    const updated = [...recipeItems];
    updated[index].proportion = val;
    setRecipeItems(updated);
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#D99738] text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" /> Stages 9 & 10 Intelligence Layer
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
          Generative Formulation Studio
        </h2>
        <p className="text-stone-400 text-xs mt-1 max-w-2xl">
          Invert user sensory targets to generate optimized candidate formulations, or construct custom multi-ingredient
          recipes with non-linear matrix interaction modeling (Odor-Induced Taste Enhancement, Bitterness Masking, Lipid Retardation).
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex gap-4 border-b border-white/[0.08]">
        <button
          onClick={() => setActiveSubTab('generative')}
          className={`text-xs font-bold pb-2 border-b-2 transition-all ${
            activeSubTab === 'generative'
              ? 'border-[#D99738] text-[#E5A852]'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          Generative Target Inversion (Prompt → Recipe)
        </button>
        <button
          onClick={() => setActiveSubTab('custom')}
          className={`text-xs font-bold pb-2 border-b-2 transition-all ${
            activeSubTab === 'custom'
              ? 'border-[#D99738] text-[#E5A852]'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          Custom Recipe Blender & Interaction Engine
        </button>
      </div>

      {/* Sub-Tab 1: Generative Target Inversion */}
      {activeSubTab === 'generative' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Describe Your Desired Sensory Experience:
              </label>
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A refreshing citrus beverage with strong lemon top-notes, moderate sweet body, and a cool menthol finish..."
                className="w-full bg-[#101217] border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D99738] resize-none font-sans shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">Max Ingredients:</span>
                <select
                  value={maxIngredients}
                  onChange={(e) => setMaxIngredients(Number(e.target.value))}
                  className="bg-[#101217] border border-white/10 text-xs text-stone-300 rounded-xl px-3 py-1.5 font-medium"
                >
                  <option value={2}>2 Ingredients</option>
                  <option value={3}>3 Ingredients</option>
                  <option value={4}>4 Ingredients</option>
                  <option value={5}>5 Ingredients</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={genLoading || !prompt}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D99738] to-[#C28328] hover:from-[#E5A852] hover:to-[#D99738] active:scale-98 disabled:opacity-50 text-stone-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{genLoading ? 'Optimizing Formulation...' : 'Synthesize Candidates'}</span>
              </button>
            </div>

            {genError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{genError}</span>
              </div>
            )}
          </div>

          {/* Candidate Results */}
          {candidates.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Candidate Selection List */}
              <div className="lg:col-span-4 space-y-3">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Generated Candidate Formulations ({candidates.length})
                </h4>
                {candidates.map((cand) => {
                  const isSelected = selectedCandidate?.rank === cand.rank;
                  return (
                    <div
                      key={cand.rank}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#1A1E27] border-[#D99738] shadow-lg shadow-amber-950/30'
                          : 'bg-[#161920]/80 border-white/[0.08] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">Candidate #{cand.rank}</span>
                        <span className="text-xs font-mono font-bold text-[#E5A852]">
                          {(cand.similarity_to_target * 100).toFixed(0)}% Target Match
                        </span>
                      </div>

                      <div className="text-xs font-medium text-stone-300 mb-2">
                        {cand.formulation
                          .map((f: any) => `${f.proportion.toFixed(0)}% ${f.name || f.ingredient_name}`)
                          .join(' + ')}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono">
                        <span>Confidence: {(cand.confidence * 100).toFixed(0)}%</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-sans font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Constraints Met
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Candidate Detail View */}
              {selectedCandidate && (
                <div className="lg:col-span-8 p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white font-sans">
                        Candidate #{selectedCandidate.rank} Formulation Card
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Optimized via Evolutionary Search & Constrained SLSQP
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-stone-400 block font-medium">Cosine Similarity</span>
                      <span className="text-2xl font-bold font-mono text-[#E5A852]">
                        {(selectedCandidate.similarity_to_target * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Recipe Proportions Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2.5">
                      Recipe Formulation Ratios
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {selectedCandidate.formulation.map((item: any) => (
                        <div
                          key={item.name || item.ingredient_name}
                          className="p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06]"
                        >
                          <span className="text-xs font-bold text-white block truncate">
                            {item.name || item.ingredient_name}
                          </span>
                          <span className="text-lg font-mono font-bold text-[#E5A852] mt-1 block">
                            {item.proportion.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dual Radar Displays */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#101217] border border-white/[0.06] flex justify-center">
                      <PolarRadarChart
                        primaryData={selectedCandidate.predicted_aroma}
                        title="Predicted Aroma (12 Dims)"
                        primaryColor="#F95D4A"
                        size={280}
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-[#101217] border border-white/[0.06] flex justify-center">
                      <PolarRadarChart
                        primaryData={selectedCandidate.predicted_flavor}
                        title="Predicted Taste (10 Dims)"
                        primaryColor="#70B814"
                        size={280}
                      />
                    </div>
                  </div>

                  {/* Scientific Explanation */}
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200">
                    <span className="font-bold block mb-1 text-[#E5A852]">Formulation Rationale:</span>
                    {selectedCandidate.explanation}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Custom Recipe Blender */}
      {activeSubTab === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="font-bold text-white text-sm font-sans">Ingredient Blend Ratios</h3>
              <button
                onClick={handleAddCustomItem}
                className="text-xs text-[#E5A852] hover:text-amber-300 flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {recipeItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <select
                      value={item.ingredient_name}
                      onChange={(e) => {
                        const updated = [...recipeItems];
                        updated[idx].ingredient_name = e.target.value;
                        setRecipeItems(updated);
                      }}
                      className="bg-transparent text-xs font-bold text-white focus:outline-none"
                    >
                      {AVAILABLE_INGREDIENTS.map((ing) => (
                        <option key={ing} value={ing} className="bg-[#161920] text-white">
                          {ing}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleRemoveCustomItem(idx)}
                      className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.proportion}
                      onChange={(e) => handleUpdateCustomProportion(idx, Number(e.target.value))}
                      className="flex-1 accent-[#D99738] h-1.5 bg-white/[0.08] rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-xs text-[#E5A852] w-10 text-right font-bold">
                      {item.proportion}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAnalyzeCustom}
              disabled={customLoading}
              className="w-full py-2.5 bg-gradient-to-r from-[#D99738] to-[#C28328] hover:from-[#E5A852] hover:to-[#D99738] active:scale-98 text-stone-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-950/40 transition-all"
            >
              {customLoading ? 'Analyzing Blend...' : 'Analyze Combinational Profile'}
            </button>
          </div>

          {/* Custom Analysis Result */}
          <div className="lg:col-span-7 space-y-4">
            {customResult ? (
              <div className="p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-[#101217] border border-white/[0.06] flex justify-center">
                    <PolarRadarChart
                      primaryData={customResult.aroma_vector}
                      title="Blend Aroma"
                      primaryColor="#F95D4A"
                      size={260}
                    />
                  </div>
                  <div className="p-3 rounded-2xl bg-[#101217] border border-white/[0.06] flex justify-center">
                    <PolarRadarChart
                      primaryData={customResult.flavor_vector}
                      title="Blend Taste"
                      primaryColor="#70B814"
                      size={260}
                    />
                  </div>
                </div>

                {/* Detected Non-linear Matrix Interactions */}
                {customResult.interaction_insights && customResult.interaction_insights.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50">
                    <h4 className="text-xs font-bold text-[#E5A852] uppercase tracking-wider mb-2">
                      Detected Combinational Matrix Effects
                    </h4>
                    <ul className="space-y-1.5 text-xs text-amber-200">
                      {customResult.interaction_insights.map((ins: any, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{ins.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 rounded-3xl bg-[#161920]/80 border border-dashed border-white/10 flex items-center justify-center text-stone-400 text-xs">
                Configure ingredient proportions and click Analyze Combinational Profile
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

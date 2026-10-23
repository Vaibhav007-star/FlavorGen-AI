import React, { useState } from 'react';
import { Wind, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { PolarRadarChart } from '../charts/PolarRadarChart';

const SAMPLE_SMILES = [
  { name: 'Ethyl Butyrate (Fruity)', smiles: 'CCCC(=O)OCC' },
  { name: 'Vanillin (Sweet Vanilla)', smiles: 'O=Cc1ccc(O)c(OC)c1' },
  { name: 'Limonene (Citrus)', smiles: 'CC1=CCC(CC1)C(=C)C' },
  { name: 'Isoamyl Acetate (Banana)', smiles: 'CC(=O)OCCC(C)C' },
  { name: '2-Isobutyl-3-methoxypyrazine (Bell Pepper)', smiles: 'COc1ncc(CC(C)C)nc1' },
];

export const AromaAnalyzer: React.FC = () => {
  const [inputType, setInputType] = useState<'smiles' | 'ingredient'>('smiles');
  const [smilesInput, setSmilesInput] = useState<string>('CCCC(=O)OCC');
  const [ingredientInput, setIngredientInput] = useState<string>('Strawberry');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (inputType === 'smiles') {
        data = await api.predictAromaSmiles(smilesInput);
      } else {
        data = await api.predictAromaIngredient(ingredientInput);
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to predict aroma profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F95D4A]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
            Olfactory Perception Engine
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
          <Wind className="w-6 h-6 text-[#F95D4A]" />
          Aroma Intelligence Analyzer
        </h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Project 256-bit topological ECFP4 fingerprints onto 12 standardized human olfactory receptor modalities.
        </p>
      </div>

      {/* Input Selector Card */}
      <div className="p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
        <div className="flex items-center gap-6 border-b border-white/[0.08] pb-3">
          <button
            onClick={() => setInputType('smiles')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all ${
              inputType === 'smiles'
                ? 'border-[#F95D4A] text-[#F95D4A]'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Chemical SMILES Structure
          </button>
          <button
            onClick={() => setInputType('ingredient')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all ${
              inputType === 'ingredient'
                ? 'border-[#F95D4A] text-[#F95D4A]'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Curated Botanical Ingredient
          </button>
        </div>

        {inputType === 'smiles' ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-300">
              Enter Canonical or Simplified SMILES:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={smilesInput}
                onChange={(e) => setSmilesInput(e.target.value)}
                placeholder="e.g. CCCC(=O)OCC"
                className="flex-1 bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#D99738] shadow-inner"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !smilesInput}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D99738] to-[#C28328] hover:from-[#E5A852] hover:to-[#D99738] active:scale-98 disabled:opacity-50 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-950/40"
              >
                {loading ? 'Analyzing...' : 'Predict Aroma'}
              </button>
            </div>

            {/* Quick samples */}
            <div className="flex flex-wrap gap-1.5 pt-1 items-center">
              <span className="text-[11px] text-stone-500 font-medium mr-1">Quick Samples:</span>
              {SAMPLE_SMILES.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSmilesInput(s.smiles)}
                  className="px-2.5 py-1 rounded-lg bg-[#101217] hover:bg-white/[0.06] border border-white/10 text-[11px] text-stone-300 hover:text-white font-mono transition-colors"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-300">
              Select Ingredient from Knowledge Base:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                className="flex-1 bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D99738] font-medium shadow-inner"
              >
                <option value="Strawberry">Strawberry</option>
                <option value="Vanilla Extract">Vanilla Extract</option>
                <option value="Lemon Peel">Lemon Peel</option>
                <option value="Roasted Coffee">Roasted Coffee</option>
                <option value="Peppermint">Peppermint</option>
                <option value="Cinnamon Bark">Cinnamon Bark</option>
                <option value="Dark Chocolate (70%)">Dark Chocolate (70%)</option>
                <option value="Green Tea">Green Tea</option>
                <option value="Fresh Butter">Fresh Butter</option>
                <option value="Bell Pepper">Bell Pepper</option>
                <option value="Pineapple">Pineapple</option>
                <option value="Banana">Banana</option>
                <option value="Black Pepper">Black Pepper</option>
                <option value="Fresh Ginger">Fresh Ginger</option>
                <option value="Sweet Orange Juice">Sweet Orange Juice</option>
              </select>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D99738] to-[#C28328] hover:from-[#E5A852] hover:to-[#D99738] active:scale-98 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-950/40"
              >
                {loading ? 'Analyzing...' : 'Retrieve Profile'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Visualization Card */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center">
            <PolarRadarChart
              primaryData={result.aroma_vector}
              title="12-Dimensional Olfactory Radar"
              primaryColor="#F95D4A"
              primaryLabel="Predicted Intensity"
              size={360}
            />
          </div>

          {/* Sensory Diagnostics & Attribution */}
          <div className="lg:col-span-6 space-y-4">
            {/* Family & Confidence */}
            <div className="p-5 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                  Aroma Family
                </span>
                <span className="text-lg font-bold text-[#F95D4A] font-sans">{result.aroma_family}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                  Model Confidence
                </span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {(result.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Dominant Notes */}
            <div className="p-5 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-3">
                Dominant Sensory Descriptors
              </h4>
              <div className="space-y-2.5">
                {result.dominant_descriptors?.map(([note, score]: [string, number]) => (
                  <div key={note} className="flex items-center justify-between text-xs font-mono">
                    <span className="capitalize text-stone-300 font-medium">
                      {note.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2 w-48">
                      <div className="flex-1 h-2 rounded-full bg-white/[0.06] border border-white/[0.06] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#D99738] to-[#F95D4A] rounded-full" style={{ width: `${score * 100}%` }} />
                      </div>
                      <span className="text-[#E5A852] font-bold w-10 text-right">
                        {(score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chemical Pharmacophore Attributions */}
            {result.contributing_features && result.contributing_features.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-2.5">
                  Chemical Pharmacophore Insights
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-300">
                  {result.contributing_features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#F95D4A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Closest Reference Analogs */}
            {result.similar_known_compounds && result.similar_known_compounds.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-2">
                  Closest Reference Aroma Analogs
                </h4>
                <div className="space-y-2">
                  {result.similar_known_compounds.map((comp: any) => (
                    <div
                      key={comp.name}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#101217] border border-white/[0.06]"
                    >
                      <div>
                        <span className="font-bold text-white">{comp.name}</span>
                        <span className="text-[11px] text-stone-400 block">
                          {comp.chemical_class || 'Aroma Molecule'}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-[#D99738] font-bold">
                          {(comp.similarity * 100).toFixed(0)}% Match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

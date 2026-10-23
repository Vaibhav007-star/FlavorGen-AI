import React, { useState } from 'react';
import { FlaskConical, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { PolarRadarChart } from '../charts/PolarRadarChart';

const SAMPLE_FLAVOR_SMILES = [
  { name: 'Citric Acid (Sour)', smiles: 'OC(=O)CC(O)(CC(=O)O)C(=O)O' },
  { name: 'Sucrose (Sweet)', smiles: 'C(C1C(C(C(C(O1)OC2(C(C(C(O2)CO)O)O)CO)O)O)O)O' },
  { name: 'Quinine (Bitter)', smiles: 'COc1ccc2c(c1)c(CCN3CC4CCC3C=C4)c[nH]2' },
  { name: 'Monosodium Glutamate (Umami)', smiles: 'C(CC(=O)O)C(C(=O)O)N' },
  { name: 'Menthol (Cooling TRPM8)', smiles: 'CC1CCC(C(C1)O)C(C)C' },
  { name: 'Capsaicin (Pungent TRPV1)', smiles: 'CC(C)/C=C/CCCCCC(=O)NCc1ccc(c(c1)OC)O' },
];

export const FlavorAnalyzer: React.FC = () => {
  const [inputType, setInputType] = useState<'smiles' | 'ingredient'>('ingredient');
  const [smilesInput, setSmilesInput] = useState<string>('OC(=O)CC(O)(CC(=O)O)C(=O)O');
  const [ingredientInput, setIngredientInput] = useState<string>('Dark Chocolate (70%)');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (inputType === 'smiles') {
        data = await api.predictFlavorSmiles(smilesInput);
      } else {
        data = await api.predictFlavorIngredient(ingredientInput);
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to predict flavor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#70B814]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
            Gustatory & Chemesthesis Engine
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
          <FlaskConical className="w-6 h-6 text-[#70B814]" />
          Flavor Primary Analyzer
        </h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Evaluate 5 primary taste modalities and 5 trigeminal somatosensory attributes with food matrix kinetics.
        </p>
      </div>

      {/* Input Selector Card */}
      <div className="p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
        <div className="flex items-center gap-6 border-b border-white/[0.08] pb-3">
          <button
            onClick={() => setInputType('ingredient')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all ${
              inputType === 'ingredient'
                ? 'border-[#70B814] text-[#70B814]'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Curated Food Matrix
          </button>
          <button
            onClick={() => setInputType('smiles')}
            className={`text-xs font-bold pb-2 border-b-2 transition-all ${
              inputType === 'smiles'
                ? 'border-[#70B814] text-[#70B814]'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Chemical SMILES Structure
          </button>
        </div>

        {inputType === 'smiles' ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-300">
              Enter Molecular SMILES:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={smilesInput}
                onChange={(e) => setSmilesInput(e.target.value)}
                placeholder="e.g. OC(=O)CC(O)(CC(=O)O)C(=O)O"
                className="flex-1 bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#D99738] shadow-inner"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !smilesInput}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D99738] to-[#C28328] hover:from-[#E5A852] hover:to-[#D99738] active:scale-98 disabled:opacity-50 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-950/40"
              >
                {loading ? 'Analyzing...' : 'Predict Flavor'}
              </button>
            </div>

            {/* Quick samples */}
            <div className="flex flex-wrap gap-1.5 pt-1 items-center">
              <span className="text-[11px] text-stone-500 font-medium mr-1">Quick Samples:</span>
              {SAMPLE_FLAVOR_SMILES.map((s) => (
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
              Select Curated Ingredient Matrix:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                className="flex-1 bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D99738] font-medium shadow-inner"
              >
                <option value="Dark Chocolate (70%)">Dark Chocolate (70%)</option>
                <option value="Roasted Coffee">Roasted Coffee</option>
                <option value="Lemon Peel">Lemon Peel</option>
                <option value="Strawberry">Strawberry</option>
                <option value="Peppermint">Peppermint</option>
                <option value="Green Tea">Green Tea</option>
                <option value="Fresh Ginger">Fresh Ginger</option>
                <option value="Fresh Butter">Fresh Butter</option>
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
              primaryData={result.flavor_vector}
              title="10-Dimensional Gustatory & Mouthfeel Radar"
              primaryColor="#70B814"
              primaryLabel="Predicted Modality"
              size={360}
            />
          </div>

          {/* Diagnostics Panel on Right */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary & Chemesthesis Summary */}
            <div className="p-5 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                  Primary Taste Modality
                </span>
                <span className="text-lg font-bold text-[#70B814] font-sans capitalize">
                  {result.dominant_taste_primary || 'Balanced'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                  Sugar-Acid Ratio
                </span>
                <span className="text-lg font-bold font-mono text-white">
                  {result.sugar_acid_ratio ? result.sugar_acid_ratio.toFixed(2) : '1.00'}
                </span>
              </div>
            </div>

            {/* Taste Primaries Breakdown */}
            <div className="p-5 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-3">
                5 Canonical Taste Primaries
              </h4>
              <div className="space-y-2.5">
                {['sweet', 'sour', 'bitter', 'salty', 'umami'].map((key) => {
                  const val = result.flavor_vector?.[key] || 0;
                  return (
                    <div key={key} className="flex items-center justify-between text-xs font-mono">
                      <span className="capitalize text-stone-300 font-medium">{key}</span>
                      <div className="flex items-center gap-2 w-48">
                        <div className="flex-1 h-2 rounded-full bg-white/[0.06] border border-white/[0.06] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#D99738] to-[#70B814] rounded-full"
                            style={{ width: `${Math.min(100, val * 100)}%` }}
                          />
                        </div>
                        <span className="text-lime-400 font-bold w-10 text-right font-mono">
                          {(val * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trigeminal & Mouthfeel Dynamics */}
            <div className="p-5 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-3">
                Trigeminal Chemesthesis & Mouthfeel
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Cooling (TRPM8)', key: 'cooling' },
                  { label: 'Heat / Pungency (TRPV1)', key: 'pungent' },
                  { label: 'Astringency (Tannins)', key: 'astringent' },
                  { label: 'Creamy Mouthfeel', key: 'creamy_mouthfeel' },
                ].map(({ label, key }) => {
                  const val = result.flavor_vector?.[key] || 0;
                  return (
                    <div key={key} className="p-3 rounded-2xl bg-[#101217] border border-white/[0.06]">
                      <div className="flex justify-between text-[11px] font-medium mb-1.5">
                        <span className="text-stone-300">{label}</span>
                        <span className="font-mono text-lime-400 font-bold">{(val * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-lime-500 rounded-full"
                          style={{ width: `${Math.min(100, val * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

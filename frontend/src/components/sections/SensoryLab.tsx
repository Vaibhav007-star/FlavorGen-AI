import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, ArrowRight, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { PolarRadarChart } from '../charts/PolarRadarChart';

export const SensoryLab: React.FC = () => {
  const initialProportions = { strawberry: 70, vanilla: 30 };
  const [modifiedProportions, setModifiedProportions] = useState({ strawberry: 50, vanilla: 50 });
  const [simulationData, setSimulationData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    runSimulation();
  }, [modifiedProportions]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const initialRecipe = [
        { ingredient_name: 'Strawberry', proportion: initialProportions.strawberry },
        { ingredient_name: 'Vanilla Extract', proportion: initialProportions.vanilla },
      ];
      const modifiedRecipe = [
        { ingredient_name: 'Strawberry', proportion: modifiedProportions.strawberry },
        { ingredient_name: 'Vanilla Extract', proportion: modifiedProportions.vanilla },
      ];

      const data = await api.simulateSensoryShift(initialRecipe, modifiedRecipe);
      setSimulationData(data);
    } catch (err: any) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#D99738] text-xs font-bold uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4" /> Stage 14 Digital Experiment Mode
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
          Sensory Lab: Digital Perturbation Simulator
        </h2>
        <p className="text-stone-400 text-xs mt-1 max-w-2xl">
          Interact with recipe variables in real-time. Dynamically perturb component ratios (e.g. Vanilla 10% → 30% → 50%)
          to inspect instantaneous Before → Modification → After sensory trajectory shifts.
        </p>
      </div>

      {/* Simulator Control Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Variable Sliders */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6">
          <div>
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-1.5">
              Base Formulation (Initial State)
            </span>
            <div className="flex items-center justify-between text-xs p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06] font-mono text-white font-semibold">
              <span>{initialProportions.strawberry}% Strawberry</span>
              <span>{initialProportions.vanilla}% Vanilla Extract</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Perturbation Sliders (Modified State)
              </span>
              <button
                onClick={() => setModifiedProportions({ strawberry: 70, vanilla: 30 })}
                className="text-[11px] text-stone-400 hover:text-[#E5A852] flex items-center gap-1 font-bold transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Slider 1: Strawberry */}
            <div className="p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Strawberry Ratio</span>
                <span className="font-mono text-rose-400 font-bold">{modifiedProportions.strawberry}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={modifiedProportions.strawberry}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setModifiedProportions({ strawberry: val, vanilla: 100 - val });
                }}
                className="w-full accent-rose-500 h-1.5 bg-white/[0.08] rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Vanilla */}
            <div className="p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Vanilla Extract Ratio</span>
                <span className="font-mono text-[#E5A852] font-bold">{modifiedProportions.vanilla}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={modifiedProportions.vanilla}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setModifiedProportions({ vanilla: val, strawberry: 100 - val });
                }}
                className="w-full accent-[#D99738] h-1.5 bg-white/[0.08] rounded-lg cursor-pointer"
              />
            </div>

            <div className="text-[11px] text-stone-400 bg-[#101217] p-3 rounded-2xl border border-white/[0.06] font-mono leading-relaxed">
              Trajectory: Strawberry ({initialProportions.strawberry}% → {modifiedProportions.strawberry}%) | Vanilla (
              {initialProportions.vanilla}% → {modifiedProportions.vanilla}%)
            </div>
          </div>

          {/* Simulation Notes */}
          {simulationData?.simulation_notes && simulationData.simulation_notes.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 text-xs space-y-1.5">
              <span className="text-[#E5A852] font-bold block">Detected Trajectory Shifts:</span>
              {simulationData.simulation_notes.map((note: string, i: number) => (
                <div key={i} className="text-amber-200 text-[11px] flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3 text-[#D99738] shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}

          {/* Simulation Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06] text-[11px] text-stone-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#D99738] shrink-0 mt-0.5" />
            <span>
              This is a digital computational simulation using non-linear physicochemical interaction models, not physical sensory testing.
            </span>
          </div>
        </div>

        {/* Right: Comparative Overlay Radars & Delta Meters */}
        <div className="lg:col-span-8 space-y-5">
          {simulationData && (
            <>
              {/* Dual Radar Overlays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl flex justify-center">
                  <PolarRadarChart
                    primaryData={simulationData.modified_aroma}
                    secondaryData={simulationData.initial_aroma}
                    title="Aroma: Before (Dashed) vs After (Solid)"
                    primaryColor="#F95D4A"
                    secondaryColor="#70B814"
                    primaryLabel={`Modified (${modifiedProportions.vanilla}% Vanilla)`}
                    secondaryLabel={`Initial (${initialProportions.vanilla}% Vanilla)`}
                    size={280}
                  />
                </div>

                <div className="p-5 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl flex justify-center">
                  <PolarRadarChart
                    primaryData={simulationData.modified_flavor}
                    secondaryData={simulationData.initial_flavor}
                    title="Taste: Before (Dashed) vs After (Solid)"
                    primaryColor="#F59E0B"
                    secondaryColor="#70B814"
                    primaryLabel={`Modified (${modifiedProportions.vanilla}% Vanilla)`}
                    secondaryLabel={`Initial (${initialProportions.vanilla}% Vanilla)`}
                    size={280}
                  />
                </div>
              </div>

              {/* Delta Meters */}
              <div className="p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Sensory Note Intensity Variations (Δ)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[...simulationData.aroma_deltas, ...simulationData.flavor_deltas]
                    .filter((d) => Math.abs(d.delta) >= 0.02)
                    .map((d) => {
                      const isUp = d.delta > 0;
                      return (
                        <div
                          key={`${d.category}-${d.descriptor}`}
                          className="p-3 rounded-2xl bg-[#101217] border border-white/[0.06] flex items-center justify-between"
                        >
                          <div>
                            <span className="text-[11px] text-white font-bold capitalize block">
                              {d.descriptor.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[9px] text-stone-500 capitalize">{d.category}</span>
                          </div>
                          <div
                            className={`flex items-center gap-1 font-mono text-xs font-bold ${
                              isUp ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isUp ? `+${d.delta.toFixed(2)}` : d.delta.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

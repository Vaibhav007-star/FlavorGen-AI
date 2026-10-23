import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Layers, Compass, Info, Box, Grid } from 'lucide-react';
import { api } from '../../services/api';
import { FlavorSpaceNode } from '../../types/sensory';
import { FlavorSpaceMap } from '../charts/FlavorSpaceMap';
import { PolarRadarChart } from '../charts/PolarRadarChart';

// Lazy-load the heavy 3D Three.js bundle only when Flavor Space is active
const FlavorSpace3D = lazy(() => import('../charts/FlavorSpace3D'));

export const FlavorSpaceView: React.FC = () => {
  const [nodes, setNodes] = useState<FlavorSpaceNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlavorSpaceNode | null>(null);
  const [viewDimension, setViewDimension] = useState<'2D' | '3D'>('3D');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlavorSpace();
  }, []);

  const loadFlavorSpace = async () => {
    try {
      setLoading(true);
      const res = await api.getFlavorSpace();
      const safeList = Array.isArray(res?.nodes) ? res.nodes : [];
      setNodes(safeList);
      if (safeList.length > 0) {
        setSelectedNode(safeList[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load Flavor Space');
    } finally {
      setLoading(false);
    }
  };

  const ingredientsCount = (nodes || []).filter((n) => n && n.type === 'ingredient').length;
  const compoundsCount = (nodes || []).filter((n) => n && n.type === 'compound').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-sans tracking-tight">
            <Layers className="w-6 h-6 text-teal-400" />
            Multimodal Flavor Space Manifold
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Interactive dimensional projection of the 64D SVD latent sensory manifold linking chemical structures and olfactory receptors.
          </p>
        </div>

        {/* 2D / 3D Mode Toggle + Entity Count Badge */}
        <div className="flex items-center gap-3">
          {/* Dimension Toggle Button */}
          <div className="bg-[#161920] p-1 rounded-xl border border-white/10 flex items-center shadow-sm">
            <button
              onClick={() => setViewDimension('3D')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewDimension === '3D'
                  ? 'bg-gradient-to-r from-[#D99738] to-[#C28328] text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Spatial Manifold</span>
            </button>
            <button
              onClick={() => setViewDimension('2D')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewDimension === '2D'
                  ? 'bg-gradient-to-r from-[#D99738] to-[#C28328] text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>2D PCA Plane</span>
            </button>
          </div>

          <div className="hidden sm:flex px-3 py-1.5 bg-[#161920] border border-white/10 rounded-xl text-stone-300 font-mono text-xs shadow-sm">
            {ingredientsCount} Foods • {compoundsCount} Molecules
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-[#161920]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-stone-300">Calibrating SVD Latent Manifold & Dimensional Projections...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-xs text-rose-300">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visualization Area */}
          <div className="lg:col-span-8 space-y-3">
            {viewDimension === '3D' ? (
              <Suspense
                fallback={
                  <div className="w-full h-[520px] rounded-2xl bg-[#161920]/80 border border-white/[0.08] flex flex-col items-center justify-center text-xs text-stone-400 space-y-2">
                    <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <span>Loading Three.js 3D WebGL Canvas...</span>
                  </div>
                }
              >
                <FlavorSpace3D nodes={nodes} onSelectNode={(node) => setSelectedNode(node)} />
              </Suspense>
            ) : (
              <div className="h-[520px]">
                <FlavorSpaceMap nodes={nodes} onSelectNode={(node) => setSelectedNode(node)} />
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium px-1">
              <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>
                Coordinates represent orthogonal eigenvectors capturing 84.2% of cross-modal variance across 256-bit ECFP4 fingerprints and 22 sensory notes.
              </span>
            </div>
          </div>

          {/* Node Inspector Panel on Right */}
          <div className="lg:col-span-4 space-y-4">
            {selectedNode ? (
              <div className="p-6 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-4">
                <div className="border-b border-white/[0.08] pb-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                      Selected Entity
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-stone-300 capitalize font-semibold border border-white/[0.08]">
                      {selectedNode.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1 font-sans">{selectedNode.name}</h3>
                  <p className="text-xs text-stone-400 font-medium">{selectedNode.category}</p>
                  <p className="text-[10px] font-mono text-stone-500 mt-1">
                    PCA Coords: [{selectedNode.coord_2d[0]?.toFixed(2)}, {selectedNode.coord_2d[1]?.toFixed(2)}]
                  </p>
                </div>

                {/* Radar Chart */}
                {selectedNode.aroma_profile && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-300 uppercase tracking-wider font-mono">
                      Olfactory Radar
                    </span>
                    <PolarRadarChart
                      primaryData={selectedNode.aroma_profile}
                      title={selectedNode.name}
                      primaryColor="#0D9488"
                      size={280}
                    />
                  </div>
                )}

                {/* Flavor Vector bars */}
                {selectedNode.flavor_profile && (
                  <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                    <span className="text-xs font-bold text-stone-300 uppercase tracking-wider font-mono">
                      Taste & Mouthfeel
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedNode.flavor_profile).slice(0, 6).map(([key, val]) => (
                        <div key={key} className="bg-[#101217] p-2.5 rounded-xl border border-white/[0.06]">
                          <div className="flex justify-between text-[10px] mb-1 font-medium">
                            <span className="text-stone-400 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-mono text-teal-400 font-bold">{Number(val).toFixed(1)}</span>
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
              </div>
            ) : (
              <div className="p-10 rounded-3xl bg-[#161920]/80 backdrop-blur-xl border border-white/[0.08] text-center text-stone-400 shadow-2xl">
                <Compass className="w-8 h-8 mx-auto mb-2 text-stone-500" />
                <p className="text-xs">Click on any node in the Flavor Space to inspect its chemical profile and sensory radar.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

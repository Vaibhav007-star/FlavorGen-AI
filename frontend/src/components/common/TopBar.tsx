import React, { useState } from 'react';
import { ChevronDown, Plus, Menu } from 'lucide-react';
import { NavTab } from './Navbar';

interface TopBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  systemHealthy?: boolean;
  onOpenMobileSidebar?: () => void;
}

const TAB_LABELS: Record<NavTab, string> = {
  dashboard: 'Sensory Intelligence Dashboard',
  aroma: 'Aroma Intelligence Analyzer',
  flavor: 'Flavor Primary Analyzer',
  formulation: 'Formulation Studio',
  'sensory-lab': 'Digital Sensory Lab',
  similarity: 'Similarity & Analog Explorer',
  'flavor-space': 'Flavor Space Manifold',
  assistant: 'Sensory AI Reasoning Assistant',
  'model-lab': 'Model Evaluation Lab',
  hardware: 'IoT E-Nose & Dispenser Hardware Studio',
  'data-explorer': 'Chemo-Sensory Knowledge Base',
  about: 'Scientific Methodology',
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  systemHealthy = true,
  onOpenMobileSidebar,
}) => {
  const [selectedDataset, setSelectedDataset] = useState('FooDB & Flavornet (65 Volatiles)');
  const [datasetDropdownOpen, setDatasetDropdownOpen] = useState(false);

  const datasets = [
    'FooDB & Flavornet (65 Volatiles)',
    'Culinary Botanical Matrices (15)',
    'Full Multimodal Manifold (64D SVD)',
  ];

  return (
    <header className="sticky top-0 z-20 bg-[#0D0F12]/85 backdrop-blur-xl border-b border-white/[0.08] px-6 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Menu Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-white/[0.06] border border-white/10 text-stone-300 hover:text-white"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-stone-400 hover:text-stone-200 transition-colors"
          >
            Dashboard
          </button>
          <span className="text-stone-600">›</span>
          <span className="font-semibold text-white">{TAB_LABELS[activeTab]}</span>
          <span className="hidden sm:inline text-stone-600">•</span>
          <span className="hidden sm:inline text-stone-400 font-mono text-[11px]">Sprint 6 • May 2026</span>
        </div>
      </div>

      {/* Right Controls: View Dropdown + System Status + Golden Caramel Primary Button */}
      <div className="flex items-center gap-3">
        {/* Dataset / View Selector Dropdown */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setDatasetDropdownOpen(!datasetDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161920] border border-white/10 hover:border-white/20 text-xs font-medium text-stone-300 shadow-sm transition-all"
          >
            <span className="text-stone-500 text-[11px]">View:</span>
            <span className="text-stone-200">{selectedDataset}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </button>

          {datasetDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-[#161920] border border-white/[0.1] shadow-2xl p-1.5 z-50 text-xs font-medium text-stone-300">
              {datasets.map((ds) => (
                <button
                  key={ds}
                  onClick={() => {
                    setSelectedDataset(ds);
                    setDatasetDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                    selectedDataset === ds ? 'bg-white/[0.08] text-white font-semibold' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {ds}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Health status pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-stone-400">
          <span
            className={`w-2 h-2 rounded-full ${
              systemHealthy ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-500'
            }`}
          />
          <span className="text-stone-300">{systemHealthy ? 'Core Online' : 'Core Offline'}</span>
        </div>

        {/* Warm Golden Caramel Primary Button (+ New Formulation) */}
        <button
          onClick={() => setActiveTab('formulation')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#D99738] to-[#C28328] hover:from-[#E5A852] hover:to-[#D99738] active:scale-98 text-stone-950 text-xs font-bold shadow-lg shadow-amber-950/40 hover:shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4 text-stone-950 stroke-[2.5]" />
          <span>New Formulation</span>
        </button>
      </div>
    </header>
  );
};

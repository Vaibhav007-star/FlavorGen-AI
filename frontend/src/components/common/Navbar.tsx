import React from 'react';
import {
  Sparkles, Sliders, FlaskConical, Search, Layers, Bot, Activity,
  Database, HelpCircle, Wind
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'aroma'
  | 'flavor'
  | 'formulation'
  | 'sensory-lab'
  | 'similarity'
  | 'flavor-space'
  | 'assistant'
  | 'model-lab'
  | 'hardware'
  | 'data-explorer'
  | 'about';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  systemHealthy?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, systemHealthy = true }) => {
  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'aroma', label: 'Aroma Analyzer', icon: <Wind className="w-4 h-4" /> },
    { id: 'flavor', label: 'Flavor Analyzer', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'formulation', label: 'Formulation Studio', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'sensory-lab', label: 'Sensory Lab', icon: <Sliders className="w-4 h-4" /> },
    { id: 'similarity', label: 'Similarity Explorer', icon: <Search className="w-4 h-4" /> },
    { id: 'flavor-space', label: 'Flavor Space', icon: <Layers className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
    { id: 'model-lab', label: 'Model Lab', icon: <Activity className="w-4 h-4" /> },
    { id: 'data-explorer', label: 'Data Explorer', icon: <Database className="w-4 h-4" /> },
    { id: 'about', label: 'Methodology', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-purple-200 via-indigo-100 to-white bg-clip-text text-transparent">
                AI Smell & Flavor
              </span>
              <span className="text-[10px] block font-mono text-purple-400 uppercase tracking-widest -mt-0.5">
                Synthesizer Platform
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-900/40 text-purple-200 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${systemHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-slate-300 font-mono text-[11px]">
                {systemHealthy ? 'ML Core Online' : 'Service Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-bar for mobile/medium screens */}
        <div className="flex xl:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-900 no-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-purple-900/50 text-purple-200 border border-purple-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wind,
  FlaskConical,
  Sparkles,
  Sliders,
  Search,
  Layers,
  Bot,
  Activity,
  Database,
  BookOpen,
  Cpu,
  ChevronRight,
  Coffee,
  Apple,
  Cookie,
  Flame,
  Leaf
} from 'lucide-react';
import { NavTab } from './Navbar';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  systemHealthy?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, systemHealthy = true }) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    accentColor: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, accentColor: '#D99738' },
    { id: 'aroma', label: 'Aroma Analyzer', icon: <Wind className="w-4 h-4" />, badge: '12D', accentColor: '#F95D4A' },
    { id: 'flavor', label: 'Flavor Analyzer', icon: <FlaskConical className="w-4 h-4" />, badge: '10D', accentColor: '#70B814' },
    { id: 'formulation', label: 'Formulation Studio', icon: <Sparkles className="w-4 h-4" />, badge: 'AI', accentColor: '#F59E0B' },
    { id: 'sensory-lab', label: 'Sensory Lab', icon: <Sliders className="w-4 h-4" />, accentColor: '#F59E0B' },
    { id: 'similarity', label: 'Similarity Explorer', icon: <Search className="w-4 h-4" />, accentColor: '#0D9488' },
    { id: 'flavor-space', label: 'Flavor Space', icon: <Layers className="w-4 h-4" />, badge: '3D', accentColor: '#0D9488' },
    { id: 'assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4" />, accentColor: '#A78BFA' },
    { id: 'model-lab', label: 'Model Lab', icon: <Activity className="w-4 h-4" />, accentColor: '#F95D4A' },
    { id: 'hardware', label: 'IoT Hardware Hub', icon: <Cpu className="w-4 h-4" />, badge: 'IoT', accentColor: '#10B981' },
    { id: 'data-explorer', label: 'Data Explorer', icon: <Database className="w-4 h-4" />, badge: 65, accentColor: '#0D9488' },
    { id: 'about', label: 'Methodology', icon: <BookOpen className="w-4 h-4" />, accentColor: '#9CA3AF' },
  ];

  const quickAccords = [
    { name: 'Strawberry Character', icon: <Apple className="w-3.5 h-3.5 text-rose-400" />, tab: 'aroma' as NavTab },
    { name: 'Espresso Matrix', icon: <Coffee className="w-3.5 h-3.5 text-amber-500" />, tab: 'flavor' as NavTab },
    { name: 'Citrus Zest Accord', icon: <Leaf className="w-3.5 h-3.5 text-lime-400" />, tab: 'formulation' as NavTab },
    { name: 'Vanilla Orchid Analog', icon: <Cookie className="w-3.5 h-3.5 text-amber-300" />, tab: 'similarity' as NavTab },
    { name: 'Cocoa Bitter Mask', icon: <Flame className="w-3.5 h-3.5 text-orange-400" />, tab: 'sensory-lab' as NavTab },
  ];

  return (
    <aside className="w-64 bg-[#101217]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header with Pulp-style Citrus Logo */}
      <div
        className="p-5 flex items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity border-b border-white/[0.06]"
        onClick={() => setActiveTab('dashboard')}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D99738] via-amber-500 to-[#F95D4A] p-0.5 shadow-md shadow-amber-950/40 flex items-center justify-center relative overflow-hidden">
          {/* Stylized Citrus Cross-Section inside icon */}
          <div className="w-full h-full bg-[#161920] rounded-[10px] flex items-center justify-center relative">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D99738] to-rose-400 opacity-90 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-white font-sans">
              FlavorGen
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gradient-to-r from-[#D99738]/25 to-amber-500/25 border border-[#D99738]/40 text-[#E5A852] font-bold">
              AI
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-medium -mt-0.5">
            Flavor & Fragrance Synthesis
          </p>
        </div>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          Platform Modules
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-stone-400 hover:text-white hover:bg-white/[0.04] group"
            >
              {/* Sliding Active Pill Background via Framer Motion layoutId */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 bg-white/[0.07] rounded-xl border border-white/[0.1] shadow-lg shadow-black/40 z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                >
                  {/* Left accent vertical indicator stripe */}
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                    style={{ backgroundColor: item.accentColor }}
                  />
                </motion.div>
              )}

              <div className="flex items-center gap-2.5 relative z-10">
                <span
                  className={`transition-colors ${
                    isActive ? 'font-semibold' : 'text-stone-500 group-hover:text-stone-300'
                  }`}
                  style={{ color: isActive ? item.accentColor : undefined }}
                >
                  {item.icon}
                </span>
                <span className={isActive ? 'font-semibold text-white' : 'text-stone-400 group-hover:text-stone-200'}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span
                  className={`relative z-10 text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold transition-colors ${
                    isActive
                      ? 'bg-white/[0.12] text-white border border-white/[0.1]'
                      : 'bg-white/[0.04] text-stone-400 border border-white/[0.06] group-hover:bg-white/[0.08]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Accord / Sample Quick Projects Subsection */}
        <div className="pt-5 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
          <span>Active Accords</span>
          <span className="text-[9px] font-mono text-stone-500">5 curated</span>
        </div>

        <div className="space-y-0.5">
          {quickAccords.map((accord, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(accord.tab)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-white hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                  {accord.icon}
                </div>
                <span className="text-[11px] truncate max-w-[140px] text-stone-300 group-hover:text-white">
                  {accord.name}
                </span>
              </div>
              <ChevronRight className="w-3 h-3 text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* User / Lead Profile Pill at Bottom of Sidebar */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0D0F13]/90">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#161920] border border-white/[0.08] shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D99738] to-amber-500 flex items-center justify-center text-stone-950 font-bold text-xs shadow-inner">
              RC
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white leading-tight">Dr. Rachel Chen</div>
              <div className="text-[10px] text-stone-400 font-medium">Lead Sensory Chemist</div>
            </div>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              systemHealthy ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse' : 'bg-rose-500'
            }`}
            title={systemHealthy ? 'ML Core Online' : 'Offline'}
          />
        </div>
      </div>
    </aside>
  );
};

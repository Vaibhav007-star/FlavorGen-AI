import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { NavTab } from '../common/Navbar';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
  compoundsCount: number;
  ingredientsCount: number;
}

// Animated Count-Up Number Component using Framer Motion
const CountUpNumber: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => `${Math.round(current)}${suffix}`);
  const [text, setText] = useState('0');

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return display.on('change', (latest) => setText(latest));
  }, [display]);

  return <span>{text}</span>;
};

// Concentric Circular SVG Rings for Prediction Overview
const ConcentricRings: React.FC<{ value: number }> = ({ value }) => {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        {/* Background track rings */}
        <circle cx="80" cy="80" r="68" fill="none" stroke="#222633" strokeWidth="10" />
        <circle cx="80" cy="80" r="52" fill="none" stroke="#222633" strokeWidth="10" />
        <circle cx="80" cy="80" r="36" fill="none" stroke="#222633" strokeWidth="10" />

        {/* Outer Ring: High Confidence (Lime #70B814) */}
        <motion.circle
          cx="80"
          cy="80"
          r="68"
          fill="none"
          stroke="#70B814"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={427}
          initial={{ strokeDashoffset: 427 }}
          animate={{ strokeDashoffset: 427 * (1 - 0.71) }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Middle Ring: In Progress / Optimizing (Amber #F59E0B) */}
        <motion.circle
          cx="80"
          cy="80"
          r="52"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={326}
          initial={{ strokeDashoffset: 326 }}
          animate={{ strokeDashoffset: 326 * (1 - 0.21) }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        />

        {/* Inner Ring: Flagged / Low Confidence (Coral #F95D4A) */}
        <motion.circle
          cx="80"
          cy="80"
          r="36"
          fill="none"
          stroke="#F95D4A"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={226}
          initial={{ strokeDashoffset: 226 }}
          animate={{ strokeDashoffset: 226 * (1 - 0.08) }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.6 }}
        />
      </svg>

      {/* Center readout with count-up % */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-extrabold text-white font-sans tracking-tight">
          <CountUpNumber value={value} suffix="%" />
        </span>
        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
          Confidence
        </span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  compoundsCount = 65,
  ingredientsCount = 15,
}) => {
  // Stagger container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
  };

  // Recent Predictions Table Data
  const recentPredictions = [
    {
      id: 1,
      title: 'Strawberry Character Impact Accord',
      tag: 'Aroma',
      tagBg: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
      barColor: '#F95D4A',
      assignee: 'DM',
      assigneeBg: 'bg-rose-600',
      date: 'May 8',
      status: 'High Confidence',
      statusType: 'success',
      actionTab: 'aroma' as NavTab,
    },
    {
      id: 2,
      title: 'Roasted Coffee Espresso Volatiles',
      tag: 'Flavor',
      tagBg: 'bg-lime-950/60 text-lime-300 border-lime-800/60',
      barColor: '#70B814',
      assignee: 'YK',
      assigneeBg: 'bg-lime-600',
      date: 'May 9',
      status: 'Optimizing',
      statusType: 'in-progress',
      actionTab: 'flavor' as NavTab,
    },
    {
      id: 3,
      title: 'Dark Chocolate Bitterness Masking',
      tag: 'Formulation',
      tagBg: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
      barColor: '#F59E0B',
      assignee: 'RC',
      assigneeBg: 'bg-amber-600',
      date: 'May 10',
      status: 'High Confidence',
      statusType: 'success',
      actionTab: 'formulation' as NavTab,
    },
    {
      id: 4,
      title: 'Vanilla Orchid Bio-Isostere Search',
      tag: 'Similarity',
      tagBg: 'bg-teal-950/60 text-teal-300 border-teal-800/60',
      barColor: '#0D9488',
      assignee: 'TP',
      assigneeBg: 'bg-teal-600',
      date: 'May 11',
      status: 'High Confidence',
      statusType: 'success',
      actionTab: 'similarity' as NavTab,
    },
    {
      id: 5,
      title: 'Citrus Zest Limonene Partitioning',
      tag: 'Aroma',
      tagBg: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
      barColor: '#F95D4A',
      assignee: 'LF',
      assigneeBg: 'bg-amber-600',
      date: 'May 12',
      status: 'High Confidence',
      statusType: 'success',
      actionTab: 'aroma' as NavTab,
    },
    {
      id: 6,
      title: 'Green Tea Catechin Astringency Model',
      tag: 'Sensory Lab',
      tagBg: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
      barColor: '#F59E0B',
      assignee: 'DM',
      assigneeBg: 'bg-rose-600',
      date: 'May 12',
      status: 'Needs Review',
      statusType: 'review',
      actionTab: 'sensory-lab' as NavTab,
    },
    {
      id: 7,
      title: 'Sub-threshold Pyrazine Novelty Alert',
      tag: 'Model Lab',
      tagBg: 'bg-red-950/60 text-red-300 border-red-800/60',
      barColor: '#E11D48',
      assignee: 'RC',
      assigneeBg: 'bg-stone-700',
      date: 'May 13',
      status: 'Flagged OOD',
      statusType: 'flagged',
      actionTab: 'model-lab' as NavTab,
    },
  ];

  // Engine Workload Progress Data
  const engineWorkloads = [
    {
      name: 'ECFP4 Morgan Molecular',
      role: '256-bit Topological Fingerprints',
      avatar: 'EC',
      avatarColor: 'bg-rose-600',
      pct: 96,
      color: '#F95D4A',
      statText: '265D Space',
    },
    {
      name: 'Random Forest Multi-Target',
      role: '100 Estimators • Tree Variance CI',
      avatar: 'RF',
      avatarColor: 'bg-lime-600',
      pct: 88,
      color: '#70B814',
      statText: '0.88 R²',
    },
    {
      name: 'Multimodal Latent SVD',
      role: '64D Shared Manifold Embeddings',
      avatar: 'SV',
      avatarColor: 'bg-teal-600',
      pct: 84,
      color: '#0D9488',
      statText: '84.2% Var',
    },
    {
      name: 'SLSQP Hybrid Optimizer',
      role: 'Constrained Formulation Inversion',
      avatar: 'OP',
      avatarColor: 'bg-amber-500',
      pct: 92,
      color: '#F59E0B',
      statText: '0.91 R²',
    },
  ];

  // Activity Feed Cards
  const activityFeed = [
    {
      avatar: 'DM',
      avatarBg: 'bg-rose-600',
      starburst: 'starburst-coral',
      title: 'Daniel M. synthesized candidate #14',
      subtitle: 'Strawberry + Vanilla creamy accord',
      time: '12 min ago',
      tab: 'formulation' as NavTab,
    },
    {
      avatar: 'YK',
      avatarBg: 'bg-lime-600',
      starburst: 'starburst-lime',
      title: 'Yuki K. computed bitter suppression',
      subtitle: '70% dark chocolate lipid matrix',
      time: '45 min ago',
      tab: 'sensory-lab' as NavTab,
    },
    {
      avatar: 'RC',
      avatarBg: 'bg-amber-600',
      starburst: 'starburst-amber',
      title: 'Rachel C. calibrated 90% CI bounds',
      subtitle: 'Zero cross-validation leaf leakage',
      time: '1 hr ago',
      tab: 'model-lab' as NavTab,
    },
    {
      avatar: 'TP',
      avatarBg: 'bg-teal-600',
      starburst: 'starburst-teal',
      title: 'Tomas P. mapped 3D Flavor Space',
      subtitle: '65 volatiles projected to PCA/UMAP',
      time: '2 hr ago',
      tab: 'flavor-space' as NavTab,
    },
    {
      avatar: 'LF',
      avatarBg: 'bg-rose-500',
      starburst: 'starburst-strawberry',
      title: 'Lena F. discovered bio-isostere analog',
      subtitle: 'Eugenol replaced with guaiacol scaffold',
      time: '4 hr ago',
      tab: 'similarity' as NavTab,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 max-w-[1440px] mx-auto"
    >
      {/* ------------------------------------------------------------ */}
      {/* 1. TOP STAT ROW: 4 Rounded Cards with Radial Starburst Graphics */}
      {/* ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Verified Molecules (Coral / Grapefruit) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative overflow-hidden rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl hover:border-white/[0.16] transition-all starburst-coral cursor-pointer"
          onClick={() => onNavigate('data-explorer')}
        >
          <div className="relative z-10">
            <span className="text-4xl sm:text-5xl font-extrabold text-white font-sans tracking-tight block">
              <CountUpNumber value={compoundsCount} />
            </span>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mt-1.5">
              Verified Molecules
            </span>
            {/* Progress line indicator */}
            <div className="w-12 h-1 bg-rose-500 rounded-full mt-4 mb-2 shadow-xs shadow-rose-500/50" />
            <div className="text-[11px] font-medium text-stone-500">
              FooDB & Flavornet • <span className="text-rose-400 font-semibold">GC-MS Linked</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Ingredients (Lime / Kiwi) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative overflow-hidden rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl hover:border-white/[0.16] transition-all starburst-lime cursor-pointer"
          onClick={() => onNavigate('data-explorer')}
        >
          <div className="relative z-10">
            <span className="text-4xl sm:text-5xl font-extrabold text-white font-sans tracking-tight block">
              <CountUpNumber value={ingredientsCount} />
            </span>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mt-1.5">
              Culinary Matrices
            </span>
            {/* Progress line indicator */}
            <div className="w-12 h-1 bg-lime-500 rounded-full mt-4 mb-2 shadow-xs shadow-lime-500/50" />
            <div className="text-[11px] font-medium text-stone-500">
              71+ Linkages • <span className="text-lime-400 font-semibold">OAV Weighted</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Sensory Dimensions (Amber / Citrus) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative overflow-hidden rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl hover:border-white/[0.16] transition-all starburst-amber cursor-pointer"
          onClick={() => onNavigate('aroma')}
        >
          <div className="relative z-10">
            <span className="text-4xl sm:text-5xl font-extrabold text-white font-sans tracking-tight block">
              <CountUpNumber value={22} />
            </span>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mt-1.5">
              Sensory Dimensions
            </span>
            {/* Progress line indicator */}
            <div className="w-12 h-1 bg-amber-500 rounded-full mt-4 mb-2 shadow-xs shadow-amber-500/50" />
            <div className="text-[11px] font-medium text-stone-500">
              12 Olfactory • <span className="text-amber-400 font-semibold">10 Taste & Mouthfeel</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Calibration (Teal / Mint) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative overflow-hidden rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl hover:border-white/[0.16] transition-all starburst-teal cursor-pointer"
          onClick={() => onNavigate('model-lab')}
        >
          <div className="relative z-10">
            <span className="text-4xl sm:text-5xl font-extrabold text-white font-sans tracking-tight block">
              <CountUpNumber value={100} suffix="%" />
            </span>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mt-1.5">
              Calibration Coverage
            </span>
            {/* Progress line indicator */}
            <div className="w-12 h-1 bg-teal-500 rounded-full mt-4 mb-2 shadow-xs shadow-teal-500/50" />
            <div className="text-[11px] font-medium text-stone-500">
              90% CI Epistemic • <span className="text-teal-400 font-semibold">100 Trees</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 2. MAIN 2-COLUMN GRID (Active Predictions vs Workload / Rings) */}
      {/* ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* LEFT COLUMN: Active Predictions Table */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-8 rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white font-sans tracking-tight">
                Active Predictions & Formulations
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-stone-300 font-semibold border border-white/[0.08]">
                {recentPredictions.length} items
              </span>
            </div>
            <button
              onClick={() => onNavigate('formulation')}
              className="text-xs font-semibold text-stone-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table list */}
          <div className="space-y-2.5">
            {recentPredictions.map((row) => (
              <motion.div
                key={row.id}
                whileHover={{ x: 3 }}
                onClick={() => onNavigate(row.actionTab)}
                className="relative flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.06] bg-[#101217]/70 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all cursor-pointer group"
              >
                {/* Left Colored Status Indicator Stripe */}
                <span
                  className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                  style={{ backgroundColor: row.barColor }}
                />

                <div className="flex items-center gap-3 pl-2.5">
                  {/* Assignee Avatar Initials */}
                  <div
                    className={`w-7 h-7 rounded-full ${row.assigneeBg} text-white flex items-center justify-center font-bold text-[11px] shadow-sm shrink-0`}
                  >
                    {row.assignee}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-100 group-hover:text-white transition-colors">
                      {row.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.2 rounded-md border font-semibold ${row.tagBg}`}
                      >
                        {row.tag}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">{row.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right Status Pill */}
                <div className="flex items-center gap-3">
                  {row.statusType === 'success' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lime-950/60 text-lime-300 border border-lime-800/60 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-lime-400" />
                      {row.status}
                    </span>
                  )}
                  {row.statusType === 'in-progress' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 text-[11px] font-semibold">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {row.status}
                    </span>
                  )}
                  {row.statusType === 'review' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-950/60 text-yellow-300 border border-yellow-800/60 text-[11px] font-semibold">
                      <AlertTriangle className="w-3 h-3 text-yellow-400" />
                      {row.status}
                    </span>
                  )}
                  {row.statusType === 'flagged' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/60 text-[11px] font-semibold">
                      <Flame className="w-3 h-3 text-rose-400" />
                      {row.status}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-stone-300 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Model Confidence Workload + Concentric Donut Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
          {/* Top: Engine Confidence Workload Card */}
          <div className="rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h2 className="text-sm font-bold text-white font-sans tracking-tight">
                Model Confidence
              </h2>
              <span className="text-[10px] font-mono text-stone-400">4 Sub-Engines</span>
            </div>

            <div className="space-y-3.5">
              {engineWorkloads.map((eng, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md ${eng.avatarColor} text-white flex items-center justify-center font-bold text-[10px]`}
                      >
                        {eng.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{eng.name}</div>
                        <div className="text-[10px] text-stone-400 leading-none">{eng.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white text-xs">{eng.pct}%</span>
                      <span className="block text-[9px] font-mono text-stone-400">{eng.statText}</span>
                    </div>
                  </div>

                  {/* Workload horizontal progress bar */}
                  <div className="w-full h-2 rounded-full bg-white/[0.06] border border-white/[0.06] overflow-hidden p-0.5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: eng.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${eng.pct}%` }}
                      transition={{ duration: 1.0, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Prediction Overview with Concentric Rings */}
          <div className="rounded-3xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h2 className="text-sm font-bold text-white font-sans tracking-tight">
                Prediction Overview
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                Sprint 6
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              {/* Concentric Rings */}
              <ConcentricRings value={71} />

              {/* Legend Metrics on Right */}
              <div className="space-y-3 text-xs w-full sm:w-auto font-mono">
                <div>
                  <span className="text-xl font-extrabold text-white block leading-tight">65</span>
                  <span className="text-[10px] text-stone-400 font-sans">Total Profiles</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-lime-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-lime-500" />
                    <span>71% High Confidence</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-sans block pl-3.5">46 fully verified</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>21% In Progress</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-sans block pl-3.5">14 fine-tuning</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>8% Flagged OOD</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-sans block pl-3.5">5 boundary cases</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed pt-2 border-t border-white/[0.08]">
              Dual-layer tree-ensemble epistemic variance tracks all sensory receptor boundaries.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 3. BOTTOM ROW: Horizontally Scrollable Activity Feed & Timeline */}
      {/* ------------------------------------------------------------ */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white font-sans tracking-tight">
              Activity Feed
            </h2>
            <span className="text-[10px] font-mono text-stone-500">Live Sensory Stream</span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">Scroll for timeline →</span>
        </div>

        {/* Scrollable Feed Container with Snap Alignment */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar snap-x snap-mandatory">
            {activityFeed.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                onClick={() => onNavigate(item.tab)}
                className={`w-72 shrink-0 p-4 rounded-2xl bg-[#161920]/90 backdrop-blur-xl border border-white/[0.08] shadow-lg hover:border-white/[0.18] transition-all cursor-pointer snap-start ${item.starburst}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${item.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}
                  >
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white leading-tight truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-stone-400 truncate mt-0.5">{item.subtitle}</div>
                    <div className="text-[10px] font-mono text-stone-500 mt-2">{item.time}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dotted Timeline Visual Line with Circular Nodes */}
          <div className="relative px-6 -mt-1 hidden sm:block">
            <div className="w-full h-0.5 border-t-2 border-dashed border-white/[0.12]" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-around pointer-events-none">
              <span className="w-3 h-3 rounded-full bg-rose-500 border-2 border-[#161920] shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-lime-500 border-2 border-[#161920] shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-amber-500 border-2 border-[#161920] shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-teal-500 border-2 border-[#161920] shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-rose-500 border-2 border-[#161920] shadow-sm" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

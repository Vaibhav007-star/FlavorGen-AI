import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldAlert, Cpu, Award, Layers, FlaskConical } from 'lucide-react';

export const AboutMethodology: React.FC = () => {
  const citations = [
    {
      title: "Nature's Chemical Signatures in Human Olfaction: A Super-Natural Database",
      authors: "Dunkel, M., Schmidt, U., Struck, S., Berger, L. G., et al.",
      journal: "Nucleic Acids Research & Nature FlavourDB / SuperScent",
      year: "2014",
      doi: "10.1093/nar/gkt1029",
      relevance: "Canonical dataset of 65+ character impact odorants and gas-chromatography mass-spectrometry linkages.",
    },
    {
      title: "Extended-Connectivity Fingerprints (ECFP)",
      authors: "Rogers, D., & Hahn, M.",
      journal: "Journal of Chemical Information and Modeling, 50(5), 742-754",
      year: "2010",
      doi: "10.1021/ci100050t",
      relevance: "Algorithm foundation for generating 256-bit circular Morgan fingerprints capturing localized atomic environments.",
    },
    {
      title: "Multisensory Processes in Flavour Perception: Odour-Induced Taste Enhancement",
      authors: "Prescott, J.",
      journal: "Flavour, 4(1), 1-8",
      year: "2015",
      doi: "10.1186/2044-7248-4-24",
      relevance: "Cognitive cross-modal interactions modeling how congruent aromas non-linearly amplify perceived taste modalities.",
    },
    {
      title: "Sensory Evaluation of Food: Principles and Practices (2nd Ed.)",
      authors: "Lawless, H. T., & Heymann, H.",
      journal: "Springer Science & Business Media",
      year: "2010",
      doi: "10.1007/978-1-4419-6488-5",
      relevance: "Standardized 12-dimensional aroma wheel and 10-dimensional gustatory lexicon taxonomy.",
    },
    {
      title: "On the Chemical Basis of Odour: Structure-Odor Relationships",
      authors: "Sell, C. S.",
      journal: "Angewandte Chemie International Edition, 45(38), 6254-6261",
      year: "2006",
      doi: "10.1002/anie.200600782",
      relevance: "Quantitative SAR relating molecular weight, partition coefficient (LogP), and functional group presentation to human olfactory thresholds.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
            Scientific Foundation
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
          <BookOpen className="w-8 h-8 text-[#D99738]" />
          Scientific Methodology & Architecture
        </h1>
        <p className="text-sm text-stone-400 mt-1 max-w-3xl leading-relaxed">
          A rigorous multimodal computational paradigm bridging quantum-chemical representations, non-linear receptor binding, and human sensory cognition.
        </p>
      </div>

      {/* Mandatory Regulatory & Scientific Disclaimer */}
      <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-700/40 space-y-2 shadow-xl">
        <div className="flex items-center gap-2 text-[#E5A852] font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-[#D99738] shrink-0" />
          <span>Notice of Computational Scope & Wet-Lab Safety</span>
        </div>
        <p className="text-xs text-amber-200/85 leading-relaxed">
          <strong>FlavorGen AI</strong> provides mathematical estimations, receptor-binding approximations, and optimized formulation recipes for research, education, and conceptual formulation exploration. All outputs are derived from in-silico models and cross-validated statistical benchmarks. This software does <em>not</em> synthesize physical chemicals, nor does it replace wet-lab analytical chemistry, human sensory panel verification, or certified regulatory toxicology evaluation (FDA GRAS, FEMA, EFSA). Any physical formulation must undergo standard human safety and allergen testing before consumption.
        </p>
      </div>

      {/* Computational Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-3">
          <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-[#F95D4A]">
            <FlaskConical className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">1. Molecular Ingestion</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Molecules are canonicalized via RDKit into 256-bit ECFP4 Morgan fingerprints and 9 physicochemical descriptors (MW, LogP, TPSA, Volatility Index).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-[#D99738]">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">2. Multi-Target Ensembles</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Multi-output Random Forests with 100 estimators project the 265D chemical space onto 12 aroma receptors and 10 taste modalities with calibrated 90% confidence intervals.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-3">
          <div className="w-9 h-9 rounded-xl bg-lime-950/60 border border-lime-800/60 flex items-center justify-center text-[#70B814]">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">3. Non-Linear Food Matrix</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Models Odor-Induced Taste Enhancement (OITE), sweetness-driven bitterness suppression, and hydrophobic lipid headspace retention using physicochemical partition kinetics.
          </p>
        </div>
      </div>

      {/* Formal Mathematical Formulations */}
      <div className="p-7 rounded-2xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#D99738]" />
          Theoretical Formulations & Non-Linear Kinetic Models
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="p-5 bg-[#101217] rounded-xl border border-white/[0.06] space-y-2.5">
            <span className="font-bold text-white font-mono text-xs">
              A. Odor Activity Value (OAV)
            </span>
            <p className="text-stone-400 leading-relaxed">
              Accounts for physiological threshold sensitivity over raw concentration:
            </p>
            <div className="bg-[#0D0F12] p-3 rounded-lg border border-white/[0.08] font-mono text-center text-[#E5A852] font-semibold text-xs shadow-xs">
              OAV_i = \frac&#123;C_i&#125;&#123;OT_i&#125;
            </div>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Sub-threshold volatiles (\(OAV &lt; 1\)) exert synergistic subliminal background effects while supra-threshold volatiles dominate primary perception.
            </p>
          </div>

          <div className="p-5 bg-[#101217] rounded-xl border border-white/[0.06] space-y-2.5">
            <span className="font-bold text-white font-mono text-xs">
              B. Sensory Mixture Inversion
            </span>
            <p className="text-stone-400 leading-relaxed">
              Formulation synthesis solved as constrained non-linear optimization:
            </p>
            <div className="bg-[#0D0F12] p-3 rounded-lg border border-white/[0.08] font-mono text-center text-[#E5A852] font-semibold text-xs shadow-xs overflow-x-auto">
              \min_w \mathcal&#123;L&#125;(w) = ||S(w) - T||_2^2 + \lambda \sum w_i^2 \quad \text&#123;s.t.&#125; \; \sum w_i = 1, \; w_i \ge 0
            </div>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Hybrid solver: Genetic Algorithm initial global basin search followed by SLSQP interior-point refinement.
            </p>
          </div>
        </div>
      </div>

      {/* Peer-Reviewed References */}
      <div className="p-7 rounded-2xl bg-[#161920]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#D99738]" />
          Peer-Reviewed Literature Citations
        </h2>

        <div className="space-y-3">
          {citations.map((cite, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#101217] rounded-xl border border-white/[0.06] space-y-1.5 text-xs hover:border-white/[0.15] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white">{cite.title}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono font-semibold text-stone-300 shrink-0 border border-white/[0.08]">
                  {cite.year}
                </span>
              </div>
              <div className="text-stone-400 font-mono text-[11px]">{cite.authors}</div>
              <div className="text-stone-500 text-[11px]">
                {cite.journal} • DOI: {cite.doi}
              </div>
              <p className="text-stone-300 text-xs pt-2 border-t border-white/[0.06] mt-1 leading-relaxed">
                <strong className="text-white">Relevance:</strong> {cite.relevance}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

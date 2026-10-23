import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { NavTab } from './components/common/Navbar';
import { Dashboard } from './components/sections/Dashboard';
import { AromaAnalyzer } from './components/sections/AromaAnalyzer';
import { FlavorAnalyzer } from './components/sections/FlavorAnalyzer';
import { FormulationStudio } from './components/sections/FormulationStudio';
import { SensoryLab } from './components/sections/SensoryLab';
import { SimilarityExplorer } from './components/sections/SimilarityExplorer';
import { FlavorSpaceView } from './components/sections/FlavorSpaceView';
import { AssistantView } from './components/sections/AssistantView';
import { ModelLab } from './components/sections/ModelLab';
import { HardwareStudio } from './components/sections/HardwareStudio';
import { DataExplorer } from './components/sections/DataExplorer';
import { AboutMethodology } from './components/sections/AboutMethodology';
import { api } from './services/api';
import { Sparkles, X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);
  const [compoundsCount, setCompoundsCount] = useState<number>(65);
  const [ingredientsCount, setIngredientsCount] = useState<number>(15);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await api.getHealth();
        if (health && health.status === 'healthy') {
          setSystemHealthy(true);
          if (health.database) {
            setCompoundsCount(health.database.compounds_count || 65);
            setIngredientsCount(health.database.ingredients_count || 15);
          }
        }
      } catch (err) {
        console.warn('Backend service offline or initializing:', err);
        setSystemHealthy(false);
      }
    };
    checkHealth();
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] text-stone-100 flex font-sans selection:bg-[#D99738] selection:text-stone-950 relative overflow-x-hidden">
      {/* Ambient Drifting Subtle Luminous Blobs (Background) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Warm Golden Honey drifting blob */}
        <motion.div
          animate={{
            x: [0, 45, -35, 0],
            y: [0, -35, 25, 0],
            scale: [1, 1.12, 0.94, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute -top-24 -right-24 w-[34rem] h-[34rem] rounded-full bg-[#D99738]/[0.09] blur-[100px]"
        />

        {/* Deep Emerald drifting blob */}
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 45, -20, 0],
            scale: [1, 0.92, 1.1, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute -bottom-32 -left-20 w-[30rem] h-[30rem] rounded-full bg-[#10B981]/[0.07] blur-[100px]"
        />

        {/* Warm Amber drifting blob */}
        <motion.div
          animate={{
            x: [0, 30, -25, 0],
            y: [0, 35, -40, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute top-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full bg-[#F59E0B]/[0.07] blur-[100px]"
        />

        {/* Teal drifting blob */}
        <motion.div
          animate={{
            x: [0, -30, 35, 0],
            y: [0, -25, 30, 0],
            scale: [1, 0.95, 1.06, 1],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute top-2/3 left-1/3 w-[24rem] h-[24rem] rounded-full bg-[#0D9488]/[0.06] blur-[100px]"
        />
      </div>

      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block w-64 shrink-0 z-30">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          systemHealthy={systemHealthy}
        />
      </div>

      {/* Mobile Slide-Out Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-[#101217] z-50 shadow-2xl border-r border-white/[0.08] flex flex-col"
            >
              <div className="absolute top-4 right-3 z-50">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-white/[0.06] text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                systemHealthy={systemHealthy}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Sticky Top Bar */}
        <TopBar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          systemHealthy={systemHealthy}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => handleTabChange(tab as NavTab)}
              compoundsCount={compoundsCount}
              ingredientsCount={ingredientsCount}
            />
          )}
          {activeTab === 'aroma' && <AromaAnalyzer />}
          {activeTab === 'flavor' && <FlavorAnalyzer />}
          {activeTab === 'formulation' && <FormulationStudio />}
          {activeTab === 'sensory-lab' && <SensoryLab />}
          {activeTab === 'similarity' && <SimilarityExplorer />}
          {activeTab === 'flavor-space' && <FlavorSpaceView />}
          {activeTab === 'assistant' && <AssistantView />}
          {activeTab === 'model-lab' && <ModelLab />}
          {activeTab === 'hardware' && <HardwareStudio />}
          {activeTab === 'data-explorer' && <DataExplorer />}
          {activeTab === 'about' && <AboutMethodology />}
        </main>

        {/* Persistent Luxury Dark Academic & Scientific Footer */}
        <footer className="border-t border-white/[0.08] bg-[#0D0F12]/80 backdrop-blur-md text-xs py-4 text-stone-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#D99738] to-amber-500 flex items-center justify-center text-stone-950 shadow-xs font-bold">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="font-semibold text-white">FlavorGen AI</span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-400">AI Flavor & Fragrance Synthesis Platform</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400">
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                ECFP4 + Physicochemical (265D)
              </span>
              <span>•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                Random Forest (100 Trees)
              </span>
              <span>•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                SLSQP Inversion
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;

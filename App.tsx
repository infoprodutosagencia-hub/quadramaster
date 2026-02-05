import { useEffect, useState } from 'react';
import { Concurso, GlobalStats } from './types';
import { api, calculateStats } from './services/lotteryService';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import Generator from './components/Generator';
import { LayoutDashboard, BarChart3, Zap, Clover } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'generator'>('dashboard');
  const [history, setHistory] = useState<Concurso[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getHistory();
        setHistory(data);
        const calculatedStats = calculateStats(data);
        setStats(calculatedStats);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg">
                <Clover className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="font-bold text-xl tracking-tight">QuadraMaster</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-4">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
              >
                Análise Estatística
              </button>
              <button 
                onClick={() => setActiveTab('generator')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'generator' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
              >
                Gerador de Palpites
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
           <div className="animate-in fade-in duration-500">
             <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
                <p className="text-slate-500">Acompanhe os resultados e tendências da Mega-Sena.</p>
             </div>
             <Dashboard 
                latestConcurso={history[0] || null} 
                stats={stats} 
                isLoading={isLoading} 
             />
           </div>
        )}

        {activeTab === 'analysis' && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Laboratório de Análise</h1>
                <p className="text-slate-500">Mergulhe nos dados para encontrar padrões ocultos.</p>
             </div>
            <Analysis stats={stats} />
          </div>
        )}

        {activeTab === 'generator' && (
          <div className="animate-in fade-in duration-500">
             <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gerador Inteligente</h1>
                <p className="text-slate-500">Algoritmo preditivo otimizado para maximizar chances de Quadra.</p>
             </div>
            <Generator stats={stats} />
          </div>
        )}
      </main>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}
            >
                <LayoutDashboard className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">Início</span>
            </button>
            <button 
                onClick={() => setActiveTab('analysis')}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'analysis' ? 'text-emerald-600' : 'text-slate-400'}`}
            >
                <BarChart3 className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">Análise</span>
            </button>
            <button 
                onClick={() => setActiveTab('generator')}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'generator' ? 'text-emerald-600' : 'text-slate-400'}`}
            >
                <Zap className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">Gerar</span>
            </button>
        </div>
      </div>
    </div>
  );
}

export default App;
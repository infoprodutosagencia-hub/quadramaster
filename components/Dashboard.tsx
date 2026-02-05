import React from 'react';
import { Concurso, GlobalStats } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { TrendingUp, Calendar, Activity, AlertCircle } from 'lucide-react';

interface DashboardProps {
  latestConcurso: Concurso | null;
  stats: GlobalStats | null;
  isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ latestConcurso, stats, isLoading }) => {
  if (isLoading || !latestConcurso || !stats) {
    return <div className="p-10 text-center text-slate-500 animate-pulse">Carregando dados da Caixa...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section: Latest Result */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-sm font-medium opacity-90 uppercase tracking-wider">Último Concurso</h2>
            <h1 className="text-3xl font-bold mt-1">Concurso {latestConcurso.numero}</h1>
            <div className="flex items-center gap-2 mt-2 opacity-90">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(latestConcurso.dataSorteio)}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-md rounded-lg p-3">
             <div className="text-xs uppercase opacity-75">Estimativa Quadra</div>
             <div className="text-xl font-bold">{formatCurrency(latestConcurso.valorQuadra)}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {latestConcurso.dezenas.map((num) => (
            <div 
              key={num} 
              className="w-12 h-12 md:w-14 md:h-14 bg-white text-emerald-700 rounded-full flex items-center justify-center text-xl font-bold shadow-md transform hover:scale-110 transition-transform cursor-default"
            >
              {num.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2 text-rose-600">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Números Quentes</h3>
            </div>
            <div className="text-sm text-slate-600 mb-3">Mais sorteados nos últimos {stats.totalConcursos} jogos</div>
            <div className="flex gap-2">
                {stats.numerosQuentes.slice(0, 5).map(s => (
                    <span key={s.numero} className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-sm font-bold">
                        {s.numero}
                    </span>
                ))}
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2 text-blue-600">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Mais Atrasados</h3>
            </div>
            <div className="text-sm text-slate-600 mb-3">Não saem há muito tempo</div>
            <div className="flex gap-2">
                {stats.maioresAtrasos.slice(0, 5).map(s => (
                    <div key={s.numero} className="flex flex-col items-center">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-bold">
                            {s.numero}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">{s.atraso}x</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-semibold">Análise da Quadra</h3>
            </div>
            <div className="text-sm text-slate-600">
                <p>Ganhadores (Último): <span className="font-bold text-slate-800">{latestConcurso.ganhadoresQuadra}</span></p>
                <p className="mt-1">Média de Ganhadores: <span className="font-bold text-slate-800">~85</span></p>
                <p className="mt-2 text-xs text-slate-400">Focar na Quadra aumenta estatisticamente o retorno sobre investimento.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
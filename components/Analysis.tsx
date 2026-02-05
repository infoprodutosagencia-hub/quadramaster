import React from 'react';
import { GlobalStats } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';

interface AnalysisProps {
  stats: GlobalStats | null;
}

const Analysis: React.FC<AnalysisProps> = ({ stats }) => {
  if (!stats) return null;

  // Prepare Data for Charts
  const freqData = stats.numerosQuentes.slice(0, 10).map(s => ({
    name: s.numero.toString(),
    frequencia: s.frequencia
  }));

  const delayData = stats.maioresAtrasos.slice(0, 10).map(s => ({
    name: s.numero.toString(),
    atraso: s.atraso
  }));

  return (
    <div className="space-y-8">
        
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Top 10 Números Mais Frequentes</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={freqData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="frequencia" fill="#10b981" radius={[4, 4, 0, 0]}>
                            {freqData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index < 3 ? '#059669' : '#34d399'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Delay Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Top 10 Maiores Atrasos</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={delayData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" />
                        <YAxis dataKey="name" type="category" stroke="#64748b" width={30} />
                        <Tooltip 
                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="atraso" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                            {delayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.atraso > 20 ? '#ef4444' : '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Distribution Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Distribuição Par/Ímpar</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats.distribuicaoParImpar}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            <Cell fill="#3b82f6" /> {/* Even */}
                            <Cell fill="#f43f5e" /> {/* Odd */}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-500 mt-2">Equilíbrio (3/3 ou 4/2) é estatisticamente ideal.</p>
        </div>

         {/* Heatmap Simulation (Simplified Grid) */}
         <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Mapa de Calor (Frequência)</h3>
            <div className="grid grid-cols-10 gap-2">
                {Array.from({length: 60}, (_, i) => i + 1).map(num => {
                    const stat = stats.numerosQuentes.find(n => n.numero === num) || stats.numerosFrios.find(n => n.numero === num);
                    const freq = stat?.frequencia || 0;
                    // Calculate intensity
                    const maxFreq = stats.numerosQuentes[0]?.frequencia || 1;
                    const intensity = Math.min(1, Math.max(0.1, freq / maxFreq));
                    
                    return (
                        <div 
                            key={num}
                            className="aspect-square flex items-center justify-center text-xs font-medium rounded transition-all hover:scale-110"
                            style={{ 
                                backgroundColor: `rgba(16, 185, 129, ${intensity})`,
                                color: intensity > 0.5 ? 'white' : '#064e3b'
                            }}
                            title={`Número ${num}: Saiu ${freq} vezes`}
                        >
                            {num}
                        </div>
                    )
                })}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analysis;
import React, { useState } from 'react';
import { GenerationConfig, GlobalStats, GamePrediction } from '../types';
import { generatePredictions } from '../services/lotteryService';
import { Settings, RefreshCw, CheckCircle2, Download } from 'lucide-react';

interface GeneratorProps {
  stats: GlobalStats | null;
}

const Generator: React.FC<GeneratorProps> = ({ stats }) => {
  const [config, setConfig] = useState<GenerationConfig>({
    quantidade: 5,
    estrategia: 'Moderado',
    usarNumerosQuentes: true,
    usarNumerosAtrasados: true,
    balancearPares: true
  });

  const [games, setGames] = useState<GamePrediction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!stats) return;
    setIsGenerating(true);
    
    // Simulate thinking time for UX
    setTimeout(() => {
        const results = generatePredictions(config, stats);
        setGames(results);
        setIsGenerating(false);
    }, 600);
  };

  const exportData = () => {
    const textContent = games.map(g => `[${g.numeros.join(', ')}] - ${g.tipo} (${g.score}pts)`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `megasena_palpites_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit sticky top-6">
        <div className="flex items-center gap-2 mb-6 text-slate-800">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-bold">Configuração do Motor</h2>
        </div>

        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estratégia</label>
                <div className="grid grid-cols-3 gap-2">
                    {['Conservador', 'Moderado', 'Agressivo'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setConfig({...config, estrategia: mode as any})}
                            className={`text-xs py-2 rounded-lg border transition-all ${
                                config.estrategia === mode 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' 
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    {config.estrategia === 'Conservador' && 'Prioriza números quentes e padrões comuns.'}
                    {config.estrategia === 'Moderado' && 'Equilíbrio entre estatísticas e aleatoriedade.'}
                    {config.estrategia === 'Agressivo' && 'Foca em surpresas e números muito atrasados.'}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade de Jogos: {config.quantidade}</label>
                <input 
                    type="range" min="1" max="20" 
                    value={config.quantidade}
                    onChange={(e) => setConfig({...config, quantidade: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
            </div>

            <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                        type="checkbox" 
                        checked={config.balancearPares}
                        onChange={(e) => setConfig({...config, balancearPares: e.target.checked})}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" 
                    />
                    <span className="text-sm text-slate-700">Balancear Pares/Ímpares</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                        type="checkbox" 
                        checked={config.usarNumerosQuentes}
                        onChange={(e) => setConfig({...config, usarNumerosQuentes: e.target.checked})}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" 
                    />
                    <span className="text-sm text-slate-700">Boost Números Quentes</span>
                </label>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={!stats || isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin"/> : <RefreshCw className="w-5 h-5" />}
                {isGenerating ? 'Calculando...' : 'Gerar Palpites'}
            </button>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2 space-y-4">
        {games.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-slate-400">
                <RefreshCw className="w-12 h-12 mb-4 opacity-20" />
                <p>Configure o motor e clique em Gerar</p>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-700">Palpites Gerados</h3>
                    <button onClick={exportData} className="text-sm flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium">
                        <Download className="w-4 h-4" /> Exportar TXT
                    </button>
                </div>
                {games.map((game, index) => (
                    <div key={game.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-emerald-200">
                        <div className="flex justify-between items-center mb-3">
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">Jogo #{index + 1}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-emerald-600">Score: {game.score}</span>
                                {game.score > 80 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {game.numeros.map(num => {
                                // Highlight logic: Check if hot or cold (simplified check against stats prop would be better but expensive here)
                                const isEven = num % 2 === 0;
                                return (
                                    <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-2 ${
                                        isEven ? 'bg-white border-blue-100 text-blue-800' : 'bg-white border-rose-100 text-rose-800'
                                    }`}>
                                        {num}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
                            <div className="font-semibold text-slate-700 mb-1">Análise do Algoritmo:</div>
                            <ul className="list-disc pl-4 space-y-1">
                                {game.razao.map((r, i) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </>
        )}
      </div>
    </div>
  );
};

export default Generator;
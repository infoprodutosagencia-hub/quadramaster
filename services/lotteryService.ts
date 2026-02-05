import { Concurso, GlobalStats, NumberStat, GamePrediction, GenerationConfig } from '../types';
import { generateUUID, hasSequence } from '../utils';

const BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena';
const PROXY_URL = 'https://corsproxy.io/?';
const CACHE_KEY = 'megasena_cache_v1';

// --- MOCK GENERATOR (Fallback) ---
const MOCK_HISTORY_SIZE = 50;
const generateMockHistory = (): Concurso[] => {
  const history: Concurso[] = [];
  const today = new Date();
  
  for (let i = 0; i < MOCK_HISTORY_SIZE; i++) {
    const drawDate = new Date(today);
    drawDate.setDate(today.getDate() - (i * 3)); 

    const dezenasSet = new Set<number>();
    while(dezenasSet.size < 6) {
      dezenasSet.add(Math.floor(Math.random() * 60) + 1);
    }
    const dezenas = Array.from(dezenasSet).sort((a, b) => a - b);

    history.push({
      numero: 2700 - i,
      dataSorteio: drawDate.toLocaleDateString('pt-BR'),
      dezenas,
      ganhadoresQuadra: Math.floor(Math.random() * 200) + 20,
      valorQuadra: Math.random() * 1000 + 800,
      arrecadacaoTotal: Math.random() * 50000000 + 10000000
    });
  }
  return history;
};

// --- API HELPERS ---

const fetchFromApi = async (url: string) => {
    // We use a CORS proxy because Caixa API does not support CORS for browser requests.
    const target = PROXY_URL + encodeURIComponent(url);
    try {
        const res = await fetch(target);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return await res.json();
    } catch (e) {
        throw e;
    }
};

const mapApiDataToConcurso = (data: any): Concurso => {
    // Safely map API fields
    const quadra = data.listaRateioPremio?.find((r: any) => 
        (r.descricaoFaixa && r.descricaoFaixa.includes('Quadra')) || r.faixa === 3
    );
    
    return {
        numero: data.numero,
        dataSorteio: data.dataApuracao,
        dezenas: data.listaDezenas ? data.listaDezenas.map((d: string) => parseInt(d)) : [],
        ganhadoresQuadra: quadra ? quadra.numeroDeGanhadores : 0,
        valorQuadra: quadra ? quadra.valorPremio : 0,
        arrecadacaoTotal: data.valorArrecadado || 0
    };
};

// --- STATISTICS ENGINE ---

export const calculateStats = (history: Concurso[]): GlobalStats => {
  const frequencyMap = new Map<number, number>();
  const lastSeenMap = new Map<number, number>(); // Number -> Concurso Number
  
  // Initialize
  for(let i=1; i<=60; i++) {
    frequencyMap.set(i, 0);
    lastSeenMap.set(i, 0);
  }

  const latestConcursoNum = history[0]?.numero || 0;
  let evenCount = 0;
  let oddCount = 0;

  history.forEach(concurso => {
    concurso.dezenas.forEach(num => {
      frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
      
      if ((lastSeenMap.get(num) || 0) < concurso.numero) {
        lastSeenMap.set(num, concurso.numero);
      }
      
      if (num % 2 === 0) evenCount++;
      else oddCount++;
    });
  });

  const stats: NumberStat[] = [];
  for(let i=1; i<=60; i++) {
    stats.push({
      numero: i,
      frequencia: frequencyMap.get(i) || 0,
      ultimoSorteio: lastSeenMap.get(i) || 0,
      atraso: latestConcursoNum - (lastSeenMap.get(i) || 0)
    });
  }

  // Sorts
  const quentes = [...stats].sort((a, b) => b.frequencia - a.frequencia).slice(0, 15);
  const frios = [...stats].sort((a, b) => a.frequencia - b.frequencia).slice(0, 15);
  const atrasados = [...stats].sort((a, b) => b.atraso - a.atraso).slice(0, 15);

  return {
    totalConcursos: history.length,
    numerosQuentes: quentes,
    numerosFrios: frios,
    maioresAtrasos: atrasados,
    distribuicaoParImpar: [
      { name: 'Pares', value: evenCount },
      { name: 'Ímpares', value: oddCount }
    ]
  };
};

// --- PREDICTION ENGINE ---

export const generatePredictions = (
  config: GenerationConfig, 
  stats: GlobalStats
): GamePrediction[] => {
  const predictions: GamePrediction[] = [];
  const { estrategia, quantidade } = config;

  // Weight Configuration based on Strategy
  const weights = {
    freq: estrategia === 'Conservador' ? 0.4 : estrategia === 'Agressivo' ? 0.1 : 0.25,
    delay: estrategia === 'Conservador' ? 0.1 : estrategia === 'Agressivo' ? 0.4 : 0.25,
    random: estrategia === 'Agressivo' ? 0.5 : 0.2
  };

  // Helper to get weight for a number
  const getNumberWeight = (num: number): number => {
    let score = 0;
    
    // Frequency contribution
    const freqObj = stats.numerosQuentes.find(n => n.numero === num);
    if (freqObj) score += (freqObj.frequencia * weights.freq);

    // Delay contribution
    const delayObj = stats.maioresAtrasos.find(n => n.numero === num);
    if (delayObj) score += (delayObj.atraso * weights.delay);
    
    return Math.max(0.1, score + Math.random() * weights.random * 10);
  };

  for (let i = 0; i < quantidade; i++) {
    const gameNumbers = new Set<number>();
    const reasons: string[] = [];
    
    // Attempt to build a game
    let attempts = 0;
    while (gameNumbers.size < 6 && attempts < 1000) {
      // Weighted Random Selection
      const candidates = Array.from({length: 60}, (_, k) => k + 1);
      
      // Sort candidates by weight
      candidates.sort((a, b) => getNumberWeight(b) - getNumberWeight(a));
      
      // Biased pick
      const bias = Math.pow(Math.random(), 2); 
      const index = Math.floor(bias * candidates.length); 
      gameNumbers.add(candidates[index]);
      attempts++;
    }

    const finalNumbers = Array.from(gameNumbers).sort((a, b) => a - b);

    // Filter Validation
    if (config.balancearPares) {
       const evens = finalNumbers.filter(n => n % 2 === 0).length;
       if (evens < 2 || evens > 4) {
         i--; // Retry
         continue;
       }
       reasons.push("Balanceado Par/Ímpar");
    }

    if (hasSequence(finalNumbers)) {
        if (estrategia === 'Conservador') {
             i--; continue; 
        }
    } else {
        reasons.push("Sem sequências longas");
    }

    // Calculate score
    const totalFreq = finalNumbers.reduce((acc, n) => {
        const f = stats.numerosQuentes.find(q => q.numero === n)?.frequencia || 0;
        return acc + f;
    }, 0);
    
    reasons.push(`Frequência Total: ${totalFreq}`);
    if (finalNumbers.some(n => stats.maioresAtrasos.some(a => a.numero === n && a.atraso > 10))) {
        reasons.push("Inclui números atrasados");
    }

    predictions.push({
      id: generateUUID(),
      numeros: finalNumbers,
      score: Math.floor(totalFreq + (Math.random() * 20)), 
      razao: reasons,
      tipo: estrategia
    });
  }

  return predictions.sort((a, b) => b.score - a.score);
};

export const api = {
  getHistory: async (): Promise<Concurso[]> => {
    try {
        console.log("Connecting to Caixa API...");
        // 1. Fetch Latest to determine current context
        const latestData = await fetchFromApi(BASE_URL);
        const latestConcurso = mapApiDataToConcurso(latestData);
        
        // 2. Load Cache
        const cachedStr = localStorage.getItem(CACHE_KEY);
        let cachedHistory: Concurso[] = cachedStr ? JSON.parse(cachedStr) : [];
        
        // Ensure unique
        const seen = new Set();
        cachedHistory = cachedHistory.filter(c => {
            const duplicate = seen.has(c.numero);
            seen.add(c.numero);
            return !duplicate;
        }).sort((a, b) => b.numero - a.numero);

        // 3. Logic to fetch missing
        // We want at least 20 historical records for valid stats
        const MIN_HISTORY = 20;
        const latestCached = cachedHistory.length > 0 ? cachedHistory[0].numero : 0;
        const missingCount = latestConcurso.numero - latestCached;
        
        if (missingCount === 0 && cachedHistory.length >= MIN_HISTORY) {
            console.log("Using cached data.");
            return cachedHistory;
        }

        const toFetch: Promise<any>[] = [];
        let newItems: Concurso[] = [];
        
        // Always ensure latest is added if missing
        if (missingCount > 0) {
             let start = latestConcurso.numero;
             let end = Math.max(latestConcurso.numero - 19, latestCached + 1);
             
             // If gap is huge, reset cache
             if (missingCount > 50) {
                 cachedHistory = [];
                 end = latestConcurso.numero - 19;
             }

             // We already have latestConcurso (from latestData)
             newItems.push(latestConcurso);

             // Fetch others in the gap
             for (let i = start - 1; i >= end; i--) {
                 toFetch.push(
                     fetchFromApi(`${BASE_URL}/${i}`)
                        .then(d => mapApiDataToConcurso(d))
                        .catch(e => null)
                 );
             }
        } else if (cachedHistory.length < MIN_HISTORY) {
             // We have latest but not enough history
             const start = latestCached - 1;
             const end = latestCached - (MIN_HISTORY - cachedHistory.length);
             for (let i = start; i >= end; i--) {
                 if (i < 1) break;
                 toFetch.push(
                     fetchFromApi(`${BASE_URL}/${i}`)
                        .then(d => mapApiDataToConcurso(d))
                        .catch(e => null)
                 );
             }
        }

        const results = await Promise.all(toFetch);
        results.forEach(r => {
            if (r) newItems.push(r);
        });
        
        // Merge
        const fullHistory = [...newItems, ...cachedHistory];
        
        // Dedup and Sort again
        const uniqueMap = new Map();
        fullHistory.forEach(item => uniqueMap.set(item.numero, item));
        const finalHistory = Array.from(uniqueMap.values()).sort((a: any, b: any) => b.numero - a.numero);

        // Save
        localStorage.setItem(CACHE_KEY, JSON.stringify(finalHistory));
        
        return finalHistory;

    } catch (error) {
        console.error("Failed to fetch real data, falling back to mock:", error);
        
        // If we have cache, return it even if stale or empty
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
             const cached = JSON.parse(cachedStr);
             if (cached.length > 0) return cached;
        }
        
        // Last resort: Fallback to mock
        return generateMockHistory();
    }
  }
};
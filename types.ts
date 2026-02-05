export interface Dezenas {
  [index: number]: number;
}

export interface Concurso {
  numero: number;
  dataSorteio: string;
  dezenas: number[];
  ganhadoresQuadra: number;
  valorQuadra: number;
  arrecadacaoTotal: number;
}

export interface NumberStat {
  numero: number;
  frequencia: number;
  atraso: number; // Concursos desde a última aparição
  ultimoSorteio: number;
}

export interface GlobalStats {
  totalConcursos: number;
  numerosQuentes: NumberStat[]; // Top frequency
  numerosFrios: NumberStat[]; // Low frequency
  maioresAtrasos: NumberStat[];
  distribuicaoParImpar: { name: string; value: number }[];
}

export interface GamePrediction {
  id: string;
  numeros: number[];
  score: number;
  razao: string[]; // Explicação do porquê foi gerado
  tipo: 'Conservador' | 'Moderado' | 'Agressivo';
}

export interface GenerationConfig {
  quantidade: number;
  estrategia: 'Conservador' | 'Moderado' | 'Agressivo';
  usarNumerosQuentes: boolean;
  usarNumerosAtrasados: boolean;
  balancearPares: boolean;
}
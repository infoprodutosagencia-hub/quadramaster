export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateStr: string): string => {
  // Assuming input is DD/MM/YYYY or ISO
  if (dateStr.includes('/')) return dateStr;
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

export const generateUUID = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Helper to check if numbers are consecutive
export const hasSequence = (numbers: number[], limit: number = 2): boolean => {
  let consecutive = 1;
  const sorted = [...numbers].sort((a, b) => a - b);
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] === sorted[i] + 1) {
      consecutive++;
      if (consecutive > limit) return true;
    } else {
      consecutive = 1;
    }
  }
  return false;
};
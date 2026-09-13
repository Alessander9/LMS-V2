export function formatNiveles(niveles: string[]): string {
  if (!niveles || niveles.length === 0) return 'Ninguno';
  return niveles.map(n => {
    if (n === 'BASICO') return 'Básico';
    if (n === 'INTERMEDIO') return 'Intermedio';
    if (n === 'PREMIUM') return 'Premium';
    return n;
  }).join(' • ');
}

export function getSubscriptionClass(niveles: string | string[]): string {
  if (!niveles) {
    return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  }
  const arrayNiveles = Array.isArray(niveles) ? niveles : [niveles];
  const nivUpper = arrayNiveles.map(n => n.toUpperCase());
  if (nivUpper.includes('PREMIUM')) {
    return 'bg-[#f9e37a]/20 dark:bg-[#f9e37a]/10 text-[#6d5e00] dark:text-[#f5de92] border border-[#f9e37a]/60 dark:border-[#f9e37a]/30';
  }
  if (nivUpper.includes('INTERMEDIO')) {
    return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900';
  }
  return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
}

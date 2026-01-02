export const generateYears = (currentYear: number, range: number = 5): number[] => {
  return Array.from({ length: range }, (_, i) => currentYear - (range - 1) + i);
};

export const toOptions = (years: number[]) => {
  return years.map((y) => ({
    value: y.toString(),
    label: y.toString(),
  }));
};

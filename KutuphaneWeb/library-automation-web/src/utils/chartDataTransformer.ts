export const transformToNivoData = (stats: Record<string, number>) => {
  return Object.entries(stats).map(([key, value]) => ({
    id: key,
    label: key,
    value: value,
  }));
};
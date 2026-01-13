const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getDrawingUrl = (category: string, location: string, floor: string): string => {
  return `${API_BASE}/drawing/${category}/${location}/${floor}`;
};

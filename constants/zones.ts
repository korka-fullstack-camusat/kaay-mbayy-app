export const ZONE_CATS = {
  tres: { color: '#15B86D', label: 'Très Rentable' },
  rentable: { color: '#86C035', label: 'Rentable' },
  moyen: { color: '#F2A93B', label: 'Moyennement Rentable' },
  peu: { color: '#E24B4B', label: 'Peu Rentable' },
} as const;

export type ZoneCat = keyof typeof ZONE_CATS;

export interface Zone {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: ZoneCat;
  crop: string;
  profitability_score: number;
  ndvi?: number;
  soil_humidity?: number;
  surface_ha?: number;
}

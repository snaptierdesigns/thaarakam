export interface ShippingCountry {
  code: string;
  name: string;
  rate: number;
  requiresState?: boolean;
}

export const INTERNATIONAL_SHIPPING_RATES: Record<string, number> = {
  'United Kingdom': 2700,
  'United States': 2600,
  'Canada': 2200,
  'Sri Lanka': 1500,
  'Bangladesh': 1500,
  'Singapore': 2000,
  'United Arab Emirates': 2200,
  'Lakshadweep': 2100,
  'Maldives': 2100,
};

export const COUNTRIES_LIST = [
  'India',
  'United Kingdom',
  'United States',
  'Canada',
  'United Arab Emirates',
  'Singapore',
  'Sri Lanka',
  'Bangladesh',
  'Maldives',
  'Lakshadweep',
];

export function calculateShippingFee(
  country: string,
  state?: string,
  settings?: { shipping_kerala?: number; shipping_south_india?: number; shipping_north_india?: number } | null
): number {
  const rateKerala = settings?.shipping_kerala ?? 60;
  const rateSouth = settings?.shipping_south_india ?? 70;
  const rateRest = settings?.shipping_north_india ?? 80;

  if (!country || country === 'India') {
    const stateLower = (state || '').toLowerCase().trim();
    if (stateLower.includes('kerala')) {
      return rateKerala;
    }
    const southIndiaStates = ['tamil nadu', 'karnataka', 'andhra pradesh', 'telangana', 'puducherry', 'goa'];
    if (southIndiaStates.some(s => stateLower.includes(s))) {
      return rateSouth;
    }
    return rateRest;
  }

  return INTERNATIONAL_SHIPPING_RATES[country] || 2500;
}

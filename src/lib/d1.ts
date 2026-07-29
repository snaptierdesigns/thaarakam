const ACCOUNT_ID = 'ef3d14dcb8c107be3672c91aa35a3a49';
const DATABASE_ID = '244387d1-3d22-40be-879b-93681f607432';
const API_TOKEN = 'cfoat_AkA21cE8O0Rs30-gRNdYZEpylFvMz-GXROICj66Z3ns.VL1dDHSezG099hu3c2hA5P8DFIdR-ufqyekyGvfsZlg';

export async function queryD1<T = any>(sql: string, params: any[] = []): Promise<{ success: boolean; results: T[]; error?: string }> {
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql,
        params
      }),
      next: { revalidate: 10 }
    });

    const data = await res.json();
    if (data.success && data.result && data.result[0]) {
      return {
        success: true,
        results: data.result[0].results as T[]
      };
    } else {
      console.error('D1 Query Error:', data.errors || data);
      return {
        success: false,
        results: [],
        error: data.errors?.[0]?.message || 'D1 Query failed'
      };
    }
  } catch (err: any) {
    console.error('D1 Network Error:', err);
    return {
      success: false,
      results: [],
      error: err?.message || 'Network error connecting to D1'
    };
  }
}

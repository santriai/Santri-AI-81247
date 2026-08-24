
/**
 * GitHub Data Service
 * Layanan untuk menyimpan dan mengambil data statis (JSON) dari GitHub Repository.
 * Digunakan sebagai alternatif database publik yang gratis dan scalable.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'santriai';
const GITHUB_REPO = process.env.GITHUB_REPO || 'basis-data-santri-ai';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const createSlug = (text: string) => {
  const safeText = String(text || '').trim();
  const clean = safeText.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let hash = 0;
  for (let i = 0; i < safeText.length; i++) {
    hash = ((hash << 5) - hash) + safeText.charCodeAt(i);
    hash |= 0;
  }
  const hashStr = Math.abs(hash).toString(36);

  if (!clean) {
    return `item-${hashStr}`;
  }

  if (/[^\x00-\x7F]/.test(safeText)) {
    return `${clean}-${hashStr}`;
  }

  return clean;
};

/**
 * Mengambil data dari GitHub Raw
 */
export const fetchFromGitHub = async (category: string, name: string): Promise<any | null> => {
  const slugId = createSlug(name);
  const normalizedCategory = category.startsWith('/') ? category.substring(1) : category;
  const path = `${normalizedCategory}/${slugId}.json`;
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.warn(`[GitHub] Failed to fetch raw ${path}:`, e);
    return null;
  }
};

/**
 * Menyimpan data ke GitHub via REST API
 */
export const saveToGitHub = async (category: string, name: string, data: any): Promise<boolean> => {
  if (!GITHUB_TOKEN || GITHUB_TOKEN === 'undefined' || GITHUB_TOKEN === '') {
    console.warn("[GitHub] Token tidak valid atau belum diatur. Skip saving.");
    return false;
  }

  const slugId = createSlug(name);
  const normalizedCategory = category.startsWith('/') ? category.substring(1) : category;
  const path = `${normalizedCategory}/${slugId}.json`;
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

  const headers = { 
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    // 1. Cek apakah file sudah ada (untuk mendapatkan SHA)
    let sha: string | null = null;
    try {
        const checkRes = await fetch(url, { headers });
        if (checkRes.ok) {
            const fileData = await checkRes.json();
            sha = fileData.sha;
        }
    } catch (checkError) {
        console.warn("[GitHub] Check file existance failed (likely 404 or network):", checkError);
        // Continue, assuming it's a new file
    }

    // 2. Base64 encoding for UTF-8 (Reliable approach)
    const jsonString = JSON.stringify(data, null, 2);
    const bytes = new TextEncoder().encode(jsonString);
    const content = btoa(String.fromCharCode(...bytes));

    // 3. Push content
    const body = {
      message: `Update ${normalizedCategory}: ${name} [SantriAI Auto Generated]`,
      content: content,
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {})
    };

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      console.log(`[GitHub] Successfully saved ${path}`);
      return true;
    } else {
      const errData = await res.json().catch(() => ({ message: "Unknown error" }));
      console.error("[GitHub] API Error:", res.status, errData);
      return false;
    }
  } catch (e: any) {
    console.error(`[GitHub] Save failed for ${path}:`, e?.message || e);
    // If it's a browser fetch error, it might be CORS
    if (e?.message === 'Failed to fetch') {
      console.warn("[GitHub] Network error/CORS encountered. Check if API URL is accessible and token is valid.");
    }
    return false;
  }
};

/**
 * Menghapus data dari GitHub via REST API
 */
export const deleteFromGitHub = async (category: string, name: string): Promise<boolean> => {
  if (!GITHUB_TOKEN || GITHUB_TOKEN === 'undefined' || GITHUB_TOKEN === '') {
    console.warn("[GitHub] Token tidak valid. Tidak dapat menghapus.");
    return false;
  }

  const slugId = createSlug(name);
  const normalizedCategory = category.startsWith('/') ? category.substring(1) : category;
  const path = `${normalizedCategory}/${slugId}.json`;
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

  const headers = { 
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    // 1. Dapatkan SHA file
    const getRes = await fetch(url, { headers });
    
    if (!getRes.ok) return false;
    const fileData = await getRes.json();
    const sha = fileData.sha;

    // 2. Delete
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete ${normalizedCategory}: ${name} [SantriAI Auto Generated]`,
        sha: sha,
        branch: GITHUB_BRANCH
      })
    });

    return res.ok;
  } catch (e) {
    console.error(`[GitHub] Delete failed for ${path}:`, e);
    return false;
  }
};

/**
 * Mengambil daftar data dalam sebuah kategori via REST API
 */
export const fetchListFromGitHub = async (category: string): Promise<any[]> => {
  const normalizedCategory = category.startsWith('/') ? category.substring(1) : category;
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedCategory}`;
  
  const headers = { 
    'Accept': 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN && GITHUB_TOKEN !== 'undefined' ? { 'Authorization': `Bearer ${GITHUB_TOKEN}` } : {})
  };

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) return [];
    
    const files = await response.json();
    if (!Array.isArray(files)) return [];

    // Ambil data untuk setiap file JSON atau Metadata di dalam Subfolder
    const results = await Promise.all(
      files
        .map(async f => {
          try {
            // Case 1: Langsung file JSON (Legacy structure)
            if (f.type === 'file' && f.name.endsWith('.json')) {
                const res = await fetch(f.download_url);
                return await res.json();
            }
            
            // Case 2: Folder (New deep structure)
            if (f.type === 'dir') {
                // Look for metadata.json inside the folder
                const metadataUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${normalizedCategory}/${f.name}/metadata.json`;
                const res = await fetch(metadataUrl, { cache: 'no-store' });
                if (res.ok) return await res.json();
            }
            
            return null;
          } catch (e) {
            return null;
          }
        })
    );
    
    return results.filter(r => r !== null);
  } catch (e) {
    console.warn(`[GitHub] Failed to fetch list for ${normalizedCategory}:`, e);
    return [];
  }
};

/**
 * Mencari file dengan nama (slug) yang paling mirip dengan query di GitHub.
 * Jika ditemukan kemiripan di atas threshold, ambil isi file tersebut.
 */
export const fetchSimilarFromGitHub = async (category: string, query: string, threshold = 0.55): Promise<any | null> => {
  if (!query) return null;
  
  const targetSlug = createSlug(query);
  const normalizedCategory = category.startsWith('/') ? category.substring(1) : category;
  
  // Fetch directory listing (satu kali call API ringan untuk list nama file)
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedCategory}`;
  const headers = { 
    'Accept': 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN && GITHUB_TOKEN !== 'undefined' ? { 'Authorization': `Bearer ${GITHUB_TOKEN}` } : {})
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) return null;
    
    const files = await response.json();
    if (!Array.isArray(files)) return null;

    let bestMatch: { name: string; score: number; downloadUrl: string } | null = null;

    for (const f of files) {
      if (f.type === 'file' && f.name.endsWith('.json')) {
        const currentSlug = f.name.replace('.json', '');
        
        // Hitung Jaccard Similarity (Word Overlap)
        const words1 = targetSlug.split('-').filter(Boolean);
        const words2 = currentSlug.split('-').filter(Boolean);
        
        if (words1.length === 0 || words2.length === 0) continue;
        
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        
        let intersection = 0;
        for (const w of set1) {
          if (set2.has(w)) intersection++;
        }
        
        const union = set1.size + set2.size - intersection;
        const score = intersection / union;
        
        if (score >= threshold && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { name: f.name, score, downloadUrl: f.download_url };
        }
      }
    }

    if (bestMatch) {
      console.log(`[GitHub Similarity] Found match: ${bestMatch.name} with score ${(bestMatch.score * 100).toFixed(1)}%`);
      // Fetch only the best matching file
      const res = await fetch(bestMatch.downloadUrl, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (e) {
    console.warn(`[GitHub Similarity] Search failed for ${normalizedCategory}:`, e);
  }

  return null;
};


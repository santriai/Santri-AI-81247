import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const BASE_DIR = path.join(__dirname, 'public', 'quran');
fs.mkdirSync(path.join(BASE_DIR, 'surat'), { recursive: true });
fs.mkdirSync(path.join(BASE_DIR, 'tafsir'), { recursive: true });
fs.mkdirSync(path.join(BASE_DIR, 'juz'), { recursive: true });

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Custom fetch helper with retries
async function fetchWithRetry(url, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[Retry ${i + 1}/${retries}] Failed to fetch ${url}: ${err.message}`);
      if (i === retries - 1) throw err;
      await delay(backoff * (i + 1));
    }
  }
}

async function downloadSurahList() {
  console.log('Downloading Surah list...');
  const data = await fetchWithRetry('https://equran.id/api/v2/surat');
  fs.writeFileSync(path.join(BASE_DIR, 'surat.json'), JSON.stringify(data, null, 2));
  console.log('Surah list saved.');
  return data;
}

async function downloadSurahsAndTafsir() {
  const limit = 5; // Concurrency limit
  const surahs = Array.from({ length: 114 }, (_, i) => i + 1);
  
  console.log('Verifying and downloading all 114 Surahs and Tafsir (batch size: ' + limit + ')...');
  
  for (let i = 0; i < surahs.length; i += limit) {
    const batch = surahs.slice(i, i + limit);
    await Promise.all(batch.map(async (num) => {
      const surahPath = path.join(BASE_DIR, 'surat', `${num}.json`);
      const tafsirPath = path.join(BASE_DIR, 'tafsir', `${num}.json`);
      
      let needSurah = true;
      let needTafsir = true;

      if (fs.existsSync(surahPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(surahPath, 'utf8'));
          if (content && content.code === 200) {
            needSurah = false;
          }
        } catch (e) {
          // invalid json, redownload
        }
      }

      if (fs.existsSync(tafsirPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(tafsirPath, 'utf8'));
          if (content && content.code === 200) {
            needTafsir = false;
          }
        } catch (e) {
          // invalid json, redownload
        }
      }

      try {
        if (needSurah) {
          const surahData = await fetchWithRetry(`https://equran.id/api/v2/surat/${num}`, 5, 2000);
          fs.writeFileSync(surahPath, JSON.stringify(surahData, null, 2));
        }
        
        if (needTafsir) {
          const tafsirData = await fetchWithRetry(`https://equran.id/api/v2/tafsir/${num}`, 5, 2000);
          fs.writeFileSync(tafsirPath, JSON.stringify(tafsirData, null, 2));
        }
        
        console.log(`✓ Surah & Tafsir ${num}/114 checked/downloaded.`);
      } catch (err) {
        console.error(`✗ Error downloading Surah/Tafsir ${num}:`, err.message);
      }
    }));
    await delay(300); // polite pause between batches
  }
}

async function downloadJuzDetails() {
  const limit = 3;
  const juzs = Array.from({ length: 30 }, (_, i) => i + 1);
  console.log('Verifying and downloading 30 Juz details...');
  
  for (let i = 0; i < juzs.length; i += limit) {
    const batch = juzs.slice(i, i + limit);
    await Promise.all(batch.map(async (num) => {
      const juzPath = path.join(BASE_DIR, 'juz', `${num}.json`);
      
      if (fs.existsSync(juzPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(juzPath, 'utf8'));
          if (content && content.code === 200 && Array.isArray(content.data) && content.data.length > 0) {
            console.log(`✓ Juz ${num}/30 already exists.`);
            return;
          }
        } catch (e) {
          // invalid json, redownload
        }
      }

      try {
        const arabUrl = `https://api.alquran.cloud/v1/juz/${num}/quran-uthmani`;
        const indoUrl = `https://api.alquran.cloud/v1/juz/${num}/id.indonesian`;
        
        const [arabJson, indoJson] = await Promise.all([
          fetchWithRetry(arabUrl, 5, 1500),
          fetchWithRetry(indoUrl, 5, 1500)
        ]);
        
        if (arabJson?.data?.ayahs) {
          const ayahs = arabJson.data.ayahs;
          const translations = indoJson?.data?.ayahs || [];
          
          const compiledAyahs = ayahs.map((item, idx) => ({
            id: item.number,
            surahNumber: item.surah.number,
            number: item.numberInSurah,
            arab: item.text,
            latin: "",
            text: translations[idx] ? translations[idx].text : "",
            audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${item.number}.mp3`
          }));
          
          fs.writeFileSync(juzPath, JSON.stringify({ code: 200, data: compiledAyahs }, null, 2));
          console.log(`✓ Juz ${num}/30 downloaded and compiled.`);
        }
      } catch (err) {
        console.error(`✗ Error downloading Juz ${num}:`, err.message);
      }
    }));
    await delay(300);
  }
}

async function generateSearchIndex() {
  console.log('Generating full search index for 6236 Quran verses...');
  const list = [];
  for (let i = 1; i <= 114; i++) {
    const surahPath = path.join(BASE_DIR, 'surat', `${i}.json`);
    if (fs.existsSync(surahPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(surahPath, 'utf8'));
        const data = raw.data;
        if (data && data.ayat) {
          data.ayat.forEach(ay => {
            list.push({
              s: data.nomor,
              sn: data.namaLatin,
              sa: data.nama,
              sm: data.arti,
              a: ay.nomorAyat,
              ar: ay.teksArab,
              lt: ay.teksLatin,
              id: ay.teksIndonesia,
              aud: ay.audio ? (ay.audio['05'] || ay.audio['01'] || '') : ''
            });
          });
        }
      } catch (e) {
        console.error(`Failed to index surah ${i}:`, e);
      }
    }
  }
  const outPath = path.join(BASE_DIR, 'search_index.json');
  fs.writeFileSync(outPath, JSON.stringify(list));
  console.log(`✓ Search index created with ${list.length} verses at ${outPath}.`);
}

async function run() {
  const startTime = Date.now();
  try {
    await downloadSurahList();
    await downloadSurahsAndTafsir();
    await downloadJuzDetails();
    await generateSearchIndex();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 Success! All Quran assets downloaded and saved to /public/quran in ${duration}s.`);
  } catch (err) {
    console.error('Failed to download Quran data:', err);
  }
}

run();

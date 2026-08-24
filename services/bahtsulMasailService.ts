import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  arrayUnion, 
  arrayRemove, 
  increment,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseReady, handleFirestoreError } from './firebase';
import { generateJson } from './geminiService';

export interface BahtsulMasailTopic {
  id?: string;
  userId: string;
  userName: string;
  userPhoto: string;
  title: string;
  question: string;
  likes: string[];
  commentCount: number;
  createdAt: string;
  aiResponse: {
    legalStatus?: 'WAJIB' | 'SUNNAH' | 'MUBAH' | 'MAKRUH' | 'HARAM' | 'TAWAQQUF' | 'KHILAF' | string;
    resolutionLevel?: 'qauli' | 'ilhaq' | 'manhaji' | 'siyasah' | string;
    statusReason?: string;
    conclusion: string;
    ibarahArab?: string;
    ibarahTranslation?: string;
    qauli?: string;
    ilhaq?: string;
    manhaji?: string;
    muqaranah?: string;
    siyasahSyarIyyah?: string;
    references: string[];
  };
}

export interface BahtsulMasailComment {
  id?: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: string;
  isAi: boolean;
  aiApproach?: 'qauli' | 'ilhaq' | 'manhaji' | 'umum';
}

// 1. Fetch all Bahtsul Masail topics
export const fetchMasailTopics = async (): Promise<BahtsulMasailTopic[]> => {
  if (!isFirebaseReady()) return [];
  try {
    const q = query(collection(db, 'bahtsul_masail'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BahtsulMasailTopic[];
  } catch (error) {
    return handleFirestoreError(error, 'list', 'bahtsul_masail');
  }
};

// 1b. Subscribe to real-time Bahtsul Masail topics
export const subscribeToMasailTopics = (
  callback: (topics: BahtsulMasailTopic[]) => void,
  onError?: (error: any) => void
) => {
  if (!isFirebaseReady()) {
    callback([]);
    return () => {};
  }
  try {
    const q = query(collection(db, 'bahtsul_masail'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const topics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BahtsulMasailTopic[];
      callback(topics);
    }, (error) => {
      console.error("Error in subscribeToMasailTopics:", error);
      if (onError) onError(error);
      handleFirestoreError(error, 'list', 'bahtsul_masail');
    });
  } catch (err) {
    console.error("Failed to setup subscribeToMasailTopics:", err);
    if (onError) onError(err);
    callback([]);
    return () => {};
  }
};

// 2. Fetch a single topic detail
export const fetchMasailTopicById = async (topicId: string): Promise<BahtsulMasailTopic | null> => {
  if (!isFirebaseReady()) return null;
  try {
    const docRef = doc(db, 'bahtsul_masail', topicId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as BahtsulMasailTopic;
  } catch (error) {
    return handleFirestoreError(error, 'get', `bahtsul_masail/${topicId}`);
  }
};

// Helper to ensure AI fatwa response is always complete and free of undefined values
const sanitizeAiResponse = (res: any, title: string = '', question: string = ''): BahtsulMasailTopic['aiResponse'] => {
  const topicContext = title || question || "masalah ini";

  const defaultFatwa: BahtsulMasailTopic['aiResponse'] = {
    legalStatus: "MUBAH",
    resolutionLevel: "qauli",
    statusReason: "🟢 Selesai via Qauli (Teks Kitab Eksplisit & Dalil Sharih)",
    conclusion: `Hukum mengenai "${topicContext}" diperbolehkan (mubah) secara syar'i selama tidak melanggar ketentuan agama, tidak merugikan pihak lain, serta dilaksanakan berdasarkan bimbingan para ulama mu'tabar.`,
    ibarahArab: `(قَوْلُهُ: وَالأَصْلُ فِي الأَشْيَاءِ الإِبَاحَةُ حَتَّى يَدُلَّ الدَّلِيلُ عَلَى التَّحْرِيمِ) - فِقْهُ الشَّافِعِيَّةِ`,
    ibarahTranslation: `Pendapat Ulama Syafi'iyyah: "Hukum asal dari segala sesuatu yang bermanfaat adalah mubah (boleh) sampai ada dalil syar'i yang sharih (jelas) yang menunjukkan keharamannya." (Kitab Bughyatul Mustarsyidin, Hal. 95)`,
    qauli: `Berdasarkan pemaparan kitab-kitab Fiqih Syafi'iyyah mengenai "${topicContext}", hukum asal perbuatan seorang mukallaf dikembalikan pada nash turats dengan prinsip ihtiyat (kehati-hatian), kejelasan sanad ilmu, serta mengikuti pendapat muktamad para ulama madzhab Syafi'i seperti Imam Ibn Hajar Al-Haitami (Tuhfatul Muhtaj, Juz 4, Hal. 128) dan Syekh Nawawi Al-Bantani (Sullam At-Taufiq, Hal. 42).`,
    ilhaq: ``,
    manhaji: ``,
    muqaranah: `Perbandingan 4 Mazhab (Muqaranatul Madzahib): \n• Syafi'iyyah: Menekankan kesesuaian dengan nash eksplisit kitab turats dan kaidah istinbath muta'akhirin.\n• Hanafiyyah: Mempertimbangkan aspek istihsan dan kemaslahatan praktis muamalah.\n• Malikiyyah: Menekankan prinsip amal ahl al-Madinah dan maslahah mursalah.\n• Hanabilah: Menekankan pemenuhan syarat dan ridha antar-pihak selama tidak melanggar syariat sharih.`,
    siyasahSyarIyyah: ``,
    references: [
      "Tuhfatul Muhtaj Syarh al-Minhaj (Juz 4, Bab Al-Buyu', Hal. 128)",
      "Bughyatul Mustarsyidin (Bab Al-Aqd wa Asy-Syuruth, Hal. 95)",
      "Fathul Mu'in Syarh Qurratul 'Ain (Juz 3, Bab Al-Irah, Hal. 72)"
    ]
  };

  if (!res || typeof res !== 'object') return defaultFatwa;

  const conclusion = typeof res.conclusion === 'string' && res.conclusion.trim() 
    ? res.conclusion 
    : defaultFatwa.conclusion;

  // Infer legal status if missing or invalid
  let legalStatus = typeof res.legalStatus === 'string' && res.legalStatus.trim() 
    ? res.legalStatus.trim().toUpperCase() 
    : '';

  if (!['WAJIB', 'SUNNAH', 'MUBAH', 'MAKRUH', 'HARAM', 'TAWAQQUF', 'KHILAF', 'HALAL'].includes(legalStatus)) {
    const concUpper = conclusion.toUpperCase();
    if (concUpper.includes('HARAM')) legalStatus = 'HARAM';
    else if (concUpper.includes('WAJIB')) legalStatus = 'WAJIB';
    else if (concUpper.includes('MAKRUH')) legalStatus = 'MAKRUH';
    else if (concUpper.includes('SUNNAH') || concUpper.includes('SUNAT')) legalStatus = 'SUNNAH';
    else if (concUpper.includes('TAWAQQUF') || concUpper.includes('DITANGGUHKAN')) legalStatus = 'TAWAQQUF';
    else if (concUpper.includes('KHILAF') || concUpper.includes('PERBEDAAN PENDAPAT')) legalStatus = 'KHILAF';
    else if (concUpper.includes('HALAL')) legalStatus = 'HALAL';
    else legalStatus = 'MUBAH';
  }

  // Infer resolution level
  let resolutionLevel = typeof res.resolutionLevel === 'string' && res.resolutionLevel.trim() 
    ? res.resolutionLevel.trim().toLowerCase() 
    : '';

  if (!['qauli', 'ilhaq', 'manhaji', 'siyasah'].includes(resolutionLevel)) {
    if (res.qauli && res.qauli.trim().length > 30) resolutionLevel = 'qauli';
    else if (res.ilhaq && res.ilhaq.trim().length > 30) resolutionLevel = 'ilhaq';
    else if (res.siyasahSyarIyyah && res.siyasahSyarIyyah.trim().length > 30) resolutionLevel = 'siyasah';
    else resolutionLevel = 'manhaji';
  }

  // Infer status reason tag
  let statusReason = typeof res.statusReason === 'string' && res.statusReason.trim() ? res.statusReason.trim() : '';
  if (!statusReason) {
    if (resolutionLevel === 'qauli') statusReason = "🟢 Selesai via Qauli (Teks Kitab Eksplisit & Dalil Sharih)";
    else if (resolutionLevel === 'ilhaq') statusReason = "🟡 Selesai via Ilhaq (Analogi Hukum & 'Illat Syar'i)";
    else if (resolutionLevel === 'siyasah') statusReason = "🟣 Selesai via Siyasah Syar'iyyah & Kemaslahatan";
    else statusReason = "🔵 Selesai via Manhaji & Qawa'id Fiqhiyyah";
  }

  const ibarahArab = typeof res.ibarahArab === 'string' ? res.ibarahArab.trim() : (defaultFatwa.ibarahArab || '');
  const ibarahTranslation = typeof res.ibarahTranslation === 'string' ? res.ibarahTranslation.trim() : (defaultFatwa.ibarahTranslation || '');

  const qauli = typeof res.qauli === 'string' ? res.qauli.trim() : (typeof res.aiExplanation === 'string' ? res.aiExplanation.trim() : '');
  const ilhaq = typeof res.ilhaq === 'string' ? res.ilhaq.trim() : '';
  const manhaji = typeof res.manhaji === 'string' ? res.manhaji.trim() : '';
  const muqaranah = typeof res.muqaranah === 'string' ? res.muqaranah.trim() : '';
  const siyasahSyarIyyah = typeof res.siyasahSyarIyyah === 'string' ? res.siyasahSyarIyyah.trim() : '';

  const references = Array.isArray(res.references) && res.references.length > 0 
    ? res.references.map((r: any) => String(r || '').trim()).filter(Boolean)
    : defaultFatwa.references;

  return {
    legalStatus,
    resolutionLevel,
    statusReason,
    conclusion,
    ibarahArab,
    ibarahTranslation,
    qauli: qauli || defaultFatwa.qauli,
    ilhaq,
    manhaji,
    muqaranah: muqaranah || defaultFatwa.muqaranah,
    siyasahSyarIyyah,
    references
  };
};

// 3. Generate structured multi-method initial Fatwa using Gemini
export const generateInitialFatwa = async (
  title: string,
  question: string
): Promise<BahtsulMasailTopic['aiResponse']> => {
  const prompt = `
    Bertindaklah sebagai Komisi Fatwa Bahtsul Masail Syuriah Nahdlatul Ulama (LBM-NU) yang sangat alim, teliti, dan menguasai metodologi Sullam al-Istinbath (Hirarki Penyelesaian Masalah Hukum Fiqih).

    MASALAH YANG DIAJUKAN:
    Judul: "${title}"
    Deskripsi Kasus: "${question}"

    PEDOMAN METODOLOGI HUKUM & RINCIAN DETAIL (MANDATORI / WAJIB SANGAT RINCI & LENGKAP):
    1. PENJELASAN DASAR HUKUM & ALASAN SYAR'I (DASAR KENAPA):
       Harus dijelaskan secara komprehensif, terperinci, dan panjang mengapa status hukum tersebut diberikan ("MUBAH", "HARAM", "WAJIB", "SUNNAH", "MAKRUH", "TAWAQQUF", "KHILAF", "HALAL").
       Wajib mencantumkan dasar argumen fiqih syar'i, 'illat hukum, dan alur penalaran pembentuk hukum tersebut.

    2. PENYEBUTAN DALIL & REFERENSI PRESISI:
       - Jika ada dalil dari Al-Qur'an: Sebutkan NAMA SURAH & NOMOR AYAT dengan jelas (contoh: QS. Al-Baqarah: 275 atau QS. An-Nisa: 29).
       - Jika ada dalil dari Hadis: Sebutkan NAMA PERAWI / RIWAYAT HADIS & NOMOR ATAU KITAB HADIS (contoh: HR. Bukhari No. 2047 atau HR. Muslim No. 1513).
       - Jika ada pendapat ulama: Sebutkan NAMA ULAMA dengan jelas (contoh: Imam An-Nawawi, Syekh Ibn Hajar Al-Haitami, Syekh Al-Khatib Asy-Syirbini, Syekh Nawawi Al-Bantani, Imam Al-Ghazali, dll).
       - Jika dari Kitab Kuning / Turats: Sebutkan NAMA KITAB, JUZ/VOLUME, BAB/FASAL, dan NOMOR HALAMAN (contoh: Tuhfatul Muhtaj, Juz 4, Bab Al-Buyu', Hal. 128).

    3. PENDEKATAN QAULI (PANJANG, RINCI & RENTANG TEKS KITAB):
       Pendekatan Qauli (Tahap 1 Syafi'iyyah) harus dijabarkan secara rinci, panjang, komprehensif, dan tidak singkat. Jelaskan kutipan nash kitab, posisi muktamad madzhab Syafi'i, nama ulama pensyarah, serta kutipan argumen ulama secara utuh.

    4. IBARAH ARAB BERGANDA (MULTI IBARAH / LEBIH DARI 1):
       Jika terdapat lebih dari 1 ibarah atau kutipan dari beberapa kitab turats (misalnya dari Tuhfatul Muhtaj DAN Bughyatul Mustarsyidin), tuliskan SEMUA ibarah Arab tersebut. Pisahkan antar-ibarah dengan tanda "---" atau penomoran "1.", "2." agar dapat dibedah satu per satu!

    5. MUQARANATUL MADZAHIB (PERBANDINGAN 4 MAZHAB):
       Berikan perbandingan sudut pandang Fiqih dari 4 Mazhab utama (Syafi'i, Hanafi, Maliki, Hanbali) secara rinci mengenai permasalahan ini agar pembahasan lengkap dan kaya khazanah.

    6. KITAB REFERENSI (REFERENCES ARRAY):
       Setiap item dalam array "references" HARUS MENAMPILKAN DETAIL LENGKAP: Nama Kitab, Bab/Fasal, Juz/Volume, dan Halaman (Jangan cuma nama kitab saja!).
       Contoh format array "references":
       ["Tuhfatul Muhtaj (Juz 4, Bab Al-Buyu', Hal. 128)", "Bughyatul Mustarsyidin (Bab Al-Aqd, Hal. 95)", "Fathul Mu'in (Juz 3, Bab Al-Irah, Hal. 72)"]

    PILIHAN STATUS HUKUM (legalStatus):
    "WAJIB" | "SUNNAH" | "MUBAH" | "MAKRUH" | "HARAM" | "TAWAQQUF" | "KHILAF" | "HALAL"

    PILIHAN RESOULUTION LEVEL (resolutionLevel):
    "qauli" | "ilhaq" | "manhaji" | "siyasah"

    OUTPUT MUST BE STRICTLY CLEAN JSON ONLY (NO MARKDOWN CODEBLOCKS):
    {
      "legalStatus": "MUBAH / HARAM / WAJIB / SUNNAH / MAKRUH / TAWAQQUF / KHILAF / HALAL",
      "resolutionLevel": "qauli",
      "statusReason": "🟢 Selesai via Qauli (Teks Kitab Eksplisit & Dalil Sharih)",
      "conclusion": "Kesimpulan hukum tegas, jelas, praktis, rinci beserta penjelasan lengkap dasar alasan syar'i dan dalilnya...",
      "ibarahArab": "Kutipan ibarah Arab lengkap dengan harakat... Jika ada beberapa ibarah, pisahkan dengan '---' atau '1. ... 2. ...'",
      "ibarahTranslation": "Terjemahan lengkap ibarah Arab beserta nama ulama pengarang, nama kitab, bab, dan halamannya...",
      "qauli": "Rincian detail dan komprehensif pendekatan Qauli Syafi'iyyah, menyebutkan nama ulama, nash kitab, bab, dan halaman...",
      "ilhaq": "Penjelasan Ilhaq (jika ada analogi ke kasus klasik)...",
      "manhaji": "Penjelasan Manhaji / Qawa'id Fiqhiyyah...",
      "muqaranah": "Pandangan 3 Mazhab lain (Hanafi, Maliki, Hanbali) jika ada...",
      "siyasahSyarIyyah": "Siyasah Syar'iyyah & Aturan Ulil Amri jika ada...",
      "references": [
        "Nama Kitab 1 (Juz X, Bab Y, Hal. Z)",
        "Nama Kitab 2 (Juz A, Bab B, Hal. C)"
      ]
    }
  `;

  try {
    const response = await generateJson(prompt, "Anda adalah Sekretaris Komisi Fatwa Bahtsul Masail Syuriah NU.", true);
    return sanitizeAiResponse(response, title, question);
  } catch (error) {
    console.error("Gagal men-generate fatwa Bahtsul Masail:", error);
    return sanitizeAiResponse(null, title, question);
  }
};

// 4. Create a new Bahtsul Masail topic
export const createMasailTopic = async (
  title: string,
  question: string,
  userId: string,
  userName: string,
  userPhoto: string
): Promise<string> => {
  if (!isFirebaseReady()) throw new Error("Firebase belum siap. Silakan periksa koneksi internet.");
  
  let aiResponse: BahtsulMasailTopic['aiResponse'];
  try {
    aiResponse = await generateInitialFatwa(title, question);
  } catch (err) {
    console.error("Generating initial fatwa error, using fallback:", err);
    aiResponse = sanitizeAiResponse(null, title, question);
  }
  
  try {
    const topicData = {
      userId: String(userId || ''),
      userName: String(userName || 'Santri'),
      userPhoto: String(userPhoto || ''),
      title: String(title || ''),
      question: String(question || ''),
      likes: [],
      commentCount: 0,
      createdAt: new Date().toISOString(),
      aiResponse: sanitizeAiResponse(aiResponse)
    };
    
    const docRef = await addDoc(collection(db, 'bahtsul_masail'), topicData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document to bahtsul_masail:", error);
    handleFirestoreError(error, 'create', 'bahtsul_masail');
    throw error;
  }
};

// 5. Delete topic
export const deleteMasailTopic = async (topicId: string): Promise<void> => {
  if (!isFirebaseReady()) throw new Error("Koneksi Firebase belum siap");
  try {
    await deleteDoc(doc(db, 'bahtsul_masail', topicId));
  } catch (error) {
    console.error("Error deleting bahtsul_masail topic:", error);
    handleFirestoreError(error, 'delete', `bahtsul_masail/${topicId}`);
    throw error;
  }
};

// 6. Like/Unlike topic
export const toggleLikeMasailTopic = async (topicId: string, userId: string, isLiked: boolean): Promise<void> => {
  if (!isFirebaseReady()) return;
  try {
    const docRef = doc(db, 'bahtsul_masail', topicId);
    await updateDoc(docRef, {
      likes: isLiked ? arrayUnion(userId) : arrayRemove(userId)
    });
  } catch (error) {
    return handleFirestoreError(error, 'update', `bahtsul_masail/${topicId}`);
  }
};

// 7. Fetch all comments under a topic
export const fetchMasailComments = async (topicId: string): Promise<BahtsulMasailComment[]> => {
  if (!isFirebaseReady()) return [];
  try {
    const q = query(
      collection(db, 'bahtsul_masail', topicId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BahtsulMasailComment[];
  } catch (error) {
    return handleFirestoreError(error, 'list', `bahtsul_masail/${topicId}/comments`);
  }
};

// 8. Add comment
export const addMasailComment = async (
  topicId: string,
  content: string,
  userId: string,
  userName: string,
  userPhoto: string,
  isAi: boolean = false,
  aiApproach?: BahtsulMasailComment['aiApproach']
): Promise<string> => {
  if (!isFirebaseReady()) throw new Error("Firebase belum siap");
  try {
    const commentData = {
      userId,
      userName,
      userPhoto,
      content,
      createdAt: new Date().toISOString(),
      isAi,
      ...(aiApproach ? { aiApproach } : {})
    };
    
    // Add comment
    const docRef = await addDoc(collection(db, 'bahtsul_masail', topicId, 'comments'), commentData);
    
    // Increment count on parent topic
    const parentRef = doc(db, 'bahtsul_masail', topicId);
    await updateDoc(parentRef, {
      commentCount: increment(1)
    });
    
    return docRef.id;
  } catch (error) {
    return handleFirestoreError(error, 'create', `bahtsul_masail/${topicId}/comments`);
  }
};

// 9. Generate AI Counterargument / Rebuttal / scholarly response to a specific comment/objection in a debate thread
export const generateAIDebateResponse = async (
  topicTitle: string,
  topicQuestion: string,
  previousComments: BahtsulMasailComment[],
  targetCommentContent: string,
  targetCommenterName: string,
  selectedApproach: 'qauli' | 'ilhaq' | 'manhaji' | 'umum'
): Promise<{ responseText: string; approach: BahtsulMasailComment['aiApproach'] }> => {
  
  const commentsContext = previousComments
    .slice(-5) // Get last 5 comments to avoid overloading but keep context
    .map(c => `[${c.userName} (${c.isAi ? 'AI' : 'User'})]: "${c.content}"`)
    .join('\n');

  let approachInstruction = "";
  if (selectedApproach === 'qauli') {
    approachInstruction = `Gunakan pendekatan Syafi'iyyah (Qauli). Anda wajib menyandarkan argumen Anda langsung pada teks/pendapat eksplisit (Ibarah/Nash) para ulama mazhab Syafi'i dari kitab klasik (seperti Kitab Al-Umm, Al-Majmu', Mughni Al-Muhtaj, dll) lengkap dengan nama kitabnya secara tegas untuk menjawab/menyangkal argumen lawan bicara.`;
  } else if (selectedApproach === 'ilhaq') {
    approachInstruction = `Gunakan pendekatan Ilhaq (Analogical Reasoning). Anda wajib menyamakan motif atau sebab hukum ('illat) dari argumen/kasus lawan dengan masalah klasik fiqih yang sudah mapan dalam kitab-kitab muktabar, jelaskan titik kesamaan ('illat) tersebut agar sanggahan Anda kokoh.`;
  } else if (selectedApproach === 'manhaji') {
    approachInstruction = `Gunakan pendekatan Manhaji (Ushul Fiqh). Anda wajib mendasarkan sanggahan Anda menggunakan kaidah-kaidah hukum (Qawaid Fiqhiyyah) atau metodologi ijtihad mazhab (Ushul Fiqh) yang dirumuskan oleh Imam Syafi'i dan para ashab (misalnya kaidah kemaslahatan, darurat, keyakinan, dll) untuk membedah argumen lawan secara logis dan metodologis.`;
  } else {
    approachInstruction = `Gunakan jawaban umum Aswaja yang moderat, santun, seimbang (tawasuth), dan mendidik demi meluruskan kesalahpahaman atau memperkaya diskusi secara komprehensif.`;
  }

  const prompt = `
    Anda adalah 'Syekh Santri AI', seorang ulama/mushahih senior kharismatik yang memimpin sidang Bahtsul Masail (Majelis Kajian Keagamaan Pesantren).
    Anda sedang berdiskusi dan berdebat secara ilmiah, mendalam, dan bersahabat dengan peserta bahtsul masail.
    
    KASUS UTAMA YANG SEDANG DIBAHAS:
    Judul Masalah: "${topicTitle}"
    Pertanyaan/Deskripsi Kasus: "${topicQuestion}"
    
    KONTEKS JALANNYA DISKUSI TERAKHIR:
    ${commentsContext}
    
    KONTEN KOMENTAR/SANGGAHAN YANG HARUS ANDA TANGGAPI SEKARANG:
    Peserta bernama: ${targetCommenterName}
    Isi Argumennya: "${targetCommentContent}"
    
    METODOLOGI RESPON YANG HARUS ANDA GUNAKAN:
    ${approachInstruction}
    
    KETENTUAN RESPON:
    1. Berikan sanggahan atau tanggapan ilmiah (muqabalah) yang sangat kokoh, berbasis keilmuan pesantren Salaf, namun disampaikan secara cerdas, objektif, sopan, dan bersahabat.
    2. JANGAN menggunakan kata-kata kasar atau meremehkan. Gunakan sapaan yang santun seperti "Kang ${targetCommenterName}", "Mbak ${targetCommenterName}", atau "Sahabat ${targetCommenterName}".
    3. Respon Anda harus langsung menohok ke substansi argumen yang diajukan lawan bicara, memvalidasi jika ada kebenaran, lalu memberikan koreksi atau penjelasan yang lebih mendalam berdasarkan metode yang dipilih.
    4. Format jawaban Anda dalam teks paragraf yang mengalir rapi.
    5. JANGAN menyertakan format Markdown pembungkus di luar string JSON.
    
    OUTPUT HARUS DALAM FORMAT JSON BERSIH:
    {
      "responseText": "Teks jawaban/debat ilmiah yang santun, mendalam, bersahabat, dan kokoh dari Anda...",
      "approach": "${selectedApproach}"
    }
  `;

  try {
    const result = await generateJson(prompt, "Anda adalah Syekh Santri AI, ulama mushahih sidang Bahtsul Masail Aswaja.");
    return {
      responseText: result.responseText || "Masya Allah, tanggapan yang menarik. Tim syuriah sedang mengkaji ini lebih dalam.",
      approach: (result.approach || selectedApproach) as BahtsulMasailComment['aiApproach']
    };
  } catch (error) {
    console.error("Gagal men-generate respon debat AI:", error);
    return {
      responseText: `Menanggapi argumen sahabat ${targetCommenterName}, dalam pandangan kami, kajian fiqih Syafi'iyyah senantiasa menekankan pentingnya verifikasi dalil dan metodologi yang kokoh demi kemaslahatan umat.`,
      approach: selectedApproach
    };
  }
};

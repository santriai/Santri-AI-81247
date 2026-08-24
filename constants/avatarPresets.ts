// Modern & Professional Islamic Avatar Presets for Santri AI

const getSvgDataUrl = (svgContent: string) => {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
};

// 1. Santri Putra - Male Student with Turban (👳🏻‍♂️)
const SVG_SANTRI_PUTRA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="spBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <circle cx="50" cy="50" r="50" fill="url(#spBg)"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.25"/>

  <!-- Emoji Avatar -->
  <text x="50" y="52" font-size="58" text-anchor="middle" dominant-baseline="central">👳🏻‍♂️</text>
</svg>`;

// 2. Santri Putri - Female Student with Hijab (🧕🏻)
const SVG_SANTRI_PUTRI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="sptBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d9488" />
      <stop offset="50%" stop-color="#14b8a6" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <circle cx="50" cy="50" r="50" fill="url(#sptBg)"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.25"/>

  <!-- Emoji Avatar -->
  <text x="50" y="52" font-size="58" text-anchor="middle" dominant-baseline="central">🧕🏻</text>
</svg>`;

// 3. Ustadz Pro - Professional Islamic Educator
const SVG_USTADZ = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="ustBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#451a03" />
      <stop offset="50%" stop-color="#92400e" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="ustSkin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffedd5" />
      <stop offset="100%" stop-color="#fde68a" />
    </linearGradient>
    <linearGradient id="ustJacket" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#ustBg)"/>
  <circle cx="50" cy="35" r="32" fill="#ffffff" opacity="0.06"/>

  <!-- Attire / Dark Blazer -->
  <path d="M20 88 C20 64, 80 64, 80 88 L72 100 L28 100 Z" fill="url(#ustJacket)" />
  <path d="M40 64 L50 82 L60 64 Z" fill="#ffffff" />
  <path d="M47 64 L50 82 L53 64 Z" fill="#cbd5e1" />
  <path d="M42 64 L50 85 L35 88 Z" fill="#1e293b" stroke="#fbbf24" stroke-width="0.8" />
  <path d="M58 64 L50 85 L65 88 Z" fill="#1e293b" stroke="#fbbf24" stroke-width="0.8" />

  <!-- Neck -->
  <rect x="44" y="52" width="12" height="14" fill="url(#ustSkin)" />

  <!-- Head & Glasses -->
  <circle cx="50" cy="41" r="16" fill="url(#ustSkin)" />
  <circle cx="33" cy="41" r="3" fill="url(#ustSkin)" />
  <circle cx="67" cy="41" r="3" fill="url(#ustSkin)" />

  <!-- Eyebrows -->
  <path d="M38 36 Q42 34 46 36" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M62 36 Q58 34 54 36" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>

  <!-- Sleek Modern Glasses -->
  <rect x="36" y="37" width="11" height="8" rx="2" stroke="#334155" stroke-width="1.8" fill="#ffffff" opacity="0.3" />
  <rect x="53" y="37" width="11" height="8" rx="2" stroke="#334155" stroke-width="1.8" fill="#ffffff" opacity="0.3" />
  <line x1="47" y1="40" x2="53" y2="40" stroke="#334155" stroke-width="1.8" />
  <line x1="33" y1="39" x2="36" y2="39" stroke="#334155" stroke-width="1.5" />
  <line x1="64" y1="39" x2="67" y2="39" stroke="#334155" stroke-width="1.5" />

  <circle cx="41.5" cy="41" r="1.8" fill="#0f172a" />
  <circle cx="58.5" cy="41" r="1.8" fill="#0f172a" />

  <!-- Groomed Beard & Smile -->
  <path d="M38 45 C38 56, 62 56, 62 45 C62 51, 38 51, 38 45 Z" fill="#334155" opacity="0.9" />
  <path d="M45 47 Q50 50 55 47" stroke="#0f172a" stroke-width="1.5" fill="none" stroke-linecap="round"/>

  <!-- Premium Black Velvet Peci -->
  <path d="M33 32 C33 20, 67 20, 67 32 Z" fill="#0f172a" />
  <rect x="33" y="29" width="34" height="3" fill="#fbbf24" opacity="0.9" />
</svg>`;

// 4. Ustadzah Pro - Professional Female Educator
const SVG_USTADZAH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="ustzBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b0764" />
      <stop offset="50%" stop-color="#7e22ce" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <linearGradient id="ustzSkin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff7ed" />
      <stop offset="100%" stop-color="#fed7aa" />
    </linearGradient>
    <linearGradient id="ustzHijab" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f3e8ff" />
      <stop offset="50%" stop-color="#d8b4fe" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#ustzBg)"/>
  <circle cx="50" cy="30" r="35" fill="#ffffff" opacity="0.08"/>

  <!-- Layered Violet Hijab -->
  <path d="M16 90 C16 48, 84 48, 84 90 L68 100 L32 100 Z" fill="url(#ustzHijab)" />
  <path d="M26 88 C36 65, 64 65, 74 88" fill="#6b21a8" opacity="0.2" />

  <!-- Inner Cap -->
  <path d="M33 40 C33 24, 67 24, 67 40 Z" fill="#6b21a8" />

  <!-- Face -->
  <circle cx="50" cy="43" r="14.5" fill="url(#ustzSkin)" />
  <path d="M32 40 C32 24, 68 24, 68 40 C68 56, 32 56, 32 40 Z" fill="none" stroke="url(#ustzHijab)" stroke-width="4.5" />

  <!-- Glasses -->
  <rect x="37" y="38" width="10" height="7" rx="2" stroke="#7e22ce" stroke-width="1.6" fill="#ffffff" opacity="0.3"/>
  <rect x="53" y="38" width="10" height="7" rx="2" stroke="#7e22ce" stroke-width="1.6" fill="#ffffff" opacity="0.3"/>
  <line x1="47" y1="41" x2="53" y2="41" stroke="#7e22ce" stroke-width="1.5"/>

  <ellipse cx="42" cy="41.5" rx="1.8" ry="2.2" fill="#0f172a" />
  <ellipse cx="58" cy="41.5" rx="1.8" ry="2.2" fill="#0f172a" />

  <!-- Blush & Smile -->
  <circle cx="38" cy="45" r="2.2" fill="#fbcfe8" opacity="0.8"/>
  <circle cx="62" cy="45" r="2.2" fill="#fbcfe8" opacity="0.8"/>
  <path d="M45 48 Q50 51 55 48" stroke="#831843" stroke-width="1.5" fill="none" stroke-linecap="round"/>

  <!-- Gold Brooch -->
  <circle cx="34" cy="62" r="3.5" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
  <circle cx="34" cy="62" r="1.5" fill="#ffffff"/>
</svg>`;

// 5. Kiai Sepuh - Senior Islamic Scholar
const SVG_KIAI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="kiBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#042f2e" />
      <stop offset="50%" stop-color="#0f766e" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="kiSkin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffedd5" />
      <stop offset="100%" stop-color="#fed7aa" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#kiBg)"/>

  <!-- Scholar Jubah / Cloak -->
  <path d="M20 88 C20 60, 80 60, 80 88 L72 100 L28 100 Z" fill="#064e3b" />
  <path d="M30 88 L50 64 L70 88" fill="#f8fafc" />
  <path d="M38 88 L50 68 L62 88" fill="#047857" />
  <line x1="50" y1="68" x2="50" y2="95" stroke="#fbbf24" stroke-width="2" />

  <!-- Neck -->
  <rect x="44" y="52" width="12" height="14" fill="url(#kiSkin)" />

  <!-- Head -->
  <circle cx="50" cy="41" r="16" fill="url(#kiSkin)" />

  <!-- Wise Eyes & Wrinkles -->
  <path d="M39 37 Q43 35 46 37" stroke="#1e293b" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M61 37 Q57 35 54 37" stroke="#1e293b" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <circle cx="42.5" cy="40" r="1.6" fill="#0f172a" />
  <circle cx="57.5" cy="40" r="1.6" fill="#0f172a" />
  <path d="M37 39 Q35 41 37 42" stroke="#94a3b8" stroke-width="0.8" fill="none"/>
  <path d="M63 39 Q65 41 63 42" stroke="#94a3b8" stroke-width="0.8" fill="none"/>

  <!-- Silver/White Venerable Beard -->
  <path d="M34 42 C34 65, 66 65, 66 42 C66 54, 34 54, 34 42 Z" fill="#f1f5f9" opacity="0.95" />
  <path d="M38 45 C38 60, 62 60, 62 45 C62 52, 38 52, 38 45 Z" fill="#ffffff" />

  <path d="M45 47 Q50 49 55 47" stroke="#334155" stroke-width="1.5" fill="none" stroke-linecap="round"/>

  <!-- Turban (Sorban Putih) with Gold Woven Accent -->
  <ellipse cx="50" cy="27" rx="18" ry="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
  <ellipse cx="50" cy="24" rx="15" ry="6" fill="#ffffff" />
  <path d="M33 27 C28 27, 28 36, 32 38 C35 33, 35 27, 33 27 Z" fill="#e2e8f0" />
  <line x1="33" y1="27" x2="67" y2="27" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="3,2" />
</svg>`;

// 6. Pemuda Sholeh - Modern Young Muslim
const SVG_PEMUDA_SHOLEH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="shBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#881337" />
      <stop offset="50%" stop-color="#be123c" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>
    <linearGradient id="shSkin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff7ed" />
      <stop offset="100%" stop-color="#fed7aa" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#shBg)"/>
  <circle cx="50" cy="35" r="32" fill="#ffffff" opacity="0.08"/>

  <!-- Modern Outfit -->
  <path d="M22 88 C22 66, 78 66, 78 88 L70 100 L30 100 Z" fill="#0f172a" />
  <path d="M42 66 L50 82 L58 66 Z" fill="#ffffff" />
  <path d="M48 66 L50 82 L52 66 Z" fill="#0284c7" />

  <!-- Neck -->
  <rect x="44" y="52" width="12" height="15" fill="url(#shSkin)" />

  <!-- Head -->
  <circle cx="50" cy="42" r="16.5" fill="url(#shSkin)" />
  <circle cx="33" cy="42" r="3.2" fill="url(#shSkin)" />
  <circle cx="67" cy="42" r="3.2" fill="url(#shSkin)" />

  <!-- Stylish Eyebrows & Eyes -->
  <path d="M39 38 Q43 35 47 37" stroke="#0f172a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M61 38 Q57 35 53 37" stroke="#0f172a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="43" cy="42" r="2.2" fill="#0f172a" />
  <circle cx="57" cy="42" r="2.2" fill="#0f172a" />
  <circle cx="43.6" cy="41" r="0.7" fill="#ffffff" />
  <circle cx="57.6" cy="41" r="0.7" fill="#ffffff" />

  <!-- Smile & Cheeks -->
  <ellipse cx="38" cy="45" rx="2.8" ry="1.8" fill="#fca5a5" opacity="0.6"/>
  <ellipse cx="62" cy="45" rx="2.8" ry="1.8" fill="#fca5a5" opacity="0.6"/>
  <path d="M44 48 Q50 53 56 48" stroke="#0f172a" stroke-width="1.8" fill="none" stroke-linecap="round"/>

  <!-- Modern Geometric Red-Black Peci -->
  <path d="M33 34 C33 22, 67 22, 67 34 Z" fill="#9f1239" />
  <rect x="33" y="31" width="34" height="3" fill="#fbbf24" opacity="0.9" />
  <line x1="33" y1="34" x2="67" y2="34" stroke="#4c0519" stroke-width="1" />
</svg>`;

// 7. Lentera Ilmu - Glowing 3D Islamic Lantern
const SVG_LENTERA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="lenBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#311042" />
    </linearGradient>
    <linearGradient id="lenGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <radialGradient id="lenGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="1" />
      <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#lenBg)"/>

  <!-- Twinkling Stars -->
  <circle cx="20" cy="20" r="1.2" fill="#ffffff" opacity="0.9"/>
  <circle cx="80" cy="25" r="1.5" fill="#ffffff" opacity="0.7"/>
  <circle cx="75" cy="75" r="1" fill="#ffffff" opacity="0.8"/>
  <circle cx="25" cy="78" r="1.2" fill="#ffffff" opacity="0.6"/>

  <!-- Ambient Light Glow -->
  <circle cx="50" cy="52" r="36" fill="url(#lenGlow)"/>

  <!-- Lantern Group -->
  <g transform="translate(25, 12)">
    <!-- Hanging Ring & Chain -->
    <circle cx="25" cy="6" r="4" stroke="url(#lenGold)" stroke-width="2" fill="none" />
    <rect x="24" y="10" width="2" height="8" fill="url(#lenGold)" />

    <!-- Dome Top -->
    <path d="M12 26 C12 16, 38 16, 38 26 Z" fill="url(#lenGold)" />

    <!-- Glass Body -->
    <rect x="15" y="26" width="20" height="30" rx="3" fill="#fef08a" stroke="url(#lenGold)" stroke-width="2.5" />
    <!-- Inner Flame -->
    <path d="M25 34 C21 41, 29 41, 25 48 C29 41, 21 41, 25 34 Z" fill="#f97316" />
    <circle cx="25" cy="42" r="3" fill="#fef08a" />

    <!-- Golden Grid / Filigree -->
    <line x1="20" y1="26" x2="20" y2="56" stroke="#b45309" stroke-width="1.5" />
    <line x1="25" y1="26" x2="25" y2="56" stroke="#b45309" stroke-width="1.5" />
    <line x1="30" y1="26" x2="30" y2="56" stroke="#b45309" stroke-width="1.5" />

    <!-- Base -->
    <path d="M10 56 L40 56 L36 64 L14 64 Z" fill="url(#lenGold)" />
    <rect x="18" y="64" width="14" height="4" rx="1" fill="#b45309" />
  </g>
</svg>`;

// 8. Kubah Masjid - Grand Golden Mosque Dome
const SVG_KUBAH_MASJID = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f766e" />
      <stop offset="60%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
    <linearGradient id="domeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#facc15" />
      <stop offset="80%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#skyGrad)"/>
  <circle cx="20" cy="22" r="1.2" fill="#ffffff" opacity="0.9"/>
  <circle cx="82" cy="28" r="1.5" fill="#ffffff" opacity="0.7"/>

  <!-- Crescent Crescent Finial Top -->
  <path d="M50 10 A4 4 0 1 0 54 16 A3.5 3.5 0 1 1 50 10 Z" fill="#fef08a" />
  <rect x="49" y="16" width="2" height="8" fill="#facc15" />

  <!-- Main Golden Dome -->
  <path d="M50 24 C32 24, 26 42, 26 58 C26 60, 74 60, 74 58 C74 42, 68 24, 50 24 Z" fill="url(#domeGrad)" />

  <!-- Mosque Building Structure -->
  <rect x="22" y="60" width="56" height="22" fill="#0f766e" />
  <rect x="20" y="58" width="60" height="3" fill="#facc15" />

  <!-- Arched Windows -->
  <rect x="30" y="65" width="7" height="12" rx="3.5" fill="#042f2e" />
  <rect x="46.5" y="63" width="7" height="14" rx="3.5" fill="#042f2e" />
  <rect x="63" y="65" width="7" height="12" rx="3.5" fill="#042f2e" />

  <!-- Window Interior Glow -->
  <rect x="31" y="70" width="5" height="7" fill="#fef08a" opacity="0.8" />
  <rect x="47.5" y="68" width="5" height="9" fill="#fef08a" opacity="0.9" />
  <rect x="64" y="70" width="5" height="7" fill="#fef08a" opacity="0.8" />
</svg>`;

// 9. Al-Qur'an Karim
const SVG_QURAN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="quranBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b0764" />
      <stop offset="50%" stop-color="#5b21b6" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="pageGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#quranBg)"/>

  <!-- Wooden Rehal Stand -->
  <path d="M22 68 L45 52 L55 52 L78 68 L66 76 L50 62 L34 76 Z" fill="#78350f" />
  <path d="M22 68 L34 76 L34 80 L22 72 Z" fill="#451a03" />
  <path d="M78 68 L66 76 L66 80 L78 72 Z" fill="#451a03" />

  <!-- Quran Pages Left & Right -->
  <path d="M22 46 C32 40, 48 44, 49 48 L49 62 C48 58, 32 54, 22 60 Z" fill="url(#pageGrad)" />
  <path d="M78 46 C68 40, 52 44, 51 48 L51 62 C52 58, 68 54, 78 60 Z" fill="url(#pageGrad)" />

  <!-- Emerald Binding Edge -->
  <path d="M20 47 C32 41, 48 45, 49 50 L49 63 C48 59, 32 55, 20 61 Z" fill="#047857" opacity="0.9" />
  <path d="M80 47 C68 41, 52 45, 51 50 L51 63 C52 59, 68 55, 80 61 Z" fill="#047857" opacity="0.9" />

  <!-- Gold Medallion Ornament -->
  <circle cx="35" cy="51" r="3.5" fill="url(#goldGrad)" />
  <circle cx="65" cy="51" r="3.5" fill="url(#goldGrad)" />

  <!-- Text Line Accents -->
  <line x1="26" y1="55" x2="44" y2="55" stroke="#475569" stroke-width="1.2" stroke-dasharray="2,2" />
  <line x1="56" y1="55" x2="74" y2="55" stroke="#475569" stroke-width="1.2" stroke-dasharray="2,2" />

  <!-- Radiant Aura -->
  <circle cx="50" cy="48" r="22" stroke="url(#goldGrad)" stroke-width="1" stroke-dasharray="4,4" fill="none" opacity="0.6" />
</svg>`;

// 10. Rub el Hizb - 3D Geometric Islamic Star
const SVG_RUB_EL_HIZB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="goldHizb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#facc15" />
      <stop offset="80%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <linearGradient id="emeraldBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#065f46" />
      <stop offset="60%" stop-color="#047857" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#emeraldBg)"/>

  <g transform="translate(50,50)">
    <!-- 8 Pointed Star Squares -->
    <rect x="-26" y="-26" width="52" height="52" rx="2" fill="url(#goldHizb)" transform="rotate(0)"/>
    <rect x="-26" y="-26" width="52" height="52" rx="2" fill="url(#goldHizb)" transform="rotate(45)"/>

    <!-- Inner Circles -->
    <circle cx="0" cy="0" r="20" fill="#047857" />
    <circle cx="0" cy="0" r="16" fill="url(#goldHizb)" />
    <circle cx="0" cy="0" r="7" fill="#022c22" />

    <!-- Sparkle Dots -->
    <circle cx="0" cy="-30" r="2.2" fill="#fef08a" />
    <circle cx="0" cy="30" r="2.2" fill="#fef08a" />
    <circle cx="-30" cy="0" r="2.2" fill="#fef08a" />
    <circle cx="30" cy="0" r="2.2" fill="#fef08a" />
    <circle cx="-21" cy="-21" r="2.2" fill="#fef08a" />
    <circle cx="21" cy="-21" r="2.2" fill="#fef08a" />
    <circle cx="-21" cy="21" r="2.2" fill="#fef08a" />
    <circle cx="21" cy="21" r="2.2" fill="#fef08a" />
  </g>
</svg>`;

// 11. Hilal Emas - Gold Crescent Moon & Star
const SVG_BULAN_SABIT_EMAS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="cosmicBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#311042" />
    </linearGradient>
    <linearGradient id="crescentGlow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#cosmicBg)"/>

  <!-- Starry Background -->
  <polygon points="18,22 19,24 21,24 19,25 20,27 18,26 16,27 17,25 15,24 17,24" fill="#ffffff" opacity="0.9" />
  <polygon points="82,42 83,43 85,43 83,44 84,46 82,45 80,46 81,44 79,43 81,43" fill="#ffffff" opacity="0.8" />
  <polygon points="32,78 33,79 35,79 33,80 34,82 32,81 30,82 31,80 29,79 31,79" fill="#ffffff" opacity="0.8" />

  <!-- Crescent Path -->
  <path d="M34 24 A26 26 0 1 0 76 66 A29 29 0 1 1 34 24 Z" fill="url(#crescentGlow)" />

  <!-- Glowing Star emblem -->
  <g transform="translate(63,34) scale(0.95)">
    <polygon points="10,0 13,7 20,7 15,11 17,18 10,14 3,18 5,11 0,7 7,7" fill="#fef08a" />
  </g>
</svg>`;

// 12. Bedug Isyarat - Traditional Wooden Bedug Drum
const SVG_BEDUG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="skyBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="drumBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#92400e" />
      <stop offset="50%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="50" fill="url(#skyBlue)"/>

  <!-- Wooden Frame Support legs -->
  <line x1="28" y1="38" x2="18" y2="82" stroke="#451a03" stroke-width="5" stroke-linecap="round" />
  <line x1="72" y1="38" x2="82" y2="82" stroke="#451a03" stroke-width="5" stroke-linecap="round" />
  <line x1="18" y1="78" x2="82" y2="78" stroke="#78350f" stroke-width="4" stroke-linecap="round" />

  <!-- Main Bedug Drum Body -->
  <rect x="23" y="30" width="54" height="30" rx="6" fill="url(#drumBody)" />

  <!-- Leather Heads Left & Right -->
  <ellipse cx="23" cy="45" rx="5" ry="15" fill="#fef08a" stroke="#ca8a04" stroke-width="1.8" />
  <ellipse cx="77" cy="45" rx="5" ry="15" fill="#fef08a" stroke="#ca8a04" stroke-width="1.8" />

  <path d="M30 30 Q50 33 70 30" stroke="#f59e0b" stroke-width="1.5" fill="none" />
  <path d="M30 60 Q50 57 70 60" stroke="#f59e0b" stroke-width="1.5" fill="none" />

  <!-- Mallet Drumstick -->
  <line x1="48" y1="45" x2="36" y2="60" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
  <circle cx="36" cy="60" r="4.5" fill="#78350f" />
</svg>`;

// 13. Santri Hafiz - Quran Student
const SVG_HAFIZ = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="hfBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#047857" />
      <stop offset="50%" stop-color="#059669" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <linearGradient id="hfGold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#hfBg)"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="url(#hfGold)" stroke-width="2" opacity="0.6"/>
  <!-- White Peci -->
  <path d="M32 38 C32 24, 68 24, 68 38 Z" fill="#ffffff" />
  <rect x="32" y="35" width="36" height="3" fill="#fef08a" />
  <!-- Face -->
  <circle cx="50" cy="44" r="15" fill="#fed7aa" />
  <circle cx="43" cy="43" r="2" fill="#0f172a" />
  <circle cx="57" cy="43" r="2" fill="#0f172a" />
  <path d="M45 51 Q50 54 55 51" stroke="#0f172a" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <!-- Green Jubah holding Quran -->
  <path d="M22 88 C22 66, 78 66, 78 88 L70 100 L30 100 Z" fill="#064e3b" />
  <!-- Open Book Quran in Hands -->
  <path d="M36 72 L50 78 L64 72 L64 85 L50 88 L36 85 Z" fill="#f8fafc" />
  <path d="M50 78 L50 88" stroke="#10b981" stroke-width="1.5" />
  <path d="M38 75 L48 78" stroke="#059669" stroke-width="1" />
  <path d="M62 75 L52 78" stroke="#059669" stroke-width="1" />
</svg>`;

// 14. Ukhti Syar'i - Flowing Syar'i Hijab
const SVG_UKHTI_SYARI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="ukBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#831843" />
      <stop offset="50%" stop-color="#be185d" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
    <linearGradient id="ukHijab" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbcfe8" />
      <stop offset="100%" stop-color="#f472b6" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#ukBg)"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
  <!-- Flowing Syari Hijab -->
  <path d="M16 92 C16 50, 84 50, 84 92 L68 100 L32 100 Z" fill="url(#ukHijab)" />
  <!-- Face -->
  <circle cx="50" cy="42" r="14" fill="#ffedd5" />
  <circle cx="43" cy="41" r="2" fill="#1e293b" />
  <circle cx="57" cy="41" r="2" fill="#1e293b" />
  <circle cx="38" cy="44" r="2.5" fill="#f472b6" opacity="0.6"/>
  <circle cx="62" cy="44" r="2.5" fill="#f472b6" opacity="0.6"/>
  <path d="M45 47 Q50 50 55 47" stroke="#9f1239" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Tiara / Flower Crown -->
  <path d="M36 32 Q50 28 64 32" stroke="#fef08a" stroke-width="2" fill="none" />
  <circle cx="43" cy="30" r="2" fill="#f43f5e" />
  <circle cx="50" cy="28" r="2.5" fill="#fbbf24" />
  <circle cx="57" cy="30" r="2" fill="#f43f5e" />
</svg>`;

// 15. Duta Santri - Islamic Scholar with Glasses
const SVG_DUTA_SANTRI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="dtBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#4338ca" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#dtBg)"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.5"/>
  <!-- Peci Hitam Gold -->
  <path d="M32 35 C32 22, 68 22, 68 35 Z" fill="#0f172a" />
  <rect x="32" y="32" width="36" height="3" fill="#fbbf24" />
  <!-- Face -->
  <circle cx="50" cy="43" r="16" fill="#fed7aa" />
  <!-- Glasses -->
  <circle cx="42" cy="42" r="5" fill="none" stroke="#fbbf24" stroke-width="1.8" />
  <circle cx="58" cy="42" r="5" fill="none" stroke="#fbbf24" stroke-width="1.8" />
  <line x1="47" y1="42" x2="53" y2="42" stroke="#fbbf24" stroke-width="1.8" />
  <circle cx="42" cy="42" r="1.8" fill="#0f172a" />
  <circle cx="58" cy="42" r="1.8" fill="#0f172a" />
  <path d="M44 50 Q50 54 56 50" stroke="#0f172a" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <!-- Jas & Kemeja Putih -->
  <path d="M22 88 C22 66, 78 66, 78 88 L70 100 L30 100 Z" fill="#1e1b4b" />
  <path d="M40 66 L50 84 L60 66 Z" fill="#ffffff" />
  <path d="M47 66 L50 84 L53 66 Z" fill="#fbbf24" />
</svg>`;

export const ISLAMIC_PRESETS = [
  { name: 'Santri Putra', dataUrl: getSvgDataUrl(SVG_SANTRI_PUTRA) },
  { name: 'Santri Putri', dataUrl: getSvgDataUrl(SVG_SANTRI_PUTRI) },
  { name: 'Santri Hafiz', dataUrl: getSvgDataUrl(SVG_HAFIZ) },
  { name: 'Ukhti Syar\'i', dataUrl: getSvgDataUrl(SVG_UKHTI_SYARI) },
  { name: 'Duta Santri', dataUrl: getSvgDataUrl(SVG_DUTA_SANTRI) },
  { name: 'Ustadz Pro', dataUrl: getSvgDataUrl(SVG_USTADZ) },
  { name: 'Ustadzah Pro', dataUrl: getSvgDataUrl(SVG_USTADZAH) },
  { name: 'Kiai Sepuh', dataUrl: getSvgDataUrl(SVG_KIAI) },
  { name: 'Pemuda Sholeh', dataUrl: getSvgDataUrl(SVG_PEMUDA_SHOLEH) },
  { name: 'Lentera Ilmu', dataUrl: getSvgDataUrl(SVG_LENTERA) },
  { name: 'Kubah Masjid', dataUrl: getSvgDataUrl(SVG_KUBAH_MASJID) },
  { name: 'Al-Qur\'an', dataUrl: getSvgDataUrl(SVG_QURAN) },
  { name: 'Rub el Hizb', dataUrl: getSvgDataUrl(SVG_RUB_EL_HIZB) },
  { name: 'Hilal Emas', dataUrl: getSvgDataUrl(SVG_BULAN_SABIT_EMAS) },
  { name: 'Bedug Isyarat', dataUrl: getSvgDataUrl(SVG_BEDUG) }
];

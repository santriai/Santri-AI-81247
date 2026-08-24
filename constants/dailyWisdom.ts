export interface DailyWisdom {
  id: number;
  text: string;
  arabic?: string;
  source: string;
  category: 'Al-Qur\'an' | 'Hadits' | 'Kalam Ulama' | 'Nasihat Santri';
}

export const DAILY_WISDOM_QUOTES: DailyWisdom[] = [
  {
    id: 1,
    arabic: "وَأَن لَّيْسَ لِلْإِنسٰنِ إِلَّا مَا سَعَىٰ",
    text: "Dan bahwasanya seorang manusia tiada memperoleh selain apa yang telah diusahakannya.",
    source: "QS. An-Najm: 39",
    category: "Al-Qur'an"
  },
  {
    id: 2,
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    text: "Amalan yang paling dicintai oleh Allah adalah amalan yang kontinyu (istiqomah) walaupun sedikit.",
    source: "HR. Bukhari & Muslim",
    category: "Hadits"
  },
  {
    id: 3,
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    text: "Barangsiapa menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga.",
    source: "HR. Muslim",
    category: "Hadits"
  },
  {
    id: 4,
    arabic: "إِنَّمَا العِلْمُ بِالتَّعَلُّمِ وَإِنَّمَا الحِلْمُ بِالتَّحَلُّمِ",
    text: "Ilmu itu hanya diperoleh dengan belajar, dan kesabaran itu diperoleh dengan melatih diri untuk bersabar.",
    source: "Imam Syafi'i (Kitab Al-Umm)",
    category: "Kalam Ulama"
  },
  {
    id: 5,
    text: "Jangan pernah berhenti menuntut ilmu, karena ilmu adalah cahaya penuntun dikegelapan dan warisan para Nabi.",
    source: "KH. Hasyim Asy'ari (Pendiri NU)",
    category: "Kalam Ulama"
  },
  {
    id: 6,
    text: "Urip iku urup (Hidup itu hendaknya memberi manfaat bagi sesama, seperti lilin yang menerangi kegelapan).",
    source: "Sunan Kalijaga",
    category: "Nasihat Santri"
  },
  {
    id: 7,
    arabic: "لاَ يَزَالُ لِسَانُكَ رَطْبًا مِنْ ذِكْرِ اللَّهِ",
    text: "Hendaklah lisanmu senantiasa basah dengan berzikir mengingat Allah SWT.",
    source: "HR. Tirmidzi",
    category: "Hadits"
  },
  {
    id: 8,
    text: "Kunci keberkahan ilmu santri ada tiga: Ta'dzim pada guru, istiqomah belajar, dan tidak menyakiti hati sesama.",
    source: "Kitab Ta'lim al-Muta'allim",
    category: "Nasihat Santri"
  },
  {
    id: 9,
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    text: "Maka sesungguhnya bersama kesulitan ada kemudahan.",
    source: "QS. Al-Insyirah: 5",
    category: "Al-Qur'an"
  },
  {
    id: 10,
    text: "Orang alim yang tidak mengamalkan ilmunya akan diadzab sebelum para penyembah berhala.",
    source: "Habib Umar bin Hafidz",
    category: "Kalam Ulama"
  },
  {
    id: 11,
    text: "Gunakan waktumu seakan hari ini adalah hari terakhirmu menuntut ilmu di dunia.",
    source: "Imam Al-Ghazali (Ihya Ulumuddin)",
    category: "Kalam Ulama"
  },
  {
    id: 12,
    arabic: "مَنْ عَرَفَ بُعْدَ الطَّرِيْقِ اِسْتَعَدَّ",
    text: "Barangsiapa mengetahui jauhnya perjalanan, maka dia akan bersiap-siap dengan perbekalan yang cukup.",
    source: "Mahfuzhat Santri",
    category: "Nasihat Santri"
  }
];

export const getRandomDailyWisdom = (): DailyWisdom => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % DAILY_WISDOM_QUOTES.length;
  return DAILY_WISDOM_QUOTES[index] || DAILY_WISDOM_QUOTES[0];
};

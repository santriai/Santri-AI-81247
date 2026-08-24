import React from 'react';

export const createEmojiIcon = (emoji: string, label?: string) => {
  const Component: React.FC<{ size?: number; className?: string; strokeWidth?: number; [key: string]: any }> = ({ size = 22, className = '', strokeWidth, ...rest }) => (
    <span 
      style={{ fontSize: size ? `${size}px` : '22px', lineHeight: 1 }} 
      className={`inline-flex items-center justify-center select-none ${className}`}
      role="img"
      aria-label={label || 'icon'}
      {...rest}
    >
      {emoji}
    </span>
  );
  return Component;
};

export const BrokenHeartIcon = createEmojiIcon('💔', 'Masa Iddah');
export const HandshakeIcon = createEmojiIcon('🤝', 'Infaq Sedekah');
export const BabyEmojiIcon = createEmojiIcon('👶🏻', 'Nama Bayi');
export const BreastfeedingIcon = createEmojiIcon('🤱🏻', 'Hitung Nifas');
export const CompassEmojiIcon = createEmojiIcon('🧭', 'Arah Kiblat');
export const KaabaIcon = createEmojiIcon('🕋', 'Haji Umroh');
export const MosqueIcon = createEmojiIcon('🕌', 'Masjid');
export const TrophyEmojiIcon = createEmojiIcon('🏆', 'Top Santri');
export const MemoIcon = createEmojiIcon('📝', 'Catatan Santri');
export const AlarmClockEmojiIcon = createEmojiIcon('⏰', 'Jadwal Sholat');
export const SleepingPersonIcon = createEmojiIcon('🛌🏻', 'Tafsir Mimpi');
export const CowIcon = createEmojiIcon('🐄', 'Qurban');
export const RadioEmojiIcon = createEmojiIcon('📻', 'Radio Islami');
export const TelevisionIcon = createEmojiIcon('📺', 'TV');
export const MovieCameraIcon = createEmojiIcon('🎥', 'Video');
export const BalanceScaleIcon = createEmojiIcon('⚖️', 'Fatwa');
export const OrangeBookIcon = createEmojiIcon('📙', 'Belajar Kitab');
export const OpenBookEmojiIcon = createEmojiIcon('📖', 'Al-Quran');
export const CalendarEmojiIcon = createEmojiIcon('🗓️', 'Kalender');
export const PrayerBeadsIcon = createEmojiIcon('📿', 'Tasbih');
export const GlobeEmojiIcon = createEmojiIcon('🌍', 'Tafakur');
export const PalmDownIcon = createEmojiIcon('🫳🏻', 'Zakat / Fidyah');
export const GemEmojiIcon = createEmojiIcon('💎', 'Santri Miliarder');
export const TurbanScholarIcon = createEmojiIcon('👳🏻‍♂️', 'Biografi Ulama');
export const CrescentMoonIcon = createEmojiIcon('🌜', 'Hitung Haid');
export const StudentEmojiIcon = createEmojiIcon('👨🏻‍🎓', 'Belajar');
export const WorldMapIcon = createEmojiIcon('🗺️', 'Jarak Safar');
export const VideoGameIcon = createEmojiIcon('🎮', 'Game Islami');
export const GamepadEmojiIcon = createEmojiIcon('🎮', 'Game Islami');
export const FrameEmojiIcon = createEmojiIcon('🖼️', 'Bingkai Avatar');
export const MoneyBagIcon = createEmojiIcon('💰', 'Santri Miliarder');
export const SwordsEmojiIcon = createEmojiIcon('⚔️', 'Versus');
export const BellEmojiIcon = createEmojiIcon('🔔', 'Notifikasi');
export const SettingsEmojiIcon = createEmojiIcon('⚙️', 'Pengaturan');
export const ArcheryEmojiIcon = createEmojiIcon('🏹', 'Panahan Sunnah');

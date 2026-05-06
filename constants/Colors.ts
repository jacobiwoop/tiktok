const tintColorLight = '#FE2C55'; // Rouge TikTok
const tintColorDark = '#FFFFFF';

export const TikTokColors = {
  red: '#FE2C55',
  cyan: '#25F4EE',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#8A8A8E',
};

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: TikTokColors.red, // On utilise le rouge TikTok pour l'onglet actif
    tabIconDefault: '#8A8A8E',
    tabIconSelected: TikTokColors.red,
  },
};

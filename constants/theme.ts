import { Platform } from 'react-native';

export const MiraColors = {
  primary:     '#7C5FFF', // vivid purple — main brand color
  secondary:   '#A78BFA', // light violet
  accent:      '#F0A0D8', // pink accent

  bg:          '#F6F3FF', // soft lavender white
  surface:     '#EDE8FF', // muted lavender card/surface
  border:      '#D4CBFF', // subtle border

  text:        '#1E1B4B', // deep indigo
  textMuted:   '#7C7CB0', // muted purple-grey
  textOnDark:  '#FFFFFF',

  darkBg:      '#1A1033', // deep purple night
  darkSurface: '#2A1F50', // dark surface

  success:     '#34D399',
  warning:     '#FBBF24',
  error:       '#F87171',
};

export const Colors = {
  light: {
    text:             MiraColors.text,
    background:       MiraColors.bg,
    tint:             MiraColors.primary,
    icon:             MiraColors.textMuted,
    tabIconDefault:   MiraColors.textMuted,
    tabIconSelected:  MiraColors.primary,
  },
  dark: {
    text:             MiraColors.textOnDark,
    background:       MiraColors.darkBg,
    tint:             MiraColors.secondary,
    icon:             '#9B8FD4',
    tabIconDefault:   '#9B8FD4',
    tabIconSelected:  MiraColors.secondary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

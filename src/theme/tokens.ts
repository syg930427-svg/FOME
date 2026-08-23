/**
 * Design tokens — source of truth is the design handoff README.
 * Do not change these values ad hoc; they are confirmed (hex/px) values.
 */

export const colors = {
  primary: '#0066FF',
  primaryTint: '#F5F9FF',
  primaryTintStrong: '#EAF2FF',

  textPrimary: '#171719',
  textSecondary: '#46474C',
  textSecondaryAlt: '#5E6066',
  textTertiary: '#878A93',
  textDisabled: '#AEB0B6',
  textDisabledAlt: '#C2C4C8',

  border: '#E1E2E4',
  borderStrong: '#DBDCDF',
  borderSubtle: '#EFF0F1',

  surface: '#FFFFFF',
  surfaceSubtle: '#F7F7F8',
  surfaceSubtleAlt: '#F4F4F5',
  surfacePlaceholder: '#EFF1F4',
  surfacePlaceholderAlt: '#F7F8FA',

  appBackground: '#EBECEE',

  cameraDark: '#141415',
  cameraDarkAlt: '#2A2C30',

  success: '#009632',
  successStrong: '#00752A',
  successBg: '#F3FBF5',
  successBorder: '#CCEAD5',
  successText: '#2E6B41',

  error: '#E52222',
  errorStrong: '#B32626',
  errorStrongAlt: '#8C2A2A',
  errorBg: '#FFF5F5',
  errorBgAlt: '#FFF4F4',
  errorBorder: '#F5D3D3',

  warning: '#D17600',
  warningStrong: '#8A5A00',
  warningBg: '#FFF6E8',

  infoText: '#2C5AA0',

  inverseBg: '#171719',
  inverseText: '#FFFFFF',

  placeholderFigure: '#D9DEE6',
  placeholderFigureAlt: '#DCE3EC',
} as const;

export const font = {
  family: 'System', // Pretendard JP not bundled in this handoff; falls back to the platform system font.
} as const;

export const type = {
  screenTitleLarge: { fontSize: 26, fontWeight: '700' as const, lineHeight: 26 * 1.3, letterSpacing: -0.02 * 26 },
  screenTitle: { fontSize: 23, fontWeight: '700' as const, lineHeight: 23 * 1.35 },
  sectionHeading: { fontSize: 17, fontWeight: '700' as const },
  cardTitle: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 14 * 1.5 },
  bodyStrong: { fontSize: 14, fontWeight: '700' as const, lineHeight: 14 * 1.5 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 13 * 1.5 },
  micro: { fontSize: 11, fontWeight: '700' as const },
  ctaLabel: { fontSize: 17, fontWeight: '700' as const },
  statusBar: { fontSize: 12, fontWeight: '700' as const },
} as const;

export const spacing = {
  screenPadding: 20,
  sectionGap: 18,
  cardGap: 10,
  listItemGap: 9,
  headerHeight: 52,
  statusBarHeight: 44,
  ctaAreaPadding: { top: 14, horizontal: 20, bottom: 28 },
} as const;

export const radius = {
  ctaPrimary: 14,
  cardLarge: 16,
  cardList: 14,
  infoBox: 12,
  thumbnailSmall: 8,
  thumbnailLarge: 11,
} as const;

export const shadow = {
  card: {
    shadowColor: 'rgba(23,23,25,1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
} as const;

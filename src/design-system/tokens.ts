// ─── COLORES ─────────────────────────────────────────────────────────────────
//
// Paleta extraída del logotipo oficial de Alpes Dental:
//   • brand (azul-gris acero) — color del texto "ALPES DENTAL"
//   • gold  (ámbar dorado)    — la "D" dorada del isotipo
//
// Actualizados 2026-05-19 para coincidir con la imagen de marca real.

export const colors = {
  /**
   * Azul-gris acero — color principal de la marca.
   * Extraído directamente del texto "ALPES DENTAL" del logotipo oficial.
   * Transmite profesionalismo clínico, confianza y sobriedad.
   */
  brand: {
    50:  '#EEF2F6',
    100: '#D3DCE8',
    200: '#A7BAD1',
    300: '#7496B3',
    400: '#4D7492',
    500: '#3A6080',  // primary action — steel blue del logotipo
    600: '#2F4F6C',  // hover
    700: '#243E58',
    800: '#1A2F44',
    900: '#112132',
  },

  /**
   * Ámbar dorado — color de acento de la marca.
   * Extraído de la "D" dorada del isotipo Alpes Dental.
   * Evoca calidez, calidad y diferenciación premium.
   * Mapea al alias "sky" para no romper las clases Tailwind existentes.
   */
  sky: {
    50:  '#FEF8EC',
    100: '#FDEBC5',
    200: '#FAD58C',
    300: '#F7BC4E',
    400: '#F4A820',  // accent base — la D dorada del logotipo
    500: '#DC9010',
    600: '#BC790D',
    700: '#97620A',
    800: '#764D08',
    900: '#593A06',
  },

  /**
   * Neutros cálidos — fondos, textos, bordes.
   * Ligeramente inclinados al gris-azul para coherencia con la marca.
   */
  neutral: {
    0:   '#FFFFFF',
    50:  '#F4F6F9',  // fondo de página
    100: '#E9EDF3',  // fondo sutil
    200: '#D5DCE7',  // borde default
    300: '#B8C4D4',  // borde fuerte
    400: '#8FA3B8',  // texto muted / placeholder
    500: '#637A91',  // texto secundario
    600: '#475E74',  // texto cuerpo
    700: '#334A5D',  // texto secundario prominente
    800: '#1F3347',  // títulos
    900: '#0F2030',  // texto principal
  },

  /** Estados semánticos — sin cambios (colores estándar de accesibilidad) */
  success: {
    bg:     '#ECFDF5',
    border: '#6EE7B7',
    base:   '#059669',
    text:   '#065F46',
  },
  error: {
    bg:     '#FEF2F2',
    border: '#FCA5A5',
    base:   '#DC2626',
    text:   '#991B1B',
  },
  warning: {
    bg:     '#FFFBEB',
    border: '#FCD34D',
    base:   '#D97706',
    text:   '#92400E',
  },
  info: {
    bg:     '#EEF2F6',
    border: '#A7BAD1',
    base:   '#3A6080',
    text:   '#2F4F6C',
  },
} as const

// ─── ALIASES SEMÁNTICOS ───────────────────────────────────────────────────────
// Usa estos en los componentes, no los valores raw del escalón de color.
// Esto permite cambiar la paleta en un solo lugar.

export const semantic = {
  // Acciones primarias
  actionBg:          colors.brand[500],
  actionBgHover:     colors.brand[600],
  actionBgActive:    colors.brand[700],
  actionText:        colors.neutral[0],
  actionBgSubtle:    colors.brand[50],
  actionTextSubtle:  colors.brand[700],
  actionBorder:      colors.brand[200],

  // Superficies y fondos
  pageBg:            colors.neutral[50],
  surfaceBg:         colors.neutral[0],
  subtleBg:          colors.neutral[100],
  raisedBg:          colors.neutral[0],

  // Texto
  textPrimary:       colors.neutral[900],
  textSecondary:     colors.neutral[600],
  textMuted:         colors.neutral[400],
  textInverse:       colors.neutral[0],
  textBrand:         colors.brand[600],
  textHeading:       colors.neutral[800],

  // Bordes
  borderDefault:     colors.neutral[200],
  borderSubtle:      colors.neutral[100],
  borderStrong:      colors.neutral[300],
  borderFocus:       colors.brand[400],
  borderBrand:       colors.brand[200],
} as const

// ─── TIPOGRAFÍA ───────────────────────────────────────────────────────────────

export const typography = {
  /** Inter — geométrica, legible, moderna. Estándar de facto en SaaS y apps médicas. */
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

  scale: {
    xs:   '0.75rem',    // 12 px
    sm:   '0.875rem',   // 14 px
    base: '1rem',       // 16 px
    lg:   '1.125rem',   // 18 px
    xl:   '1.25rem',    // 20 px
    '2xl': '1.5rem',    // 24 px
    '3xl': '1.875rem',  // 30 px
    '4xl': '2.25rem',   // 36 px
    '5xl': '3rem',      // 48 px
  },

  weight: {
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },

  lineHeight: {
    none:    1,
    tight:   1.25,
    snug:    1.375,
    normal:  1.5,
    relaxed: 1.625,
    loose:   2,
  },

  letterSpacing: {
    tighter: '-0.04em',
    tight:   '-0.02em',
    normal:  '0em',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
  },
} as const

// ─── ESPACIADO ────────────────────────────────────────────────────────────────

export const spacing = {
  0:   '0px',
  px:  '1px',
  0.5: '2px',
  1:   '4px',
  1.5: '6px',
  2:   '8px',
  2.5: '10px',
  3:   '12px',
  3.5: '14px',
  4:   '16px',
  5:   '20px',
  6:   '24px',
  7:   '28px',
  8:   '32px',
  9:   '36px',
  10:  '40px',
  11:  '44px',
  12:  '48px',
  14:  '56px',
  16:  '64px',
  20:  '80px',
  24:  '96px',
} as const

// ─── BORDER RADIUS ────────────────────────────────────────────────────────────

export const radius = {
  none: '0px',
  xs:   '4px',
  sm:   '8px',   // elementos pequeños: badges, tags
  md:   '12px',  // inputs, botones
  lg:   '16px',  // cards pequeñas
  xl:   '20px',  // cards medianas
  '2xl': '24px', // cards grandes, modales
  '3xl': '32px', // elementos hero
  full: '9999px', // pills, avatars
} as const

// ─── SOMBRAS ─────────────────────────────────────────────────────────────────

export const shadows = {
  xs:    '0 1px 2px 0 rgb(15 30 44 / 0.05)',
  sm:    '0 1px 3px 0 rgb(15 30 44 / 0.08), 0 1px 2px -1px rgb(15 30 44 / 0.06)',
  md:    '0 4px 12px -2px rgb(15 30 44 / 0.09), 0 2px 6px -2px rgb(15 30 44 / 0.05)',
  lg:    '0 10px 28px -5px rgb(15 30 44 / 0.10), 0 4px 12px -4px rgb(15 30 44 / 0.06)',
  xl:    '0 20px 40px -10px rgb(15 30 44 / 0.12), 0 8px 20px -6px rgb(15 30 44 / 0.07)',
  inner: 'inset 0 2px 4px 0 rgb(15 30 44 / 0.06)',
  brand: '0 4px 14px -2px rgb(26 95 175 / 0.35)',
  none:  'none',
} as const

// ─── TRANSICIONES ─────────────────────────────────────────────────────────────

export const transitions = {
  fast:   '100ms ease',
  base:   '160ms ease',
  slow:   '250ms ease',
  slower: '380ms ease',
} as const

// ─── BREAKPOINTS ──────────────────────────────────────────────────────────────

export const breakpoints = {
  sm:   '640px',
  md:   '768px',
  lg:   '1024px',
  xl:   '1280px',
  '2xl': '1536px',
} as const

// ─── Z-INDEX ─────────────────────────────────────────────────────────────────

export const zIndex = {
  base:    0,
  raised:  10,
  dropdown: 100,
  sticky:  200,
  overlay: 300,
  modal:   400,
  toast:   500,
} as const

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#003466',
        'primary-container': '#1a4b84',
        'on-primary': '#ffffff',
        'primary-fixed': '#d5e3ff',
        'on-primary-container': '#93bcfc',
        secondary: '#006e1c',
        'secondary-container': '#91f78e',
        'secondary-fixed': '#94f990',
        'secondary-fixed-dim': '#78dc77',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#00731e',
        'on-secondary-fixed': '#002204',
        'on-secondary-fixed-variant': '#005313',
        surface: '#f8faf8',
        background: '#f8faf8',
        'on-surface': '#191c1b',
        'on-surface-variant': '#424750',
        'surface-variant': '#e1e3e1',
        'surface-container': '#eceeec',
        'surface-container-high': '#e6e9e7',
        'surface-container-highest': '#e1e3e1',
        'surface-container-low': '#f2f4f2',
        'surface-container-lowest': '#ffffff',
        'surface-bright': '#f8faf8',
        'surface-dim': '#d8dad9',
        'surface-tint': '#335f99',
        outline: '#737781',
        'outline-variant': '#c3c6d1',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        tertiary: '#2b362e',
        'tertiary-container': '#414d45',
        'tertiary-fixed': '#d9e6da',
        'tertiary-fixed-dim': '#bdcabe',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#b1beb2',
        'on-tertiary-fixed': '#131e17',
        'on-tertiary-fixed-variant': '#3e4a41',
        'inverse-surface': '#2e3130',
        'inverse-primary': '#a6c8ff',
        'inverse-on-surface': '#eff1ef'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      spacing: {
        'section-gap': '80px',
        'margin-mobile': '16px',
        'container-max': '1280px',
        base: '8px',
        gutter: '24px',
        'margin-desktop': '40px'
      },
      fontFamily: {
        'headline-lg-mobile': ['Manrope'],
        'headline-lg': ['Manrope'],
        caption: ['Manrope'],
        'headline-xl': ['Manrope'],
        'body-md': ['Manrope'],
        'headline-md': ['Manrope'],
        'body-lg': ['Manrope'],
        'label-md': ['Hanken Grotesk']
      },
      fontSize: {
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }]
      }
    }
  },
  plugins: []
};

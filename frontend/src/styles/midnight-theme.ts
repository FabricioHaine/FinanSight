import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import type { ComponentsDesignTokens } from '@primeuix/themes/types';

/**
 * Preset "Midnight" - tema escuro do FinanSight.
 *
 * O preset reescreve os tokens semanticos do PrimeNG para que nenhum
 * componente mantenha a aparencia padrão da biblioteca. Todas as cores
 * derivam da paleta oficial definida em `styles/_tokens.scss`.
 *
 * A estrutura segue o esquema de cores do PrimeNG: o esquema `dark` recebe
 * superficies, textos, campos de formulario e overlays, e cada componente
 * tem seus próprios tokens.
 */
const midnightSemantic = {
  primary: {
    50: '#eef2ff',
    100: '#dce4ff',
    200: '#b8d3f5',
    300: '#8fb3d9',
    400: '#6b8eff',
    500: '#5578e6',
    600: '#4360b8',
    700: '#354a8c',
    800: '#293865',
    900: '#1c2643',
    950: '#0f1526',
  },
  focusRing: {
    width: '2px',
    style: 'solid',
    color: 'rgba(107, 142, 255, 0.5)',
    offset: '2px',
    shadow: 'none',
  },
  iconSize: '1rem',
  disabledOpacity: '0.55',
  transitionDuration: '0.18s',
  colorScheme: {
    dark: {
      surface: {
        0: '#ffffff',
        50: '#f4f7fb',
        100: '#e8eef7',
        200: '#d3deec',
        300: '#b5c4d8',
        400: '#91a1b8',
        500: '#71839b',
        600: '#20314a',
        700: '#172a44',
        800: '#101e32',
        900: '#0d192a',
        950: '#07111f',
      },
      primary: {
        color: '#6b8eff',
        contrastColor: '#07111f',
        hoverColor: '#82a0ff',
        activeColor: '#5578e6',
      },
      highlight: {
        background: '#172a44',
        focusBackground: '#1d3352',
        color: '#e8eef7',
        focusColor: '#ffffff',
      },
      mask: {
        background: 'rgba(4, 10, 20, 0.74)',
        color: '#e8eef7',
      },
      formField: {
        background: '#0a1524',
        disabledBackground: '#0a1524',
        filledBackground: '#0d192a',
        filledHoverBackground: '#0d192a',
        filledFocusBackground: '#0d192a',
        borderColor: '#20314a',
        hoverBorderColor: '#2c3f5c',
        focusBorderColor: '#6b8eff',
        invalidBorderColor: '#e58b93',
        color: '#e8eef7',
        disabledColor: '#57687e',
        placeholderColor: '#71839b',
        invalidPlaceholderColor: '#c98089',
        floatLabelColor: '#71839b',
        floatLabelFocusColor: '#8fb3d9',
        floatLabelActiveColor: '#91a1b8',
        floatLabelInvalidColor: '#e58b93',
        iconColor: '#71839b',
        shadow: 'none',
      },
      text: {
        color: '#e8eef7',
        hoverColor: '#ffffff',
        mutedColor: '#91a1b8',
        hoverMutedColor: '#b5c4d8',
      },
      content: {
        background: '#0d192a',
        hoverBackground: '#101e32',
        borderColor: '#20314a',
        color: '#e8eef7',
        hoverColor: '#ffffff',
      },
      overlay: {
        select: {
          background: '#0d192a',
          borderColor: '#20314a',
          color: '#e8eef7',
        },
        popover: {
          background: '#0d192a',
          borderColor: '#20314a',
          color: '#e8eef7',
        },
        modal: {
          background: '#0d192a',
          borderColor: '#20314a',
          color: '#e8eef7',
        },
      },
      list: {
        option: {
          focusBackground: '#101e32',
          selectedBackground: '#172a44',
          selectedFocusBackground: '#1d3352',
          color: '#e8eef7',
          focusColor: '#ffffff',
          selectedColor: '#e8eef7',
          selectedFocusColor: '#ffffff',
          icon: { color: '#71839b', focusColor: '#91a1b8' },
        },
        optionGroup: { background: 'transparent', color: '#71839b' },
      },
      navigation: {
        item: {
          focusBackground: '#101e32',
          activeBackground: '#172a44',
          color: '#91a1b8',
          focusColor: '#e8eef7',
          activeColor: '#e8eef7',
          icon: { color: '#71839b', focusColor: '#8fb3d9', activeColor: '#8fb3d9' },
        },
        submenuLabel: { background: 'transparent', color: '#71839b' },
        submenuIcon: { color: '#71839b', focusColor: '#8fb3d9', activeColor: '#8fb3d9' },
      },
    },
  },
};

const midnightComponents = {
  button: {
    root: {
      borderRadius: '6px',
      paddingX: '0.9rem',
      paddingY: '0.5rem',
      label: { fontWeight: '600' },
      focusRing: {
        width: '2px',
        style: 'solid',
        color: 'rgba(107, 142, 255, 0.45)',
        offset: '2px',
        shadow: 'none',
      },
    },
    colorScheme: {
      dark: {
        root: {
          primary: {
            background: '#6b8eff',
            hoverBackground: '#82a0ff',
            activeBackground: '#5578e6',
            borderColor: 'transparent',
            hoverBorderColor: 'transparent',
            activeBorderColor: 'transparent',
            color: '#07111f',
            hoverColor: '#07111f',
            activeColor: '#07111f',
            focusRing: { color: 'rgba(107, 142, 255, 0.35)', shadow: 'none' },
          },
          secondary: {
            background: '#101e32',
            hoverBackground: '#172a44',
            activeBackground: '#1d3352',
            borderColor: '#20314a',
            hoverBorderColor: '#2c3f5c',
            activeBorderColor: '#2c3f5c',
            color: '#e8eef7',
            hoverColor: '#ffffff',
            activeColor: '#ffffff',
          },
          danger: {
            background: '#e58b93',
            hoverBackground: '#eaa0a7',
            activeBackground: '#d97a83',
            borderColor: 'transparent',
            hoverBorderColor: 'transparent',
            activeBorderColor: 'transparent',
            color: '#2a0f13',
            hoverColor: '#2a0f13',
            activeColor: '#2a0f13',
          },
        },
        outlined: {
          primary: {
            background: 'transparent',
            hoverBackground: 'rgba(107, 142, 255, 0.1)',
            activeBackground: 'rgba(107, 142, 255, 0.16)',
            borderColor: '#6b8eff',
            hoverBorderColor: '#82a0ff',
            activeBorderColor: '#5578e6',
            color: '#8fb3d9',
            hoverColor: '#b8d3f5',
            activeColor: '#b8d3f5',
          },
          secondary: {
            background: 'transparent',
            hoverBackground: '#101e32',
            activeBackground: '#172a44',
            borderColor: '#20314a',
            hoverBorderColor: '#2c3f5c',
            activeBorderColor: '#2c3f5c',
            color: '#91a1b8',
            hoverColor: '#e8eef7',
            activeColor: '#e8eef7',
          },
          danger: {
            background: 'transparent',
            hoverBackground: 'rgba(229, 139, 147, 0.1)',
            activeBackground: 'rgba(229, 139, 147, 0.16)',
            borderColor: 'rgba(229, 139, 147, 0.45)',
            hoverBorderColor: '#e58b93',
            activeBorderColor: '#d97a83',
            color: '#e58b93',
            hoverColor: '#eaa0a7',
            activeColor: '#eaa0a7',
          },
        },
        text: {
          primary: {
            background: 'transparent',
            hoverBackground: 'rgba(107, 142, 255, 0.1)',
            activeBackground: 'rgba(107, 142, 255, 0.16)',
            color: '#8fb3d9',
            hoverColor: '#b8d3f5',
            activeColor: '#b8d3f5',
          },
          secondary: {
            background: 'transparent',
            hoverBackground: '#101e32',
            activeBackground: '#172a44',
            color: '#91a1b8',
            hoverColor: '#e8eef7',
            activeColor: '#e8eef7',
          },
        },
      },
    },
  },
  inputtext: {
    root: {
      background: '#0a1524',
      borderColor: '#20314a',
      hoverBorderColor: '#2c3f5c',
      focusBorderColor: '#6b8eff',
      invalidBorderColor: '#e58b93',
      color: '#e8eef7',
      placeholderColor: '#71839b',
      borderRadius: '6px',
      paddingX: '0.75rem',
      paddingY: '0.5rem',
      shadow: 'none',
    },
  },
  textarea: {
    root: {
      background: '#0a1524',
      borderColor: '#20314a',
      hoverBorderColor: '#2c3f5c',
      focusBorderColor: '#6b8eff',
      invalidBorderColor: '#e58b93',
      color: '#e8eef7',
      placeholderColor: '#71839b',
      borderRadius: '6px',
      paddingX: '0.75rem',
      paddingY: '0.5rem',
      shadow: 'none',
    },
  },
  select: {
    root: {
      background: '#0a1524',
      borderColor: '#20314a',
      hoverBorderColor: '#2c3f5c',
      focusBorderColor: '#6b8eff',
      invalidBorderColor: '#e58b93',
      color: '#e8eef7',
      placeholderColor: '#71839b',
      borderRadius: '6px',
      paddingX: '0.75rem',
      paddingY: '0.5rem',
      shadow: 'none',
    },
    dropdown: { color: '#71839b' },
    overlay: {
      background: '#0d192a',
      borderColor: '#20314a',
      borderRadius: '8px',
      color: '#e8eef7',
      shadow: '0 18px 44px -22px rgba(0, 0, 0, 0.85)',
    },
    option: {
      color: '#e8eef7',
      focusBackground: '#101e32',
      focusColor: '#ffffff',
      selectedBackground: '#172a44',
      selectedColor: '#e8eef7',
      selectedFocusBackground: '#1d3352',
      selectedFocusColor: '#ffffff',
    },
  },
  multiselect: {
    root: {
      background: '#0a1524',
      borderColor: '#20314a',
      hoverBorderColor: '#2c3f5c',
      focusBorderColor: '#6b8eff',
      color: '#e8eef7',
      placeholderColor: '#71839b',
      borderRadius: '6px',
    },
    overlay: { background: '#0d192a', borderColor: '#20314a', color: '#e8eef7' },
    option: {
      color: '#e8eef7',
      focusBackground: '#101e32',
      selectedBackground: '#172a44',
      selectedColor: '#e8eef7',
    },
  },
  listbox: {
    root: {
      background: '#0d192a',
      borderColor: '#20314a',
      color: '#e8eef7',
      borderRadius: '8px',
      shadow: '0 18px 44px -22px rgba(0, 0, 0, 0.85)',
    },
    colorScheme: {
      dark: {
        option: {
          color: '#e8eef7',
          focusBackground: '#101e32',
          focusColor: '#ffffff',
          selectedBackground: '#172a44',
          selectedColor: '#e8eef7',
        },
      },
    },
  },
  datepicker: {
    colorScheme: {
      dark: {
        panel: {
          background: '#0d192a',
          borderColor: '#20314a',
          borderRadius: '10px',
          color: '#e8eef7',
          shadow: '0 20px 50px -24px rgba(0, 0, 0, 0.9)',
        },
        header: { background: '#0d192a', borderColor: '#20314a', color: '#e8eef7' },
        title: { fontSize: '0.9375rem', fontWeight: '600' },
        weekDay: { color: '#71839b', fontSize: '0.75rem', fontWeight: '600' },
        date: {
          color: '#91a1b8',
          hoverBackground: '#101e32',
          hoverColor: '#e8eef7',
          selectedBackground: '#6b8eff',
          selectedColor: '#07111f',
          range: { selected: { background: 'rgba(107, 142, 255, 0.14)', color: '#e8eef7' } },
        },
        today: { color: '#8fb3d9' },
        inputIcon: { color: '#71839b' },
      },
    },
  },
  datatable: {
    root: { borderColor: '#16243a' },
    colorScheme: {
      dark: {
        header: {
          background: '#101e32',
          borderColor: '#20314a',
          color: '#91a1b8',
          padding: '0.75rem 1rem',
        },
        headerCell: {
          background: '#101e32',
          borderColor: '#20314a',
          color: '#91a1b8',
          padding: '0.75rem 1rem',
          hoverBackground: '#172a44',
          hoverColor: '#e8eef7',
        },
        columnTitle: { fontWeight: '600', fontSize: '0.75rem' },
        row: {
          background: 'transparent',
          color: '#e8eef7',
          hoverBackground: '#101e32',
          hoverColor: '#e8eef7',
          selectedBackground: '#172a44',
          selectedColor: '#e8eef7',
        },
        bodyCell: {
          borderColor: '#16243a',
          color: '#91a1b8',
          padding: '0.75rem 1rem',
        },
        footer: { background: 'transparent', borderColor: '#20314a', color: '#91a1b8' },
        footerCell: { background: 'transparent', borderColor: '#20314a', color: '#91a1b8' },
        sortIcon: { color: '#71839b', hoverColor: '#8fb3d9', size: '0.75rem' },
        paginatorTop: { borderColor: '#20314a', borderWidth: '0 0 1px 0' },
        paginatorBottom: { borderColor: '#20314a', borderWidth: '0 0 1px 0' },
      },
    },
  },
  dialog: {
    root: {
      background: '#0d192a',
      borderColor: '#20314a',
      color: '#e8eef7',
      borderRadius: '12px',
      shadow: '0 28px 70px -26px rgba(0, 0, 0, 0.9)',
    },
    header: { padding: '1.25rem 1.5rem', gap: '0.75rem' },
    title: { fontSize: '1.0625rem', fontWeight: '600' },
    content: { padding: '0 1.5rem 0.25rem' },
    footer: { padding: '1rem 1.5rem 1.5rem', gap: '0.5rem' },
  },
  drawer: {
    root: { background: '#0a1524', borderColor: '#20314a', color: '#e8eef7' },
    header: { padding: '1rem 1.25rem' },
    title: { fontSize: '1rem', fontWeight: '600' },
    content: { padding: '0 1.25rem 1.25rem' },
  },
  confirmdialog: {
    content: { gap: '0.75rem' },
    icon: { color: '#e58b93', size: '1.25rem' },
  },
  toast: {
    root: { borderRadius: '8px', width: '22rem' },
    content: { gap: '0.75rem', padding: '0.875rem 1rem' },
    summary: { fontWeight: '600', fontSize: '0.9375rem' },
    detail: { fontSize: '0.8125rem' },
    icon: { size: '1.125rem' },
    colorScheme: {
      dark: {
        normal: {
          background: '#101e32',
          borderColor: '#20314a',
          color: '#e8eef7',
          detailColor: '#91a1b8',
          shadow: '0 18px 44px -22px rgba(0, 0, 0, 0.85)',
        },
        success: {
          background: 'rgba(72, 198, 173, 0.12)',
          borderColor: 'rgba(72, 198, 173, 0.4)',
          color: '#48c6ad',
          detailColor: '#91a1b8',
        },
        error: {
          background: 'rgba(229, 139, 147, 0.12)',
          borderColor: 'rgba(229, 139, 147, 0.4)',
          color: '#e58b93',
          detailColor: '#91a1b8',
        },
        info: {
          background: 'rgba(143, 179, 217, 0.12)',
          borderColor: 'rgba(143, 179, 217, 0.4)',
          color: '#8fb3d9',
          detailColor: '#91a1b8',
        },
        warn: {
          background: 'rgba(217, 183, 121, 0.12)',
          borderColor: 'rgba(217, 183, 121, 0.4)',
          color: '#d9b779',
          detailColor: '#91a1b8',
        },
      },
    },
  },
  tooltip: {
    root: {
      background: '#101e32',
      color: '#e8eef7',
      borderRadius: '6px',
      padding: '0.375rem 0.625rem',
      fontSize: '0.75rem',
      shadow: '0 8px 24px -12px rgba(0, 0, 0, 0.8)',
    },
  },
  progressbar: {
    root: { background: '#0a1524', borderRadius: '999px', height: '6px' },
    value: { background: '#6b8eff' },
    label: { color: '#e8eef7', fontWeight: '600', fontSize: '0.75rem' },
  },
  tag: {
    root: { borderRadius: '999px', fontWeight: '600', fontSize: '0.75rem' },
    colorScheme: {
      dark: {
        root: { borderRadius: '999px', fontWeight: '600', fontSize: '0.75rem' },
        primary: { background: '#172a44', color: '#b8d3f5' },
        secondary: { background: '#101e32', color: '#91a1b8' },
        success: { background: 'rgba(72, 198, 173, 0.14)', color: '#48c6ad' },
        danger: { background: 'rgba(229, 139, 147, 0.14)', color: '#e58b93' },
        warn: { background: 'rgba(217, 183, 121, 0.14)', color: '#d9b779' },
        info: { background: 'rgba(143, 179, 217, 0.14)', color: '#8fb3d9' },
        contrast: { background: '#20314a', color: '#e8eef7' },
      },
    },
  },
  menu: {
    root: {
      background: '#0d192a',
      borderColor: '#20314a',
      borderRadius: '8px',
      color: '#e8eef7',
      shadow: '0 18px 44px -22px rgba(0, 0, 0, 0.85)',
    },
    item: {
      color: '#e8eef7',
      focusBackground: '#172a44',
      focusColor: '#ffffff',
      icon: { color: '#71839b', focusColor: '#8fb3d9' },
    },
    separator: { borderColor: '#20314a' },
  },
  popover: {
    root: {
      background: '#0d192a',
      borderColor: '#20314a',
      borderRadius: '8px',
      color: '#e8eef7',
      shadow: '0 18px 44px -22px rgba(0, 0, 0, 0.85)',
    },
    content: { padding: '0.75rem' },
  },
  paginator: {
    root: {
      background: 'transparent',
      borderRadius: '0',
      color: '#91a1b8',
      gap: '0.125rem',
      padding: '0.5rem',
    },
    navButton: {
      background: 'transparent',
      hoverBackground: '#172a44',
      selectedBackground: '#172a44',
      color: '#91a1b8',
      hoverColor: '#e8eef7',
      selectedColor: '#e8eef7',
      borderRadius: '5px',
      width: '2.25rem',
      height: '2.25rem',
      fontSize: '0.8125rem',
      fontWeight: '500',
    },
    currentPageReport: { color: '#71839b', fontSize: '0.8125rem' },
  },
  skeleton: {
    root: { background: '#101e32', borderRadius: '5px', animationBackground: '#172a44' },
  },
  checkbox: {
    root: {
      background: '#0a1524',
      borderColor: '#20314a',
      hoverBorderColor: '#2c3f5c',
      checkedBackground: '#6b8eff',
      checkedBorderColor: '#6b8eff',
      checkedHoverBackground: '#82a0ff',
      checkedHoverBorderColor: '#82a0ff',
      borderRadius: '4px',
    },
    icon: { color: '#07111f', checkedColor: '#07111f' },
  },
  toggleswitch: {
    root: { borderRadius: '999px' },
    handle: { background: '#0d192a', hoverBackground: '#172a44' },
    colorScheme: {
      dark: {
        root: {
          background: '#0a1524',
          checkedBackground: '#6b8eff',
          checkedHoverBackground: '#82a0ff',
          borderColor: '#20314a',
        },
        handle: { background: '#0d192a', hoverBackground: '#172a44' },
      },
    },
  },
  password: {
    icon: { color: '#71839b' },
    overlay: { background: '#0d192a', borderColor: '#20314a', color: '#e8eef7' },
  },
  card: {
    root: { background: '#0d192a', color: '#e8eef7', borderRadius: '12px' },
  },
  badge: {
    root: { borderRadius: '999px' },
    colorScheme: {
      dark: {
        root: { borderRadius: '999px' },
        primary: { background: '#6b8eff', color: '#07111f' },
      },
    },
  },
  divider: {
    root: { borderColor: '#20314a' },
    content: { background: '#0d192a', color: '#71839b' },
  },
  inputnumber: {
    button: {
      background: '#101e32',
      borderColor: '#20314a',
      color: '#91a1b8',
      hoverBackground: '#172a44',
      hoverColor: '#e8eef7',
    },
  },
};

/**
 * Preset final: combina os tokens semanticos com a personalizacao de cada
 * componente do PrimeNG.
 */
export const MidnightPreset = definePreset(Aura, {
  semantic: midnightSemantic,
  components: midnightComponents as unknown as ComponentsDesignTokens,
});

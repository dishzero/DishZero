import { createTheme } from '@mui/material/styles';

export const brandColors = {
    primary: '#68b49a',
    primaryDark: '#29604d',
    primaryLight: '#e0f4f4',
    secondary: '#b56983',
    secondaryDark: '#964a65',
    secondaryLight: '#c5899e',
    surface: '#ffffff',
    surfaceDark: '#464646',
    accentBlue: '#b0d1d8',
    textPrimary: '#4c4242',
    textMuted: '#757575',
    danger: '#bf4949',
};

const theme = createTheme({
    palette: {
        primary: {
            main: brandColors.primary,
            dark: brandColors.primaryDark,
            light: brandColors.primaryLight,
        },
        secondary: {
            main: brandColors.secondary,
            dark: brandColors.secondaryDark,
            light: brandColors.secondaryLight,
        },
        error: {
            main: brandColors.danger,
        },
        background: {
            default: brandColors.surface,
            paper: '#ffffff',
        },
        text: {
            primary: '#000000',
            secondary: brandColors.textMuted,
        },
    },
    shape: {
        borderRadius: 10,
    },
    typography: {
        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: {
            fontSize: '3.5rem',
            fontWeight: 700,
            lineHeight: 1.1,
        },
        h2: {
            fontSize: '2.25rem',
            fontWeight: 600,
            lineHeight: 1.2,
        },
        h4: {
            fontSize: '2.25rem',
            fontWeight: 600,
            lineHeight: '44px',
        },
        h5: {
            fontSize: '1.75rem',
            fontWeight: 500,
            lineHeight: 1.3,
        },
        subtitle1: {
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        subtitle2: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.43,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                ':root': {
                    '--light-blue': brandColors.primaryLight,
                    '--turquoise': brandColors.primary,
                    '--green': brandColors.primaryDark,
                    '--dark-grey': brandColors.surfaceDark,
                    '--secondary-blue': brandColors.accentBlue,
                    '--secondary-green': brandColors.primaryDark,
                },
                'html, body, #root': {
                    minHeight: '100%',
                    width: '100%',
                },
                body: {
                    margin: 0,
                    backgroundColor: brandColors.surface,
                    color: '#000000',
                },
                '*': {
                    boxSizing: 'border-box',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    boxShadow: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    boxShadow: 'none',
                },
            },
        },
    },
});

export default theme;

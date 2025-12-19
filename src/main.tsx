import ReactDOM from 'react-dom/client'
import {App} from "./app.tsx";
import {MantineProvider, createTheme, MantineColorsTuple} from "@mantine/core";
import {TimeProvider} from "./provider/pomodoro.tsx";

import '@mantine/core/styles.css';
import './index.css';

const primary: MantineColorsTuple = [
    '#eef3ff',
    '#dce4f5',
    '#b9c7e2',
    '#94a8d0',
    '#748dc0',
    '#5f7cb7',
    '#5474b4',
    '#44639f',
    '#3a588f',
    '#2d4b80'
];

const accent: MantineColorsTuple = [
    '#f3edff',
    '#e1d8f8',
    '#c0acee',
    '#9d7de5',
    '#8056dd',
    '#6d3dd9',
    '#6432d8',
    '#5325c0',
    '#4920ac',
    '#3d1897'
];

const theme = createTheme({
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    primaryColor: 'primary',
    colors: {
        primary,
        accent,
    },
    radius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
    },
    defaultRadius: 'md',
    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    headings: {
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: '600',
    },
    components: {
        Modal: {
            defaultProps: {
                radius: 'lg',
                overlayProps: {
                    backgroundOpacity: 0.55,
                    blur: 3,
                },
            },
        },
        ActionIcon: {
            defaultProps: {
                variant: 'light',
            },
        },
        NumberInput: {
            defaultProps: {
                radius: 'md',
            },
        },
        TextInput: {
            defaultProps: {
                radius: 'md',
            },
        },
    },
});

const storedColorScheme = localStorage.getItem('colorScheme') as 'light' | 'dark' | null;
const storedAccentColor = localStorage.getItem('accentColor');

// Apply stored accent color on load
if (storedAccentColor) {
    document.documentElement.style.setProperty('--accent-color', storedAccentColor);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={theme} defaultColorScheme={storedColorScheme || 'dark'}>
        <TimeProvider>
            <App />
        </TimeProvider>
    </MantineProvider>,
)

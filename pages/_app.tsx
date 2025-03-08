import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import AuthProvider from '../src/contexts/AuthContext';
import '../src/hooks/useAuth'; // Import for side effects only to initialize the auth store
import '../styles/globals.css';

const queryClient = new QueryClient();

// Create rtl cache
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

// Create theme with RTL direction
const theme = createTheme({
    direction: 'rtl',
    typography: {
        fontFamily: 'IRANSans, Roboto, Arial',
    },
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <Component {...pageProps} />
                    </AuthProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default MyApp; 
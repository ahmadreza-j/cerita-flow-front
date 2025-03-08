import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import AuthProvider from '../src/contexts/AuthContext';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

// Import PageLoader with no SSR
const PageLoader = dynamic(() => import('../src/components/common/PageLoader'), {
  ssr: false,
});

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Remove the server-side injected CSS
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement?.removeChild(jssStyles);
        }

        // Add a short delay to ensure styles are applied
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        {loading ? (
                            <PageLoader />
                        ) : (
                            <Component {...pageProps} />
                        )}
                    </AuthProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default MyApp; 
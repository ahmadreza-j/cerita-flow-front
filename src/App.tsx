import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import AuthProvider from './contexts/AuthContext';
import AppRoutes from './routes';

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

const App: React.FC = () => {
    return (
        <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <AuthProvider>
                            <AppRoutes />
                        </AuthProvider>
                    </BrowserRouter>
                </QueryClientProvider>
            </ThemeProvider>
        </CacheProvider>
    );
};

export default App; 
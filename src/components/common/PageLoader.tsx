import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'در حال بارگذاری...',
  fullScreen = true 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: fullScreen ? '100vh' : '100%',
        width: '100%',
        position: fullScreen ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(245, 245, 245, 0.9)',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} color="primary" />
      {message && (
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 'medium' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default PageLoader; 
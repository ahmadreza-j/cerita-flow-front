import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { getCurrentPersianDateTime, formatPersianDateFull } from '../../utils/dateUtils';

interface PersianDateTimeProps {
  showDate?: boolean;
  showTime?: boolean;
  showFullDate?: boolean;
  variant?: 'text' | 'outlined' | 'contained';
}

const PersianDateTime: React.FC<PersianDateTimeProps> = ({
  showDate = true,
  showTime = true,
  showFullDate = false,
  variant = 'text'
}) => {
  // Use null as initial state to prevent hydration mismatch
  const [dateTime, setDateTime] = useState<{ date: string; time: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true when component mounts (client-side only)
    setMounted(true);
    // Set initial date time
    setDateTime(getCurrentPersianDateTime());

    // Update time every second
    const timer = setInterval(() => {
      setDateTime(getCurrentPersianDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Only render content after component has mounted on client
  if (!mounted) {
    return null; // Return empty on server-side rendering
  }

  const renderContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {showDate && !showFullDate && dateTime && (
        <Typography variant="body1" component="div" dir="rtl">
          تاریخ: {dateTime.date}
        </Typography>
      )}
      {showFullDate && (
        <Typography variant="body1" component="div" dir="rtl">
          {formatPersianDateFull(new Date())}
        </Typography>
      )}
      {showTime && dateTime && (
        <Typography variant="body1" component="div" dir="rtl">
          ساعت: {dateTime.time}
        </Typography>
      )}
    </Box>
  );

  if (variant === 'contained') {
    return (
      <Paper elevation={1} sx={{ p: 1, borderRadius: 1 }}>
        {renderContent()}
      </Paper>
    );
  }

  if (variant === 'outlined') {
    return (
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
        {renderContent()}
      </Paper>
    );
  }

  return renderContent();
};

export default PersianDateTime; 
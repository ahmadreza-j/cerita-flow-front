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
  const [dateTime, setDateTime] = useState(getCurrentPersianDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(getCurrentPersianDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const renderContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {showDate && !showFullDate && (
        <Typography variant="body1" component="div" dir="rtl">
          تاریخ: {dateTime.date}
        </Typography>
      )}
      {showFullDate && (
        <Typography variant="body1" component="div" dir="rtl">
          {formatPersianDateFull(new Date())}
        </Typography>
      )}
      {showTime && (
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
import React from 'react';
import { CircularProgress, Typography, Backdrop } from '@mui/material';

const LoadingIndicator = ({ open, message = 'Загрузка...' }) => {
  return (
    <Backdrop 
      open={open} 
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column'
      }}
    >
      <CircularProgress size={60} color="inherit" />
      <Typography variant="h6" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Backdrop>
  );
};

export default LoadingIndicator;
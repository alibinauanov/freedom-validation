import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Button, Container, Typography, Box } from '@mui/material';
import PaymentForm from './components/PaymentForm/PaymentForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
  },
});

function App() {
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);

  const handlePaymentSubmit = (values) => {
    console.log('Payment form submitted:', values);
    setPaymentFormOpen(false);
    
    // Здесь можно отправить данные на сервер
    alert('Платеж успешно создан!');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Система пенсионных платежей
          </Typography>
          
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Демонстрация платежной формы с валидациями, справочником сотрудников и отзывчивым интерфейсом
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setPaymentFormOpen(true)}
              sx={{ 
                bgcolor: '#4caf50',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Создать Пенсионный платеж
            </Button>
          </Box>

          <PaymentForm
            open={paymentFormOpen}
            onClose={() => setPaymentFormOpen(false)}
            onSubmit={handlePaymentSubmit}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
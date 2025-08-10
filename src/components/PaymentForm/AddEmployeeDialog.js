import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { validateIIN, formatIIN, getDateFromIIN, cleanIIN, generateId } from '../../utils/formatters';

const validationSchema = Yup.object({
  iin: Yup.string()
    .matches(/^\d{12}$/, 'ИИН должен содержать 12 цифр')
    .test('valid-iin', 'Неверный ИИН', (value) => value ? validateIIN(value) : false)
    .required('ИИН обязателен'),
  isResident: Yup.boolean(),
  birthDate: Yup.date()
    .max(new Date(), 'Дата рождения не может быть в будущем')
    .required('Дата рождения обязательна'),
  lastName: Yup.string()
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .required('Фамилия обязательна'),
  firstName: Yup.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .required('Имя обязательно'),
  middleName: Yup.string()
    .min(2, 'Отчество должно содержать минимум 2 символа')
    .required('Отчество обязательно'),
  amount: Yup.number()
    .min(0, 'Сумма не может быть отрицательной')
    .required('Сумма обязательна')
});

const AddEmployeeDialog = ({ open, onClose, onSubmit, onAddToDirectory }) => {
  const [loading, setLoading] = useState(false);
  const [iinError, setIinError] = useState('');
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingEmployee, setPendingEmployee] = useState(null);

  const handleIINChange = (iin, formik) => {
    const cleaned = cleanIIN(iin);
    if (cleaned.length <= 12) {
      formik.setFieldValue('iin', cleaned);
      setIinError('');
      
      if (cleaned.length >= 6) {
        const birthDate = getDateFromIIN(cleaned);
        if (birthDate) {
          formik.setFieldValue('birthDate', birthDate);
        }
      }
      
      // Валидация при вводе
      if (cleaned.length === 12) {
        if (!validateIIN(cleaned)) {
          setIinError('Некорректный ИИН');
        }
      }
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    
    try {
      // Проверяем разность дат
      const birthDate = new Date(values.birthDate);
      const iinDate = new Date(getDateFromIIN(values.iin));
      
      const newEmployee = {
        id: generateId(),
        iin: values.iin,
        fullName: `${values.lastName} ${values.firstName} ${values.middleName}`,
        residence: values.isResident ? 'KZ' : 'Пусто',
        amount: values.amount,
        month: 7, // по умолчанию июль
        year: 2025, // по умолчанию 2025
        birthDate: values.birthDate,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,
        isResident: values.isResident
      };
      
      if (Math.abs(birthDate - iinDate) > 24 * 60 * 60 * 1000) { // больше суток
        setPendingEmployee({ employee: newEmployee, resetForm });
        setShowWarningDialog(true);
        setLoading(false);
        return;
      }
      
      // Добавляем сотрудника в основную форму
      onSubmit(newEmployee);
      
      // Добавляем сотрудника в справочник, если передан коллбек
      if (onAddToDirectory) {
        onAddToDirectory(newEmployee);
      }
      
      resetForm();
      setIinError('');
      onClose();
    } catch (error) {
      console.error('Error adding employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWarningConfirm = () => {
    if (pendingEmployee) {
      // Добавляем сотрудника в основную форму
      onSubmit(pendingEmployee.employee);
      
      // Добавляем сотрудника в справочник, если передан коллбек
      if (onAddToDirectory) {
        onAddToDirectory(pendingEmployee.employee);
      }
      
      pendingEmployee.resetForm();
      setIinError('');
      onClose();
    }
    setShowWarningDialog(false);
    setPendingEmployee(null);
  };

  const handleWarningClose = () => {
    setShowWarningDialog(false);
    setPendingEmployee(null);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <Formik
          initialValues={{
            iin: '',
            isResident: true,
            birthDate: '',
            lastName: '',
            firstName: '',
            middleName: '',
            amount: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {(formik) => (
            <Form>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  Добавить сотрудника
                  <IconButton onClick={onClose}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>

              <DialogContent>
                <TextField
                  name="iin"
                  label="ИИН"
                  value={formatIIN(formik.values.iin)}
                  onChange={(e) => handleIINChange(e.target.value, formik)}
                  onBlur={formik.handleBlur}
                  error={formik.touched.iin && (Boolean(formik.errors.iin) || Boolean(iinError))}
                  helperText={formik.touched.iin && (formik.errors.iin || iinError)}
                  fullWidth
                  margin="normal"
                  placeholder="000 000 000 000"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.isResident}
                      onChange={formik.handleChange}
                      name="isResident"
                    />
                  }
                  label="Резидент"
                  sx={{ mb: 2 }}
                />

                <TextField
                  name="birthDate"
                  label="Выберите дату"
                  type="date"
                  value={formik.values.birthDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                  helperText={formik.touched.birthDate && formik.errors.birthDate}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <TextField
                  name="lastName"
                  label="Фамилия"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  name="firstName"
                  label="Имя"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  name="middleName"
                  label="Отчество"
                  value={formik.values.middleName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                  helperText={formik.touched.middleName && formik.errors.middleName}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  name="amount"
                  label="Сумма"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  fullWidth
                  margin="normal"
                />

                {iinError && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {iinError}
                    <Button 
                      onClick={() => setIinError('')} 
                      size="small" 
                      sx={{ ml: 2 }}
                    >
                      Продолжить
                    </Button>
                  </Alert>
                )}
              </DialogContent>

              <DialogActions>
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={loading || !formik.isValid || Boolean(iinError)}
                  sx={{ bgcolor: '#4caf50' }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Добавить'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Диалог предупреждения о несоответствии даты рождения */}
      <Dialog open={showWarningDialog} onClose={handleWarningClose} maxWidth="sm">
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Уважаемый клиент,
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            дата рождения отличается от введенного ИИН, просим перепроверить. 
            В случае если введенные данные верны, просим игнорировать данное сообщение.
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleWarningConfirm}
            sx={{ bgcolor: '#4caf50' }}
          >
            Продолжить
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddEmployeeDialog;
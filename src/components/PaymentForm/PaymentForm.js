import React, { useState, useEffect, useRef } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Divider,
  FormHelperText,
  CircularProgress,
  Alert,
  Switch,
  RadioGroup,
  Radio,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import EmployeeList from './EmployeeList';
import AddEmployeeDialog from './AddEmployeeDialog';
import EmployeeDirectoryDialog from './EmployeeDirectoryDialog';
import AutoCalculateAmount from './AutoCalculateAmount';
import { PAYMENT_TYPES, KNP_CODES, DEFAULT_FORM_VALUES } from '../../constants';
import { formatIIN } from '../../utils/formatters';
import { employeeAPI, paymentAPI } from '../../services/mockAPI';

// Валидационная схема
const validationSchema = Yup.object({
  documentNumber: Yup.string()
    .matches(/^\d{4}$/, 'Номер документа должен содержать 4 цифры')
    .required('Номер документа обязателен'),
  paymentType: Yup.string()
    .required('Тип платежа обязателен'),
  senderAccount: Yup.string()
    .required('Счет списания обязателен'),
  isActualPayer: Yup.boolean(),
  actualPayerBIN: Yup.string().when('isActualPayer', {
    is: true,
    then: (schema) => schema
      .matches(/^\d{12}$/, 'БИН/ИИН должен содержать 12 цифр')
      .required('БИН/ИИН обязателен'),
    otherwise: (schema) => schema.notRequired(),
  }),
  actualPayerName: Yup.string().when('isActualPayer', {
    is: true,
    then: (schema) => schema.required('Наименование плательщика обязательно'),
    otherwise: (schema) => schema.notRequired(),
  }),
  recipientAccount: Yup.string(),
  recipientBIN: Yup.string(),
  recipientName: Yup.string(),
  amount: Yup.number()
    .min(0.01, 'Минимальное значение должно быть больше 0.01')
    .required('Сумма обязательна'),
  paymentPurpose: Yup.string()
    .required('Назначение платежа обязательно'),
  employees: Yup.array()
    .min(1, 'Необходимо добавить хотя бы одного сотрудника')
    .required('Список сотрудников обязателен'),
});

const PaymentForm = ({ open, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [employeeListOpen, setEmployeeListOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const formikRef = useRef(null);

  // Имитация загрузки данных с сервера
  useEffect(() => {
    if (open) {
      setLoading(true);
      // Используем mock API для получения справочника сотрудников
      employeeAPI.getAll()
        .then(employees => {
          setAvailableEmployees(employees);
        })
        .catch(error => {
          console.error('Error loading employees:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const getKNPByPaymentType = (paymentType) => {
    switch (paymentType) {
      case PAYMENT_TYPES.MANDATORY:
        return KNP_CODES.MANDATORY;
      case PAYMENT_TYPES.VOLUNTARY:
        return KNP_CODES.VOLUNTARY;
      case PAYMENT_TYPES.PROFESSIONAL:
        return KNP_CODES.PROFESSIONAL;
      default:
        return { code: '', name: '' };
    }
  };

  const handleAddEmployee = (employee) => {
    if (!formikRef.current) return;
    
    const newEmployees = [...formikRef.current.values.employees, employee];
    formikRef.current.setFieldValue('employees', newEmployees);
    setEmployeeDialogOpen(false);
  };

  const handleAddToDirectory = (employee) => {
    // Проверяем, нет ли уже такого сотрудника в справочнике
    const existingEmployee = availableEmployees.find(emp => emp.iin === employee.iin);
    if (!existingEmployee) {
      setAvailableEmployees(prev => [...prev, employee]);
    }
  };

  const handleEmployeeEdit = (employeeId, updatedEmployee, formik) => {
    const updatedEmployees = formik.values.employees.map(emp => 
      emp.id === employeeId ? updatedEmployee : emp
    );
    formik.setFieldValue('employees', updatedEmployees);
  };

  const handleEmployeeDelete = (employeeId, formik) => {
    const filteredEmployees = formik.values.employees.filter(emp => emp.id !== employeeId);
    formik.setFieldValue('employees', filteredEmployees);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Используем mock API для отправки платежа
      await paymentAPI.create(values);
      onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Можно добавить обработку ошибок через состояние
    } finally {
      setLoading(false);
    }
  };

  if (loading && open) {
    return (
      <Dialog open={open} maxWidth="lg" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Загрузка данных...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <Formik
          initialValues={DEFAULT_FORM_VALUES}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {(formik) => {
            // Сохраняем ссылку на formik
            formikRef.current = formik;
            
            const knpData = getKNPByPaymentType(formik.values.paymentType);
            
            return (
              <Form>
                {/* Автоматический подсчет суммы */}
                <AutoCalculateAmount />
                
                <DialogTitle>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    Создать Пенсионный платеж
                    <IconButton onClick={onClose}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                
                <DialogContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {/* Номер документа */}
                    <TextField
                      name="documentNumber"
                      label="Номер документа *"
                      value={formik.values.documentNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.documentNumber && Boolean(formik.errors.documentNumber)}
                      helperText={formik.touched.documentNumber && formik.errors.documentNumber}
                      sx={{ width: '200px' }}
                    />

                    {/* Тип платежа в бюджет */}
                    <FormControl sx={{ width: '300px' }}>
                      <InputLabel>Тип платежа в бюджет *</InputLabel>
                      <Select
                        name="paymentType"
                        value={formik.values.paymentType}
                        onChange={formik.handleChange}
                        error={formik.touched.paymentType && Boolean(formik.errors.paymentType)}
                      >
                        {Object.values(PAYMENT_TYPES).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.paymentType && formik.errors.paymentType && (
                        <FormHelperText error>{formik.errors.paymentType}</FormHelperText>
                      )}
                    </FormControl>

                    <FormControlLabel
                      control={<Checkbox />}
                      label="Пеня"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>

                  {/* Отправитель */}
                  <Typography variant="h6" gutterBottom>
                    Отправитель
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Счет списания *</InputLabel>
                    <Select
                      name="senderAccount"
                      value={formik.values.senderAccount}
                      onChange={formik.handleChange}
                      error={formik.touched.senderAccount && Boolean(formik.errors.senderAccount)}
                    >
                      <MenuItem value="KZ50551Z127012909KZT">KZ50551Z127012909KZT</MenuItem>
                    </Select>
                    {formik.touched.senderAccount && formik.errors.senderAccount && (
                      <FormHelperText error>{formik.errors.senderAccount}</FormHelperText>
                    )}
                  </FormControl>

                  {/* Фактический плательщик */}
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.isActualPayer}
                          onChange={(e) => formik.setFieldValue('isActualPayer', e.target.checked)}
                        />
                      }
                      label="Фактический плательщик"
                    />
                    
                    {formik.values.isActualPayer && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                          name="actualPayerBIN"
                          label="БИН/ИИН отправителя"
                          value={formatIIN(formik.values.actualPayerBIN)}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '');
                            if (cleaned.length <= 12) {
                              formik.setFieldValue('actualPayerBIN', cleaned);
                            }
                          }}
                          onBlur={formik.handleBlur}
                          error={formik.touched.actualPayerBIN && Boolean(formik.errors.actualPayerBIN)}
                          helperText={formik.touched.actualPayerBIN && formik.errors.actualPayerBIN}
                          sx={{ flex: 1 }}
                        />
                        
                        <TextField
                          name="actualPayerName"
                          label="Наименование фактического плательщика"
                          value={formik.values.actualPayerName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.actualPayerName && Boolean(formik.errors.actualPayerName)}
                          helperText={formik.touched.actualPayerName && formik.errors.actualPayerName}
                          sx={{ flex: 1 }}
                        />
                        
                        <RadioGroup
                          row
                          sx={{ alignItems: 'center', ml: 2 }}
                          defaultValue="ИП"
                        >
                          <FormControlLabel value="ИП" control={<Radio />} label="ИП" />
                          <FormControlLabel value="ФЛ" control={<Radio />} label="ФЛ" />
                        </RadioGroup>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Получатель */}
                  <Typography variant="h6" gutterBottom>
                    Получатель
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      name="recipientAccount"
                      label="Счет зачисления *"
                      value={formik.values.recipientAccount}
                      sx={{ flex: 1 }}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    
                    <TextField
                      name="recipientBIN"
                      label="БИН налогового органа *"
                      value={formik.values.recipientBIN}
                      sx={{ flex: 1 }}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Box>

                  <TextField
                    name="recipientName"
                    label="Наименование *"
                    value={formik.values.recipientName}
                    fullWidth
                    sx={{ mb: 2 }}
                    InputProps={{
                      readOnly: true,
                    }}
                  />

                  <Divider sx={{ my: 2 }} />

                  {/* Детали платежа */}
                  <Typography variant="h6" gutterBottom>
                    Детали платежа
                  </Typography>
                  
                  <TextField
                    name="amount"
                    label="Сумма заполняется автоматически *"
                    type="number"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    helperText={(formik.touched.amount && formik.errors.amount) || 'Минимальное значение должно быть больше 0.01'}
                    fullWidth
                    sx={{ mb: 2 }}
                    InputProps={{
                      readOnly: true,
                    }}
                  />

                  {/* КНП */}
                  <Typography variant="h6" gutterBottom>
                    КНП: {knpData.code}. {knpData.name}
                  </Typography>
                  
                  <TextField
                    name="paymentPurpose"
                    label="Назначение платежа *"
                    multiline
                    rows={3}
                    value={formik.values.paymentPurpose}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.paymentPurpose && Boolean(formik.errors.paymentPurpose)}
                    helperText={formik.touched.paymentPurpose && formik.errors.paymentPurpose}
                    fullWidth
                    sx={{ mb: 2 }}
                    inputProps={{ maxLength: 250 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {formik.values.paymentPurpose.length} / 250
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Divider sx={{ my: 2 }} />

                  {/* Список сотрудников */}
                  <Typography variant="h6" gutterBottom>
                    Список сотрудников
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={() => setEmployeeDialogOpen(true)}
                      sx={{ bgcolor: '#4caf50' }}
                    >
                      Добавить сотрудника
                    </Button>
                    <Button 
                      variant="outlined"
                      onClick={() => setEmployeeListOpen(true)}
                    >
                      Справочник
                    </Button>
                  </Box>

                  {formik.errors.employees && typeof formik.errors.employees === 'string' && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {formik.errors.employees}
                    </Alert>
                  )}

                  <EmployeeList
                    employees={formik.values.employees}
                    onEdit={(employeeId, updatedEmployee) => handleEmployeeEdit(employeeId, updatedEmployee, formik)}
                    onDelete={(employeeId) => handleEmployeeDelete(employeeId, formik)}
                  />
                </DialogContent>

                <DialogActions>
                  <Button 
                    type="submit" 
                    variant="contained"
                    disabled={loading || formik.values.employees.length === 0}
                    sx={{ bgcolor: '#4caf50' }}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Сохранить'}
                  </Button>
                </DialogActions>
              </Form>
            );
          }}
        </Formik>
      </Dialog>

      {/* Диалог добавления сотрудника */}
      <AddEmployeeDialog
        open={employeeDialogOpen}
        onClose={() => setEmployeeDialogOpen(false)}
        onSubmit={handleAddEmployee}
        onAddToDirectory={handleAddToDirectory}
      />

      {/* Справочник сотрудников */}
      <EmployeeDirectoryDialog
        open={employeeListOpen}
        onClose={() => setEmployeeListOpen(false)}
        employees={availableEmployees}
        onEmployeeSelect={(newEmployeesToAdd) => {
          // Используем ref для доступа к formik
          if (formikRef.current) {
            const currentEmployees = formikRef.current.values.employees || [];
            console.log('Текущие сотрудники перед добавлением:', currentEmployees.length);
            console.log('Сотрудники из справочника:', newEmployeesToAdd.length);
            
            const updatedEmployees = [...currentEmployees];
            
            newEmployeesToAdd.forEach(emp => {
              // Проверяем, нет ли уже такого сотрудника (по ID)
              if (!updatedEmployees.find(e => e.id === emp.id)) {
                updatedEmployees.push(emp);
              }
            });
            
            console.log('Итоговое количество сотрудников:', updatedEmployees.length);
            formikRef.current.setFieldValue('employees', updatedEmployees);
          }
          setEmployeeListOpen(false);
        }}
        onEmployeeEdit={(employeeId, updatedEmployee) => {
          const updatedAvailable = availableEmployees.map(emp =>
            emp.id === employeeId ? updatedEmployee : emp
          );
          setAvailableEmployees(updatedAvailable);
        }}
        onEmployeeDelete={(employeeId) => {
          const filteredAvailable = availableEmployees.filter(emp => emp.id !== employeeId);
          setAvailableEmployees(filteredAvailable);
        }}
      />
    </>
  );
};

export default PaymentForm;
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmployeeList from './EmployeeList';

const EmployeeDirectoryDialog = ({ 
  open, 
  onClose, 
  employees, 
  onEmployeeSelect,
  onEmployeeEdit,
  onEmployeeDelete 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  
  // Очищаем выбор при открытии диалога
  React.useEffect(() => {
    if (open) {
      setSelectedEmployees([]);
      setSearchQuery('');
    }
  }, [open]);
  
  const filteredEmployees = employees.filter(employee => 
    employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.iin.includes(searchQuery.replace(/\s/g, ''))
  );

  const handleSelect = () => {
    // Кнопка "Выбрать" выбирает всех отфильтрованных сотрудников для удобства
    const allFilteredEmployees = filteredEmployees;
    setSelectedEmployees(allFilteredEmployees);
  };

  const handleDelete = () => {
    // Логика для удаления выбранных сотрудников
    selectedEmployees.forEach(employee => {
      onEmployeeDelete(employee.id);
    });
    setSelectedEmployees([]);
  };

  const handleApply = () => {
    // Применяем только выбранных сотрудников
    console.log('Применяем сотрудников из справочника:', selectedEmployees.length);
    console.log('Выбранные сотрудники:', selectedEmployees.map(e => e.fullName));
    
    onEmployeeSelect(selectedEmployees);
    setSelectedEmployees([]); // Очищаем выбор после применения
    onClose();
  };

  const handleSelectionChange = (selected) => {
    setSelectedEmployees(selected);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Справочник сотрудников
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#4caf50' }}
            onClick={handleSelect}
          >
            Выбрать
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleDelete}
            disabled={selectedEmployees.length === 0}
          >
            Удалить
          </Button>
          <TextField
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ ml: 'auto', minWidth: 200 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Выбрано: {selectedEmployees.length} сотрудников
        </Typography>

        <EmployeeList
          employees={filteredEmployees}
          onEdit={onEmployeeEdit}
          onDelete={onEmployeeDelete}
          selectable={true}
          onSelectionChange={handleSelectionChange}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>
        <Button 
          variant="contained"
          onClick={handleApply}
          sx={{ bgcolor: '#4caf50' }}
          disabled={selectedEmployees.length === 0}
        >
          Применить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeDirectoryDialog;
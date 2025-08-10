import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { MONTHS, YEARS_RANGE } from '../../constants';
import { formatIIN, formatAmount } from '../../utils/formatters';

const EmployeeList = ({ employees, onEdit, onDelete, selectable = false, onSelectionChange }) => {
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Защита от некорректных данных
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const handleEditStart = (employeeId) => {
    setEditingId(employeeId);
  };

  const handleEditSave = (employee, updatedData) => {
    onEdit(employee.id, { ...employee, ...updatedData });
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleSelectionChange = (employeeId, checked) => {
    let newSelection;
    if (checked) {
      newSelection = [...selectedEmployees, employeeId];
    } else {
      newSelection = selectedEmployees.filter(id => id !== employeeId);
    }
    setSelectedEmployees(newSelection);
    
    if (onSelectionChange) {
      const selectedEmployeeObjects = safeEmployees.filter(emp => newSelection.includes(emp.id));
      onSelectionChange(selectedEmployeeObjects);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = safeEmployees.map(emp => emp.id);
      setSelectedEmployees(allIds);
      if (onSelectionChange) {
        onSelectionChange(safeEmployees);
      }
    } else {
      setSelectedEmployees([]);
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };

  const months = MONTHS;
  const years = YEARS_RANGE;

  if (!safeEmployees || safeEmployees.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Сотрудники не добавлены
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < safeEmployees.length}
                  checked={safeEmployees.length > 0 && selectedEmployees.length === safeEmployees.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
            )}
            <TableCell>ФИО</TableCell>
            <TableCell>ИИН</TableCell>
            <TableCell>Месяц отчисления</TableCell>
            <TableCell>Год отчисления</TableCell>
            <TableCell>Сумма</TableCell>
            <TableCell align="center">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {safeEmployees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              isEditing={editingId === employee.id}
              onEditStart={handleEditStart}
              onEditSave={handleEditSave}
              onEditCancel={handleEditCancel}
              onDelete={onDelete}
              selectable={selectable}
              selected={selectedEmployees.includes(employee.id)}
              onSelectionChange={handleSelectionChange}
              months={months}
              years={years}
              formatIIN={formatIIN}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const EmployeeRow = ({
  employee,
  isEditing,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
  selectable,
  selected,
  onSelectionChange,
  months,
  years,
  formatIIN
}) => {
  const [editData, setEditData] = useState({
    month: employee.month || 7,
    year: employee.year || 2025,
    amount: employee.amount || 0
  });

  React.useEffect(() => {
    if (isEditing) {
      setEditData({
        month: employee.month || 7,
        year: employee.year || 2025,
        amount: employee.amount || 0
      });
    }
  }, [isEditing, employee]);

  const handleSave = () => {
    onEditSave(employee, editData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onEditCancel();
    }
  };

  return (
    <TableRow>
      {selectable && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={(e) => onSelectionChange(employee.id, e.target.checked)}
          />
        </TableCell>
      )}
      <TableCell>{employee.fullName}</TableCell>
      <TableCell>{formatIIN(employee.iin)}</TableCell>
      <TableCell>
        {isEditing ? (
          <Select
            value={editData.month}
            onChange={(e) => setEditData({ ...editData, month: e.target.value })}
            size="small"
            sx={{ minWidth: 100 }}
          >
            {months.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        ) : (
          months.find(m => m.value === employee.month)?.label || 'Июль'
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Select
            value={editData.year}
            onChange={(e) => setEditData({ ...editData, year: e.target.value })}
            size="small"
            sx={{ minWidth: 80 }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        ) : (
          employee.year || '2025'
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <TextField
            type="number"
            value={editData.amount}
            onChange={(e) => setEditData({ ...editData, amount: Number(e.target.value) })}
            onKeyDown={handleKeyPress}
            size="small"
            sx={{ minWidth: 100 }}
          />
        ) : (
          formatAmount(employee.amount) || '0'
        )}
      </TableCell>
      <TableCell align="center">
        {!selectable && (
          <>
            {isEditing ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={handleSave} color="primary">
                  ✓
                </IconButton>
                <IconButton size="small" onClick={onEditCancel} color="secondary">
                  ✗
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={() => onEditStart(employee.id)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(employee.id)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </>
        )}
        {selectable && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={() => onEditStart(employee.id)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(employee.id)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
};

export default EmployeeList;
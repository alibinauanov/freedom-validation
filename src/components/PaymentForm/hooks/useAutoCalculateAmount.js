import React from 'react';

// Хук для автоматического подсчета суммы из сотрудников
export const useAutoCalculateAmount = (formik) => {
  React.useEffect(() => {
    const totalAmount = formik.values.employees.reduce((sum, emp) => sum + (emp.amount || 0), 0);
    if (totalAmount !== formik.values.amount) {
      formik.setFieldValue('amount', totalAmount);
    }
  }, [formik.values.employees, formik]);
  
  return null;
};

export default useAutoCalculateAmount;
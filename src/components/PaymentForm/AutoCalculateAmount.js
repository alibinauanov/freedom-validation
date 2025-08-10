import React from 'react';
import { useFormikContext } from 'formik';

const AutoCalculateAmount = () => {
  const formik = useFormikContext();

  React.useEffect(() => {
    const totalAmount = formik.values.employees.reduce((sum, emp) => sum + (emp.amount || 0), 0);
    if (totalAmount !== formik.values.amount) {
      formik.setFieldValue('amount', totalAmount);
    }
  }, [formik.values.employees, formik]);

  return null;
};

export default AutoCalculateAmount;
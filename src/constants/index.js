// Константы приложения

export const PAYMENT_TYPES = {
  MANDATORY: 'Обязательный',
  VOLUNTARY: 'Добровольный', 
  PROFESSIONAL: 'Профессиональный'
};

export const KNP_CODES = {
  MANDATORY: {
    code: '010',
    name: 'Обязательные пенсионные взносы'
  },
  VOLUNTARY: {
    code: '013', 
    name: 'Добровольные пенсионные взносы'
  },
  PROFESSIONAL: {
    code: '015',
    name: 'Обязательные профессиональные пенсионные взносы'
  }
};

export const MONTHS = [
  { value: 1, label: 'Январь' },
  { value: 2, label: 'Февраль' },
  { value: 3, label: 'Март' },
  { value: 4, label: 'Апрель' },
  { value: 5, label: 'Май' },
  { value: 6, label: 'Июнь' },
  { value: 7, label: 'Июль' },
  { value: 8, label: 'Август' },
  { value: 9, label: 'Сентябрь' },
  { value: 10, label: 'Октябрь' },
  { value: 11, label: 'Ноябрь' },
  { value: 12, label: 'Декабрь' },
];

export const RESIDENCE_TYPES = {
  RESIDENT: 'KZ',
  NON_RESIDENT: 'Пусто'
};

export const CURRENT_YEAR = new Date().getFullYear();

export const YEARS_RANGE = Array.from(
  { length: 10 }, 
  (_, i) => CURRENT_YEAR - 5 + i
);

export const DEFAULT_FORM_VALUES = {
  documentNumber: '3644',
  paymentType: PAYMENT_TYPES.MANDATORY,
  senderAccount: 'KZ50551Z127012909KZT',
  isActualPayer: false,
  actualPayerBIN: '',
  actualPayerName: '',
  recipientAccount: 'KZ12009NPS041360981б',
  recipientBIN: '160440007161',
  recipientName: 'НАО Государственная корпорация "Правительство для граждан"',
  amount: 0,
  paymentPurpose: '010. Обязательные пенсионные взносы',
  employees: []
};

export const API_ENDPOINTS = {
  EMPLOYEES: '/api/employees',
  PAYMENTS: '/api/payments',
  VALIDATION: '/api/validate'
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Поле обязательно для заполнения',
  INVALID_IIN: 'Неверный формат ИИН',
  INVALID_AMOUNT: 'Неверная сумма',
  INVALID_ACCOUNT: 'Неверный формат счета',
  MIN_AMOUNT: 'Минимальная сумма должна быть больше 0.01'
};
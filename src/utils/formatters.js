// Форматирует ИИН в формате XXX XXX XXX XXX
export const formatIIN = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,3})$/);
  if (match) {
    return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
  }
  return cleaned;
};

// Очищает ИИН от пробелов и оставляет только цифры
export const cleanIIN = (value) => {
  return value ? value.replace(/\D/g, '') : '';
};

// Валидация ИИН по алгоритму
export const validateIIN = (iin) => {
  if (!iin || iin.length !== 12) return false;
  
  const digits = iin.split('').map(Number);
  
  // Проверка контрольной суммы для первых 11 цифр
  const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const sum1 = digits.slice(0, 11).reduce((sum, digit, index) => sum + digit * weights1[index], 0);
  let controlSum = sum1 % 11;
  
  if (controlSum === 10) {
    const weights2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
    const sum2 = digits.slice(0, 11).reduce((sum, digit, index) => sum + digit * weights2[index], 0);
    controlSum = sum2 % 11;
    if (controlSum === 10) controlSum = 0;
  }
  
  return controlSum === digits[11];
};

// Извлекает дату рождения из ИИН
export const getDateFromIIN = (iin) => {
  if (!iin || iin.length < 6) return '';
  
  const year = iin.substring(0, 2);
  const month = iin.substring(2, 4);
  const day = iin.substring(4, 6);
  
  // Определяем век по 7-й цифре
  const centuryDigit = parseInt(iin[6]);
  let fullYear;
  
  if (centuryDigit >= 1 && centuryDigit <= 2) {
    fullYear = '19' + year;
  } else if (centuryDigit >= 3 && centuryDigit <= 4) {
    fullYear = '20' + year;
  } else {
    return '';
  }
  
  return `${fullYear}-${month}-${day}`;
};

// Форматирует сумму с разделением тысяч
export const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '';
  return Number(amount).toLocaleString('ru-RU');
};

// Парсит сумму из строки с разделителями
export const parseAmount = (amountString) => {
  if (!amountString) return 0;
  return Number(amountString.replace(/[^\d.-]/g, ''));
};

// Генерирует уникальный ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Задержка для имитации API вызовов
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Проверяет, является ли объект пустым
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Глубокое клонирование объекта
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
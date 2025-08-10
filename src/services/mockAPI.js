import { delay, generateId } from '../utils/formatters';

// Имитация базы данных сотрудников
let employeesDB = [
  {
    id: '1',
    iin: '930420302182',
    fullName: 'Журсинбеков Максат Нурланович',
    firstName: 'Максат',
    lastName: 'Журсинбеков',
    middleName: 'Нурланович',
    residence: 'Пусто',
    amount: 250000,
    month: 7,
    year: 2025,
    birthDate: '1993-04-20',
    isResident: false
  },
  {
    id: '2', 
    iin: '930113400556',
    fullName: 'Шабден Ботакез Алимжанкызы',
    firstName: 'Ботакез',
    lastName: 'Шабден',
    middleName: 'Алимжанкызы',
    residence: 'KZ',
    amount: 0,
    month: 7,
    year: 2025,
    birthDate: '1993-01-13',
    isResident: true
  },
  {
    id: '3',
    iin: '710727050464', 
    fullName: 'Керр Джейсон Макс',
    firstName: 'Джейсон',
    lastName: 'Керр',
    middleName: 'Макс',
    residence: 'Пусто',
    amount: 0,
    month: 7,
    year: 2025,
    birthDate: '1971-07-27',
    isResident: false
  },
  {
    id: '4',
    iin: '680629300199',
    fullName: 'Узаков Тахирджан Анварович', 
    firstName: 'Тахирджан',
    lastName: 'Узаков',
    middleName: 'Анварович',
    residence: 'Пусто',
    amount: 2000000,
    month: 7,
    year: 2025,
    birthDate: '1968-06-29',
    isResident: false
  }
];

// Имитация базы данных платежей
let paymentsDB = [];

// API для работы с сотрудниками
export const employeeAPI = {
  // Получить всех сотрудников
  async getAll() {
    await delay(500); // Имитация задержки сети
    return [...employeesDB];
  },

  // Получить сотрудника по ID
  async getById(id) {
    await delay(300);
    const employee = employeesDB.find(emp => emp.id === id);
    if (!employee) {
      throw new Error('Сотрудник не найден');
    }
    return employee;
  },

  // Создать нового сотрудника
  async create(employeeData) {
    await delay(800);
    
    // Проверка на дублирование ИИН
    const existingEmployee = employeesDB.find(emp => emp.iin === employeeData.iin);
    if (existingEmployee) {
      throw new Error('Сотрудник с таким ИИН уже существует');
    }

    const newEmployee = {
      ...employeeData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    employeesDB.push(newEmployee);
    return newEmployee;
  },

  // Обновить сотрудника
  async update(id, updatedData) {
    await delay(600);
    
    const index = employeesDB.findIndex(emp => emp.id === id);
    if (index === -1) {
      throw new Error('Сотрудник не найден');
    }

    employeesDB[index] = { ...employeesDB[index], ...updatedData, updatedAt: new Date().toISOString() };
    return employeesDB[index];
  },

  // Удалить сотрудника
  async delete(id) {
    await delay(400);
    
    const index = employeesDB.findIndex(emp => emp.id === id);
    if (index === -1) {
      throw new Error('Сотрудник не найден');
    }

    const deletedEmployee = employeesDB.splice(index, 1)[0];
    return deletedEmployee;
  },

  // Поиск сотрудников
  async search(query) {
    await delay(300);
    
    const lowerQuery = query.toLowerCase();
    return employeesDB.filter(emp => 
      emp.fullName.toLowerCase().includes(lowerQuery) ||
      emp.iin.includes(query.replace(/\s/g, ''))
    );
  }
};

// API для работы с платежами
export const paymentAPI = {
  // Получить все платежи
  async getAll() {
    await delay(600);
    return [...paymentsDB];
  },

  // Создать новый платеж
  async create(paymentData) {
    await delay(1200); // Более долгая операция
    
    // Валидация данных
    if (!paymentData.employees || paymentData.employees.length === 0) {
      throw new Error('Необходимо добавить хотя бы одного сотрудника');
    }

    if (paymentData.amount <= 0) {
      throw new Error('Сумма должна быть больше 0');
    }

    const newPayment = {
      ...paymentData,
      id: generateId(),
      status: 'created',
      createdAt: new Date().toISOString()
    };

    paymentsDB.push(newPayment);
    return newPayment;
  },

  // Валидация платежа
  async validate(paymentData) {
    await delay(800);
    
    const errors = {};

    if (!paymentData.documentNumber) {
      errors.documentNumber = 'Номер документа обязателен';
    }

    if (!paymentData.paymentType) {
      errors.paymentType = 'Тип платежа обязателен';
    }

    if (!paymentData.employees || paymentData.employees.length === 0) {
      errors.employees = 'Необходимо добавить хотя бы одного сотрудника';
    }

    if (Object.keys(errors).length > 0) {
      const error = new Error('Validation failed');
      error.errors = errors;
      throw error;
    }

    return { valid: true };
  }
};

// API для справочников
export const referenceAPI = {
  // Получить список банковских счетов
  async getAccounts() {
    await delay(400);
    return [
      'KZ50551Z127012909KZT',
      'KZ86125KZT3006123456',
      'KZ44185EUR3000987654'
    ];
  },

  // Получить информацию о налоговом органе
  async getTaxOfficeInfo() {
    await delay(300);
    return {
      name: 'НАО Государственная корпорация "Правительство для граждан"',
      bin: '160440007161',
      account: 'KZ12009NPS041360981б'
    };
  }
};

// Утилиты для тестирования
export const mockUtils = {
  // Сброс базы данных к начальному состоянию
  resetDatabase() {
    employeesDB = [
      {
        id: '1',
        iin: '930420302182',
        fullName: 'Журсинбеков Максат Нурланович',
        firstName: 'Максат',
        lastName: 'Журсинбеков', 
        middleName: 'Нурланович',
        residence: 'Пусто',
        amount: 250000,
        month: 7,
        year: 2025,
        birthDate: '1993-04-20',
        isResident: false
      },
      {
        id: '2', 
        iin: '930113400556',
        fullName: 'Шабден Ботакез Алимжанкызы',
        firstName: 'Ботакез',
        lastName: 'Шабден',
        middleName: 'Алимжанкызы',
        residence: 'KZ',
        amount: 0,
        month: 7,
        year: 2025,
        birthDate: '1993-01-13',
        isResident: true
      },
      {
        id: '3',
        iin: '710727050464', 
        fullName: 'Керр Джейсон Макс',
        firstName: 'Джейсон',
        lastName: 'Керр',
        middleName: 'Макс',
        residence: 'Пусто',
        amount: 0,
        month: 7,
        year: 2025,
        birthDate: '1971-07-27',
        isResident: false
      },
      {
        id: '4',
        iin: '680629300199',
        fullName: 'Узаков Тахирджан Анварович', 
        firstName: 'Тахирджан',
        lastName: 'Узаков',
        middleName: 'Анварович',
        residence: 'Пусто',
        amount: 2000000,
        month: 7,
        year: 2025,
        birthDate: '1968-06-29',
        isResident: false
      }
    ];
    paymentsDB = [];
  },

  // Добавить тестовых сотрудников
  addTestEmployees(count = 5) {
    for (let i = 0; i < count; i++) {
      employeesDB.push({
        id: generateId(),
        iin: `${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`,
        fullName: `Тестовый Сотрудник ${i + 1}`,
        firstName: `Сотрудник${i + 1}`,
        lastName: 'Тестовый',
        middleName: 'Тестович',
        residence: Math.random() > 0.5 ? 'KZ' : 'Пусто',
        amount: Math.floor(Math.random() * 1000000),
        month: Math.floor(Math.random() * 12) + 1,
        year: 2024 + Math.floor(Math.random() * 2),
        birthDate: '1990-01-01',
        isResident: Math.random() > 0.5
      });
    }
  }
};

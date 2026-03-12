export function generateUser() {
  const timestamp = Date.now();

  return {
    firstName: 'Pavel',
    lastName: `Test${timestamp}`,
    email: `pavel.test.${timestamp}@example.com`,
    password: 'StrongPassword123!',
    birthMonth: 'Januar',
    birthDay: '15',
    birthYear: '1995',
    gender: 'Mand',
  };
}
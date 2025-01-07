export function validateCpf(cpf) {
  if (/^(.)\1+$/.test(cpf)) return false; // Verifica se todos os dígitos são iguais

  let sum = 0;
  let remainder;

  // Validação do primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf[i - 1]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf[i - 1]) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;

  return remainder === parseInt(cpf[10]);
}

export function validateCnpj(cnpj) {
  if (/^(.)\1+$/.test(cnpj)) return false; // Verifica se todos os dígitos são iguais

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const calculateCheckDigit = (cnpj, weights) => {
    const sum = cnpj
      .slice(0, weights.length)
      .split("")
      .reduce((acc, digit, index) => acc + digit * weights[index], 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstCheckDigit = calculateCheckDigit(cnpj, weights1);
  const secondCheckDigit = calculateCheckDigit(cnpj, weights2);

  return (
    firstCheckDigit === parseInt(cnpj[12]) &&
    secondCheckDigit === parseInt(cnpj[13])
  );
}

export function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^(?:\+55\s?)?\(?[1-9]{2}\)?\s?[9]?[6-9]\d{3}-?\d{4}$/;
  return phoneRegex.test(phone);
}

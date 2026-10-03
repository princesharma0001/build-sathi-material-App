export const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
  
    if (!phone) {
      return 'Mobile number is required';
    }
  
    if (!phoneRegex.test(phone)) {
      return 'Enter a valid 10 digit mobile number';
    }
  
    return '';
  };
  
  export const validateName = (name: string) => {
    if (!name.trim()) {
      return 'Name is required';
    }
  
    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters';
    }
  
    return '';
  };
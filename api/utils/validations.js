export const validateEmail = (email) => {
  if (!email) return false;

  // Standard email regex + custom rules
  const emailRegex = /^[a-zA-Z]+@[a-zA-Z]+\.[a-zA-Z]+$/;

  return emailRegex.test(email.trim());
};

export const validateFullName = (fullName) => {
  if (!fullName) {
    return { valid: false, message: "Full name is required" };
  }

  // Check for leading/trailing spaces
  if (fullName !== fullName.trim()) {
    return {
      valid: false,
      message: "Remove spaces before/after the name",
    };
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return {
      valid: false,
      message: "Name must be 2-100 characters",
    };
  }

  if (!/^[\p{L}' -]+$/u.test(fullName)) {
    return {
      valid: false,
      message: "Use only letters, hyphens (-), or apostrophes (')",
    };
  }

  // Check for consecutive spaces or invalid space usage
  if (/\s{2,}/.test(fullName) || /[-']\s|[\s-']$/.test(fullName)) {
    return {
      valid: false,
      message: "Fix spacing between names",
    };
  }

  return { valid: true };
};

export const validateUsername = (username) => {
  if (!username) {
    return { valid: false, message: "Username is required" };
  }

  // Disallow any whitespace
  if (/\s/.test(username)) {
    return { valid: false, message: "Username cannot contain spaces" };
  }

  // Must start with a letter, followed by letters or numbers
  const usernameRegex = /^[a-zA-Z]+[a-zA-Z0-9]*$/;

  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      message:
        "Username must start with a letter and can only contain letters and numbers (no symbols)",
    };
  }

  // Length check (3-30 chars)
  if (username.length < 3 || username.length > 30) {
    return {
      valid: false,
      message: "Username must be 3-30 characters long",
    };
  }

  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: "Password is required" };
  }

  // Disallow any whitespace
  if (/\s/.test(password)) {
    return {
      valid: false,
      message: "Password cannot contain spaces",
    };
  }

  if (password.length < 12) {
    return {
      valid: false,
      message: "Password must be at least 12 characters",
    };
  }

  return { valid: true };
};

export const validatePHMobile = (phone) => {
  if (!phone) {
    return { valid: false, message: "Phone number is required" };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length !== 11) {
    return {
      valid: false,
      message: "Phone number must be 11 digits (ex: 099987654123)",
    };
  }

  if (!digitsOnly.startsWith("09")) {
    return {
      valid: false,
      message: "Phone number must start with 09",
    };
  }

  return { valid: true };
};

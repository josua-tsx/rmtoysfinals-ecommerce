export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: "Email is required" };
  }

  const trimmedEmail = email.trim();
  if (email !== trimmedEmail) {
    return { valid: false, message: "Remove spaces before/after the email" };
  }

  // Split email into local and domain parts
  const parts = trimmedEmail.split("@");

  // Check if email has exactly one @
  if (parts.length !== 2) {
    return { valid: false, message: "Email must contain exactly one @" };
  }

  const [localPart, domain] = parts;

  // Validate local part (no consecutive dots, only letters, numbers, and single dots)
  if (!/^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/.test(localPart)) {
    return {
      valid: false,
      message:
        "Local part (before @) can only contain letters, numbers, and single dots (no consecutive dots)",
    };
  }

  // Validate domain part (no consecutive dots, valid TLD, no repeated 'm' in .com)
  if (!/^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/.test(domain)) {
    return {
      valid: false,
      message:
        "Domain must be valid (no consecutive dots, valid TLD like .com, .net)",
    };
  }

  // Extra check: If domain ends with .com, ensure no extra 'm's (blocks .comm, .commm, etc.)
  if (/\.com[^a-zA-Z]|\.comm+$/i.test(domain)) {
    return {
      valid: false,
      message: "Invalid domain (.com should not have extra letters)",
    };
  }

  return { valid: true };
};

export const validateFullName = (fullName) => {
  if (!fullName) {
    return { valid: false, message: "Full name is required" };
  }

  // Trim and check for leading/trailing spaces
  const trimmedName = fullName.trim();
  if (fullName !== trimmedName) {
    return { valid: false, message: "Remove spaces before/after the name" };
  }

  // Length check (2-100 chars)
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return { valid: false, message: "Name must be 2-100 characters" };
  }

  // Allow letters, apostrophes, hyphens, spaces, and SINGLE dots
  if (!/^[\p{L}' .-]+$/u.test(trimmedName) || /\.{2,}/.test(trimmedName)) {
    return {
      valid: false,
      message:
        "Use only letters, spaces, hyphens (-), apostrophes ('), or single dots (.)",
    };
  }

  // Check for double spaces or invalid punctuation placement
  if (/\s{2,}/.test(trimmedName) || /[-']\s|[\s-']$/.test(trimmedName)) {
    return { valid: false, message: "Fix spacing between names" };
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

  // Check minimum length
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters",
    };
  }

  // Disallow whitespace
  if (/\s/.test(password)) {
    return {
      valid: false,
      message: "Password cannot contain spaces",
    };
  }

  // Require at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter (A-Z)",
    };
  }

  // Require at least one symbol
  if (!/[-!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one symbol (!@#$% etc.)",
    };
  }

  // Require at least one number
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number (0-9)",
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

export const validateProductName = (name) => {
  if (!name) {
    return { valid: false, message: "Product name is required" };
  }

  // Trim and check for leading/trailing spaces
  if (name !== name.trim()) {
    return {
      valid: false,
      message: "Remove spaces before/after the product name",
    };
  }

  // Length check (5-50 chars)
  if (name.length < 5 || name.length > 50) {
    return {
      valid: false,
      message: "Product name must be 5-50 characters",
    };
  }

  // Double spaces check
  if (/\s{2,}/.test(name)) {
    return {
      valid: false,
      message: "Double spaces are not allowed",
    };
  }

  // Allow letters, numbers, spaces, hyphens (-), and apostrophes (')
  if (!/^[a-zA-Z0-9 \-']+$/.test(name)) {
    return {
      valid: false,
      message:
        "Only letters, numbers, spaces, hyphens (-), and apostrophes (') are allowed",
    };
  }

  // Prevent names starting with a number
  if (/^[0-9]/.test(name)) {
    return {
      valid: false,
      message: "Product name cannot start with a number",
    };
  }

  // Prevent names starting/ending with hyphen/apostrophe
  if (/^[-']|[-']$/.test(name)) {
    return {
      valid: false,
      message:
        "Product name cannot start or end with a hyphen (-) or apostrophe (')",
    };
  }

  return { valid: true };
};

export const validateProductDescription = (desc) => {
  if (!desc) {
    return { valid: false, message: "Description is required" };
  }

  // Trim and check for leading/trailing spaces
  if (desc !== desc.trim()) {
    return {
      valid: false,
      message: "Remove spaces before/after the description",
    };
  }

  // Max length check (200 chars)
  if (desc.length > 200) {
    return {
      valid: false,
      message: "Description cannot exceed 200 characters",
    };
  }

  // Double spaces check
  if (/\s{2,}/.test(desc)) {
    return {
      valid: false,
      message: "Double spaces are not allowed",
    };
  }

  return { valid: true };
};

export const validateCategoryNamee = (name) => {
  if (!name) {
    return { valid: false, message: "Category name is required" };
  }

  // Trim and check for leading/trailing spaces
  const trimmedName = name.trim();
  if (name !== trimmedName) {
    return { valid: false, message: "Remove spaces before/after the name" };
  }

  // Length check (3-50 chars)
  if (trimmedName.length < 3 || trimmedName.length > 50) {
    return {
      valid: false,
      message: "Category name must be 3-50 characters long",
    };
  }

  // Allow letters and single spaces between words (no numbers or symbols)
  if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(trimmedName)) {
    return {
      valid: false,
      message:
        "Category name must contain only letters and single spaces between words",
    };
  }

  // Check for consecutive spaces (shouldn't happen due to trim, but just in case)
  if (/\s{2,}/.test(trimmedName)) {
    return {
      valid: false,
      message: "Use only single spaces between words",
    };
  }

  return { valid: true };
};

export const validateCategoryDescription = (desc) => {
  if (!desc) return { valid: true }; // Optional field

  const trimmedDesc = desc.trim();
  if (desc !== trimmedDesc) {
    return {
      valid: false,
      message: "Remove spaces before/after the description",
    };
  }

  if (trimmedDesc.length > 200) {
    return {
      valid: false,
      message: "Description cannot exceed 200 characters",
    };
  }

  if (/\s{2,}/.test(trimmedDesc)) {
    return { valid: false, message: "Remove double spaces" };
  }

  // Allows letters, numbers, spaces, and basic punctuation
  if (!/^[A-Za-z0-9\s.,!?-]+$/.test(trimmedDesc)) {
    return {
      valid: false,
      message: "Description contains invalid characters",
    };
  }

  return { valid: true };
};

export const validateSupplierName = (name) => {
  if (!name) {
    return { valid: false, message: "Supplier name is required" };
  }

  const trimmedName = name.trim();
  if (name !== trimmedName) {
    return { valid: false, message: "Remove spaces before/after the name" };
  }

  if (trimmedName.length < 3 || trimmedName.length > 50) {
    return {
      valid: false,
      message: "Supplier name must be 3-50 characters long",
    };
  }

  // Allow letters, numbers, spaces, and common punctuation (including . for abbreviations)
  if (!/^[A-Za-z0-9\s\-',.&()]+$/.test(trimmedName)) {
    return {
      valid: false,
      message:
        "Supplier name contains invalid characters (only letters, numbers, spaces, and -',.&() allowed)",
    };
  }

  // Prevent names starting/ending with HYPHENS/APOSTROPHES only (but allow trailing .)
  if (/^[-']|[-']$/.test(trimmedName)) {
    return {
      valid: false,
      message: "Supplier name cannot start or end with hyphens/apostrophes",
    };
  }

  return { valid: true };
};

export const validateSupplierAddress = (address) => {
  if (!address) {
    return { valid: false, message: "Address is required" };
  }

  // Trim and check for leading/trailing spaces
  const trimmedAddress = address.trim();
  if (address !== trimmedAddress) {
    return { valid: false, message: "Remove spaces before/after the address" };
  }

  // Length check (5-200 chars)
  if (trimmedAddress.length < 5 || trimmedAddress.length > 200) {
    return {
      valid: false,
      message: "Address must be 5-200 characters long",
    };
  }

  // Double spaces check
  if (/\s{2,}/.test(trimmedAddress)) {
    return {
      valid: false,
      message: "Remove double spaces in the address",
    };
  }

  // Allow letters, numbers, spaces, and basic punctuation (including #)
  if (!/^[A-Za-z0-9\s.,'#-]+$/.test(trimmedAddress)) {
    return {
      valid: false,
      message:
        "Address contains invalid characters (only letters, numbers, spaces, and .,-'# allowed)",
    };
  }

  return { valid: true };
};

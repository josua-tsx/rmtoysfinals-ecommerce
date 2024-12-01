// Helper function to check for empty fields
export const isEmpty = (value) => !value || value.trim() === "";

// VALIDATION FOR EMAIL
// EMAIL SHOULD BE ALL IN LOWERCSASE
// EMAIL SHOULD NOT HAVE NUMBER AFTER @
// EMAIL SHOULD HAVE DOMAIN
export const isValidEmail = (email) => {
  const regex = /^[A-Za-z0-9._%+-]+@[a-z]+\.[a-z]+(\.[a-z]+)*$/;
  return regex.test(email);
};


// PASSWORD SHOULD BE AT LEAST 8 CHARACTERS WITH ONE UPPERCASE AT LEAST ONE NUMBER AND SPECIAL CHARACTER
export const isValidPassword = (password) => {
  const regex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

export const isValidUsername = (username) => {
  const regex = /^[a-zA-Z]{5,50}$/;
  return regex.test(username);
};


//   console.log(isValidUsername("alllowercaseuser"));   // true (meets all criteria)
//   console.log(isValidUsername("AllLowerCaseUser"));   // false (contains uppercase letters)
//   console.log(isValidUsername("shortusername"));      // false (less than 15 characters)
//   console.log(isValidUsername("thisisavalidusername"));// true (exactly lowercase and 15+ characters)

// NUMBER SHOULD ALWAYS START WITH 09 AND SHOULD EXACT 11 numbers
export const isValidPhoneNumber = (phoneNumber) => {
  // Regex explanation:
  // ^09: Starts with 09
  // \d{9}: Followed by exactly 9 digits (making the total length 11)
  // $: Ends the string
  const regex = /^09\d{9}$/;
  return regex.test(phoneNumber);
};

//   should not have double spaces
export const validateNoDoubleSpaces = (text) => {
  // Regex to check for double spaces
  const regex = /\s{2,}/;
  return !regex.test(text); // Returns true if no double spaces, false if there are double spaces
};

// ALL LOWERCASE AND SHOULD EXCEED 50 LETTERS
export const isValidFullName = (fullName) => {
  const regex = /^[a-z\s-]{6,50}$/; // All lowercase, spaces and hyphens allowed, length between 6 and 50 characters
  return regex.test(fullName) && !/\s{2,}/.test(fullName); // No consecutive spaces
};

export const isValidText2 = (text) => {
  const regex = /^[A-Za-z\s-]{1,200}$/; // Allow uppercase, lowercase, spaces, and hyphens, max 100 characters
  return regex.test(text) && !/\s{2,}/.test(text); // No consecutive spaces
};

export const isValidText1 = (text) => {
  const regex = /^[A-Za-z\s-]{5,50}$/; // Allow uppercase, lowercase, spaces, and hyphens, length between 5 and 50 characters
  return regex.test(text) && !/\s{2,}/.test(text); // No consecutive spaces
};

export const isValidTextNoNumbers = (text) => {
  const regex = /^[A-Za-z ]{3,50}$/; // Only letters and spaces, length between 5 and 50 characters // No double spaces allowed
  return regex.test(text) && !/\s{2,}/.test(text); // Matches letters and spaces and checks for double spaces
};

export const isValidTextAllowNumbers = (text) => {
    const regex = /^[A-Za-z0-9 ]{3,50}$/; // Only letters, numbers, and spaces allowed, length between 5 and 50 characters
    return regex.test(text) && !/\s{2,}/.test(text);; // Matches letters, numbers, and spaces, and ensures no double spaces
  };

  

  export const isValidCategoryName = (name) => {
    const regex = /^[a-zA-Z\s'-]{3,50}$/;
    return regex.test(name);
  };
  
// export const handleInputChange = (setter) => (e) => {
//   const value = e.target.value;
//   // Prevent spaces as the first character
//   if (value === " " || (value.length === 1 && value[0] === " ")) {
//     return; // Block input if it's only a space or starts with a space
//   }
//   setter(value);
// };

export const handleInputChange = (setter, validator) => (e) => {
    const value = e.target.value;
  
    // Prevent spaces as the first character
    if (value === " " || (value.length === 1 && value[0] === " ")) {
      return;
    }
  
    // Apply custom validator if provided
    if (validator && !validator(value)) {
      return;
    }
  
    setter(value);
  };

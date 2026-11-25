const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  
  // Remove all non-digit characters except '+'
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with 03 and is 11 digits long, replace 0 with +92
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    return '+92' + cleaned.substring(1);
  }
  
  // If it starts with 92 without +, add +
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  
  // If it's already properly formatted starting with +92
  if (cleaned.startsWith('+92') && cleaned.length === 13) {
    return cleaned;
  }
  
  return cleaned;
};

module.exports = formatPhoneNumber;

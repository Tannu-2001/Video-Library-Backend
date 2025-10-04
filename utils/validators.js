// Validate Email
exports.isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Validate Mobile Number (10 digits)
exports.isValidMobile = (mobile) => {
    return /^[0-9]{10}$/.test(mobile);
};

// Check empty fields
exports.isEmpty = (value) => {
    return !value || value.trim() === "";
};
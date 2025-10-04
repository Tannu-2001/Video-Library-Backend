const bcrypt = require("bcrypt");

// Hash password before saving
exports.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compare plain password with hashed
exports.comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
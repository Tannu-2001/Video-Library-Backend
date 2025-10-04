// Generate a random 6 digit ID
exports.generateId = () => {
    return Math.floor(100000 + Math.random() * 900000);
};
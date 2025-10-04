exports.handleError = (res, error, message = "Something went wrong") => {
    console.error("❌ Error: ", error);
    res.status(500).json({ error: message });
};
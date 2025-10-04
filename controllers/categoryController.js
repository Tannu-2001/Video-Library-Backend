  import Category from "../models/categoryModel.js";

export const getCategories = async (req, res) => {
  try {
    const list = await Category.find().sort({ Category_name: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { Category_name } = req.body;
    if (!Category_name) return res.status(400).json({ message: "name is required" });
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: "Category exists" });
    const category = await Category.create({ name });
    res.status(201).json({ success: true, message: "Category created", category });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export default { getCategories, addCategory };
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({ isActive: true, isDeleted: false }).sort('name');
  res.json({ success: true, data: { categories } });
});

exports.getAllCategoriesAdmin = catchAsync(async (req, res) => {
  const categories = await Category.find({ isDeleted: false }).sort('name');
  res.json({ success: true, data: { categories } });
});

exports.createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;
  const category = await Category.create({ name });
  res.status(201).json({ success: true, data: { category } });
});

exports.updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
  if (!category) throw new AppError('Category not found', 404);

  const { name, isActive } = req.body;
  if (name !== undefined) category.name = name;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save(); 
  res.json({ success: true, data: { category } });
});

exports.deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
  if (!category) throw new AppError('Category not found', 404);

  category.isDeleted = true;
  category.isActive = false;
  await category.save();

  await Subcategory.updateMany(
    { categoryId: category._id },
    { isDeleted: true, isActive: false }
  );
  await Product.updateMany({ categoryId: category._id }, { isActive: false });

  res.json({ success: true, message: 'Category deleted' });
});
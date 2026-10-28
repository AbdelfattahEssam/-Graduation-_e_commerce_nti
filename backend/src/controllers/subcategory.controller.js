const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getSubcategories = catchAsync(async (req, res) => {
  const filter = { isActive: true, isDeleted: false };
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;

  const subcategories = await Subcategory.find(filter).sort('name');
  res.json({ success: true, data: { subcategories } });
});

exports.getAllSubcategoriesAdmin = catchAsync(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;

  const subcategories = await Subcategory.find(filter)
    .populate('categoryId', 'name')
    .sort('name');
  res.json({ success: true, data: { subcategories } });
});

exports.createSubcategory = catchAsync(async (req, res) => {
  const { name, categoryId } = req.body;

  const category = await Category.findOne({ _id: categoryId, isDeleted: false });
  if (!category) throw new AppError('Category not found', 404);

  const subcategory = await Subcategory.create({ name, categoryId });
  res.status(201).json({ success: true, data: { subcategory } });
});

exports.updateSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findOne({ _id: req.params.id, isDeleted: false });
  if (!subcategory) throw new AppError('Subcategory not found', 404);

  const { name, isActive } = req.body;
  if (name !== undefined) subcategory.name = name;
  if (isActive !== undefined) subcategory.isActive = isActive;

  await subcategory.save();
  res.json({ success: true, data: { subcategory } });
});

exports.deleteSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findOne({ _id: req.params.id, isDeleted: false });
  if (!subcategory) throw new AppError('Subcategory not found', 404);

  subcategory.isDeleted = true;
  subcategory.isActive = false;
  await subcategory.save();

  await Product.updateMany({ subcategoryId: subcategory._id }, { isActive: false });

  res.json({ success: true, message: 'Subcategory deleted' });
});
const fs = require('fs');
const path = require('path');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const removeImageFile = (imagePath) => {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  const full = path.join(__dirname, '..', '..', imagePath);
  fs.unlink(full, () => {});
};

const stockLabel = (stock) => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= 3) return `Only ${stock} left`;
  return null;
};

const format = (p) => {
  const obj = p.toObject ? p.toObject() : p;
  return { ...obj, stockLabel: stockLabel(obj.stock), inStock: obj.stock > 0 };
};

const validateCategories = async (categoryId, subcategoryId) => {
  const category = await Category.findOne({ _id: categoryId, isDeleted: false });
  if (!category) throw new AppError('Category not found', 404);

  const sub = await Subcategory.findOne({
    _id: subcategoryId,
    categoryId,
    isDeleted: false,
  });
  if (!sub) throw new AppError('Subcategory not found in this category', 404);
};


exports.getProducts = catchAsync(async (req, res) => {
  const { search, categoryId, subcategoryId, minPrice, maxPrice, sort } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

  const filter = { isActive: true, isDeleted: false };
  if (search) filter.$text = { $search: search };
  if (categoryId) filter.categoryId = categoryId;
  if (subcategoryId) filter.subcategoryId = subcategoryId;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    newest: { createdAt: -1 },
  };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      products: products.map(format),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

exports.getProductBySlug = catchAsync(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
    isDeleted: false,
  })
    .populate('categoryId', 'name slug')
    .populate('subcategoryId', 'name slug');

  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: { product: format(product) } });
});


exports.getAllProductsAdmin = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

  const filter = { isDeleted: false };
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      products: products.map(format),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

exports.createProduct = catchAsync(async (req, res) => {
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const { title, description, price, stock, categoryId, subcategoryId, isActive } =
      req.body || {};

    await validateCategories(categoryId, subcategoryId);

    const product = await Product.create({
      title,
      description,
      price,
      stock,
      categoryId,
      subcategoryId,
      image: imagePath,
      ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
    });

    res.status(201).json({ success: true, data: { product: format(product) } });
  } catch (err) {
    removeImageFile(imagePath); 
    throw err;
  }
});

exports.updateProduct = catchAsync(async (req, res) => {
  const newImage = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) throw new AppError('Product not found', 404);

    const body = req.body || {};
    const fields = ['title', 'description', 'price', 'stock'];
    fields.forEach((f) => {
      if (body[f] !== undefined) product[f] = body[f];
    });

    if (body.isActive !== undefined) {
      product.isActive = body.isActive === 'true' || body.isActive === true;
    }

    if (body.categoryId || body.subcategoryId) {
      const categoryId = body.categoryId || product.categoryId;
      const subcategoryId = body.subcategoryId || product.subcategoryId;
      await validateCategories(categoryId, subcategoryId);
      product.categoryId = categoryId;
      product.subcategoryId = subcategoryId;
    }

    const oldImage = product.image;
    if (newImage) product.image = newImage;

    await product.save();
    if (newImage) removeImageFile(oldImage);
    res.json({ success: true, data: { product: format(product) } });
  } catch (err) {
    removeImageFile(newImage);
    throw err;
  }
});
exports.getProductAdmin = catchAsync(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: { product: format(product) } });
});

exports.toggleActive = catchAsync(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) throw new AppError('Product not found', 404);

  product.isActive = !product.isActive;
  await product.save();

  res.json({ success: true, data: { product: format(product) } });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) throw new AppError('Product not found', 404);

  product.isDeleted = true;
  product.isActive = false;
  await product.save();

  res.json({ success: true, message: 'Product deleted' });
});
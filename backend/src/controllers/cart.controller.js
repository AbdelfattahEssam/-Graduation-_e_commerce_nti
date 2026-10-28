const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const stockLabel = (stock) => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= 3) return `Only ${stock} left`;
  return null;
};

const buildCartResponse = async (cart) => {
  const ids = cart.products.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids } });
  const map = new Map(products.map((p) => [p._id.toString(), p]));

  let changed = false;
  const items = [];

  for (const item of cart.products) {
    const p = map.get(item.productId.toString());
    const unavailable = !p || !p.isActive || p.isDeleted;

    const priceChanged = !unavailable && p.price !== item.priceAtAdd;
    if (item.isPriceChanged !== priceChanged) {
      item.isPriceChanged = priceChanged;
      changed = true;
    }

    items.push({
      productId: item.productId,
      quantity: item.quantity,
      isPriceChanged: priceChanged,
      oldPrice: item.priceAtAdd,
      currentPrice: p ? p.price : null,
      unavailable,
      product: p
        ? {
            title: p.title,
            slug: p.slug,
            image: p.image,
            stock: p.stock,
            stockLabel: stockLabel(p.stock),
          }
        : null,
      outOfStock: !unavailable && p.stock <= 0,
      exceedsStock: !unavailable && item.quantity > p.stock,
    });
  }

  if (changed) await cart.save();

  const hasIssues = items.some(
    (i) => i.unavailable || i.isPriceChanged || i.outOfStock || i.exceedsStock
  );

  const subtotal = items
    .filter((i) => !i.unavailable && !i.outOfStock)
    .reduce((sum, i) => sum + i.currentPrice * i.quantity, 0);

  return { items, subtotal, hasIssues };
};

const getOrCreateCart = async (userId) =>
  (await Cart.findOne({ clientId: userId })) ||
  (await Cart.create({ clientId: userId, products: [] }));

exports.getCart = catchAsync(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ success: true, data: await buildCartResponse(cart) });
});

exports.addItem = catchAsync(async (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  const qty = Number(quantity);
  if (!productId) throw new AppError('productId is required', 400);
  if (!Number.isInteger(qty) || qty < 1) throw new AppError('Invalid quantity', 400);

  const product = await Product.findOne({ _id: productId, isActive: true, isDeleted: false });
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock <= 0) throw new AppError('Product is out of stock', 400);

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.products.find((i) => i.productId.equals(product._id));

  const newQty = (existing ? existing.quantity : 0) + qty;
  if (newQty > product.stock) {
    throw new AppError(`Only ${product.stock} left in stock`, 400);
  }

  if (existing) {
    existing.quantity = newQty;
    existing.priceAtAdd = product.price;
    existing.isPriceChanged = false;
  } else {
    cart.products.push({ productId: product._id, quantity: qty, priceAtAdd: product.price });
  }

  await cart.save();
  res.status(201).json({ success: true, data: await buildCartResponse(cart) });
});

exports.updateItem = catchAsync(async (req, res) => {
  const qty = Number((req.body || {}).quantity);
  if (!Number.isInteger(qty) || qty < 1) throw new AppError('Invalid quantity', 400);

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.products.find((i) => i.productId.toString() === req.params.productId);
  if (!item) throw new AppError('Item not in cart', 404);

  const product = await Product.findOne({
    _id: req.params.productId,
    isActive: true,
    isDeleted: false,
  });
  if (!product) throw new AppError('Product is no longer available', 400);
  if (qty > product.stock) throw new AppError(`Only ${product.stock} left in stock`, 400);

  item.quantity = qty;
  await cart.save();
  res.json({ success: true, data: await buildCartResponse(cart) });
});

exports.acceptNewPrice = catchAsync(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.products.find((i) => i.productId.toString() === req.params.productId);
  if (!item) throw new AppError('Item not in cart', 404);

  const product = await Product.findOne({
    _id: req.params.productId,
    isActive: true,
    isDeleted: false,
  });
  if (!product) throw new AppError('Product is no longer available', 400);

  item.priceAtAdd = product.price;
  item.isPriceChanged = false;
  await cart.save();

  res.json({ success: true, data: await buildCartResponse(cart) });
});

exports.removeItem = catchAsync(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.products = cart.products.filter((i) => i.productId.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, data: await buildCartResponse(cart) });
});

exports.clearCart = catchAsync(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.products = [];
  await cart.save();
  res.json({ success: true, data: await buildCartResponse(cart) });
});


exports.mergeCart = catchAsync(async (req, res) => {
  const guestItems = Array.isArray((req.body || {}).items) ? req.body.items : [];
  const cart = await getOrCreateCart(req.user._id);

  for (const g of guestItems) {
    const qty = Number(g.quantity);
    if (!g.productId || !Number.isInteger(qty) || qty < 1) continue;

    const product = await Product.findOne({
      _id: g.productId,
      isActive: true,
      isDeleted: false,
    }).catch(() => null);
    if (!product || product.stock <= 0) continue;

    const existing = cart.products.find((i) => i.productId.equals(product._id));
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      const seenPrice = Number(g.priceAtAdd);
      cart.products.push({
        productId: product._id,
        quantity: Math.min(qty, product.stock),
        priceAtAdd: Number.isFinite(seenPrice) && seenPrice >= 0 ? seenPrice : product.price,
      });
    }
  }

  await cart.save();
  res.json({ success: true, data: await buildCartResponse(cart) });
});


exports.validateGuestCart = catchAsync(async (req, res) => {
  const items = Array.isArray((req.body || {}).items) ? req.body.items : [];
  const valid = items.filter((i) => /^[0-9a-fA-F]{24}$/.test(String(i.productId)));

  const products = await Product.find({ _id: { $in: valid.map((i) => i.productId) } });
  const map = new Map(products.map((p) => [p._id.toString(), p]));

  const result = valid.map((i) => {
    const p = map.get(String(i.productId));
    const unavailable = !p || !p.isActive || p.isDeleted;
    const priceChanged = !unavailable && Number(i.priceAtAdd) !== p.price;
    return {
      productId: i.productId,
      quantity: Number(i.quantity),
      isPriceChanged: priceChanged,
      oldPrice: Number(i.priceAtAdd),
      currentPrice: p ? p.price : null,
      unavailable,
      outOfStock: !unavailable && p.stock <= 0,
      exceedsStock: !unavailable && Number(i.quantity) > p.stock,
      product: p
        ? { title: p.title, slug: p.slug, image: p.image, stock: p.stock, stockLabel: stockLabel(p.stock) }
        : null,
    };
  });

  res.json({ success: true, data: { items: result } });
});
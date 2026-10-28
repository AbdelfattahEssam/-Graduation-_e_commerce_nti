require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const User = require('../models/user.model');
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Testimonial = require('../models/testimonial.model');
const FAQ = require('../models/faq.model');
const ShippingZone = require('../models/shippingZone.model');

const img = (n) => {
  const file = `demo-${n}.jpg`;
  return fs.existsSync(path.join(__dirname, '..', '..', 'uploads', file))
    ? `/uploads/${file}`
    : '';
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([
    Category.deleteMany({}),
    Subcategory.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({}),
    Testimonial.deleteMany({}),
    FAQ.deleteMany({}),
  ]);

  const men = await Category.create({ name: 'Men' });
  const women = await Category.create({ name: 'Women' });
  const kids = await Category.create({ name: 'Kids' });

  const menTees = await Subcategory.create({ name: 'T-Shirts', categoryId: men._id });
  const menJeans = await Subcategory.create({ name: 'Jeans', categoryId: men._id });
  const womenDresses = await Subcategory.create({ name: 'Dresses', categoryId: women._id });
  const womenTops = await Subcategory.create({ name: 'Tops', categoryId: women._id });
  const kidsSets = await Subcategory.create({ name: 'Sets', categoryId: kids._id });

  const defs = [
    ['Classic White T-Shirt', 'Soft cotton t-shirt, regular fit.', 300, 25, men, menTees, 1],
    ['Black Oversized T-Shirt', 'Relaxed oversized fit, 100% cotton.', 350, 12, men, menTees, 2],
    ['Slim Fit Blue Jeans', 'Stretch denim, slim fit.', 650, 8, men, menJeans, 3],
    ['Straight Black Jeans', 'Classic straight cut.', 700, 2, men, menJeans, 4], // Only 2 left
    ['Floral Summer Dress', 'Light dress for summer days.', 800, 15, women, womenDresses, 5],
    ['Elegant Evening Dress', 'Satin evening dress.', 1200, 3, women, womenDresses, 6], // Only 3 left
    ['Basic White Top', 'Everyday cotton top.', 250, 30, women, womenTops, 7],
    ['Striped Casual Top', 'Comfortable striped top.', 280, 0, women, womenTops, 8], // Out of Stock
    ['Kids Cotton Set', 'T-shirt and shorts set.', 400, 20, kids, kidsSets, 9],
    ['Kids Pajama Set', 'Soft pajama set.', 450, 1, kids, kidsSets, 10], // Only 1 left
  ];

  const products = [];
  for (const [title, description, price, stock, cat, sub, n] of defs) {
    products.push(
      await Product.create({
        title,
        description,
        price,
        stock,
        categoryId: cat._id,
        subcategoryId: sub._id,
        image: img(n),
      })
    );
  }

  await Product.create({
    title: 'Hidden Winter Jacket',
    description: 'Inactive product (hidden from the store).',
    price: 1500,
    stock: 10,
    categoryId: men._id,
    subcategoryId: menTees._id,
    isActive: false,
  });

  const user = await User.findOne({ role: 'user' });
  if (user) {
    if (!user.mobile) user.mobile = '01012345678';
    if (!user.addresses.length) {
      user.addresses.push({
        title: 'Home',
        governorate: 'Cairo',
        city: 'Nasr City',
        street: '10 Abbas El Akkad St',
        isDefault: true,
      });
    }
    await user.save();

    const address = user.addresses.find((a) => a.isDefault) || user.addresses[0];
    const zone = await ShippingZone.findOne({ governorate: address.governorate });
    const shipping = zone ? zone.cost : 50;

    const statuses = [
      'pending',
      'pending',
      'preparing',
      'shipped',
      'delivered',
      'received',
      'cancelled by client',
      'rejected',
    ];

    for (let i = 0; i < statuses.length; i++) {
      const p = products[i % products.length];
      const qty = (i % 3) + 1;
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);

      await Order.create({
        userId: user._id,
        addressId: address._id,
        addressSnapshot: address.toObject(),
        mobileSnapshot: user.mobile,
        status: statuses[i],
        shippingCost: shipping,
        totalPrice: p.price * qty + shipping,
        orderItems: [{ productId: p._id, quantity: qty, price: p.price }],
        date: d,
        timestamp: d.getTime(),
      });
    }

    await Testimonial.create([
      { userId: user._id, rating: 5, content: 'Great quality and fast delivery!', status: 'approved' },
      { userId: user._id, rating: 4, content: 'Nice products, will order again.', status: 'approved' },
      { userId: user._id, rating: 5, content: 'Excellent customer service.', status: 'pending' },
      { userId: user._id, rating: 2, content: 'Delivery was a bit late.', status: 'pending' },
    ]);
  } else {
    console.log('No normal user found: skipped orders and testimonials');
  }

  await FAQ.create([
    { question: 'How long does delivery take?', answer: 'Delivery takes 2 to 5 working days depending on your governorate.' },
    { question: 'What payment methods do you accept?', answer: 'We currently accept Cash on Delivery only.' },
    { question: 'Can I return or exchange an item?', answer: 'Yes, please check our Return and Exchange policies page.' },
    { question: 'Do I need an account to place an order?', answer: 'You can browse and add to cart as a guest, but you need to log in to place an order.' },
  ]);

  console.log('Demo data ready ✅');
  console.log(`Categories: 3 | Products: ${products.length + 1} | FAQs: 4`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
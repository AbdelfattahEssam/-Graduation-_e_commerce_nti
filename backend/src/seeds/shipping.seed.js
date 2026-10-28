require('dotenv').config();
const mongoose = require('mongoose');
const ShippingZone = require('../models/shippingZone.model');

const zones = [
  ['Cairo', 50], ['Giza', 50], ['Alexandria', 60], ['Qalyubia', 55],
  ['Port Said', 70], ['Suez', 70], ['Damietta', 70], ['Dakahlia', 65],
  ['Sharqia', 65], ['Gharbia', 65], ['Monufia', 65], ['Kafr El Sheikh', 70],
  ['Beheira', 70], ['Ismailia', 70], ['Faiyum', 70], ['Beni Suef', 75],
  ['Minya', 80], ['Asyut', 85], ['Sohag', 90], ['Qena', 95],
  ['Luxor', 100], ['Aswan', 100], ['Red Sea', 110], ['New Valley', 120],
  ['Matrouh', 110], ['North Sinai', 120], ['South Sinai', 120],
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const [governorate, cost] of zones) {
    await ShippingZone.updateOne(
      { governorate },
      { $setOnInsert: { governorate, cost, isAvailable: true } },
      { upsert: true }
    );
  }

  console.log(`Shipping zones ready: ${zones.length}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
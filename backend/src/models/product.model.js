const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    description: { type: String, trim: true, default: "" },
    image: { type: String, default: "" },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    slug: { type: String, unique: true, lowercase: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: [true, "Subcategory is required"],
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({ title: "text", description: "text" });

productSchema.pre("validate", function (next) {
  if (this.isModified("title")) {
    const suffix = Math.random().toString(36).slice(2, 7);
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${suffix}`;
  }
});

module.exports = mongoose.model("Product", productSchema);

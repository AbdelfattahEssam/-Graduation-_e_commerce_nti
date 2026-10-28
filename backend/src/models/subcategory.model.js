const mongoose = require('mongoose');
const slugify = require('slugify');

const subcategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
    },
    slug: { type: String, lowercase: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subcategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });

subcategorySchema.pre('validate', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

});

module.exports = mongoose.model('Subcategory', subcategorySchema);
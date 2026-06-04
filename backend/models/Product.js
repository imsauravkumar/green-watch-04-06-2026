import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: "" // base64 or URL
  },
  sellerId: {
    type: String,
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  buyRequests: [
    {
      buyerName: { type: String, required: true },
      buyerEmail: { type: String, required: true },
      buyerMobile: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
      requestedAt: { type: Date, default: Date.now },
      seen: { type: Boolean, default: false }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;

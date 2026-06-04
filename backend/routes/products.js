import express from 'express';
import { protect } from '../middleware/auth.js';
import { isMockDb, getMockDb, writeMockDb } from '../config/db.js';
import Product from '../models/Product.js';

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (isMockDb) {
      const db = getMockDb();
      return res.json(db.products || []);
    } else {
      const products = await Product.find({}).sort({ createdAt: -1 });
      return res.json(products);
    }
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ message: "Server error fetching products", error: error.message });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, price, stock, description, image } = req.body;

  // Check roles: must be seller or both
  const userRole = req.user.role;
  if (userRole !== 'seller' && userRole !== 'both' && userRole !== 'admin') {
    return res.status(403).json({ message: "Only sellers can add products" });
  }

  if (!name || price === undefined || stock === undefined || !description) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  try {
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    if (parsedPrice < 0 || parsedStock < 0) {
      return res.status(400).json({ message: "Price and Stock must be positive numbers" });
    }

    const sellerId = req.user.id || req.user._id?.toString();
    const sellerName = req.user.name;

    if (isMockDb) {
      const db = getMockDb();
      const newProduct = {
        id: `prod-${Date.now()}`,
        name,
        price: parsedPrice,
        stock: parsedStock,
        description,
        image: image || "",
        sellerId,
        sellerName,
        createdAt: new Date().toISOString()
      };

      if (!db.products) db.products = [];
      db.products.push(newProduct);
      writeMockDb(db);

      return res.status(201).json(newProduct);
    } else {
      const product = await Product.create({
        name,
        price: parsedPrice,
        stock: parsedStock,
        description,
        image: image || "",
        sellerId,
        sellerName
      });

      return res.status(201).json(product);
    }
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Server error creating product", error: error.message });
  }
});

// @desc    Update a product (only owner or admin)
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const productId = req.params.id;
  const { name, price, stock, description, image } = req.body;
  const userId = req.user.id || req.user._id?.toString();
  const isAdmin = req.user.role === 'admin';

  try {
    if (isMockDb) {
      const db = getMockDb();
      const product = db.products.find(p => p.id === productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check ownership
      if (product.sellerId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to edit this product" });
      }

      if (name) product.name = name;
      if (price !== undefined) product.price = parseFloat(price);
      if (stock !== undefined) product.stock = parseInt(stock);
      if (description) product.description = description;
      if (image !== undefined) product.image = image;

      writeMockDb(db);
      return res.json(product);
    } else {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to edit this product" });
      }

      if (name) product.name = name;
      if (price !== undefined) product.price = parseFloat(price);
      if (stock !== undefined) product.stock = parseInt(stock);
      if (description) product.description = description;
      if (image !== undefined) product.image = image;

      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    }
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server error updating product", error: error.message });
  }
});

// @desc    Delete a product (only owner or admin)
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id || req.user._id?.toString();
  const isAdmin = req.user.role === 'admin';

  try {
    if (isMockDb) {
      const db = getMockDb();
      const productIndex = db.products.findIndex(p => p.id === productId);

      if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found" });
      }

      const product = db.products[productIndex];

      if (product.sellerId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this product" });
      }

      db.products.splice(productIndex, 1);
      writeMockDb(db);

      return res.json({ message: "Product removed successfully" });
    } else {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this product" });
      }

      await Product.findByIdAndDelete(productId);
      return res.json({ message: "Product removed successfully" });
    }
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Server error deleting product", error: error.message });
  }
});

// @desc    Request to buy a product (submit buyer details to seller)
// @route   POST /api/products/:id/buy
// @access  Private
router.post('/:id/buy', protect, async (req, res) => {
  const productId = req.params.id;
  const quantityToBuy = parseInt(req.body.quantity || 1);
  const { buyerName, buyerEmail, buyerMobile } = req.body;
  const buyerId = req.user.id || req.user._id?.toString();

  if (quantityToBuy <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than zero" });
  }

  if (!buyerName || !buyerEmail || !buyerMobile) {
    return res.status(400).json({ message: "Please provide buyer name, email, and mobile number" });
  }

  try {
    if (isMockDb) {
      const db = getMockDb();
      const product = db.products.find(p => p.id === productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Prevent seller from buying own product
      if (product.sellerId === buyerId) {
        return res.status(403).json({ message: "You cannot buy your own product." });
      }

      if (product.stock < quantityToBuy) {
        return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left.` });
      }

      if (!product.buyRequests) {
        product.buyRequests = [];
      }

      product.buyRequests.push({
        buyerName,
        buyerEmail,
        buyerMobile,
        quantity: quantityToBuy,
        requestedAt: new Date().toISOString(),
        seen: false
      });

      writeMockDb(db);

      return res.json({ message: "Request sent to seller successfully!", product });
    } else {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Prevent seller from buying own product
      if (product.sellerId === buyerId) {
        return res.status(403).json({ message: "You cannot buy your own product." });
      }

      if (product.stock < quantityToBuy) {
        return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left.` });
      }

      if (!product.buyRequests) {
        product.buyRequests = [];
      }

      product.buyRequests.push({
        buyerName,
        buyerEmail,
        buyerMobile,
        quantity: quantityToBuy,
        requestedAt: new Date(),
        seen: false
      });

      const updatedProduct = await product.save();

      return res.json({ message: "Request sent to seller successfully!", product: updatedProduct });
    }
  } catch (error) {
    console.error("Buy Product Request Error:", error);
    res.status(500).json({ message: "Server error submitting purchase request", error: error.message });
  }
});

// @desc    Get buyer requests for a product (seller or admin only), marks them as seen
// @route   GET /api/products/:id/buyers
// @access  Private (owner or admin)
router.get('/:id/buyers', protect, async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id || req.user._id?.toString();
  const isAdmin = req.user.role === 'admin';

  try {
    if (isMockDb) {
      const db = getMockDb();
      const product = db.products.find(p => p.id === productId);

      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.sellerId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to view buyer requests" });
      }

      // Mark all unseen requests as seen
      if (product.buyRequests) {
        product.buyRequests.forEach(r => { r.seen = true; });
      }
      writeMockDb(db);

      return res.json(product.buyRequests || []);
    } else {
      const product = await Product.findById(productId);

      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.sellerId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to view buyer requests" });
      }

      // Mark all unseen requests as seen
      product.buyRequests.forEach(r => { r.seen = true; });
      await product.save();

      return res.json(product.buyRequests);
    }
  } catch (error) {
    console.error("Get Buyers Error:", error);
    res.status(500).json({ message: "Server error fetching buyer requests", error: error.message });
  }
});

// @desc    Update product stock (seller or admin)
// @route   PATCH /api/products/:id/stock
// @access  Private (owner or admin)
router.patch('/:id/stock', protect, async (req, res) => {
  const productId = req.params.id;
  const newStock = parseInt(req.body.stock);
  const userId = req.user.id || req.user._id?.toString();
  const isAdmin = req.user.role === 'admin';

  if (isNaN(newStock) || newStock < 0) {
    return res.status(400).json({ message: "Stock must be a non-negative number" });
  }

  try {
    if (isMockDb) {
      const db = getMockDb();
      const product = db.products.find(p => p.id === productId);

      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.sellerId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to update stock" });
      }

      product.stock = newStock;
      writeMockDb(db);
      return res.json({ message: "Stock updated successfully", stock: newStock, product });
    } else {
      const product = await Product.findById(productId);

      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.sellerId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to update stock" });
      }

      product.stock = newStock;
      const updated = await product.save();
      return res.json({ message: "Stock updated successfully", stock: newStock, product: updated });
    }
  } catch (error) {
    console.error("Update Stock Error:", error);
    res.status(500).json({ message: "Server error updating stock", error: error.message });
  }
});

export default router;


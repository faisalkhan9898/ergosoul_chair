const Product = require('../models/product.model');
const User = require('../models/user.model');
const { uploadToCloudinaryOrLocal } = require('../middleware/upload.middleware');

// Generate a clean slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// @desc    Get all products with advanced filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      mainCategory,
      category,
      purpose,
      minPrice,
      maxPrice,
      material,
      color,
      brand,
      rating,
      availability,
      armRest,
      headRest,
      reclining,
      wheelType,
      sort
    } = req.query;

    const query = {};

    // Text Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Direct filters
    if (mainCategory) query.mainCategory = mainCategory;
    if (category) query.category = category;
    if (purpose) query.purpose = purpose;
    if (material) query['specs.material'] = material;
    if (brand) query['specs.brand'] = brand;
    if (armRest) query['specs.armRest'] = armRest;
    if (headRest) query['specs.headRest'] = headRest;
    if (reclining) query['specs.reclining'] = reclining;
    if (wheelType) query['specs.wheelType'] = wheelType;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Color array filter
    if (color) {
      query['specs.color'] = { $in: Array.isArray(color) ? color : [color] };
    }

    // Rating
    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) };
    }

    // Stock/Availability
    if (availability) {
      if (availability === 'in-stock') {
        query.stock = { $gt: 0 };
      } else if (availability === 'out-of-stock') {
        query.stock = 0;
      }
    }

    // Setup Sorting
    let sortBy = { createdAt: -1 };
    if (sort) {
      if (sort === 'price-asc') sortBy = { price: 1 };
      else if (sort === 'price-desc') sortBy = { price: -1 };
      else if (sort === 'rating') sortBy = { 'ratings.average': -1 };
      else if (sort === 'popular') sortBy = { isBestSeller: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      longDescription,
      price,
      oldPrice,
      mainCategory,
      category,
      purpose,
      stock,
      material,
      color,
      brand,
      height,
      width,
      weight,
      weightCapacity,
      armRest,
      headRest,
      reclining,
      wheelType,
      warranty,
      isFeatured,
      isBestSeller,
      isNewArrival
    } = req.body;

    const slug = slugify(name);
    const slugExists = await Product.findOne({ slug });
    if (slugExists) {
      res.status(400);
      throw new Error('Product with a similar name already exists (slug collision)');
    }

    // Process files
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinaryOrLocal(file);
        images.push(url);
      }
    } else {
      // Fallback placeholder images if no images uploaded
      images.push('https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600');
    }

    const product = await Product.create({
      name,
      slug,
      description,
      longDescription,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      mainCategory: mainCategory || 'Chairs',
      category,
      purpose,
      images,
      stock: Number(stock),
      specs: {
        material,
        color: Array.isArray(color) ? color : color.split(',').map(c => c.trim()),
        brand: brand || 'Ergosoul',
        height,
        width,
        weight,
        weightCapacity,
        armRest,
        headRest,
        reclining,
        wheelType
      },
      warranty,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      isNewArrival: isNewArrival === 'true' || isNewArrival === true
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const {
      name,
      description,
      longDescription,
      price,
      oldPrice,
      mainCategory,
      category,
      purpose,
      stock,
      material,
      color,
      brand,
      height,
      width,
      weight,
      weightCapacity,
      armRest,
      headRest,
      reclining,
      wheelType,
      warranty,
      isFeatured,
      isBestSeller,
      isNewArrival
    } = req.body;

    if (name && name !== product.name) {
      product.name = name;
      product.slug = slugify(name);
    }

    product.description = description || product.description;
    product.longDescription = longDescription || product.longDescription;
    product.price = price !== undefined ? Number(price) : product.price;
    product.oldPrice = oldPrice !== undefined ? Number(oldPrice) : product.oldPrice;
    product.mainCategory = mainCategory || product.mainCategory;
    product.category = category || product.category;
    product.purpose = purpose || product.purpose;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.warranty = warranty || product.warranty;
    
    product.isFeatured = isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : product.isFeatured;
    product.isBestSeller = isBestSeller !== undefined ? (isBestSeller === 'true' || isBestSeller === true) : product.isBestSeller;
    product.isNewArrival = isNewArrival !== undefined ? (isNewArrival === 'true' || isNewArrival === true) : product.isNewArrival;

    // Spec updates
    if (!product.specs) product.specs = {};
    product.specs.material = material || product.specs.material;
    product.specs.brand = brand || product.specs.brand;
    product.specs.height = height || product.specs.height;
    product.specs.width = width || product.specs.width;
    product.specs.weight = weight || product.specs.weight;
    product.specs.weightCapacity = weightCapacity || product.specs.weightCapacity;
    product.specs.armRest = armRest || product.specs.armRest;
    product.specs.headRest = headRest || product.specs.headRest;
    product.specs.reclining = reclining || product.specs.reclining;
    product.specs.wheelType = wheelType || product.specs.wheelType;

    if (color) {
      product.specs.color = Array.isArray(color) ? color : color.split(',').map(c => c.trim());
    }

    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const url = await uploadToCloudinaryOrLocal(file);
        newImages.push(url);
      }
      product.images = newImages; // Overwrite or extend. We overwrite for simplicity in editing.
    }

    const updatedProduct = await product.save();
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommendations (AI recommendation simulation based on current product features)
// @route   GET /api/products/:slug/recommendations
// @access  Public
const getRecommendations = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Find complementary products sharing same category or purpose, excluding this product
    let recommendations = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { purpose: product.purpose }
      ]
    }).limit(4);

    // If less than 4 recommendations, pad with featured items
    if (recommendations.length < 4) {
      const padCount = 4 - recommendations.length;
      const additional = await Product.find({
        _id: { $ne: product._id, $not: { $in: recommendations.map(r => r._id) } }
      }).limit(padCount);
      recommendations = [...recommendations, ...additional];
    }

    res.json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user wishlist item
// @route   POST /api/products/:id/wishlist
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const index = user.wishlist.indexOf(productId);
    let message = '';
    
    if (index > -1) {
      user.wishlist.splice(index, 1);
      message = 'Product removed from wishlist';
    } else {
      user.wishlist.push(productId);
      message = 'Product added to wishlist';
    }

    await user.save();
    res.json({ success: true, message, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations,
  toggleWishlist
};

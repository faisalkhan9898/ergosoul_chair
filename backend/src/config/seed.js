require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Coupon = require('../models/coupon.model');
const Blog = require('../models/blog.model');
const Review = require('../models/review.model');
const Currency = require('../models/currency.model');
const Tax = require('../models/tax.model');
const Category = require('../models/category.model');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Ergosoul');
    console.log('Seed: Connected to Database.');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Blog.deleteMany({});
    await Review.deleteMany({});
    await Currency.deleteMany({});
    await Tax.deleteMany({});
    await Category.deleteMany({});
    console.log('Seed: Cleared all tables.');

    // 0. Create Currencies
    await Currency.create([
      { code: 'USD', symbol: '$', exchangeRate: 1.0, isDefault: true, isActive: true },
      { code: 'EUR', symbol: '€', exchangeRate: 0.92, isDefault: false, isActive: true },
      { code: 'INR', symbol: '₹', exchangeRate: 83.0, isDefault: false, isActive: true },
      { code: 'GBP', symbol: '£', exchangeRate: 0.79, isDefault: false, isActive: true }
    ]);
    console.log('Seed: Created default currencies.');

    // 0.1 Create Taxes
    await Tax.create([
      { name: 'Standard GST', rate: 18, description: 'Standard tax rate for furniture items', isDefault: true, isActive: true },
      { name: 'Low GST', rate: 5, description: 'Lower tax rate tier', isDefault: false, isActive: true },
      { name: 'Exempt', rate: 0, description: 'No tax applicable', isDefault: false, isActive: true }
    ]);
    console.log('Seed: Created default taxes.');

    // 0.2 Create Categories (Departments)
    await Category.create([
      {
        name: 'Chairs',
        icon: '🪑',
        image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=400',
        subcategories: ['Banquet Chair', 'Bar Chair', 'Stool Chair', 'Cafeteria Chair', 'Cushion High Back Executive Chair', 'Cushion Mid Back Executive Chair', 'Dining Chair', 'Ergonomic High Back Series', 'Lounge Chair', 'Meeting Room Office Chair', 'Training Chair', 'Visitor Chair'],
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Sofa',
        icon: '🛋️',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400',
        subcategories: ['L-Shape Sofa', 'Single Seater Sofa', 'Two Seater Sofa', 'Three Seater Sofa'],
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Office Table',
        icon: '💻',
        image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=400',
        subcategories: ['Executive Desk', 'Conference Table', 'Adjustable Standing Desk', 'Compact Task Desk'],
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Wardrobe',
        icon: '🚪',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=400',
        subcategories: ['2-Door Wardrobe', 'Sliding Door Wardrobe', 'Walk-in Closet Cabinet', 'Classic Wooden Almirah'],
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Furniture',
        icon: '🪴',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400',
        subcategories: ['Bed', 'Computer Table', 'Dining Table', 'Dresser', 'Mattress', 'Shoe Rack', 'Side Table', 'TV Unit'],
        displayOrder: 5,
        isActive: true
      }
    ]);
    console.log('Seed: Created default categories.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Ergosoul Admin',
      email: 'admin@Ergosoul.com',
      password: 'adminpassword123',
      role: 'admin',
      isVerified: true
    });

    const customer = await User.create({
      name: 'Jane Doe',
      email: 'customer@Ergosoul.com',
      password: 'customerpassword123',
      role: 'customer',
      isVerified: true,
      addresses: [
        {
          street: '456 Luxury Lane, Suite 10',
          city: 'Beverly Hills',
          state: 'California',
          zipCode: '90210',
          country: 'United States',
          phoneNumber: '+1-555-0199',
          isDefault: true
        }
      ]
    });
    console.log('Seed: Created Admin and Customer accounts.');

    // 2. Create Coupons
    await Coupon.create([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountAmount: 10,
        minPurchase: 0,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      {
        code: 'LUXURY20',
        discountType: 'percentage',
        discountAmount: 20,
        minPurchase: 1000,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'FLAT50',
        discountType: 'flat',
        discountAmount: 50,
        minPurchase: 300,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log('Seed: Coupons created.');

    // 3. Create Blogs
    await Blog.create([
      {
        title: 'The Art of Ergonomics: How Your Chair Affects Posture',
        slug: 'the-art-of-ergonomics-how-your-chair-affects-posture',
        excerpt: 'Discover why high-quality lumbar support is the single most important element in modern workspaces.',
        content: 'Long working hours at a desk can lead to chronic back pain, reduced blood flow, and overall discomfort. A premium ergonomic mesh chair solves this by offering active lumbar tracking that mimics the natural curvature of your spine. Reclining to 135 degrees during breaks relieves intra-discal pressure. Invest in your body by selecting mesh designs with multi-dimensional arm rests.',
        image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=800',
        tags: ['Ergonomics', 'Office', 'Health'],
        readTime: '6 mins read'
      },
      {
        title: 'Minimalist Dining Seats: Blending Wood and Comfort',
        slug: 'minimalist-dining-seats-blending-wood-and-comfort',
        excerpt: 'How to pick dining chairs that offer premium luxury comfort while keeping a clean aesthetic.',
        content: 'Minimalism isn\'t about lack of style; it\'s about precision. When picking wooden or dining chairs, look for clean curves, organic grains (like Teak or American Oak), and high-density foam cushions covered in performance leather or linen. The dining chair is the hub of conversation—ensure it sits at the optimal 45cm height for natural posture.',
        image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800',
        tags: ['Dining Room', 'Minimalism', 'Wooden Design'],
        readTime: '4 mins read'
      },
      {
        title: 'Why Gamers Need Lumbar Support and 4D Armrests',
        slug: 'why-gamers-need-lumbar-support-and-4d-armrests',
        excerpt: 'An in-depth review of gaming chair ergonomics, materials, and long-session cooling setups.',
        content: 'Gaming sessions are intense and put unique pressure on shoulders and wrists. 4D armrests allow height, width, pivot, and slide adjustments to align perfectly with your desk. Carbon-fiber structural frames support high-density cold-cured foam cores, preventing flat spots even after years of continuous usage. PU wheel casters ensure silent slide movements.',
        image: 'https://images.unsplash.com/photo-1598550476439-6847785fce6e?q=80&w=800',
        tags: ['Gaming', 'Tech Spec', 'Luxury Setup'],
        readTime: '5 mins read'
      }
    ]);
    console.log('Seed: Blogs created.');

    // 4. Create 20 Premium Chairs
    const productData = [
      {
        name: 'AeroFlex Ergonomic Mesh Task Chair',
        slug: 'aeroflex-ergonomic-mesh-task-chair',
        description: 'Advanced responsive lumbar support task chair with fully breathable elastic mesh backing.',
        longDescription: 'The AeroFlex represents the pinnacle of modern work seating. It features dynamic tension mesh that adapts to every micro-movement of your spine, keeping you cool and focused. The synchronized tilt matches back recline and seat slider offsets for flawless biomechanics.',
        price: 349,
        oldPrice: 429,
        category: 'Ergonomic High Back Series',
        purpose: 'Office',
        images: [
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600',
          'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=600'
        ],
        threeSixtyImages: [
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600',
          'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=600'
        ],
        stock: 25,
        specs: {
          material: 'Premium Elastomeric Mesh',
          color: ['Black', 'Cool Grey', 'Navy Blue'],
          brand: 'Ergosoul Premium',
          height: '105 - 118 cm',
          width: '64 cm',
          weight: '16 kg',
          weightCapacity: '150 kg',
          armRest: '3D Adjustable',
          headRest: 'Adjustable Mesh',
          reclining: 'Yes (90° - 135°)',
          wheelType: 'PU Casters'
        },
        warranty: '5 Years',
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false
      },
      {
        name: 'Imperia Leather Executive Director Chair',
        slug: 'imperia-leather-executive-director-chair',
        description: 'Luxurious top-grain aniline leather boardroom chair with detailed aluminum framework.',
        longDescription: 'Crafted for leaders who appreciate fine art. The Imperia combines genuine Italian top-grain leather with a pressure-cast aluminum base. Dual-density cushioning ensures deep support for prolonged executive board sessions.',
        price: 899,
        oldPrice: 1199,
        category: 'Cushion High Back Executive Chair',
        purpose: 'Office',
        images: [
          'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=600',
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600'
        ],
        stock: 8,
        specs: {
          material: 'Top Grain Italian Leather',
          color: ['Saddle Brown', 'Executive Black', 'Chalk White'],
          brand: 'Ergosoul Luxury',
          height: '115 - 125 cm',
          width: '70 cm',
          weight: '24 kg',
          weightCapacity: '180 kg',
          armRest: 'Leather Padded Fixed',
          headRest: 'Integrated Leather Cushion',
          reclining: 'Yes (90° - 120°)',
          wheelType: 'Silent Nylon Casters'
        },
        warranty: '7 Years',
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true
      },
      {
        name: 'Apex Throne Carbon Esports Chair',
        slug: 'apex-throne-carbon-esports-chair',
        description: 'Elite racing shell gaming seat wrapped in carbon fiber leather and cooling gel cushions.',
        longDescription: 'Designed for tournament endurance. The Apex Throne utilizes heavy-duty cold-cured foam cushions embedded with a temperature-regulating cooling gel layer, supported by an reinforced industrial steel structural cage.',
        price: 499,
        oldPrice: 599,
        category: 'Ergonomic High Back Series',
        purpose: 'Gaming',
        images: [
          'https://images.unsplash.com/photo-1598550476439-6847785fce6e?q=80&w=600'
        ],
        stock: 15,
        specs: {
          material: 'Carbon-Fiber PU Leather',
          color: ['Cyberpunk Yellow', 'Carbon Black', 'Neon Red'],
          brand: 'Esports Series',
          height: '120 - 132 cm',
          width: '68 cm',
          weight: '22 kg',
          weightCapacity: '160 kg',
          armRest: '4D Fully Adjustable',
          headRest: 'Velour Neck Pillow',
          reclining: 'Yes (90° - 165°)',
          wheelType: 'XL PU Casters'
        },
        warranty: '3 Years',
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false
      },
      {
        name: 'Nordic Oak Tufted Dining Chair',
        slug: 'nordic-oak-tufted-dining-chair',
        description: 'Elegant American solid white oak chair with micro-fiber linen padded seating.',
        longDescription: 'Minimalist luxury for the modern dining room. Features beautiful hand-finished solid white oak legs and a comfortable supportive curved backrest with subtle tufted buttons.',
        price: 189,
        oldPrice: 249,
        category: 'Dining Chair',
        purpose: 'Restaurant',
        images: [
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600'
        ],
        stock: 40,
        specs: {
          material: 'Solid White Oak & Linen',
          color: ['Sand Beige', 'Slate Grey', 'Olive Green'],
          brand: 'Ergosoul Craft',
          height: '84 cm',
          width: '52 cm',
          weight: '8 kg',
          weightCapacity: '130 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '2 Years',
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false
      },
      {
        name: 'Breeze All-Weather Resin Patio Chair',
        slug: 'breeze-all-weather-resin-patio-chair',
        description: 'Stackable minimalist fiberglass-reinforced resin outdoor chair with UV inhibitors.',
        longDescription: 'Durable, lightweight, and modern. Designed to withstand harsh sun, salty air, and rain, this designer stackable seat is perfect for outdoor cafes, terraces, and backyard dining tables.',
        price: 79,
        oldPrice: 99,
        category: 'Cafeteria Chair',
        purpose: 'Cafe',
        images: [
          'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=600'
        ],
        stock: 60,
        specs: {
          material: 'Fiberglass Resin Polypropylene',
          color: ['Matte Terracotta', 'Sand Dollar', 'Sage'],
          brand: 'Ergosoul Outdoor',
          height: '78 cm',
          width: '56 cm',
          weight: '4.5 kg',
          weightCapacity: '140 kg',
          armRest: 'Integrated PP',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '2 Years',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true
      },
      {
        name: 'Starlight Ergonomic Kids Desk Chair',
        slug: 'starlight-ergonomic-kids-desk-chair',
        description: 'Growing student chair featuring posture support and self-locking friction casters.',
        longDescription: 'Designed for growing children. Starlight features independent height adjustments for both the backrest and the seat cushion to prevent bad slumping habits during study time.',
        price: 129,
        oldPrice: 159,
        category: 'Training Chair',
        purpose: 'Study',
        images: [
          'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600'
        ],
        stock: 3, // Set low to trigger inventory alerts in dashboard!
        specs: {
          material: 'Nylon Polymer & Density Foam',
          color: ['Bubblegum Pink', 'Sky Blue', 'Mint Green'],
          brand: 'Kids posture',
          height: '80 - 95 cm',
          width: '48 cm',
          weight: '10 kg',
          weightCapacity: '90 kg',
          armRest: 'Foldable Arms',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'Friction Lock Casters'
        },
        warranty: '3 Years',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'Vanguard Chrome Frame Visitor Chair',
        slug: 'vanguard-chrome-frame-visitor-chair',
        description: 'Sleek cantilever guest seat finished in professional padded mesh and chrome tubing.',
        longDescription: 'Perfect for conference rooms, executive suites, and reception desks. Provides superior comfort using tensioned mesh cushions and steel frames.',
        price: 159,
        oldPrice: 199,
        category: 'Visitor Chair',
        purpose: 'Waiting Area',
        images: [
          'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=600'
        ],
        stock: 30,
        specs: {
          material: 'Chrome Frame & Elastic Mesh',
          color: ['Professional Black', 'Steel Grey'],
          brand: 'Ergosoul Premium',
          height: '92 cm',
          width: '58 cm',
          weight: '12 kg',
          weightCapacity: '140 kg',
          armRest: 'Fixed Chrome',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '3 Years',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'Modena Mid-Century Luxury Accent Chair',
        slug: 'modena-mid-century-luxury-accent-chair',
        description: 'Sculptural velvet lounge armchair set with antique brass thin leg frames.',
        longDescription: 'An absolute masterpiece of design. The Modena accent lounge seat commands visual attention in lobby rooms, premium hotels, or private apartments. Upholstered in rich premium velvet.',
        price: 549,
        oldPrice: 699,
        category: 'Lounge Chair',
        purpose: 'Hotel',
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600'
        ],
        stock: 12,
        specs: {
          material: 'Premium Velvet & Brass',
          color: ['Emerald Green', 'Royal Gold', 'Rust Orange'],
          brand: 'Ergosoul Luxury',
          height: '76 cm',
          width: '82 cm',
          weight: '19 kg',
          weightCapacity: '150 kg',
          armRest: 'Velvet Covered Slope',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '5 Years',
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false
      },
      {
        name: 'Urban Loft Swivel Bar Stool',
        slug: 'urban-loft-swivel-bar-stool',
        description: 'Industrial rustic solid pine and wrought iron adjustable height counter stool.',
        longDescription: 'Perfect stool heights for cafe bars, kitchen counters, or trendy bistro pubs. The threaded spindle screw allows simple swivel adjustments from 60cm to 80cm.',
        price: 99,
        oldPrice: 129,
        category: 'Bar Chair',
        purpose: 'Cafe',
        images: [
          'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=600'
        ],
        stock: 35,
        specs: {
          material: 'Wrought Iron & Distressed Pine',
          color: ['Distressed Walnut', 'Charcoal Black'],
          brand: 'Ergosoul Craft',
          height: '62 - 80 cm',
          width: '38 cm',
          weight: '7 kg',
          weightCapacity: '120 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true
      },
      {
        name: 'Ergosoul Premium Banquet Chair',
        slug: 'ergosoul-premium-banquet-chair',
        description: 'Premium chrome-finished banquet chair with high-density green foam cushioning and Ergosoul logo.',
        longDescription: 'Designed for hotels, banquet halls, weddings, and corporate events. Features a heavy-duty chrome-finished frame, comfortable high-density polyurethane foam core in a lush emerald green fabric cover, and the Ergosoul logo hot-stamped on the backrest.',
        price: 79,
        oldPrice: 99,
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: [
          '/banquet_chair.jpg'
        ],
        stock: 120,
        specs: {
          material: 'Chrome-Finished Alloy Steel & High Density Fabric',
          color: ['Emerald Green'],
          brand: 'Ergosoul',
          height: '92 cm',
          width: '46 cm',
          weight: '6.5 kg',
          weightCapacity: '150 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '3 Years',
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      {
        name: 'MediClinic Reclining Care Chair',
        slug: 'mediclinic-reclining-care-chair',
        description: 'Antibacterial medical lounge chair with seamless vinyl covers and deep gas spring recliners.',
        longDescription: 'Engineered for patient recovery. Smooth hydraulic gas shocks enable infinite adjustments to flat bed shapes, constructed from heavy-duty sanitizable vinyl.',
        price: 649,
        oldPrice: 799,
        category: 'Lounge Chair',
        purpose: 'Hospital',
        images: [
          'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=600'
        ],
        stock: 6,
        specs: {
          material: 'Sanitizable Medical Vinyl & Steel',
          color: ['Teal Green', 'Hospital Blue'],
          brand: 'Ergosoul Medical',
          height: '110 cm',
          width: '74 cm',
          weight: '32 kg',
          weightCapacity: '220 kg',
          armRest: 'Padded Fold-Away',
          headRest: 'Integrated Pillow',
          reclining: 'Yes (90° - 150°)',
          wheelType: 'Locking Medical Casters'
        },
        warranty: '5 Years',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'AeroBreathe High Back Mesh Chair',
        slug: 'aerobreathe-high-back-mesh-chair',
        description: 'Full body support mesh chair incorporating 4D armrests and multi-directional headrest.',
        longDescription: 'Perfect mesh posture solution for long office hours. Designed to keep air flowing and your body aligned, reducing neck strain and lower back pressure.',
        price: 279,
        oldPrice: 349,
        category: 'Meeting Room Office Chair',
        purpose: 'Office',
        images: [
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600'
        ],
        stock: 2, // Low stock to trigger alert!
        specs: {
          material: 'Tensioned Kore Mesh',
          color: ['Pitch Black', 'Slate Grey'],
          brand: 'Ergosoul Premium',
          height: '112 - 126 cm',
          width: '63 cm',
          weight: '15.5 kg',
          weightCapacity: '140 kg',
          armRest: '4D Fully Adjustable',
          headRest: 'Adjustable Mesh',
          reclining: 'Yes (90° - 125°)',
          wheelType: 'PU Casters'
        },
        warranty: '3 Years',
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: true
      },
      {
        name: 'Royal Velvet Chesterfield Sofa',
        slug: 'royal-velvet-chesterfield-sofa',
        description: 'Deep-buttoned classical tufted velvet sofa in rich emerald green.',
        longDescription: 'A classic masterwork of living room comfort. Features solid beechwood frames, high-density pocket spring cores, and luxurious water-repellent performance velvet upholstery.',
        price: 1299,
        oldPrice: 1599,
        mainCategory: 'Sofa',
        category: 'Three Seater Sofa',
        purpose: 'Home',
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600'],
        stock: 5,
        specs: {
          material: 'Premium Velvet & Beechwood',
          color: ['Emerald Green', 'Royal Blue'],
          brand: 'Ergosoul Living',
          height: '78 cm',
          width: '210 cm',
          weight: '45 kg',
          weightCapacity: '350 kg',
          armRest: 'Fixed Chesterfield Padded',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '5 Years',
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true
      },
      {
        name: 'Apex Motorized Standing Desk',
        slug: 'apex-motorized-standing-desk',
        description: 'Dual-motor electric height-adjustable desk with rustic walnut finish top.',
        longDescription: 'Improve your workday circulation. Features double electric lift columns, 4 height preset digital memory keys, and a heavy-duty steel leg framing supporting up to 120kg.',
        price: 449,
        oldPrice: 549,
        mainCategory: 'Office Table',
        category: 'Adjustable Standing Desk',
        purpose: 'Office',
        images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=600'],
        stock: 12,
        specs: {
          material: 'American Walnut & Carbon Steel',
          color: ['Rustic Walnut', 'Natural Oak'],
          brand: 'Ergosoul Office',
          height: '70 - 120 cm',
          width: '140 cm',
          weight: '28 kg',
          weightCapacity: '120 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '3 Years',
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-01',
        slug: 'ergosoul-banquet-chair-esbc-01',
        description: 'Premium Banquet Chair with metal powder coated base and high quality foam seat.',
        longDescription: 'Ergonomic banquet seating featuring bent wood ply with soft cushion fabric and a sturdy metal powder coated base. Tailored by Ergosoul.',
        price: 85,
        oldPrice: 105,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-01.jpg'],
        stock: 50,
        specs: {
          material: 'Metal & Bent Wood Ply',
          color: ['Classic Red', 'Emerald Green', 'Royal Blue'],
          brand: 'Ergosoul',
          height: '34 in',
          width: '21 in',
          weight: '6.0 kg',
          weightCapacity: '150 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-02',
        slug: 'ergosoul-banquet-chair-esbc-02',
        description: 'Premium Banquet Chair with bent wood ply back and soft cushion fabric.',
        longDescription: 'High quality foam seat and back made by bent wood ply with soft cushion fabric and metal powder coated base.',
        price: 89,
        oldPrice: 110,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-02.jpg'],
        stock: 45,
        specs: {
          material: 'Metal & Bent Wood Ply',
          color: ['Emerald Green', 'Classic Gold'],
          brand: 'Ergosoul',
          height: '35 in',
          width: '22.8 in',
          weight: '6.2 kg',
          weightCapacity: '150 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-03',
        slug: 'ergosoul-banquet-chair-esbc-03',
        description: 'Premium Banquet Chair with metal powder coated base in gold finish.',
        longDescription: 'A highly luxurious banquet chair with gold-finished powder-coated metal legs, high quality foam seat and back.',
        price: 99,
        oldPrice: 125,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-03.jpg'],
        stock: 60,
        specs: {
          material: 'Metal & Gold Finish Steel',
          color: ['Emerald Green', 'Royal Blue'],
          brand: 'Ergosoul',
          height: '35 in',
          width: '22.8 in',
          weight: '6.3 kg',
          weightCapacity: '150 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-04',
        slug: 'ergosoul-banquet-chair-esbc-04',
        description: 'Premium Banquet Chair with high quality steel base and foam seat.',
        longDescription: 'Heavy-duty steel base banquet seating with high quality foam seat and bent wood ply backrest covered in premium fabric.',
        price: 95,
        oldPrice: 119,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-04.jpg'],
        stock: 80,
        specs: {
          material: 'Steel & Cushion Fabric',
          color: ['Classic Red', 'Emerald Green'],
          brand: 'Ergosoul',
          height: '38 in',
          width: '23 in',
          weight: '6.8 kg',
          weightCapacity: '160 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-05',
        slug: 'ergosoul-banquet-chair-esbc-05',
        description: 'Premium Banquet Chair with metal brown powder coated base.',
        longDescription: 'High quality foam seat & back made of bent wood ply with soft cushion fabric and brown powder coated metal legs.',
        price: 92,
        oldPrice: 115,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-05.jpg'],
        stock: 55,
        specs: {
          material: 'Metal & Bent Wood Ply',
          color: ['Emerald Green', 'Matte Brown'],
          brand: 'Ergosoul',
          height: '38 in',
          width: '22.8 in',
          weight: '6.4 kg',
          weightCapacity: '150 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-06',
        slug: 'ergosoul-banquet-chair-esbc-06',
        description: 'Premium Banquet Chair with stainless steel (S.S.) frame base.',
        longDescription: 'Rust-resistant stainless steel S.S frame base with high quality foam seat and backrest made of bent wood ply.',
        price: 119,
        oldPrice: 149,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-06.jpg'],
        stock: 70,
        specs: {
          material: 'Stainless Steel & Fabric',
          color: ['Emerald Green', 'Royal Blue'],
          brand: 'Ergosoul',
          height: '33.5 in',
          width: '22.8 in',
          weight: '7.0 kg',
          weightCapacity: '160 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-07',
        slug: 'ergosoul-banquet-chair-esbc-07',
        description: 'Premium Banquet Chair with metal base black powder coated.',
        longDescription: 'High quality foam seat and back with bent wood ply structure and black powder coated metal legs.',
        price: 88,
        oldPrice: 109,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-07.jpg'],
        stock: 110,
        specs: {
          material: 'Metal & Bent Wood Ply',
          color: ['Emerald Green', 'Classic Black'],
          brand: 'Ergosoul',
          height: '33.5 in',
          width: '21.8 in',
          weight: '6.1 kg',
          weightCapacity: '150 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-08',
        slug: 'ergosoul-banquet-chair-esbc-08',
        description: 'Premium Banquet Chair with S.S. Steel base frame.',
        longDescription: 'Ultra durable stainless steel S.S. Steel base frame with high quality foam cushioning and curved backrest.',
        price: 125,
        oldPrice: 159,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-08.jpg'],
        stock: 40,
        specs: {
          material: 'Stainless Steel & Bent Wood Ply',
          color: ['Emerald Green', 'Silver'],
          brand: 'Ergosoul',
          height: '38 in',
          width: '21 in',
          weight: '7.2 kg',
          weightCapacity: '170 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-09',
        slug: 'ergosoul-banquet-chair-esbc-09',
        description: 'Premium Banquet Chair made of polypropylene with soft cushion fabric.',
        longDescription: 'Durable and lightweight polypropylene backrest and seat frame with soft cushion fabric. Modern aesthetic by Ergosoul.',
        price: 75,
        oldPrice: 95,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-09.jpg'],
        stock: 90,
        specs: {
          material: 'Polypropylene & Fabric',
          color: ['Emerald Green', 'Classic Black'],
          brand: 'Ergosoul',
          height: '38 in',
          width: '21 in',
          weight: '4.8 kg',
          weightCapacity: '130 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-10',
        slug: 'ergosoul-banquet-chair-esbc-10',
        description: 'Premium Ergonomic Banquet Chair made of durable polypropylene.',
        longDescription: 'High quality polypropylene structure with soft cushion fabric. Modern ergonomic seat profile for banquets and hotels.',
        price: 79,
        oldPrice: 99,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-10.jpg'],
        stock: 95,
        specs: {
          material: 'Polypropylene & Fabric',
          color: ['Emerald Green', 'Classic Black'],
          brand: 'Ergosoul',
          height: '38 in',
          width: '21 in',
          weight: '4.9 kg',
          weightCapacity: '130 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Banquet Chair ESBC-11',
        slug: 'ergosoul-banquet-chair-esbc-11',
        description: 'Premium Banquet Chair with lightweight aluminium base frame.',
        longDescription: 'Ultra-lightweight aluminium base frame with high quality foam seat and back made by bent wood ply with soft cushion fabric.',
        price: 135,
        oldPrice: 169,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-11.jpg'],
        stock: 50,
        specs: {
          material: 'Aluminium & Bent Wood Ply',
          color: ['Emerald Green', 'Metallic Silver'],
          brand: 'Ergosoul',
          height: '38 in',
          width: '21 in',
          weight: '5.2 kg',
          weightCapacity: '150 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: false
      },
      {
        name: 'Ergosoul Stackable Banquet Chair ESBC-12',
        slug: 'ergosoul-stackable-banquet-chair-esbc-12',
        description: 'Metal Stackable Banquet Chair with 18mm capsule pipe and Altima foam.',
        longDescription: 'Commercial stackable banquet chair with 18mm capsule pipe thickness, 3-inch 32 Density Altima Foam, 12mm plywood in seat and back, rubber feet for scratch-free floors, and glossy finish.',
        price: 145,
        oldPrice: 189,
        mainCategory: 'Chairs',
        category: 'Banquet Chair',
        purpose: 'Hotel',
        images: ['/uploads/banquet/ESBC-12.jpg'],
        stock: 150,
        specs: {
          material: 'Alloy Steel & 12mm Plywood',
          color: ['Emerald Green', 'Royal Gold', 'Navy Blue'],
          brand: 'Ergosoul',
          height: '36.61 in',
          width: '17.71 in',
          weight: '7.5 kg',
          weightCapacity: '180 kg',
          armRest: 'None',
          headRest: 'None',
          reclining: 'No',
          wheelType: 'None'
        },
        warranty: '1 Year',
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    ,
{
  "name": "Ergosoul Apple Training Chair",
  "slug": "ergosoul-apple-training-chair",
  "description": "Premium training chair made of durable PVC plastic and metal body frame.",
  "longDescription": "High quality PVC plastic seat and back with 18 gauge powder coated metal frame. Features a laminated 16mm engineering plywood writing tablet. Designed by Ergosoul.",
  "price": 49,
  "oldPrice": 65,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "School",
  "images": [
    "/uploads/training_chair/Apple  training Chair.jpg"
  ],
  "stock": 120,
  "specs": {
    "material": "PVC Plastic & Steel",
    "color": [
      "Black",
      "Blue"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "15.5 in",
    "weight": "4.5 kg",
    "weightCapacity": "130 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Asian Training Chair",
  "slug": "ergosoul-asian-training-chair",
  "description": "Comfortable training chair with soft cushion fabric seat and metal frame base.",
  "longDescription": "Features a 12mm plywood seat and back structure covered in high-quality soft cushion fabric/rexin. Supported by an 18 gauge powder coated metal frame and a 16mm laminated writing tablet.",
  "price": 55,
  "oldPrice": 75,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "School",
  "images": [
    "/uploads/training_chair/Asian training Chair.jpg"
  ],
  "stock": 100,
  "specs": {
    "material": "Fabric & Bent Wood Plywood",
    "color": [
      "Gray",
      "Blue"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "15.5 in",
    "weight": "5.0 kg",
    "weightCapacity": "130 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Bobby Training Chair",
  "slug": "ergosoul-bobby-training-chair",
  "description": "Advanced training chair with soft PU pad armrest, metal body frame, and storage basket.",
  "longDescription": "Features a 12mm plywood cushioned seat and backrest, soft PU armrests, an 18 gauge powder coated metal frame, integrated bottom storage basket, and a laminated 16mm writing tablet.",
  "price": 69,
  "oldPrice": 89,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/Bobby  training Chair.jpg"
  ],
  "stock": 80,
  "specs": {
    "material": "Plywood, Fabric & PU Armrests",
    "color": [
      "Black",
      "Charcoal"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "17 in",
    "weight": "6.5 kg",
    "weightCapacity": "140 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": true,
  "isBestSeller": true,
  "isNewArrival": false
},
{
  "name": "Ergosoul Century Training Chair",
  "slug": "ergosoul-century-training-chair",
  "description": "Training chair with PVC plastic body, soft cushion fabric seat, and movable half tablet.",
  "longDescription": "Features a durable PVC plastic frame with a soft cushioned seat and backrest. Includes a movable half writing tablet made of PVC and an 18 gauge powder coated metal frame.",
  "price": 59,
  "oldPrice": 79,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "School",
  "images": [
    "/uploads/training_chair/Century training Chair.jpg"
  ],
  "stock": 90,
  "specs": {
    "material": "PVC Plastic & Fabric",
    "color": [
      "Blue",
      "Black"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "15.5 in",
    "weight": "5.2 kg",
    "weightCapacity": "130 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Classic Training Chair",
  "slug": "ergosoul-classic-training-chair",
  "description": "Premium classic training chair with soft PU pad armrest, metal frame, and writing tablet.",
  "longDescription": "Features a metal inner body frame with soft cushion fabric/rexin, padded PU armrests, an 18 gauge powder coated steel tube base, and a laminated 16mm engineering wood writing tablet.",
  "price": 75,
  "oldPrice": 99,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/Classic  training Chair (1).jpg"
  ],
  "stock": 85,
  "specs": {
    "material": "Metal, Fabric & Steel Frame",
    "color": [
      "Black",
      "Dark Red"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "19 in",
    "weight": "6.8 kg",
    "weightCapacity": "150 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Cosmo Training Chair",
  "slug": "ergosoul-cosmo-training-chair",
  "description": "Training chair with soft cushion plywood seat, PVC backrest, and movable half tablet.",
  "longDescription": "Features a 12mm plywood soft cushioned seat, a breathable PVC plastic backrest, an 18 gauge powder coated metal frame, and a movable half-size PVC writing tablet.",
  "price": 65,
  "oldPrice": 85,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "School",
  "images": [
    "/uploads/training_chair/Cosmo  training Chair.jpg"
  ],
  "stock": 110,
  "specs": {
    "material": "Plywood, Fabric & PVC",
    "color": [
      "Gray",
      "Black"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "17 in",
    "weight": "5.4 kg",
    "weightCapacity": "130 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Half Tablet Prizma Training Chair",
  "slug": "ergosoul-half-tablet-prizma-training-chair",
  "description": "Prizma training chair featuring 12mm plywood soft cushion seat and half writing tablet.",
  "longDescription": "High quality training chair featuring a 12mm plywood cushioned seat, PVC plastic backrest shell, 18 gauge powder coated metal frame, and a 16mm laminated engineering plywood writing tablet.",
  "price": 68,
  "oldPrice": 88,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "School",
  "images": [
    "/uploads/training_chair/Half Tablet Prizma Training Chair.jpg"
  ],
  "stock": 95,
  "specs": {
    "material": "Plywood, PVC & Metal Frame",
    "color": [
      "Black",
      "Blue"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "17 in",
    "weight": "5.5 kg",
    "weightCapacity": "130 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Igo Training Chair",
  "slug": "ergosoul-igo-training-chair",
  "description": "Stainless steel finished frame training chair with PP fiber backrest and movable tablet.",
  "longDescription": "Features a 12mm plywood cushioned seat with a polypropylene (P.P.) fiber backrest. Supported by an 18 gauge steel body frame with a sleek chrome finish and a movable half-size PVC writing tablet.",
  "price": 79,
  "oldPrice": 105,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/Igo   training Chair.jpg"
  ],
  "stock": 75,
  "specs": {
    "material": "Chrome Finished Steel & PP",
    "color": [
      "Black",
      "Chrome Silver"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "18 in",
    "weight": "6.2 kg",
    "weightCapacity": "140 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": true,
  "isBestSeller": false,
  "isNewArrival": true
},
{
  "name": "Ergosoul L-Cushion Training Chair",
  "slug": "ergosoul-l-cushion-training-chair",
  "description": "Luxe training chair with chrome plated metal frame and soft cushion rexin seat.",
  "longDescription": "Elegant L-shape cushioned profile made of 12mm bent wood plywood covered in soft cushion rexin. Supported by a chrome-plated 18 gauge steel pipe base and a half-tablet laminated writing desk.",
  "price": 85,
  "oldPrice": 110,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/L  Cushion  training Chair.jpg"
  ],
  "stock": 65,
  "specs": {
    "material": "Rexin & Chrome Plated Steel",
    "color": [
      "Classic Black",
      "Tan Brown"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "15.5 in",
    "weight": "6.4 kg",
    "weightCapacity": "140 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul National Training Chair",
  "slug": "ergosoul-national-training-chair",
  "description": "Durable PVC plastic training chair with powder coated metal frame and laminated tablet.",
  "longDescription": "Features a full PVC plastic seat and back shell, 18 gauge powder coated metal frame legs, and a 16mm laminated engineering plywood writing tablet.",
  "price": 48,
  "oldPrice": 60,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "School",
  "images": [
    "/uploads/training_chair/National  training Chair.jpg"
  ],
  "stock": 140,
  "specs": {
    "material": "PVC Plastic & Steel",
    "color": [
      "Blue",
      "Red",
      "Black"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "15.5 in",
    "weight": "4.6 kg",
    "weightCapacity": "130 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Orbit Training Chair",
  "slug": "ergosoul-orbit-training-chair",
  "description": "Nylon backrest training chair with mesh fabric, soft cushion seat, and half tablet.",
  "longDescription": "High quality nylon backrest with breathable mesh fabric, a 12mm plywood cushioned seat, 18 gauge powder coated metal frame, and a movable half-size PVC writing tablet.",
  "price": 89,
  "oldPrice": 119,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/Orbit   training Chair (14).jpg"
  ],
  "stock": 70,
  "specs": {
    "material": "Nylon Mesh & Metal Frame",
    "color": [
      "Black",
      "Blue"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "15.5 in",
    "weight": "5.8 kg",
    "weightCapacity": "140 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": true,
  "isBestSeller": true,
  "isNewArrival": false
},
{
  "name": "Ergosoul Perfo Training Chair",
  "slug": "ergosoul-perfo-training-chair",
  "description": "Metal body frame training chair with soft cushion seat, laminated writing tablet.",
  "longDescription": "Features a sturdy metal inner seat frame with high quality soft cushion fabric, an 18 gauge powder coated steel frame, and a 16mm laminated writing tablet.",
  "price": 72,
  "oldPrice": 95,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/Perfo  training Chair.jpg"
  ],
  "stock": 90,
  "specs": {
    "material": "Metal, Fabric & Laminated Plywood",
    "color": [
      "Royal Blue",
      "Classic Charcoal"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "17.5 in",
    "weight": "6.7 kg",
    "weightCapacity": "150 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Prizma Training Chair",
  "slug": "ergosoul-prizma-training-chair",
  "description": "Prizma training chair with 12mm plywood soft cushion seat and full writing tablet.",
  "longDescription": "Features a 12mm plywood cushioned seat, PVC plastic backrest shell, 18 gauge powder coated metal frame, and a full-size 16mm laminated engineering plywood writing tablet.",
  "price": 70,
  "oldPrice": 90,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "School",
  "images": [
    "/uploads/training_chair/Prizma  training Chair.jpg"
  ],
  "stock": 110,
  "specs": {
    "material": "Plywood, PVC & Metal Frame",
    "color": [
      "Classic Black",
      "Navy Blue"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "17 in",
    "weight": "5.6 kg",
    "weightCapacity": "130 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Sigma Chaoras Training Chair",
  "slug": "ergosoul-sigma-chaoras-training-chair",
  "description": "Ergonomic training chair with nylon net mesh fabric, MSPC frame, and writing tablet.",
  "longDescription": "Features a 12mm plywood soft cushioned seat, a mesh backrest supported by a mild steel powder-coated (MSPC) frame, an 18 gauge powder coated metal base, and a 16mm laminated writing tablet.",
  "price": 95,
  "oldPrice": 129,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/Sigma chaoras  training Chair.jpg"
  ],
  "stock": 50,
  "specs": {
    "material": "Nylon Net Mesh & Mild Steel",
    "color": [
      "Charcoal Black",
      "Cobalt Blue"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "18 in",
    "weight": "6.0 kg",
    "weightCapacity": "140 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": true,
  "isBestSeller": false,
  "isNewArrival": true
},
{
  "name": "Ergosoul Three-Line Training Chair",
  "slug": "ergosoul-three-line-training-chair",
  "description": "Three-line design training chair with PU armrest, metal basket frame, and writing tablet.",
  "longDescription": "Features a 12mm plywood seat and back covered in premium cushion fabric with stylish three-line stitched detail. Equipped with soft PU armrests, an 18 gauge powder coated metal frame with integrated storage basket, and a laminated writing tablet.",
  "price": 82,
  "oldPrice": 110,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/Three line   training Chair.jpg"
  ],
  "stock": 65,
  "specs": {
    "material": "Fabric, Plywood & PU Padded Arms",
    "color": [
      "Black",
      "Dark Red"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "17 in",
    "weight": "6.9 kg",
    "weightCapacity": "150 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Three-Line Cushioned Training Chair",
  "slug": "ergosoul-three-line-cushioned-training-chair",
  "description": "Cushioned training chair featuring three-line fabric detail, PU armrests, and bottom basket.",
  "longDescription": "Highly comfortable seminar seating with 12mm plywood back and seat frame covered in Altima foam and three-line fabric detail. Includes soft PU pad armrests, 18 gauge powder coated legs, wire basket, and laminated writing desk.",
  "price": 88,
  "oldPrice": 115,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/Three line Seat & Back training Chair.jpg"
  ],
  "stock": 75,
  "specs": {
    "material": "Fabric, Altima Foam & Steel Frame",
    "color": [
      "Classic Black",
      "Navy Blue"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "17 in",
    "weight": "7.0 kg",
    "weightCapacity": "150 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Training Chair ESBC-13",
  "slug": "ergosoul-training-chair-esbc-13",
  "description": "Durable training chair with soft cushion seat, PU armrest, and integrated wire basket.",
  "longDescription": "Features a 12mm plywood cushioned seat/backrest, soft PU armrests, an 18 gauge powder coated metal frame legs, an integrated wire basket under the seat, and a laminated writing tablet.",
  "price": 74,
  "oldPrice": 99,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "Office",
  "images": [
    "/uploads/training_chair/training Chair 13.jpg"
  ],
  "stock": 80,
  "specs": {
    "material": "Plywood, Fabric & Steel Frame",
    "color": [
      "Black",
      "Dark Gray"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "17.5 in",
    "weight": "6.6 kg",
    "weightCapacity": "150 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Training Chair ESBC-16",
  "slug": "ergosoul-training-chair-esbc-16",
  "description": "Comfortable PVC training chair with soft cushion fabric and movable plastic half tablet.",
  "longDescription": "Features a durable PVC plastic back shell, soft cushioned fabric seat, an 18 gauge powder coated metal frame, and a movable half-size PVC writing tablet.",
  "price": 78,
  "oldPrice": 100,
  "mainCategory": "Chairs",
  "category": "Training Chair",
  "purpose": "School",
  "images": [
    "/uploads/training_chair/training Chair 16.jpg"
  ],
  "stock": 90,
  "specs": {
    "material": "PVC, Fabric & Steel Pipe",
    "color": [
      "Blue",
      "Black"
    ],
    "brand": "Ergosoul",
    "height": "33.5 in",
    "width": "15.5 in",
    "weight": "5.1 kg",
    "weightCapacity": "130 kg",
    "armRest": "None",
    "headRest": "None",
    "reclining": "No",
    "wheelType": "None"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
  {
    name: 'Ergosoul Wooden Training Chair',
    slug: 'ergosoul-wooden-training-chair',
    description: 'Luxurious bent wood polished plywood training chair with stainless steel (SS) frame.',
    longDescription: 'Premium auditorium/seminar seating. Features a seat and backrest made of high-grade bent wood polished plywood, an 18 gauge stainless steel (S.S) pipe frame, and a 14mm matching bent wood writing tablet.',
    price: 110,
    oldPrice: 145,
    mainCategory: 'Chairs',
    category: 'Training Chair',
    purpose: 'Office',
    images: ['/uploads/training_chair/Wooden  training Chair.jpg'],
    stock: 50,
    specs: {
      material: 'Bent Wood Plywood & Stainless Steel',
      color: ['Polished Walnut', 'Polished Oak'],
      brand: 'Ergosoul',
      height: '35 in',
      width: '15.5 in',
      weight: '7.3 kg',
      weightCapacity: '150 kg',
      armRest: 'None',
      headRest: 'None',
      reclining: 'No',
      wheelType: 'None'
    },
    warranty: '1 Year',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true
  },
{
  "name": "Ergosoul Aqua Premium Leather MB Executive Chair",
  "slug": "ergosoul-aqua-premium-leather-mb-executive-chair",
  "description": "Aqua Premium Medium Back executive chair with finest composite leather and diecast armrests.",
  "longDescription": "Medium Back executive chair designed for meeting rooms and conference setups. Features finest composite leather on seat & back, aluminum diecast armrest with PU pads, knee tilt mechanism with multi-position lock, class 4 gas lift, and 700mm aluminium diecast base.",
  "price": 199,
  "oldPrice": 249,
  "mainCategory": "Chairs",
  "category": "Meeting Room Office Chair",
  "purpose": "Office",
  "images": [
    "/uploads/meeting_room_office_chair/aqua/Aqua Premium  (1).JPG",
    "/uploads/meeting_room_office_chair/aqua/aqua  (6).JPG"
  ],
  "stock": 40,
  "specs": {
    "material": "Composite Leather & Aluminum",
    "color": [
      "Black",
      "Amber"
    ],
    "brand": "Ergosoul",
    "height": "43-45 in",
    "width": "25 in",
    "weight": "14 kg",
    "weightCapacity": "150 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "Yes",
    "wheelType": "Nylon Casters"
  },
  "warranty": "2 Years",
  "isFeatured": true,
  "isBestSeller": false,
  "isNewArrival": true
},
{
  "name": "Ergosoul Crown Leather MB Executive Chair",
  "slug": "ergosoul-crown-leather-mb-executive-chair",
  "description": "Crown Medium Back executive chair with finest composite leather and diecast armrests.",
  "longDescription": "Elegantly styled Crown Medium Back executive chair. Features finest composite leather on seat & back, aluminum diecast armrests with PU pads, knee tilt mechanism with multi-position locks, class 4 gas lift, and 700mm aluminium diecast base.",
  "price": 210,
  "oldPrice": 260,
  "mainCategory": "Chairs",
  "category": "Meeting Room Office Chair",
  "purpose": "Office",
  "images": [
    "/uploads/meeting_room_office_chair/crown/IMG_6873.JPG",
    "/uploads/meeting_room_office_chair/crown/IMG_6874.JPG",
    "/uploads/meeting_room_office_chair/crown/IMG_6875.JPG"
  ],
  "stock": 35,
  "specs": {
    "material": "Composite Leather & Aluminum",
    "color": [
      "Black",
      "Charcoal"
    ],
    "brand": "Ergosoul",
    "height": "43-45 in",
    "width": "25 in",
    "weight": "14.2 kg",
    "weightCapacity": "150 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "Yes",
    "wheelType": "Nylon Casters"
  },
  "warranty": "2 Years",
  "isFeatured": false,
  "isBestSeller": true,
  "isNewArrival": false
},
{
  "name": "Ergosoul Crusie Leather MB Executive Chair",
  "slug": "ergosoul-crusie-leather-mb-executive-chair",
  "description": "Crusie Medium Back executive chair with finest pure leather and extra lumbar support cushions.",
  "longDescription": "Premium meeting room chair featuring a multi-bend plywood structure with molded cushion, finest pure leather upholstery on seat & back, fixed armrests with padded cushions, knee-tilt synchro mechanism with multi-position locks, and a 700mm aluminium diecast base.",
  "price": 245,
  "oldPrice": 299,
  "mainCategory": "Chairs",
  "category": "Meeting Room Office Chair",
  "purpose": "Office",
  "images": [
    "/uploads/meeting_room_office_chair/crusie/WhatsApp Image 2023-12-02 at 5.54.59 PM.jpeg",
    "/uploads/meeting_room_office_chair/crusie/WhatsApp Image 2023-12-02 at 5.54.59 PM (1).jpeg"
  ],
  "stock": 25,
  "specs": {
    "material": "Pure Leather, Plywood & Padded Arms",
    "color": [
      "Black",
      "Tan"
    ],
    "brand": "Ergosoul",
    "height": "37 in",
    "width": "28 in",
    "weight": "15.5 kg",
    "weightCapacity": "160 kg",
    "armRest": "Fixed Cushion Padded",
    "headRest": "None",
    "reclining": "Yes",
    "wheelType": "Nylon Casters"
  },
  "warranty": "3 Years",
  "isFeatured": true,
  "isBestSeller": true,
  "isNewArrival": false
},
{
  "name": "Ergosoul Delta Leather MB Executive Chair",
  "slug": "ergosoul-delta-leather-mb-executive-chair",
  "description": "Delta Medium Back executive chair with finest composite leather and built-in lumbar support.",
  "longDescription": "Delta Medium Back office chair designed for active ergonomics. Features finest composite leather on seat and back, 500mm aluminium die cast base with nylon castors, self-in design lumbar support, and synchro tilt mechanism.",
  "price": 185,
  "oldPrice": 229,
  "mainCategory": "Chairs",
  "category": "Meeting Room Office Chair",
  "purpose": "Office",
  "images": [
    "/uploads/meeting_room_office_chair/delta/WhatsApp Image 2024-01-19 at 17.26.47.jpeg",
    "/uploads/meeting_room_office_chair/delta/WhatsApp Image 2024-01-19 at 17.26.47 (1).jpeg",
    "/uploads/meeting_room_office_chair/delta/WhatsApp Image 2024-01-19 at 17.27.36.jpeg"
  ],
  "stock": 50,
  "specs": {
    "material": "Composite Leather & Aluminum Base",
    "color": [
      "Black",
      "Brown"
    ],
    "brand": "Ergosoul",
    "height": "43-45 in",
    "width": "25 in",
    "weight": "13.5 kg",
    "weightCapacity": "150 kg",
    "armRest": "Fixed Cushion Padded",
    "headRest": "None",
    "reclining": "Yes",
    "wheelType": "Nylon Casters"
  },
  "warranty": "2 Years",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Magna Leather MB Executive Chair",
  "slug": "ergosoul-magna-leather-mb-executive-chair",
  "description": "Magna Medium Back executive chair with molded seat, PU upholstery, and push-back synchro mechanism.",
  "longDescription": "Sophisticated Magna meeting room chair with a molded seat and back with PU upholstery, multiple locking push-back synchro mechanism, PU pads on aluminum armrests, medium gas lift, and heavy duty aluminum base.",
  "price": 225,
  "oldPrice": 275,
  "mainCategory": "Chairs",
  "category": "Meeting Room Office Chair",
  "purpose": "Office",
  "images": [
    "/uploads/meeting_room_office_chair/magna/aqua  (3).JPG",
    "/uploads/meeting_room_office_chair/magna/aqua  (4).JPG"
  ],
  "stock": 30,
  "specs": {
    "material": "PU Upholstery & Aluminum",
    "color": [
      "Black",
      "Charcoal"
    ],
    "brand": "Ergosoul",
    "height": "43-45 in",
    "width": "25 in",
    "weight": "14.8 kg",
    "weightCapacity": "150 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "Yes",
    "wheelType": "Nylon Casters"
  },
  "warranty": "2 Years",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  "name": "Ergosoul Stanlee MB Executive Chair",
  "slug": "ergosoul-stanlee-mb-executive-chair",
  "description": "Stanlee Medium Back executive chair with molded seat, PU upholstery, and push-back synchro mechanism.",
  "longDescription": "Designed for executive conference rooms. Features a molded seat and back with premium PU upholstery, multiple locking push-back synchro mechanism, PU pads on aluminum armrests, and a sturdy aluminum base.",
  "price": 235,
  "oldPrice": 285,
  "mainCategory": "Chairs",
  "category": "Meeting Room Office Chair",
  "purpose": "Office",
  "images": [
    "/uploads/meeting_room_office_chair/stanlee/E 24 MB.PNG",
    "/uploads/meeting_room_office_chair/stanlee/E 26 MB.PNG"
  ],
  "stock": 32,
  "specs": {
    "material": "PU Upholstery & Aluminum Base",
    "color": [
      "Black",
      "Amber"
    ],
    "brand": "Ergosoul",
    "height": "43-45 in",
    "width": "25 in",
    "weight": "15.0 kg",
    "weightCapacity": "150 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "Yes",
    "wheelType": "Nylon Casters"
  },
  "warranty": "2 Years",
  "isFeatured": true,
  "isBestSeller": true,
  "isNewArrival": true
},
{
  "name": "Ergosoul Wanetta Executive Low Back Chair",
  "slug": "ergosoul-wanetta-executive-low-back-chair",
  "description": "Wanetta low back meeting chair with double-layer pillow cushions and chrome armrests.",
  "longDescription": "Low back executive chair designed for modern office spaces. Features finest composite rexine with double-layer pillow construction on seat and back cushions, built-in lumbar support, metallic chrome armrests with soft pads, center tilt mechanism, and a steel chrome base.",
  "price": 179,
  "oldPrice": 219,
  "mainCategory": "Chairs",
  "category": "Meeting Room Office Chair",
  "purpose": "Office",
  "images": [
    "/uploads/meeting_room_office_chair/wanetta/wanetta executive low backchair black.jpg"
  ],
  "stock": 45,
  "specs": {
    "material": "Composite Rexine & Steel Chrome",
    "color": [
      "Black"
    ],
    "brand": "Ergosoul",
    "height": "36.6 in",
    "width": "24 in",
    "weight": "12.8 kg",
    "weightCapacity": "140 kg",
    "armRest": "Fixed PU Padded",
    "headRest": "None",
    "reclining": "Yes",
    "wheelType": "Nylon Casters"
  },
  "warranty": "1 Year",
  "isFeatured": false,
  "isBestSeller": false,
  "isNewArrival": false
},
{
  name: 'Nuvola Bouclé Sectional L-Shape Sofa',
  slug: 'nuvola-boucle-sectional-l-shape-sofa',
  description: 'Ultra-luxurious L-shape sectional sofa wrapped in premium textured bouclé fabric.',
  longDescription: 'Experience cloud-like luxury with the Nuvola Sectional. Features high-resilience memory foam cushioning, solid birchwood framing, and deep low-profile seating that adapts to your relaxation needs.',
  price: 2499,
  oldPrice: 2999,
  mainCategory: 'Sofa',
  category: 'L-Shape Sofa',
  purpose: 'Home',
  images: ['https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=600'],
  stock: 4,
  specs: {
    material: 'Premium Textured Bouclé & Birchwood',
    color: ['Off-White', 'Oatmeal', 'Slate Grey'],
    brand: 'Ergosoul Living',
    height: '72 cm',
    width: '280 cm',
    weight: '75 kg',
    weightCapacity: '500 kg',
    armRest: 'Low-profile Padded',
    headRest: 'None',
    reclining: 'No',
    wheelType: 'None'
  },
  warranty: '5 Years',
  isFeatured: true,
  isBestSeller: false,
  isNewArrival: true
},
{
  name: 'Solo Ergonomic Italian Leather Single Seater Sofa',
  slug: 'solo-ergonomic-italian-leather-single-seater-sofa',
  description: 'Executive single-seater lounge sofa upholstered in top-grain aniline leather.',
  longDescription: 'Bespoke individual comfort designed for studies and offices. Includes high-density cooling gel foam, solid walnut wood arm accents, and a heavy-duty steel swivel base with tilt-tension controls.',
  price: 699,
  oldPrice: 849,
  mainCategory: 'Sofa',
  category: 'Single Seater Sofa',
  purpose: 'Office',
  images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=600'],
  stock: 8,
  specs: {
    material: 'Top-Grain Italian Leather & Walnut',
    color: ['Cognac Brown', 'Obsidian Black'],
    brand: 'Ergosoul Premium',
    height: '85 cm',
    width: '82 cm',
    weight: '24 kg',
    weightCapacity: '150 kg',
    armRest: 'Walnut Wood Armrest',
    headRest: 'Integrated Neck Cushion',
    reclining: 'Yes (105° - 120°)',
    wheelType: 'None'
  },
  warranty: '3 Years',
  isFeatured: false,
  isBestSeller: true,
  isNewArrival: false
},
{
  name: 'Heritage Solid Mahogany Executive Desk',
  slug: 'heritage-solid-mahogany-executive-desk',
  description: 'Classic double-pedestal executive office table crafted from hand-carved mahogany.',
  longDescription: 'Bring timeless prestige to your office setup. Features beautiful solid mahogany wood grain, premium brass drawer handles, a built-in leather writing pad, and dynamic cable routing ports.',
  price: 1899,
  oldPrice: 2299,
  mainCategory: 'Office Table',
  category: 'Executive Desk',
  purpose: 'Office',
  images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600'],
  stock: 3,
  specs: {
    material: 'Solid Mahogany Wood & Solid Brass',
    color: ['Dark Mahogany', 'Natural Walnut'],
    brand: 'Ergosoul Office',
    height: '76 cm',
    width: '180 cm',
    weight: '62 kg',
    weightCapacity: '200 kg',
    armRest: 'None',
    headRest: 'None',
    reclining: 'No',
    wheelType: 'None'
  },
  warranty: '5 Years',
  isFeatured: true,
  isBestSeller: true,
  isNewArrival: false
},
{
  name: 'Summit Modular Boardroom Conference Table',
  slug: 'summit-modular-boardroom-conference-table',
  description: 'Extra-large professional conference table with integrated power sockets and wood veneer finish.',
  longDescription: 'Perfect for conference halls and collaborative boardrooms. Features double-pedestal steel columns supporting a thick oak veneer top, built-in dynamic flip-up electrical/HDMI boxes, and a wire management chassis.',
  price: 2999,
  oldPrice: 3499,
  mainCategory: 'Office Table',
  category: 'Conference Table',
  purpose: 'Office',
  images: ['https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600'],
  stock: 2,
  specs: {
    material: 'Oak Wood Veneer & Carbon Steel',
    color: ['Light Natural Oak', 'Dark Charcoal Oak'],
    brand: 'Ergosoul Office',
    height: '75 cm',
    width: '320 cm',
    weight: '98 kg',
    weightCapacity: '300 kg',
    armRest: 'None',
    headRest: 'None',
    reclining: 'No',
    wheelType: 'None'
  },
  warranty: '5 Years',
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: true
},
{
  name: 'Nordic Oak 2-Door Wardrobe',
  slug: 'nordic-oak-2-door-wardrobe',
  description: 'Minimalist double-door bedroom wardrobe with soft-closing hinges and solid pine drawers.',
  longDescription: 'Keep your clothes organized in style. Features high-quality American white oak veneer, modern soft-closing doors, a heavy-duty clothes hanging rail, and 3 integrated storage drawers.',
  price: 799,
  oldPrice: 949,
  mainCategory: 'Wardrobe',
  category: '2-Door Wardrobe',
  purpose: 'Home',
  images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600'],
  stock: 7,
  specs: {
    material: 'American White Oak & Pinewood',
    color: ['Natural Oak', 'Smoked Oak'],
    brand: 'Ergosoul Living',
    height: '190 cm',
    width: '100 cm',
    weight: '55 kg',
    weightCapacity: '120 kg',
    armRest: 'None',
    headRest: 'None',
    reclining: 'No',
    wheelType: 'None'
  },
  warranty: '3 Years',
  isFeatured: true,
  isBestSeller: false,
  isNewArrival: false
},
{
  name: 'Metropolitan Sliding Door Wardrobe',
  slug: 'metropolitan-sliding-door-wardrobe',
  description: 'Modern space-saving sliding wardrobe with full-length integrated mirror panels.',
  longDescription: 'Maximize your bedroom space. Includes double sliding tracks with full soft-close damper pistons, high-definition safety mirror panels, multiple shelving segments, and dual hanging rods.',
  price: 1199,
  oldPrice: 1399,
  mainCategory: 'Wardrobe',
  category: 'Sliding Door Wardrobe',
  purpose: 'Home',
  images: ['https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600'],
  stock: 6,
  specs: {
    material: 'Engineered HDF Wood & Glass Mirror',
    color: ['Premium Walnut', 'Classic White'],
    brand: 'Ergosoul Living',
    height: '210 cm',
    width: '160 cm',
    weight: '82 kg',
    weightCapacity: '180 kg',
    armRest: 'None',
    headRest: 'None',
    reclining: 'No',
    wheelType: 'None'
  },
  warranty: '3 Years',
  isFeatured: false,
  isBestSeller: true,
  isNewArrival: true
},
{
  name: 'Elysian Tufted King Platform Bed',
  slug: 'elysian-tufted-king-platform-bed',
  description: 'Premium king-size platform bed featuring a hand-tufted headboard and velvet wrap.',
  longDescription: 'Bring hotel-like luxury to your master bedroom. Features a thick, hand-tufted high back headboard filled with premium foam, solid hardwood support slats that eliminate the need for a box spring, and strong brass-tipped steel support legs.',
  price: 1499,
  oldPrice: 1799,
  mainCategory: 'Furniture',
  category: 'Bed',
  purpose: 'Home',
  images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600'],
  stock: 5,
  specs: {
    material: 'Hardwood Slats & Performance Velvet',
    color: ['Royal Navy', 'Sand Beige', 'Charcoal'],
    brand: 'Ergosoul Living',
    height: '135 cm',
    width: '215 cm',
    weight: '58 kg',
    weightCapacity: '400 kg',
    armRest: 'None',
    headRest: 'None',
    reclining: 'No',
    wheelType: 'None'
  },
  warranty: '5 Years',
  isFeatured: true,
  isBestSeller: false,
  isNewArrival: true
},
{
  name: 'Tuscany Live-Edge Oak Dining Table',
  slug: 'tuscany-live-edge-oak-dining-table',
  description: 'Stunning 6-seater dining table crafted from a single slab of rustic live-edge oak wood.',
  longDescription: 'A gorgeous centerpiece for modern dining rooms. Crafted from 4.5cm thick solid live-edge French oak wood with heavy-duty black powder-coated steel X-legs, presenting an industrial yet organic aesthetic.',
  price: 1299,
  oldPrice: 1599,
  mainCategory: 'Furniture',
  category: 'Dining Table',
  purpose: 'Home',
  images: ['https://images.unsplash.com/photo-1544207240-8b1025eb7a6c?q=80&w=600'],
  stock: 4,
  specs: {
    material: 'Live-Edge French Oak Wood & Steel',
    color: ['Golden Honey Oak', 'Raw Smoked Oak'],
    brand: 'Ergosoul Living',
    height: '76 cm',
    width: '200 cm',
    weight: '65 kg',
    weightCapacity: '250 kg',
    armRest: 'None',
    headRest: 'None',
    reclining: 'No',
    wheelType: 'None'
  },
  warranty: '5 Years',
  isFeatured: true,
  isBestSeller: true,
  isNewArrival: false
}
    ];

    // Seed products & capture references
    const createdProducts = [];
    for (const prod of productData) {
      const p = await Product.create(prod);
      createdProducts.push(p);
    }
    console.log(`Seed: Created ${createdProducts.length} premium products.`);

    // 5. Create Reviews for top products
    const sampleReviews = [
      {
        rating: 5,
        title: 'Best ergonomic chair I have ever owned',
        comment: 'Absolutely love the AeroFlex. The mesh lumbar tracking is incredibly supportive. Working 10 hours a day doesn\'t hurt my back anymore. Extremely high build quality!',
        recommends: true
      },
      {
        rating: 4,
        title: 'Very comfortable but assembly took 20 minutes',
        comment: 'Great chair support, mesh is very cool. The wheels slide silently on hard wood floors. Highly recommended, though instructions could be slightly clearer.',
        recommends: true
      }
    ];

    // Add sample reviews to AeroFlex
    const aeroflex = createdProducts.find(p => p.slug === 'aeroflex-ergonomic-mesh-task-chair');
    if (aeroflex) {
      await Review.create({
        user: customer._id,
        product: aeroflex._id,
        rating: sampleReviews[0].rating,
        title: sampleReviews[0].title,
        comment: sampleReviews[0].comment,
        recommends: sampleReviews[0].recommends
      });

      await Review.create({
        user: admin._id,
        product: aeroflex._id,
        rating: sampleReviews[1].rating,
        title: sampleReviews[1].title,
        comment: sampleReviews[1].comment,
        recommends: sampleReviews[1].recommends
      });

      // Update ratings average
      aeroflex.ratings.count = 2;
      aeroflex.ratings.average = 4.5;
      await aeroflex.save();
      console.log('Seed: Added reviews to AeroFlex.');
    }

    // Add a review to Apex Throne
    const apex = createdProducts.find(p => p.slug === 'apex-throne-carbon-esports-chair');
    if (apex) {
      await Review.create({
        user: customer._id,
        product: apex._id,
        rating: 5,
        title: 'Esports ready, cooling gel works wonders!',
        comment: 'Amazing support, reclining flat is super nice for quick breaks between gaming queues. Highly durable carbon leather.',
        recommends: true
      });
      apex.ratings.count = 1;
      apex.ratings.average = 5;
      await apex.save();
    }

    console.log('Seed: Database completely seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed: Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();

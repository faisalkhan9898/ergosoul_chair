import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaShippingFast, FaShieldAlt, FaTools, FaQuoteLeft, FaStar, FaChevronDown } from 'react-icons/fa';
import API, { getImageUrl } from '../services/api';
import ProductCard from '../components/ProductCard';

// Swiper slider imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featRes, bestRes, catRes] = await Promise.all([
          API.get('/products', { params: { isFeatured: true, limit: 4 } }),
          API.get('/products', { params: { isBestSeller: true, limit: 4 } }),
          API.get('/categories')
        ]);
        
        setFeatured(featRes.data.products);
        setBestSellers(bestRes.data.products);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Home data load failed, using local fallback:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-20 font-sans">
      {/* 1. HERO BANNER */}
      <section className="relative h-[85vh] bg-primary-dark overflow-hidden flex items-center bg-[url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1600')] bg-cover bg-center">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white space-y-6">
          <span className="text-secondary font-semibold text-xs tracking-widest uppercase block animate-fade-in">
            Premium Italian Craftsmanship
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif leading-tight max-w-2xl font-bold">
            Every Chair for <span className="text-secondary">Every Purpose</span>.
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-lg font-light leading-relaxed">
            Ditch generic seating. Experience bespoke lumbar curvature, solid natural hardwood joints, and high-performance breathable fabrics engineered for health.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/shop"
              className="px-8 py-4 bg-secondary hover:bg-secondary-dark text-gray-900 font-bold rounded-full text-sm shadow-glow transition-all flex items-center gap-2"
            >
              Explore Collection
              <FaArrowRight className="text-xs" />
            </Link>
            <Link
              to="/shop?mainCategory=Chairs"
              className="px-8 py-4 border border-white/20 hover:border-white hover:bg-white/5 rounded-full text-sm font-semibold transition-all"
            >
              Fit My Office
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif text-gray-900 dark:text-white">Shop by Category</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">Explore custom built architectures tailored to specific comfort and structural demands.</p>
        </div>

        <div className="category-slider">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            loop={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 }
            }}
            className="pb-12"
          >
            {categories.map((cat, idx) => (
              <SwiperSlide key={idx}>
                <Link
                  to={`/shop?mainCategory=${encodeURIComponent(cat.name)}`}
                  className="relative group rounded-2xl overflow-hidden aspect-[4/3] shadow-premium block bg-gray-100"
                >
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-2xl mb-1.5">{cat.icon}</span>
                    <h4 className="font-serif font-bold text-base group-hover:text-secondary transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-[10px] text-gray-300 font-light opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                      View Models <FaArrowRight className="text-[8px]" />
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif text-gray-900 dark:text-white">Featured Masterpieces</h2>
            <p className="text-xs text-gray-400">Handpicked models defining active seating technology and art.</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors">
            See All Chairs <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 h-80 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {[
            {
              icon: <FaShippingFast className="text-3xl text-secondary" />,
              title: 'White Glove Express Shipping',
              desc: 'Every chair is shipped in heavy-duty reinforced shockproof packages. Free residential delivery for purchases above $1000.'
            },
            {
              icon: <FaShieldAlt className="text-3xl text-secondary" />,
              title: 'Lifetime Structural Warranty',
              desc: 'We construct framework using high-tensile steel frames and solid grade-A hardwoods. We cover cylinders and joints for up to 7 Years.'
            },
            {
              icon: <FaTools className="text-3xl text-secondary" />,
              title: 'Custom Fabric Branding',
              desc: 'Choose from 50+ textures including premium Italian wool, aniline top-grain leathers, and dual-layer elastic Korean mesh.'
            }
          ].map((feat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-150/50 dark:border-gray-700 shadow-premium hover:shadow-luxury transition-all duration-300 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                {feat.icon}
              </div>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">{feat.title}</h3>
              <p className="text-sm text-gray-400 dark:text-gray-300 leading-relaxed font-light">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif text-gray-900 dark:text-white">Best Sellers</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">The absolute favorites verified by thousands of customers worldwide.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 h-80 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 6. STATISTICS ROW */}
      <section className="bg-primary dark:bg-gray-950 py-16 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '120k+', label: 'Chairs Sold' },
            { value: '99.2%', label: 'Ergonomic Satisfaction' },
            { value: '20+', label: 'Seating Categories' },
            { value: '15 Years', label: 'Manufacturing Legacy' }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <h2 className="text-3xl sm:text-5xl font-serif text-secondary font-bold">{stat.value}</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-light uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. REVIEWS & ACCORDIAN FAQS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Reviews */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif text-gray-900 dark:text-white">Customer Experiences</h2>
            <div className="flex text-amber-500 justify-center gap-1.5 mt-2">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 border dark:border-gray-850 p-8 rounded-3xl relative text-center shadow-sm">
            <FaQuoteLeft className="text-amber-500/20 text-5xl absolute left-6 top-6" />
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-200 font-light italic leading-relaxed relative z-10">
              "Buying the AeroFlex mesh task chair has completely solved my chronic low back problems. The responsive lumbar support tracks my spinal shifts seamlessly. The delivery was fast and the assembly took less than 15 minutes. Best investment I've made in years."
            </p>
            <div className="mt-6">
              <h4 className="font-semibold font-serif text-sm text-gray-900 dark:text-white">Dr. Aris Vance</h4>
              <span className="text-xs text-gray-400">Orthopedic Specialist, NY</span>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          <h2 className="text-3xl font-serif text-center text-gray-900 dark:text-white">Seating FAQs</h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'What makes Ergosoul superior to IKEA or standard office furniture?',
                a: 'Ergosoul uses dual-density seat cores that do not bottom out, gas spring cylinders certified up to 220kg load capacities, and synchronized recline angles (up to 135-165 degrees) that relieve spinal disk tension during rest cycles.'
              },
              {
                q: 'How does the white glove delivery work?',
                a: 'For heavy duty wooden lounge chairs or large packages, our shipping partners unpack, inspect, and position the chairs in your desired room, discarding all packaging debris.'
              },
              {
                q: 'Can I request custom adjustments for corporate office fit-outs?',
                a: 'Absolutely! We offer custom logo hot-stamp branding on leather backrests, custom pantone color matching for mesh materials, and bulk contract pricing. Reach out directly via our live chat.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-150 dark:border-gray-850 pb-4">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center text-left py-3 font-semibold text-gray-900 dark:text-white hover:text-amber-500 transition-colors"
                >
                  <span className="text-sm sm:text-base font-serif">{faq.q}</span>
                  <FaChevronDown className={`text-xs transition-transform duration-300 ${openFaq === idx ? 'transform rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <p className="text-sm text-gray-400 mt-2 font-light leading-relaxed animate-fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

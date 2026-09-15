import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-primary dark:bg-gray-950 text-white font-sans transition-colors duration-300 border-t dark:border-gray-800">
      {/* Upper Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand details */}
        <div className="space-y-5">
          <Link to="/" className="inline-block">
            <div className="h-16 w-48 overflow-hidden flex items-center justify-center relative -ml-4 rounded-xl bg-white border border-gray-150 shadow-sm">
              <img
                src="/logo.png"
                alt="Ergosoul Logo"
                className="h-28 w-auto max-w-none object-contain scale-[1.7]"
              />
            </div>
          </Link>
          <p className="text-sm text-gray-300 leading-relaxed font-light">
            We Manufacture Office Chairs, Sofas, Salon Chairs, & Other Furniture. High-end home & corporate interior solutions tailored for ergonomics, luxury, and lifetime durability.
          </p>
          <div className="flex gap-4">
            {[{ icon: <FaFacebookF />, url: '#' },
              { icon: <FaInstagram />, url: '#' },
              { icon: <FaTwitter />, url: '#' },
              { icon: <FaLinkedinIn />, url: '#' }
            ].map((social, i) => (
              <a
                key={i}
                href={social.url}
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-secondary text-gray-300 hover:text-gray-900 flex items-center justify-center transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Categories Quick Links */}
        <div className="space-y-4">
          <h4 className="font-semibold font-serif text-sm tracking-wider uppercase border-b border-gray-800 pb-2">Seating Catalog</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/shop?mainCategory=Chairs" className="hover:text-secondary transition-colors">Luxury Chairs</Link></li>
            <li><Link to="/shop?mainCategory=Sofa" className="hover:text-secondary transition-colors">Comfort Sofas</Link></li>
            <li><Link to="/shop?mainCategory=Office+Table" className="hover:text-secondary transition-colors">Office Tables</Link></li>
            <li><Link to="/shop?mainCategory=Wardrobe" className="hover:text-secondary transition-colors">Designer Wardrobes</Link></li>
            <li><Link to="/shop?mainCategory=Furniture" className="hover:text-secondary transition-colors">Home Furniture</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="font-semibold font-serif text-sm tracking-wider uppercase border-b border-gray-800 pb-2">Experience Center</h4>
          <ul className="space-y-3.5 text-sm text-gray-300">
            <li className="flex gap-3">
              <FaMapMarkerAlt className="text-secondary text-base shrink-0 mt-0.5" />
              <span>Gala No. 14, Galli No. 4, Mustafa Market, Near Jagannath Mandir, 90 Feet Road, Sakinaka, Andheri (E), Mumbai - 400072</span>
            </li>
            <li className="flex flex-col gap-1.5 pl-7 relative">
              <FaPhoneAlt className="text-secondary absolute left-0 top-1 text-sm" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">Afroz Shah</span>
                <span>+91 93268 80981</span>
              </div>
              <div className="flex flex-col mt-0.5">
                <span className="font-semibold text-white">Altamash Khan</span>
                <span>+91 75064 71498</span>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-secondary shrink-0" />
              <span>team.ergosoul@gmail.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className="space-y-4">
          <h4 className="font-semibold font-serif text-sm tracking-wider uppercase border-b border-gray-800 pb-2">Newsletter</h4>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            Subscribe to receive premium collections launches, seating posture articles, and private promotion codes.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-800 rounded-lg text-sm outline-none focus:border-secondary text-white placeholder-gray-500"
              required
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-secondary hover:bg-secondary-dark text-gray-900 font-semibold rounded-lg text-xs tracking-wider uppercase shadow-premium transition-all duration-300"
            >
              Join Club
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-green-400 font-semibold animate-pulse">
              Thank you for subscribing! Check your inbox soon.
            </p>
          )}
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="bg-primary-dark dark:bg-gray-950/80 border-t border-gray-800 dark:border-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} ErgoSoul. All rights reserved. Home & Corporate Interior Solution.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

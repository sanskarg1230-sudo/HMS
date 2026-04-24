import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SPA-friendly smooth scroll to hash section
  const scrollToSection = (e, id) => {
    e.preventDefault();
    // If we're not on home, navigate there first then scroll
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinkBase = 'font-medium tracking-tight text-sm transition-colors duration-200';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-2xl shadow-md'
          : 'bg-white/60 backdrop-blur-xl shadow-sm'
        }`}
    >
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20 w-full">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold tracking-tighter text-cyan-900 hover:text-primary transition-colors">
          HMS
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            className={`${navLinkBase} text-cyan-700 border-b-2 border-cyan-700 pb-1`}
            to="/"
          >
            Home
          </Link>
          <a
            className={`${navLinkBase} text-slate-600 hover:text-primary`}
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
          >
            Features
          </a>
          <a
            className={`${navLinkBase} text-slate-600 hover:text-primary`}
            href="#about"
            onClick={(e) => scrollToSection(e, 'about')}
          >
            About
          </a>
          <a
            className={`${navLinkBase} text-slate-600 hover:text-primary`}
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact')}
          >
            Contact
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login?mode=login"
            className="px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-95"
          >
            Login
          </Link>
          <Link
            to="/login?mode=register"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-primary to-primary-container rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

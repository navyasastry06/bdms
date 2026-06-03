import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, Menu, X, ArrowRight } from 'lucide-react';

import AboutSection from '../components/landing/AboutSection';
import HowItWorks from '../components/landing/HowItWorks';
import RolesSection from '../components/landing/RolesSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import CampSection from '../components/landing/CampSection';
import SecuritySection from '../components/landing/SecuritySection';
import useAuth from '../hooks/useAuth';
import { ROLE_CONFIG } from '../utils/roleConfig';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbStats, setDbStats] = useState({
    donorCount: 4,
    campCount: 0,
    requestCount: 0,
    livesSaved: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/auth/stats');
        const data = await response.json();
        if (data.success && data.stats) {
          setDbStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { value: `${dbStats.donorCount}+`, label: "Registered Donors" },
    { value: `${dbStats.livesSaved}+`, label: "Lives Saved" },
    { value: `${dbStats.requestCount}+`, label: "Blood Requests" },
    { value: `${dbStats.campCount}+`, label: "Donation Camps" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-white font-sans text-gray-900">
      
      {/* SECTION 1 — HERO & NAVBAR */}
      <header className="relative min-h-screen flex flex-col justify-between">
        
        {/* Background Video and Overlay */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="https://assets.mixkit.co/videos/preview/mixkit-hand-of-a-doctor-in-a-hospital-41618-large.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/35 to-white/75" />
        </div>

        {/* Navbar Container */}
        <div className="w-full z-50 px-6 pt-6">
          <nav className="max-w-6xl mx-auto rounded-full liquid-glass px-6 md:px-8 py-4 flex items-center justify-between shadow-lg">
            {/* Left */}
            <Link to="/" className="flex items-center gap-2 group">
              <HeartPulse className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold text-xl text-gray-900 tracking-tight">RaktaBandhu</span>
            </Link>

            {/* Center Navigation (Desktop Only) */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">About</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Find Blood</a>
              <a href="#camps" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Donation Camps</a>
            </div>

            {/* Right */}
            <div className="hidden md:flex items-center gap-6">
              {isAuthenticated && user ? (
                <Link to={ROLE_CONFIG[user.role]?.dashboardPath || '/'} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white hover:!text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors">
                    Register
                  </Link>
                  <Link to="/login" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white hover:!text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile Drawer (Pill Glass style overlay) */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-24 left-6 right-6 liquid-glass rounded-3xl p-6 flex flex-col gap-6 shadow-2xl z-50 border border-gray-200"
            >
              <div className="flex flex-col gap-4">
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-gray-700 hover:text-red-600 transition-colors">About</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-gray-700 hover:text-red-600 transition-colors">Find Blood</a>
                <a href="#camps" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-gray-700 hover:text-red-600 transition-colors">Donation Camps</a>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex flex-col gap-4">
                {isAuthenticated && user ? (
                  <Link to={ROLE_CONFIG[user.role]?.dashboardPath || '/'} onClick={() => setMobileMenuOpen(false)} className="w-full py-3 bg-red-600 text-white hover:!text-white rounded-2xl font-semibold text-center hover:bg-red-700 transition-colors">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 border border-gray-200 rounded-2xl font-semibold text-center text-gray-700 hover:bg-gray-50 hover:!text-gray-900 transition-colors">
                      Register
                    </Link>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 bg-red-600 text-white hover:!text-white rounded-2xl font-semibold text-center hover:bg-red-700 transition-colors">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Hero Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-20 text-center max-w-5xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wider text-red-600 uppercase bg-red-50 border border-red-100 shadow-sm">
              🩸 Trusted by Donors & Hospitals
            </span>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 leading-tight">
              Every Donation<br />
              <em className="italic font-serif text-red-600 not-italic">Saves a Life</em>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed mt-4">
              Connecting donors, hospitals, and communities through a secure platform designed to make blood donation faster, safer, and more accessible.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              {isAuthenticated && user ? (
                <Link to={ROLE_CONFIG[user.role]?.dashboardPath || '/'} className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white hover:!text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white hover:!text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    Become a Donor <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login" className="px-8 py-4 liquid-glass hover:bg-white/80 text-gray-700 hover:!text-gray-900 rounded-2xl font-semibold flex items-center justify-center border border-gray-200">
                    Request Blood
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Statistics Row */}
        <div className="w-full z-10 px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="liquid-glass rounded-2xl p-6 text-center border border-white/20"
              >
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </header>

      {/* SECTION 2 — ABOUT US */}
      <AboutSection />

      {/* SECTION 3 — HOW IT WORKS */}
      <HowItWorks />

      {/* SECTION 5 — ROLE BASED ACCESS */}
      <RolesSection />

      {/* SECTION 6 — CORE FEATURES */}
      <FeaturesSection />

      {/* SECTION 7 — UPCOMING CAMPS */}
      <CampSection />

      {/* SECTION 8 — SECURITY & TRUST */}
      <SecuritySection />

      {/* SECTION 9 — FINAL CTA */}
      <section className="py-24 bg-gradient-to-r from-red-50 via-white to-red-50 border-t border-b border-red-100/50 relative overflow-hidden">
        {/* Soft floating glow elements */}
        <div className="absolute top-1/2 left-10 w-48 h-48 bg-red-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-25 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-950 font-serif leading-tight">
              Every Drop Counts.<br />
              Every Donor Matters.
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed mt-2">
              Join our growing network of donors, hospitals, and volunteers helping save lives every day.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              {isAuthenticated && user ? (
                <Link to={ROLE_CONFIG[user.role]?.dashboardPath || '/'} className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white hover:!text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white hover:!text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all">
                    Become a Donor <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login" className="px-8 py-4 liquid-glass hover:bg-white/80 text-gray-700 hover:!text-gray-900 rounded-2xl font-semibold flex items-center justify-center border border-gray-200">
                    Request Blood
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-gray-200/80 py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
            {/* Logo and Tagline */}
            <div className="flex flex-col gap-4 max-w-xs">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-6 h-6 text-red-600" />
                <span className="font-semibold text-lg text-gray-900 tracking-tight">RaktaBandhu</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                A modern, secure, and centralized portal dedicated to connecting donors and healthcare systems instantly.
              </p>
            </div>

            {/* Links Grid */}
            <div className="flex flex-wrap gap-x-16 gap-y-8">
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Navigation</span>
                <a href="#" className="text-sm text-gray-600 hover:text-red-600 transition-colors">Home</a>
                <a href="#about" className="text-sm text-gray-600 hover:text-red-600 transition-colors">About</a>
                <a href="#how-it-works" className="text-sm text-gray-600 hover:text-red-600 transition-colors">Find Blood</a>
                <a href="#camps" className="text-sm text-gray-600 hover:text-red-600 transition-colors">Donation Camps</a>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Contact Support</span>
                <a href="mailto:support@raktabandhu.org" className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium">
                  support@raktabandhu.org
                </a>
                <span className="text-xs text-gray-400 max-w-[200px]">
                  Emergency line open 24/7 for critical blood request approvals.
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full mb-8" />

          {/* Bottom Copyright & SEO tags */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <p>
              © 2026 RaktaBandhu Blood Donation Management System.
            </p>
            <p className="font-semibold text-gray-500">
              Connecting Donors. Saving Lives.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const CampSection = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await api.get('/auth/camps');
        if (response.data.success) {
          setCamps(response.data.camps);
        }
      } catch (error) {
        console.error('Failed to fetch public camps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, []);

  return (
    <section id="camps" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative blurred gradient elements to show glassmorphism refraction */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-red-50/50 rounded-full blur-3xl opacity-35 pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-red-100/30 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            Upcoming Donation Drives
          </motion.h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Find and register for local donation camps near you. Secure your slot and save lives in your own community.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading upcoming camps...
          </div>
        ) : camps.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-gray-500 border border-white/20">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-red-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming camps scheduled</h3>
            <p>Check back soon for new donation drives in your area.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {camps.map((camp, idx) => (
              <motion.div
                key={camp._id || idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="liquid-glass rounded-3xl p-8 flex flex-col justify-between min-h-[380px] hover:scale-[1.03] hover:shadow-xl transition-all duration-300 border border-white/20"
              >
                <div>
                  <span className="text-xs font-bold text-red-600 tracking-wider uppercase bg-red-50 px-3 py-1.5 rounded-full inline-block mb-6">
                    CAMP DRIVE
                  </span>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">
                    {camp.name}
                  </h3>
                  
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {camp.description || "Join this camp to donate blood and help save lives."}
                  </p>
                </div>

                <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{new Date(camp.date).toLocaleDateString()} • {camp.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
                    <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{camp.venue}, {camp.city}</span>
                  </div>

                  <Link
                    to="/register"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white hover:!text-white rounded-2xl font-semibold text-center text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    Register <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CampSection;

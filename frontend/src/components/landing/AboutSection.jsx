import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle decorative blurred elements */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <span className="text-xs font-bold tracking-widest text-red-600 uppercase bg-red-50 px-4 py-2 rounded-full">
            ABOUT US
          </span>
          
          <h2 className="text-4xl md:text-6xl font-semibold text-gray-900 tracking-tight leading-tight mt-2">
            Connecting people,<br />
            <em className="italic font-serif text-red-600 not-italic">saving lives</em> through<br />
            smart blood donation management.
          </h2>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed mt-6">
            Our platform bridges the gap between donors, hospitals, and emergency blood requirements through real-time inventory tracking, secure authentication, and intelligent request management.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;

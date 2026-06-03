import React from 'react';
import { motion } from 'framer-motion';

const ImpactSection = () => {
  return (
    <section id="impact" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16 text-center md:text-left">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            Donors <em className="italic font-serif text-red-600 not-italic">x</em> Lives Saved
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Video */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative rounded-[32px] overflow-hidden aspect-video shadow-2xl border border-gray-100"
          >
            <video
              className="w-full h-full object-cover"
              src="https://assets.mixkit.co/videos/preview/mixkit-doctor-explaining-something-to-a-patient-41617-large.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            {/* Soft overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/20 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Right Column - Text Blocks */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-10"
          >
            {/* Block 1 */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-red-600 tracking-wider uppercase">
                Become a Lifesaver
              </span>
              <p className="text-lg text-gray-500 leading-relaxed">
                Every donation contributes directly to saving patients in need. Register, donate, and help build a healthier community.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 w-full" />

            {/* Block 2 */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-red-600 tracking-wider uppercase">
                Track Your Impact
              </span>
              <p className="text-lg text-gray-500 leading-relaxed">
                View donation history, camp participation, and eligibility status from your dashboard.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;

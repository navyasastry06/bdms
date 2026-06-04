import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, CalendarRange } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      title: "Donor Management",
      icon: <Heart className="w-6 h-6 text-red-600" />,
      description: "Secure registration with OTP verification and eligibility tracking."
    },
    {
      title: "Blood Requests",
      icon: <Activity className="w-6 h-6 text-red-600" />,
      description: "Hospitals can search blood availability and create emergency requests."
    },
    {
      title: "Donation Camps",
      icon: <CalendarRange className="w-6 h-6 text-red-600" />,
      description: "Manage donation drives and monitor donor participation."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative blurred gradient elements to show glassmorphism refraction */}
      <div className="absolute top-1/4 right-5 w-80 h-80 bg-red-50/70 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-1/4 left-5 w-96 h-96 bg-red-100/30 rounded-full blur-3xl opacity-35 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            Core Features
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(225,29,72,0.12)] hover:border-red-100 hover:-translate-y-3 transition-all duration-500 flex flex-col gap-6 border border-gray-100 relative group"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-red-100 transition-all duration-300">
                {feature.icon}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

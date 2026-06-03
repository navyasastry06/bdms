import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, HeartHandshake } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8 text-red-600" />,
      stepNum: "01",
      title: "Register",
      description: "Create a donor or hospital account and verify your email through secure OTP authentication."
    },
    {
      icon: <Search className="w-8 h-8 text-red-600" />,
      stepNum: "02",
      title: "Donate or Request",
      description: "Register for donation camps or search blood availability during emergencies."
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-red-600" />,
      stepNum: "03",
      title: "Save Lives",
      description: "Connect donors with patients and healthcare providers in real time."
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="how-it-works" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative blurred gradient elements to show glassmorphism refraction */}
      <div className="absolute top-1/4 left-10 w-90 h-90 bg-red-100/40 rounded-full blur-3xl opacity-35 pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-red-50/50 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            How It Works
          </motion.h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="liquid-glass rounded-3xl p-8 flex flex-col justify-between min-h-[300px] hover:translate-y-[-8px] transition-transform duration-300 group border border-white/20"
            >
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-serif text-red-200 tracking-tight font-bold">
                    {step.stepNum}
                  </span>
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
              </div>

              <p className="text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Building2, ShieldCheck, Check } from 'lucide-react';

const RolesSection = () => {
  const roles = [
    {
      title: "DONOR",
      icon: <Heart className="w-8 h-8 text-red-600" />,
      features: [
        "Register & Create Profile",
        "Eligibility Status Calculator",
        "Donation History Records",
        "Camp Registration & Drive Updates"
      ]
    },
    {
      title: "HOSPITAL",
      icon: <Building2 className="w-8 h-8 text-red-600" />,
      features: [
        "Real-time Blood Search",
        "Broadcast Emergency Requests",
        "Track Request Fulfilment Status",
        "Low-Inventory Alert Notifications"
      ]
    },
    {
      title: "ADMIN",
      icon: <ShieldCheck className="w-8 h-8 text-red-600" />,
      features: [
        "Manage Blood Stock & Inventory",
        "Review & Approve Blood Requests",
        "Create & Schedule Donation Camps",
        "Comprehensive Analytics Dashboard"
      ]
    }
  ];

  return (
    <section id="roles" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative blurred gradient elements to show glassmorphism refraction */}
      <div className="absolute top-12 right-10 w-96 h-96 bg-red-100/40 rounded-full blur-3xl opacity-35 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl opacity-25 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            Built For Everyone
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="liquid-glass rounded-3xl p-8 flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border border-white/20"
            >
              <div>
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                  <span className="text-sm font-bold tracking-widest text-red-600 uppercase">
                    {role.title}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    {role.icon}
                  </div>
                </div>

                <ul className="flex flex-col gap-4">
                  {role.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-red-600" />
                      </div>
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <span className="text-xs text-gray-400 block text-center">
                  Full secure role permission mapping active
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;

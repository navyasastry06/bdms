import React from 'react';
import { motion } from 'framer-motion';
import { MailCheck, ShieldCheck, KeyRound, Lock } from 'lucide-react';

const SecuritySection = () => {
  const items = [
    {
      title: "Email OTP",
      label: "Email Verification",
      body: "Every donor and hospital account is verified through secure one-time passwords.",
      icon: <MailCheck className="w-6 h-6 text-red-600" />
    },
    {
      title: "JWT Authentication",
      label: "Session Integrity",
      body: "Secure session management, cookie tokens, and fully protected system routes.",
      icon: <ShieldCheck className="w-6 h-6 text-red-600" />
    },
    {
      title: "Role Based Access",
      label: "Granular Permissions",
      body: "Strict separation of access rights and permissions for donors, hospitals, and admins.",
      icon: <KeyRound className="w-6 h-6 text-red-600" />
    },
    {
      title: "Encrypted Passwords",
      label: "Bcrypt Hashing",
      body: "All user passwords securely hashed using salt-rounded Bcrypt before database entry.",
      icon: <Lock className="w-6 h-6 text-red-600" />
    }
  ];

  return (
    <section id="security" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative blurred gradient elements to show glassmorphism refraction */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-red-100/40 rounded-full blur-3xl opacity-35 pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-red-50/50 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            Secure & Trusted
          </motion.h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Our platform adheres to rigorous data protection standards, utilizing modern encryption and strict authentication mechanisms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="liquid-glass rounded-3xl p-8 hover:translate-y-[-8px] transition-all duration-300 flex flex-col gap-6 border border-white/20"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>

              <div>
                <span className="text-xs font-bold text-red-600 tracking-wider uppercase block mb-1">
                  {item.label}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {item.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;

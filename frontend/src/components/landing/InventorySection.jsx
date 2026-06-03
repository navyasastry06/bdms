import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (isNaN(end)) return;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 1200; // ms
    const stepTime = 20; // 50fps
    const totalSteps = duration / stepTime;
    const stepValue = end / totalSteps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(stepValue * currentStep));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

const InventorySection = () => {
  const bloodData = [
    { group: "A+", units: 42, indicator: "green", label: "Adequate Stock" },
    { group: "O-", units: 3, indicator: "red", label: "Critical Stock" },
    { group: "AB+", units: 12, indicator: "yellow", label: "Moderate Stock" },
    { group: "B+", units: 28, indicator: "green", label: "Adequate Stock" },
    { group: "A-", units: 5, indicator: "red", label: "Critical Stock" },
    { group: "O+", fontLarge: true, units: 36, indicator: "green", label: "Adequate Stock" },
    { group: "B-", units: 8, indicator: "yellow", label: "Moderate Stock" },
    { group: "AB-", units: 6, indicator: "yellow", label: "Moderate Stock" }
  ];

  return (
    <section id="inventory" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            Live Blood Availability
          </motion.h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Real-time tracking of blood units in our central depository. Quantities are updated immediately upon donation and hospital release.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {bloodData.map((blood, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="liquid-glass rounded-2xl p-6 bg-white flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                  {blood.group}
                </span>
                
                {/* Indicator dot with pulse */}
                <div className="relative flex h-3 w-3">
                  {blood.indicator === 'red' && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </>
                  )}
                  {blood.indicator === 'yellow' && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </>
                  )}
                  {blood.indicator === 'green' && (
                    <>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="text-4xl font-semibold text-gray-900 tracking-tight mb-1">
                  <AnimatedCounter value={blood.units} /> <span className="text-sm font-medium text-gray-400">Units</span>
                </div>
                <span className={`text-xs font-semibold ${
                  blood.indicator === 'red' ? 'text-red-600' :
                  blood.indicator === 'yellow' ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>
                  {blood.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Alert/Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/60 backdrop-blur-md px-6 py-4 rounded-full border border-gray-200/80 max-w-2xl mx-auto shadow-sm"
        >
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">Live Database Connected</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Emergency requests bypass standard reservations instantly.</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InventorySection;

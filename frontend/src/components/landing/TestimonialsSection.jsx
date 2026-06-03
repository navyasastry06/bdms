import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      role: "DONOR",
      name: "Aarav Sharma",
      quote: "Registering on RaktaBandhu took less than 2 minutes. The OTP was instant, and scheduling my donation at the local camp was incredibly smooth.",
      location: "Bangalore"
    },
    {
      role: "HOSPITAL COORDINATOR",
      name: "Dr. Priya Deshmukh",
      quote: "During a critical surgery last month, we broadcasted an emergency request. Within minutes, eligible local donors were notified, and the blood arrived right on time.",
      location: "City Hospital, Hubli"
    },
    {
      role: "VOLUNTEER",
      name: "Rahul Kulkarni",
      quote: "Managing blood drives is easy now. We create camps on the admin panel, and donors register online. No paper logs, zero hassle.",
      location: "Red Cross Chapter"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            Stories That Matter
          </motion.h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Read how donors, hospitals, and coordinators are transforming emergency healthcare through centralized management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="liquid-glass rounded-3xl p-8 bg-white flex flex-col justify-between min-h-[300px] border border-gray-200/80 hover:shadow-lg transition-shadow duration-300"
            >
              <div>
                <Quote className="w-10 h-10 text-red-100 mb-6 flex-shrink-0" />
                <p className="text-gray-600 italic leading-relaxed mb-8">
                  "{t.quote}"
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-red-600 tracking-wider uppercase block mb-1">
                  {t.role}
                </span>
                <h4 className="text-base font-semibold text-gray-900">
                  {t.name}
                </h4>
                <span className="text-xs text-gray-400">
                  {t.location}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

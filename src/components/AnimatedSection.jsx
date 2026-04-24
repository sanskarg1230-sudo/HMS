import { motion } from 'framer-motion';

const AnimatedSection = () => {
  // Staggered sequence variant
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.1
      }
    }
  };

  // Upward reveal variant
  const itemUp = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  // Left slide variant
  const itemLeft = {
    hidden: { opacity: 0, x: -60 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  // Right slide variant
  const itemRight = {
    hidden: { opacity: 0, x: 60 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section 
      className="py-32 bg-surface-container-lowest relative overflow-hidden" 
      id="excellence"
    >
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          className="flex flex-col lg:flex-row gap-20 items-center"
        >
          {/* Header Sub-section */}
          <div className="lg:w-1/3 text-center lg:text-left">
            <motion.span variants={itemUp} className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-tertiary bg-tertiary-fixed rounded-full">
              Engineered for Quality
            </motion.span>
            <motion.h2 variants={itemUp} className="text-4xl lg:text-5xl font-extrabold text-on-surface mb-8 tracking-tight leading-tight">
              A Digital Sanctuary <br /> 
              <span className="text-primary opacity-80">Built for Trust</span>
            </motion.h2>
            <motion.p variants={itemUp} className="text-on-surface-variant text-lg mb-10 leading-relaxed opacity-80">
              From automated occupancy logic to secure document vaults, every corner of our system is designed to provide architectural precision and total peace of mind.
            </motion.p>
            <motion.button 
              variants={itemUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all text-sm uppercase tracking-widest"
            >
              Learn More
            </motion.button>
          </div>

          {/* Cards Grid Sub-section */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Slide from Left */}
            <motion.div 
              variants={itemLeft}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-10 rounded-[2.5rem] bg-surface-container-low border border-white/40 shadow-sm hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-primary-container/20 text-primary rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h4 className="text-2xl font-bold mb-4">Enterprise Security</h4>
              <p className="text-on-surface-variant leading-relaxed opacity-80">
                End-to-end encryption for all student documents and medical records, ensuring complete data privacy and compliance.
              </p>
            </motion.div>

            {/* Card 2: Pop from Bottom */}
            <motion.div 
              variants={itemUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-10 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-container text-white shadow-xl hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-white/20 text-white rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">auto_mode</span>
              </div>
              <h4 className="text-2xl font-bold mb-4">Smart Automation</h4>
              <p className="text-white/80 leading-relaxed">
                Our predictive algorithms streamline room allocations and fee billing, reducing manual administrative overhead by over 70%.
              </p>
            </motion.div>

            {/* Card 3: Pop from Bottom */}
            <motion.div 
              variants={itemUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-10 rounded-[2.5rem] bg-surface-container-low border border-white/40 shadow-sm hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-secondary-container/20 text-secondary rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">analytics</span>
              </div>
              <h4 className="text-2xl font-bold mb-4">Real-time Analytics</h4>
              <p className="text-on-surface-variant leading-relaxed opacity-80">
                Gain instant visibility into occupancy trends, fee collections, and maintenance status with our live management dashboard.
              </p>
            </motion.div>

            {/* Card 4: Slide from Right */}
            <motion.div 
              variants={itemRight}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-10 rounded-[2.5rem] bg-surface-container-low border border-white/40 shadow-sm hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-surface-container-highest text-primary rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">devices</span>
              </div>
              <h4 className="text-2xl font-bold mb-4">Agile Experience</h4>
              <p className="text-on-surface-variant leading-relaxed opacity-80">
                Seamless cloud synchronization allows students and staff to access the portal from mobile, tablet, or desktop anywhere.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedSection;

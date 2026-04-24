import { motion } from 'framer-motion';
import { useState } from 'react';

const features = [
  // Row 1
  [
    { icon: 'person_search', title: 'Student Management', desc: 'Centralized database for student profiles and medical history.' },
    { icon: 'bed', title: 'Room Allocation', desc: 'Smart algorithms for room assignments based on preferences.' },
    { icon: 'payments', title: 'Fee Tracking', desc: 'Automated invoicing, payment history, and overdue reminders.' },
    { icon: 'group_add', title: 'Visitor Logs', desc: 'Digital check-in/out for security and real-time monitoring.' },
    { icon: 'report_problem', title: 'Complaint Portal', desc: 'Digital tracking of maintenance issues with auto-assignment.' },
    { icon: 'how_to_reg', title: 'Attendance Monitor', desc: 'Biometric and digital attendance tracking for students.' },
  ],
  // Row 2
  [
    { icon: 'monitoring', title: 'Analytics Dashboard', desc: 'Real-time occupancy analytics and comprehensive reporting.' },
    { icon: 'local_laundry_service', title: 'Laundry Tracking', desc: 'Efficient management of laundry schedules and pick-ups.' },
    { icon: 'restaurant', title: 'Mess Management', desc: 'Meal planning, attendance, and inventory for dining halls.' },
    { icon: 'inventory_2', title: 'Inventory Control', desc: 'Track hostel assets, furniture, and maintenance supplies.' },
    { icon: 'badge', title: 'Staff Management', desc: 'Manage warden, security, and cleaning staff schedules.' },
    { icon: 'event', title: 'Event Scheduler', desc: 'Organize and announce hostel activities and celebrations.' },
  ],
  // Row 3
  [
    { icon: 'qr_code_2', title: 'Asset Tracking', desc: 'QR-based tracking for all hostel equipment and assets.' },
    { icon: 'cloud_upload', title: 'Document Vault', desc: 'Secure cloud storage for student IDs and admission forms.' },
    { icon: 'medical_services', title: 'Health Records', desc: 'Digital storage for emergency contacts and medical data.' },
    { icon: 'family_restroom', title: 'Parent Portal', desc: 'Dedicated access for parents to monitor fees and leave.' },
    { icon: 'fingerprint', title: 'Biometric Sync', desc: 'Seamless integration with existing hardware for security.' },
    { icon: 'sms', title: 'Instant Alerts', desc: 'Automated SMS and email notifications for all updates.' },
  ]
];

const FeatureCard = ({ icon, title, desc }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="flex-shrink-0 w-80 p-8 mx-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg relative overflow-hidden group transition-all duration-300 hover:shadow-primary/20 hover:bg-white/10"
    >
      {/* Background Glow */}
      <div className="absolute -inset-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500 opacity-0 group-hover:opacity-100" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold mb-3 text-on-surface tracking-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-on-surface-variant text-sm leading-relaxed opacity-80 group-hover:opacity-100">
          {desc}
        </p>
      </div>

      {/* Glass Highlight */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

const MarqueeRow = ({ items, direction = 'left', speed = 40 }) => {
  const animationClass = direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse';
  
  return (
    <div className="flex overflow-hidden py-6 select-none mask-fade h-72 items-center group/row">
      <div 
        className={`marquee-track ${animationClass} group-hover/row:[animation-play-state:paused]`}
        style={{ 
          '--speed': `${speed}s`,
        }}
      >
        {/* Render items multiple times for seamless loop across all screens */}
        {[...items, ...items, ...items].map((item, idx) => (
          <FeatureCard key={`${direction}-${idx}`} {...item} />
        ))}
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section 
      className="py-32 bg-surface overflow-hidden relative" 
      id="features"
    >
      {/* Abstract Background Elements */}
      <div className="absolute top-40 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-x-1/2" />
      <div className="absolute bottom-40 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 mb-20 text-center relative z-10">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-primary bg-primary/10 rounded-full"
        >
          Powerful Capabilities
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-6xl font-extrabold text-on-surface mb-6 tracking-tight"
        >
          Everything You Need to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Scale Your Hostel</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-on-surface-variant text-lg lg:text-xl max-w-3xl mx-auto opacity-80"
        >
          Our all-in-one ecosystem automates daily chores, letting wardens focus on student well-being rather than spreadsheets.
        </motion.p>
      </div>

      {/* Marquee Containers */}
      <div className="relative space-y-4">
        <MarqueeRow items={features[0]} direction="left" speed={30} />
        <MarqueeRow items={features[1]} direction="right" speed={35} />
        <MarqueeRow items={features[2]} direction="left" speed={25} />
      </div>

      {/* Bottom CTA Gradient Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-surface to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default FeaturesSection;

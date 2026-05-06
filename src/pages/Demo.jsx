import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Placeholder Images (Replace with actual HMS screenshots)
const SCREENSHOTS = [
  {
    id: 1,
    title: 'Mess Management',
    desc: 'Manage the mess menu week wise & month wise.',
    url: '/demo-assets/Mess.png'
  },
  {
    id: 2,
    title: 'Student Onboarding',
    desc: 'Seamless digital registration and room allocation process.',
    url: '/demo-assets/student-onboarding.png'
  },
  {
    id: 3,
    title: 'Complaint Tracking',
    desc: 'Real-time issue reporting and resolution workflows.',
    url: '/demo-assets/complaint-tracking.png'
  },
  {
    id: 4,
    title: 'Fee Management',
    desc: 'Automated fee tracking, receipts, and pending dues alerts.',
    url: '/demo-assets/fee-management.png'
  },
  {
    id: 5,
    title: 'Document Store and Verification',
    desc: 'Secure storage and verification of student documents.',
    url: '/demo-assets/document.png'
  },
  {
    id: 6,
    title: 'Leave Management',
    desc: 'Manage Leaves Requested By Students .',
    url: '/demo-assets/leave.png'
  }
];

const FEATURES = [
  {
    title: 'Digital Student Onboarding',
    desc: 'Eliminate paperwork. Students register online, upload their documents, and get verified instantly. Assign rooms with a drag-and-drop interface.',
    icon: 'how_to_reg',
    img: '/demo-assets/student-onboarding.png',
    reversed: false
  },
  {
    title: 'Intelligent Complaint Routing',
    desc: 'Students log maintenance issues directly from their phones. Wardens can assign tasks to staff, track repair progress, and notify students when resolved.',
    icon: 'construction',
    img: '/demo-assets/complaint-tracking.png',
    reversed: true
  },
  {
    title: 'Automated Fee Management',
    desc: 'Keep track of payments, generate invoices, and send automated reminders for pending dues. Say goodbye to manual ledger keeping.',
    icon: 'payments',
    img: '/demo-assets/fee-management.png',
    reversed: false
  }
];

const TiltImage = ({ src, alt }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for mouse movement
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Map mouse position to rotation (-15deg to 15deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate percentage (-0.5 to 0.5)
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className="w-full h-full relative z-10">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full rounded-[2rem] shadow-2xl transition-shadow duration-300 hover:shadow-primary/30 border border-outline-variant/20 bg-surface-container-lowest"
      >
        <div
          style={{ transform: "translateZ(50px)" }}
          className="w-full h-full rounded-[2rem] overflow-hidden"
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-cover aspect-[4/3] pointer-events-none"
            loading="lazy"
          />
        </div>
      </motion.div>
    </div>
  );
};

function Demo() {
  const [lightboxImage, setLightboxImage] = useState(null);

  return (
    <div className="min-h-screen bg-surface font-body overflow-x-hidden">
      <Navbar />

      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-fixed/20 via-surface to-surface pointer-events-none -z-10"></div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-primary bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
              Product Walkthrough
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-on-surface leading-tight tracking-tight mb-6">
              See <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">HMS</span> in Action
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-3xl mx-auto mb-10">
              Explore how our platform simplifies hostel administration, automates student onboarding, tracks complaints, and manages fees in one secure ecosystem.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#video"
                className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">play_circle</span>
                Watch Video Demo
              </a>
              <a
                href="#gallery"
                className="px-8 py-4 bg-white text-on-surface font-bold rounded-xl shadow-sm border border-outline-variant/20 hover:bg-surface-container transition-all active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">dashboard</span>
                View Screenshots
              </a>
            </div>
          </motion.div>


        </div>
      </section>

      {/* ── Video Embed Section ────────────────────────────────────────────────── */}
      <section id="video" className="py-20 bg-surface-container-lowest border-y border-outline-variant/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="aspect-video bg-black rounded-[2rem] shadow-2xl overflow-hidden relative group border border-outline-variant/20">
            {/* REPLACE THIS IFRAME WITH ACTUAL YOUTUBE/LOOM EMBED */}
            {/* Example:
              <iframe 
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=0&rel=0" 
                title="HMS Product Demo"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            */}

            {/* Placeholder Content (Remove when iframe is added) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-lowest z-10 p-6 text-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-4xl ml-1">play_arrow</span>
              </div>
              <h3 className="text-2xl font-extrabold text-on-surface mb-2">Full Product Walkthrough</h3>
              <p className="text-on-surface-variant max-w-md">The video demo is currently being produced. Please check back later, or explore the screenshots below.</p>
              <code className="mt-4 px-4 py-2 bg-surface-container rounded-lg text-xs text-on-surface-variant border border-outline-variant/20">
                &lt;iframe src="your-video-url" /&gt; goes here
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Showcase ───────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6 space-y-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-6">Designed for Scale</h2>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Every feature is built with warden productivity and student satisfaction in mind.
          </p>
        </div>

        {FEATURES.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col ${feature.reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
          >
            <div className="flex-1 space-y-6">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">{feature.title}</h3>
              <p className="text-lg text-on-surface-variant leading-relaxed">{feature.desc}</p>

              <ul className="space-y-3 pt-4">
                {[1, 2, 3].map(i => (
                  <li key={i} className="flex items-center gap-3 text-on-surface font-medium">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    Streamlined workflow element {i}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 w-full relative group">
              {/* Background accent block */}
              <div className="absolute inset-0 bg-primary/10 rounded-[2rem] translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500 -z-10 blur-xl"></div>

              {/* 3D Interactive Card */}
              <TiltImage src={feature.img} alt={feature.title} />
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Screenshot Gallery ─────────────────────────────────────────────────── */}
      <section id="gallery" className="py-24 bg-surface-container-lowest border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-6">Explore the Interface</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              A clean, accessible, and responsive dashboard experience across all devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SCREENSHOTS.map((screen) => (
              <motion.div
                key={screen.id}
                whileHover={{ y: -8 }}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-outline-variant/20 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                onClick={() => setLightboxImage(screen)}
              >
                <div className="relative aspect-video overflow-hidden bg-surface-container-high">
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-4xl drop-shadow-lg scale-50 group-hover:scale-100 transition-transform duration-300">zoom_in</span>
                  </div>
                  <img
                    src={screen.url}
                    alt={screen.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-extrabold text-on-surface text-lg mb-2 group-hover:text-primary transition-colors">{screen.title}</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{screen.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-6">Ready to Digitize Your Hostel?</h2>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
          Join universities and private hostels upgrading their management infrastructure.
        </p>
        <Link
          to="/register-hostel"
          className="inline-block px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-white font-extrabold text-lg rounded-2xl shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
        >
          Request Admin Access
        </Link>
      </section>

      <Footer />

      {/* ── Lightbox Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            onClick={() => setLightboxImage(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full text-white flex items-center justify-center transition-colors z-50 backdrop-blur-sm"
              onClick={() => setLightboxImage(null)}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl w-full max-h-full flex flex-col items-center"
              onClick={e => e.stopPropagation()} // Prevent click from closing when clicking image
            >
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="w-auto max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain border border-white/10"
              />
              <div className="mt-6 text-center text-white">
                <h3 className="text-2xl font-extrabold mb-2">{lightboxImage.title}</h3>
                <p className="text-white/70 max-w-2xl mx-auto">{lightboxImage.desc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Demo;

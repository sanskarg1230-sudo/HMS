import { motion } from 'framer-motion';

const ScrollReveal = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.9,
  className = "" 
}) => {
  const getOffset = (dir) => {
    // Keep offsets small so they never trigger horizontal scroll
    if (dir === 'up') return { y: 24, x: 0 };
    if (dir === 'down') return { y: -24, x: 0 };
    if (dir === 'left') return { y: 0, x: 24 };
    if (dir === 'right') return { y: 0, x: -24 };
    return { y: 24, x: 0 };
  };

  const { y: yOffset, x: xOffset } = getOffset(direction);

  const variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.98,
      filter: 'blur(6px)',
      y: yOffset,
      x: xOffset,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      filter: 'blur(0px)',
      y: 0, 
      x: 0,
      transition: {
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.1 }}
      variants={variants}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;

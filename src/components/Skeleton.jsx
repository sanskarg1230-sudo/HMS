const Skeleton = ({ className = "" }) => {
  return (
    <div 
      className={`animate-skeleton skeleton-bg rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;

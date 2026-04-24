import Skeleton from './Skeleton';

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Skeleton */}
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Skeleton className="w-40 h-8 rounded-full" />
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-3/4 h-8" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="w-40 h-14 rounded-xl" />
              <Skeleton className="w-40 h-14 rounded-xl" />
            </div>
          </div>
          <Skeleton className="w-full aspect-video rounded-[2.5rem]" />
        </div>
      </section>

      {/* Stats Skeleton */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-8 bg-surface-container-lowest rounded-2xl space-y-3">
                <Skeleton className="w-1/2 h-10 mx-auto" />
                <Skeleton className="w-3/4 h-4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Skeleton */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6 mb-20">
          <Skeleton className="w-32 h-6 mx-auto rounded-full" />
          <Skeleton className="w-1/2 h-16 mx-auto" />
          <Skeleton className="w-2/3 h-6 mx-auto" />
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-[2.5rem]" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSkeleton;

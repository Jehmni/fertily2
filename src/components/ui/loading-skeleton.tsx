
interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton = ({ rows = 1, className = "" }: LoadingSkeletonProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex space-x-4"
        >
          <div className="h-12 bg-secondary rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
};

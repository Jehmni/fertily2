import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export const LazyImage = ({ src, alt, className, fallback, ...props }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src!;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  if (error && fallback) {
    return <img src={fallback} alt={alt} className={className} {...props} />;
  }

  return (
    <>
      {!loaded && <div className={cn("animate-pulse bg-muted", className)} />}
      <img
        src={src}
        alt={alt}
        className={cn(className, !loaded && "hidden")}
        {...props}
      />
    </>
  );
}; 
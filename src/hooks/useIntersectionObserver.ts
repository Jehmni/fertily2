
import { useEffect, useRef } from "react";

interface UseIntersectionObserverProps {
  onChange: (isIntersecting: boolean) => void;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useIntersectionObserver<T extends Element>({
  onChange,
  root = null,
  rootMargin = "0px",
  threshold = 0,
}: UseIntersectionObserverProps) {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onChange(entry.isIntersecting);
      },
      { root, rootMargin, threshold }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [onChange, root, rootMargin, threshold]);

  return targetRef;
}


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AutoRefreshProps {
  interval?: number; // in milliseconds
}

export function AutoRefresh({ interval = 10000 }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (interval <= 0) return;

    const timer = setInterval(() => {
      // router.refresh() fetches the server component data without losing client state
      // (like input values or scroll position)
      router.refresh();
    }, interval);

    return () => clearInterval(timer);
  }, [interval, router]);

  return null;
}

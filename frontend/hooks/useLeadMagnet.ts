'use client';

import { useState, useEffect } from 'react';

// Define a clear return type for our custom hook
interface UseLeadMagnetReturn {
  hasAccess: boolean | null;
  unlockResources: () => void;
}

export function useLeadMagnet(): UseLeadMagnetReturn {
  // Explicitly allow boolean or null
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unlocked = localStorage.getItem('lead_magnet_unlocked');
      setHasAccess(unlocked === 'true');
    }
  }, []);

  const unlockResources = () => {
    localStorage.setItem('lead_magnet_unlocked', 'true');
    setHasAccess(true);
  };

  return { hasAccess, unlockResources };
}
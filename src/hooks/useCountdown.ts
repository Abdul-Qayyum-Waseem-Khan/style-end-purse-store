import { useState, useEffect, useMemo } from 'react';

export interface CountdownResult {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
  isExpired: boolean;
}

export function useCountdown(targetDate?: string | Date | null): CountdownResult {
  const targetTime = useMemo(() => {
    if (!targetDate) return null;
    const date = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    return isNaN(date.getTime()) ? null : date.getTime();
  }, [targetDate]);

  const calculateTimeLeft = (): CountdownResult => {
    if (!targetTime) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00', totalSeconds: 0, isExpired: true };
    }

    const difference = targetTime - Date.now();

    if (difference <= 0) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00', totalSeconds: 0, isExpired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return {
      days: days.toString().padStart(2, '0'),
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      totalSeconds: Math.floor(difference / 1000),
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(calculateTimeLeft);

  useEffect(() => {
    if (!targetTime) return;

    // Immediately calculate
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return timeLeft;
}

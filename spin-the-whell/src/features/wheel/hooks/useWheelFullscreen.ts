"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export function useWheelFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === targetRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [targetRef]);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement === targetRef.current) {
      await document.exitFullscreen();
      return;
    }
    if (targetRef.current?.requestFullscreen) await targetRef.current.requestFullscreen();
  }, [targetRef]);

  return { isFullscreen, toggleFullscreen };
}

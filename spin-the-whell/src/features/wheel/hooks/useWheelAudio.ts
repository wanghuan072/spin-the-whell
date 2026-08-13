"use client";

import { useCallback, useEffect, useRef } from "react";

export function useWheelAudio(enabled: boolean, volume: number, soundStyle: string) {
  const contextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  const volumeRef = useRef(volume);
  const soundStyleRef = useRef(soundStyle);

  useEffect(() => {
    enabledRef.current = enabled;
    volumeRef.current = volume;
    soundStyleRef.current = soundStyle;
  }, [enabled, soundStyle, volume]);

  useEffect(() => () => {
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== "closed") void context.close();
  }, []);

  const playTone = useCallback((frequency: number, duration = 0.08) => {
    const currentVolume = volumeRef.current;
    if (!enabledRef.current || currentVolume === 0) return;

    try {
      let context = contextRef.current;
      if (!context || context.state === "closed") {
        if (typeof window.AudioContext !== "function") return;
        context = new window.AudioContext();
        contextRef.current = context;
      }
      if (context.state === "suspended") void context.resume().catch(() => undefined);

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const style = soundStyleRef.current;
      oscillator.type = style === "soft" ? "sine" : style === "bell" ? "triangle" : "square";
      oscillator.frequency.value = frequency;
      const outputGain = Math.max(0.0001, Math.pow(currentVolume / 100, 1.8) * 0.22);
      gain.gain.setValueAtTime(outputGain, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
      oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        gain.disconnect();
      });
    } catch {
      // Audio is optional; browsers may reject it until after a user gesture.
    }
  }, []);

  return { enabledRef, volumeRef, soundStyleRef, playTone };
}

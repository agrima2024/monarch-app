"use client";

import { useEffect, useState } from "react";

interface RoyalProclamationBarProps {
  messages: string[];
}

export function RoyalProclamationBar({ messages }: RoyalProclamationBarProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const items =
    messages.length > 0
      ? messages
      : ["📜 The realm awaits your first proclamation…"];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setVisible(true);
      }, 320);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [items.length]);

  return (
    <div className="pointer-events-none max-w-[min(72vw,320px)]">
      <div className="rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 px-3 py-2 shadow-lg">
        <p className="text-[10px] uppercase tracking-widest text-gold/80 mb-0.5">
          Royal Proclamation
        </p>
        <p
          className={`text-xs text-foreground/90 leading-snug transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {items[index]}
        </p>
      </div>
    </div>
  );
}

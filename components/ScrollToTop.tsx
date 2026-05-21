"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={[
        "hidden md:flex",
        "fixed bottom-8 right-8 z-50",
        "w-11 h-11 items-center justify-center",
        "bg-brand-charcoal/80 backdrop-blur-sm border border-white/10",
        "hover:border-brand-gold/50 hover:bg-brand-charcoal transition-all duration-500",
        "group",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        "transition-[opacity,transform] duration-500",
      ].join(" ")}
    >
      <Image
        src="/images/logo_icon.svg"
        width={28}
        height={28}
        alt=""
        className="opacity-50 group-hover:opacity-100 transition-opacity duration-500"
      />
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { label: "Wajib Pajak Terdaftar", value: 1250000, suffix: "+", prefix: "" },
  { label: "Realisasi PAD (Miliar)", value: 850, suffix: "M", prefix: "Rp" },
  { label: "Unit Samsat", value: 11, suffix: "", prefix: "" },
  { label: "Layanan E-Samsat", value: 24, suffix: "/7", prefix: "" },
];

function CountUp({ target, suffix, prefix }: { target: number; suffix: string; prefix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const stepValue = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += stepValue;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(current));
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl font-bold font-poppins text-white">
      {prefix}{count.toLocaleString("id-ID")}{suffix}
    </div>
  );
}

export function StatisticsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary-800 to-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-poppins text-white">BAPENDA dalam Angka</h2>
          <p className="text-white/70 mt-2">Capaian dan pencapaian BAPENDA Provinsi Jambi</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <CountUp target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              <p className="text-white/80 text-sm mt-2 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

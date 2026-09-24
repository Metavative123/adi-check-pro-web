"use client";

import { useEffect, useState } from "react";
import Gauge from "@/components/Gauge";

// Needle sweeps back and forth, like the app is searching for the page.
export default function NotFoundGauge() {
  const [value, setValue] = useState(8);

  useEffect(() => {
    let high = true;
    const id = setInterval(() => {
      setValue(high ? 92 : 8);
      high = !high;
    }, 1300);
    return () => clearInterval(id);
  }, []);

  return <Gauge value={value} className="w-64 md:w-72" />;
}

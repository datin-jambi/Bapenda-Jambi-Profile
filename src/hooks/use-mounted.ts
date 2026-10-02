"use client";

import { useEffect, useState } from "react";

/**
 * `false` saat render server & render klien pertama, `true` setelahnya.
 *
 * Dipakai komponen yang membaca store ter-persist (auth/sidebar di
 * localStorage): server merender nilai awal sementara klien langsung punya
 * data tersimpan, sehingga pohon render berbeda dan React melaporkan
 * hydration mismatch. Dengan gate ini render pertama di kedua sisi identik.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

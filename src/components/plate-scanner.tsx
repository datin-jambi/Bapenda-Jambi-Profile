"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2, RotateCcw, Check, X, AlertCircle, SwitchCamera } from "lucide-react";

const PLATE_API =
  process.env.NEXT_PUBLIC_PLATE_API_URL ?? "http://localhost:5051/api/detect-plate";

type Mode = "scanning" | "review";

interface PlateScannerProps {
  open: boolean;
  onClose: () => void;
  /** Dipanggil saat operator menekan "Gunakan Nomor Ini" */
  onConfirm: (plate: string) => void;
}

const MAX_WIDTH = 1024;

interface DetectResponse {
  status?: string;
  plate_number?: string;
  confidence?: number;
  message?: string;
}

/** Ambil frame video jadi JPEG blob (di-downscale agar upload ringan). */
function grabFrame(video: HTMLVideoElement): Promise<{ blob: Blob; dataUrl: string } | null> {
  const w = video.videoWidth;
  if (!w) return Promise.resolve(null);
  const scale = Math.min(1, MAX_WIDTH / w);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob ? { blob, dataUrl } : null), "image/jpeg", 0.85)
  );
}

async function detectPlate(blob: Blob): Promise<DetectResponse> {
  const form = new FormData();
  form.append("image", blob, "capture.jpg");
  const res = await fetch(PLATE_API, { method: "POST", body: form });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function PlateScanner({ open, onClose, onConfirm }: PlateScannerProps) {
  const [mode, setMode] = useState<Mode>("scanning");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Menyalakan kamera...");
  const [snapshot, setSnapshot] = useState("");
  const [plate, setPlate] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [hasMultiCam, setHasMultiCam] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const modeRef = useRef<Mode>("scanning");
  const abortRef = useRef(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const goReview = useCallback(
    (dataUrl: string, number: string, conf: number | null, msg: string) => {
      modeRef.current = "review";
      setMode("review");
      setSnapshot(dataUrl);
      setPlate(number.toUpperCase());
      setConfidence(conf);
      setError(msg);
      stopStream();
    },
    [stopStream]
  );

  /** Ambil frame sekarang, kirim ke API OCR, lalu tampilkan hasil untuk direview. */
  const capture = useCallback(async () => {
    const video = videoRef.current;
    setStatus(`Tombol ditekan → ${PLATE_API}`);
    if (!video || busyRef.current || modeRef.current === "review") {
      setError(`Capture dilewati (video=${!!video} busy=${busyRef.current} mode=${modeRef.current})`);
      return;
    }
    const frame = await grabFrame(video);
    if (!frame) {
      setError(`Kamera belum siap (videoWidth=${video.videoWidth}). Tunggu gambar muncul lalu coba lagi.`);
      return;
    }

    setError("");
    setStatus(`Mengirim ${(frame.blob.size / 1024).toFixed(0)} KB ke ${PLATE_API}...`);
    busyRef.current = true;
    setBusy(true);
    try {
      const result = await detectPlate(frame.blob);
      const ok = result.status === "success" && !!result.plate_number;
      goReview(
        frame.dataUrl,
        result.plate_number ?? "",
        result.confidence ?? null,
        ok ? "" : result.message ?? "Plat tidak terbaca. Silakan ketik manual."
      );
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? `Tidak bisa menghubungi ${PLATE_API}. Pastikan service jalan & mengizinkan CORS.`
          : `Deteksi gagal: ${err instanceof Error ? err.message : String(err)}`;
      setError(msg);
      setStatus("");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [goReview]);

  const startCamera = useCallback(async (mode: "environment" | "user" = "environment") => {
    setError("");
    setStatus("Menyalakan kamera...");
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      video.srcObject = stream;
      await video.play();
      setStatus("Arahkan plat ke dalam kotak");
      // Label device baru terisi setelah izin diberikan, jadi dicek di sini.
      const cams = (await navigator.mediaDevices.enumerateDevices()).filter(
        (d) => d.kind === "videoinput"
      );
      setHasMultiCam(cams.length > 1);
    } catch {
      setError(
        "Kamera tidak dapat diakses. Beri izin kamera; browser hanya mengizinkan di localhost atau HTTPS."
      );
      setStatus("");
    }
  }, [stopStream]);

  // Buka: nyalakan kamera. Deteksi hanya jalan saat tombol capture ditekan.
  useEffect(() => {
    if (!open) return;
    abortRef.current = false;
    busyRef.current = false;
    modeRef.current = "scanning";
    setMode("scanning");
    setSnapshot("");
    setPlate("");
    setConfidence(null);
    setError("");
    setFacing("environment");

    startCamera("environment");

    return () => {
      abortRef.current = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    abortRef.current = true;
    stopStream();
    onClose();
  };

  const handleSwitchCamera = async () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    await startCamera(next);
  };

  const handleRetake = async () => {
    modeRef.current = "scanning";
    setMode("scanning");
    setSnapshot("");
    setPlate("");
    setConfidence(null);
    await startCamera(facing);
  };

  const handleConfirm = () => {
    const val = plate.trim().toUpperCase();
    if (val.replace(/\s/g, "").length < 3) {
      setError("Nomor polisi belum valid.");
      return;
    }
    abortRef.current = true;
    stopStream();
    onConfirm(val);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Scan Plat Nomor</h2>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative bg-black aspect-video">
          {mode === "review" && snapshot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={snapshot} alt="Hasil tangkapan plat" className="w-full h-full object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${facing === "user" ? "scale-x-[-1]" : ""}`}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-1/4 border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
              {hasMultiCam && (
                <button
                  onClick={handleSwitchCamera}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white"
                  aria-label={facing === "environment" ? "Pakai kamera depan" : "Pakai kamera belakang"}
                >
                  <SwitchCamera className="h-4 w-4" />
                </button>
              )}
              <div className="absolute bottom-2 left-0 right-0 px-3 text-center text-[11px] text-white/90">
                {status}
              </div>
            </>
          )}
        </div>

        <div className="p-4 space-y-3">
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-px" />
              <span className="break-words">{error}</span>
            </div>
          )}

          {mode === "scanning" ? (
            <button
              onClick={() => capture()}
              disabled={busy}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Ambil Gambar Sekarang
            </button>
          ) : (
            <>
              <div>
                <label className="text-xs text-gray-500">Nomor Polisi Terdeteksi</label>
                <input
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  maxLength={12}
                  placeholder="BH 1234 AB"
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {confidence !== null && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Akurasi deteksi {(confidence * 100).toFixed(1)}% — periksa dan koreksi bila perlu.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ulangi
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Gunakan Nomor Ini
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

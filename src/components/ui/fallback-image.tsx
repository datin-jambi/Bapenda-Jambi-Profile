"use client";

import { useState, useEffect, useRef } from "react";
import NextImage, { ImageProps } from "next/image";
import { PLACEHOLDERS, PlaceholderType } from "@/lib/image";
import { cn } from "@/lib/utils";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallback: PlaceholderType;
}

const MAX_RETRIES = 3;

function getRetryDelay(attempt: number) {
  // 1s → 2s → 4s
  return 1000 * Math.pow(2, attempt - 1);
}

export function FallbackImage({ src, fallback, alt, className, fill, ...props }: FallbackImageProps) {
  const placeholder = PLACEHOLDERS[fallback];
  const resolved = src && src.trim() !== "" ? src : placeholder;

  const [imgSrc, setImgSrc] = useState<string>(resolved);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setImgSrc(resolved);
    setLoading(true);
    setRetryCount(0);
  }, [resolved]);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  function handleLoad() {
    setLoading(false);
  }

  function handleError() {
    const url = imgSrc;

    if (retryCount < MAX_RETRIES && url !== placeholder) {
      const attempt = retryCount + 1;
      const delay = getRetryDelay(attempt);

      console.warn(
        `[FallbackImage] Load failed — url: ${url}, retry: ${attempt}/${MAX_RETRIES}, delay: ${delay}ms`
      );

      retryTimerRef.current = setTimeout(() => {
        setRetryCount(attempt);
        const separator = url.includes("?") ? "&" : "?";
        setImgSrc(`${url}${separator}_retry=${attempt}`);
      }, delay);
    } else {
      if (url !== placeholder) {
        console.error(
          `[FallbackImage] Permanently failed after ${retryCount} retries — url: ${url}, using placeholder`
        );
      }
      setImgSrc(placeholder);
      setLoading(false);
    }
  }

  return (
    <>
      {/* Skeleton shown while image is loading */}
      {loading && (
        <span
          className="absolute inset-0 z-10 animate-pulse bg-gray-200"
          aria-hidden="true"
        />
      )}
      <NextImage
        {...props}
        fill={fill}
        src={imgSrc}
        alt={alt}
        className={cn(
          className,
          loading ? "opacity-0" : "opacity-100 transition-opacity duration-300"
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}

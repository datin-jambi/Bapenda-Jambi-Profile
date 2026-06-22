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
  return 1000 * Math.pow(2, attempt - 1);
}

function isLocalPath(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
}

export function FallbackImage({ src, fallback, alt, className, fill, width, height, ...props }: FallbackImageProps) {
  const placeholder = PLACEHOLDERS[fallback];
  const originalSrc = src && src.trim() !== "" ? src : placeholder;

  // Start as loaded for local placeholders to avoid flicker on fallback render
  const isLocal = isLocalPath(originalSrc);
  const [imgSrc, setImgSrc] = useState<string>(originalSrc);
  const [loading, setLoading] = useState(!isLocal);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originalSrcRef = useRef(originalSrc);

  useEffect(() => {
    if (originalSrcRef.current === originalSrc) return;
    originalSrcRef.current = originalSrc;
    setImgSrc(originalSrc);
    setLoading(!isLocalPath(originalSrc));
    retryCountRef.current = 0;
  }, [originalSrc]);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  function handleLoad() {
    setLoading(false);
  }

  function handleError() {
    const base = originalSrcRef.current;

    if (retryCountRef.current < MAX_RETRIES && base !== placeholder) {
      const attempt = retryCountRef.current + 1;
      const delay = getRetryDelay(attempt);
      retryTimerRef.current = setTimeout(() => {
        retryCountRef.current = attempt;
        setImgSrc(`${base}?_retry=${attempt}`);
      }, delay);
    } else {
      setImgSrc(placeholder);
      setLoading(false);
    }
  }

  if (fill) {
    return (
      <>
        {loading && (
          <span
            className="absolute inset-0 z-10 animate-pulse rounded bg-gray-200"
            aria-hidden="true"
          />
        )}
        <NextImage
          {...props}
          fill
          src={imgSrc}
          alt={alt}
          unoptimized={isLocalPath(imgSrc)}
          className={cn(className, loading ? "opacity-0" : "opacity-100 transition-opacity duration-300")}
          onLoad={handleLoad}
          onError={handleError}
        />
      </>
    );
  }

  return (
    <span
      className="relative inline-block overflow-hidden rounded"
      style={{ width: Number(width), height: Number(height) }}
    >
      {loading && (
        <span
          className="absolute inset-0 animate-pulse bg-gray-200"
          aria-hidden="true"
        />
      )}
      <NextImage
        {...props}
        width={width}
        height={height}
        src={imgSrc}
        alt={alt}
        unoptimized={isLocalPath(imgSrc)}
        className={cn(className, loading ? "opacity-0" : "opacity-100 transition-opacity duration-300")}
        onLoad={handleLoad}
        onError={handleError}
      />
    </span>
  );
}

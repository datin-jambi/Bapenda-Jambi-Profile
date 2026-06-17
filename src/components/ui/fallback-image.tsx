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

export function FallbackImage({ src, fallback, alt, className, fill, width, height, ...props }: FallbackImageProps) {
  const placeholder = PLACEHOLDERS[fallback];
  const originalSrc = src && src.trim() !== "" ? src : placeholder;

  const [imgSrc, setImgSrc] = useState<string>(originalSrc);
  const [loading, setLoading] = useState(true);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originalSrcRef = useRef(originalSrc);

  useEffect(() => {
    originalSrcRef.current = originalSrc;
    setImgSrc(originalSrc);
    setLoading(true);
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
      console.warn(
        `[FallbackImage] load failed — url: ${base}, retry ${attempt}/${MAX_RETRIES} in ${delay}ms`
      );
      retryTimerRef.current = setTimeout(() => {
        retryCountRef.current = attempt;
        setImgSrc(`${base}?_retry=${attempt}`);
      }, delay);
    } else {
      if (base !== placeholder) {
        console.warn(
          `[FallbackImage] permanently failed after ${retryCountRef.current} retries — url: ${base}, using placeholder`
        );
      }
      setImgSrc(placeholder);
      setLoading(false);
    }
  }

  // fill mode — skeleton is absolute overlay, fits the relative parent container
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
          className={cn(className, loading ? "opacity-0" : "opacity-100 transition-opacity duration-300")}
          onLoad={handleLoad}
          onError={handleError}
        />
      </>
    );
  }

  // fixed-size mode (e.g. inside table cells) — skeleton wraps image and matches its dimensions exactly
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
        className={cn(className, loading ? "opacity-0" : "opacity-100 transition-opacity duration-300")}
        onLoad={handleLoad}
        onError={handleError}
      />
    </span>
  );
}

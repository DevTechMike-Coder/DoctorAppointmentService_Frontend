"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api";

interface AvatarProps {
  initials: string;
  /** API-relative path (e.g. `/doctors/3/photo?v=…`) or a blob:/https: URL. */
  photoUrl?: string | null;
  alt: string;
  /** Size, radius, colors and text styles for the initials fallback (same classes the old div used). */
  className?: string;
}

/** Shows the doctor's photo, falling back to initials when there's none or it fails to load. */
export function Avatar({ initials, photoUrl, alt, className = "" }: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showPhoto = !!photoUrl && failedUrl !== photoUrl;

  return (
    <div className={`${className} relative overflow-hidden`}>
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={apiUrl(photoUrl)}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(photoUrl)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

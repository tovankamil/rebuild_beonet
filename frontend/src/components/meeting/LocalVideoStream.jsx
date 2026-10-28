import React, { useEffect, useRef } from 'react';

/**
 * LocalVideoStream: Reliable WebRTC Video Stream Player
 * Handles autoPlay, playsInline, mirrored mode, and prevents React ref collision
 * across desktop and mobile browsers (iOS Safari, Chrome Android, Desktop).
 */
export default function LocalVideoStream({
  stream,
  isMirrored = false,
  isMuted = true,
  className = 'w-full h-full object-cover',
  ...props
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (stream) {
      // Direct DOM properties required for mobile autoplay compliance
      videoEl.muted = isMuted;
      videoEl.defaultMuted = isMuted;
      videoEl.playsInline = true;
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('webkit-playsinline', '');

      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }

      // Explicitly trigger play to prevent freeze on mobile browsers
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay policy may pause until user interaction or muted
          console.warn('Video play auto-interrupted (safe to ignore if muted):', err.message);
        });
      }
    } else {
      videoEl.srcObject = null;
    }
  }, [stream, isMuted]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isMuted}
      className={`${className} ${isMirrored ? 'transform -scale-x-100' : ''}`}
      {...props}
    />
  );
}

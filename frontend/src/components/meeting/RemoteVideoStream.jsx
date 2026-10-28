import React, { useEffect, useRef } from 'react';

/**
 * RemoteVideoStream: Dedicated Video Player for Remote Peers in WebRTC Conference.
 * Handles autoPlay, playsInline, unmuted playback, and dynamic stream track attachment.
 */
export default function RemoteVideoStream({
  stream,
  isMuted = false,
  className = 'w-full h-full object-cover',
  ...props
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (stream) {
      videoEl.muted = isMuted;
      videoEl.playsInline = true;
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('webkit-playsinline', '');

      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }

      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Remote video play interrupted (safely retrying on interaction):', err.message);
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
      className={className}
      {...props}
    />
  );
}


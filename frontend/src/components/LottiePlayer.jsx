import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

export default function LottiePlayer({ src, className = "w-full h-full", loop = true, autoplay = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !src) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: loop,
      autoplay: autoplay,
      path: src
    });

    return () => {
      anim.destroy();
    };
  }, [src, loop, autoplay]);

  return <div ref={containerRef} className={className} />;
}

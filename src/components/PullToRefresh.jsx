import React, { useState, useRef, useEffect } from "react";

export default function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startYRef = useRef(0);

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current) return;
    const currentY = e.touches[0].clientY;
    const scrollTop = containerRef.current.scrollTop;

    if (scrollTop === 0 && currentY > startYRef.current && !isRefreshing) {
      const pullDistance = currentY - startYRef.current;
      if (pullDistance > 80) {
        setIsRefreshing(true);
        onRefresh?.();
      }
    }
  };

  const handleRefreshComplete = () => {
    setIsRefreshing(false);
  };

  React.useEffect(() => {
    if (isRefreshing) {
      const timer = setTimeout(handleRefreshComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="w-full"
    >
      {children}
    </div>
  );
}
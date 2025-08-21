import React from "react";

interface LodgeEmblemProps {
  size?: number;
  className?: string;
}

export default function LodgeEmblem({ size = 80, className = "" }: LodgeEmblemProps) {
  return (
    <div className={`flex items-start justify-center ${className}`} style={{ width: size, height: size }}>
      {" "}
      <img
        src="/SquareCompass.png"
        alt="Lodge Emblem"
        width={80}
        height={80}
        className="bg-lodge-white"
        style={{
          backgroundColor: "transparent",
          filter: "contrast(1.2) brightness(1.1) saturate(1.1)",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}

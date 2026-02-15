'use client';

import { useState } from 'react';
import type { NFVLandmark, NFVAngle } from '@/lib/api/types';

interface LandmarkOverlayProps {
  imageUrl?: string;
  landmarks: NFVLandmark[];
  width?: number;
  height?: number;
}

// Lines connecting related landmarks
const connections: [string, string][] = [
  ['acromion_left', 'acromion_right'],
  ['acromion_left', 'iliac_crest_left'],
  ['acromion_right', 'iliac_crest_right'],
  ['iliac_crest_left', 'iliac_crest_right'],
  ['iliac_crest_left', 'patella_left'],
  ['iliac_crest_right', 'patella_right'],
  ['patella_left', 'malleolus_left'],
  ['patella_right', 'malleolus_right'],
  ['tragus_left', 'tragus_right'],
  ['c7', 'acromion_left'],
  ['c7', 'acromion_right'],
];

export default function LandmarkOverlay({
  imageUrl,
  landmarks,
  width = 400,
  height = 600,
}: LandmarkOverlayProps) {
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);

  const landmarkMap = new Map(landmarks.map((l) => [l.name, l]));

  return (
    <div className="relative inline-block rounded-xl overflow-hidden border border-[#d0dbe6]" style={{ width, height }}>
      {/* Background image or placeholder */}
      {imageUrl ? (
        <img src={imageUrl} alt="Posture assessment" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-nfv-bg-card flex items-center justify-center">
          <div className="text-center">
            <p className="text-nfv-ice-muted text-sm">Imagem do paciente</p>
            <p className="text-nfv-ice-muted/50 text-xs mt-1">(disponível com dados reais)</p>
          </div>
        </div>
      )}

      {/* SVG Overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Connection lines */}
        {connections.map(([from, to]) => {
          const a = landmarkMap.get(from);
          const b = landmarkMap.get(to);
          if (!a || !b) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x * width}
              y1={a.y * height}
              x2={b.x * width}
              y2={b.y * height}
              stroke="rgba(0, 188, 212, 0.5)"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
          );
        })}

        {/* Landmark dots */}
        {landmarks.map((landmark) => {
          const cx = landmark.x * width;
          const cy = landmark.y * height;
          const isHovered = hoveredLandmark === landmark.name;

          return (
            <g
              key={landmark.name}
              onMouseEnter={() => setHoveredLandmark(landmark.name)}
              onMouseLeave={() => setHoveredLandmark(null)}
              className="cursor-pointer"
            >
              {/* Glow ring */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 10 : 6}
                fill="none"
                stroke="rgba(0, 188, 212, 0.3)"
                strokeWidth="1"
                className="transition-all duration-200"
              />
              {/* Dot */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 5 : 3.5}
                fill="#00bcd4"
                stroke="rgba(0, 0, 0, 0.5)"
                strokeWidth="1"
                className="transition-all duration-200"
              />

              {/* Label on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={cx + 12}
                    y={cy - 12}
                    width={landmark.label.length * 6.5 + 16}
                    height={24}
                    rx={6}
                    fill="rgba(255, 255, 255, 0.95)"
                    stroke="rgba(0, 188, 212, 0.3)"
                    strokeWidth="1"
                  />
                  <text
                    x={cx + 20}
                    y={cy + 3}
                    fill="#1a2332"
                    fontSize="10"
                    fontFamily="sans-serif"
                  >
                    {landmark.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

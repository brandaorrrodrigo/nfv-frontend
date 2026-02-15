'use client';

interface AuroraBackgroundProps {
  intensity?: 'subtle' | 'normal' | 'vivid';
  children?: React.ReactNode;
}

export default function AuroraBackground({ intensity = 'normal', children }: AuroraBackgroundProps) {
  // On ice theme, aurora orbs are very subtle — 0.05-0.12 max opacity
  const opacityMap = { subtle: '0.05', normal: '0.08', vivid: '0.12' };
  const op = opacityMap[intensity];

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#f0f4f8]" style={{ zIndex: 0 }}>
      {/* Aurora orb 1 - Cyan */}
      <div
        className="absolute animate-nfv-aurora-breathe"
        style={{
          width: '60vw',
          height: '60vh',
          top: '-10%',
          left: '-10%',
          background: `radial-gradient(ellipse, rgba(0, 188, 212, ${op}) 0%, transparent 70%)`,
          filter: 'blur(80px)',
          backgroundSize: '200% 200%',
        }}
      />
      {/* Aurora orb 2 - Blue */}
      <div
        className="absolute animate-nfv-aurora-breathe"
        style={{
          width: '50vw',
          height: '50vh',
          top: '20%',
          right: '-5%',
          background: `radial-gradient(ellipse, rgba(41, 98, 255, ${op}) 0%, transparent 70%)`,
          filter: 'blur(90px)',
          backgroundSize: '200% 200%',
          animationDelay: '-7s',
        }}
      />
      {/* Aurora orb 3 - Purple */}
      <div
        className="absolute animate-nfv-aurora-breathe"
        style={{
          width: '45vw',
          height: '45vh',
          bottom: '5%',
          left: '20%',
          background: `radial-gradient(ellipse, rgba(124, 77, 255, ${op}) 0%, transparent 70%)`,
          filter: 'blur(100px)',
          backgroundSize: '200% 200%',
          animationDelay: '-13s',
        }}
      />
      {/* Aurora orb 4 - Teal (vivid only) */}
      {intensity === 'vivid' && (
        <div
          className="absolute animate-nfv-aurora-breathe"
          style={{
            width: '40vw',
            height: '40vh',
            top: '40%',
            left: '50%',
            background: 'radial-gradient(ellipse, rgba(0, 191, 165, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            backgroundSize: '200% 200%',
            animationDelay: '-4s',
          }}
        />
      )}
      {/* Grid overlay — very subtle on light */}
      <div className="absolute inset-0 nfv-grid-overlay opacity-40 pointer-events-none" />
      {/* Content passthrough */}
      {children}
    </div>
  );
}

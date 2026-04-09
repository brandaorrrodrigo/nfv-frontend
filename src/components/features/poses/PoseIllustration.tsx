'use client';

// Ilustrações SVG de silhuetas por pose baseadas nas regras IFBB 2024.
// Usam SVG inline — sem copyright, totalmente proprietário.

const POSE_SVGS: Record<string, string> = {
  front_double_biceps_open: `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="20" r="12" fill="none" stroke="#00bcd4" stroke-width="2"/><line x1="60" y1="32" x2="60" y2="45" stroke="#00bcd4" stroke-width="2"/><line x1="25" y1="50" x2="95" y2="50" stroke="#00bcd4" stroke-width="2.5"/><line x1="25" y1="50" x2="15" y2="75" stroke="#00bcd4" stroke-width="2"/><line x1="15" y1="75" x2="20" y2="95" stroke="#00e5ff" stroke-width="2"/><line x1="95" y1="50" x2="105" y2="75" stroke="#00bcd4" stroke-width="2"/><line x1="105" y1="75" x2="100" y2="95" stroke="#00e5ff" stroke-width="2"/><circle cx="20" cy="97" r="3" fill="#00e5ff"/><circle cx="100" cy="97" r="3" fill="#00e5ff"/><line x1="25" y1="50" x2="30" y2="110" stroke="#00bcd4" stroke-width="2"/><line x1="95" y1="50" x2="90" y2="110" stroke="#00bcd4" stroke-width="2"/><line x1="30" y1="110" x2="90" y2="110" stroke="#00bcd4" stroke-width="2"/><line x1="45" y1="110" x2="40" y2="155" stroke="#00bcd4" stroke-width="2"/><line x1="40" y1="155" x2="38" y2="195" stroke="#00bcd4" stroke-width="2"/><line x1="75" y1="110" x2="80" y2="155" stroke="#00bcd4" stroke-width="2"/><line x1="80" y1="155" x2="82" y2="195" stroke="#00bcd4" stroke-width="2"/><text x="60" y="210" text-anchor="middle" fill="#00bcd4" font-size="7">Mãos ABERTAS</text></svg>`,

  front_double_biceps: `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="20" r="12" fill="none" stroke="#00bcd4" stroke-width="2"/><line x1="60" y1="32" x2="60" y2="45" stroke="#00bcd4" stroke-width="2"/><line x1="25" y1="50" x2="95" y2="50" stroke="#00bcd4" stroke-width="2.5"/><line x1="25" y1="50" x2="15" y2="75" stroke="#00bcd4" stroke-width="2"/><line x1="15" y1="75" x2="20" y2="95" stroke="#00e5ff" stroke-width="2"/><line x1="95" y1="50" x2="105" y2="75" stroke="#00bcd4" stroke-width="2"/><line x1="105" y1="75" x2="100" y2="95" stroke="#00e5ff" stroke-width="2"/><rect x="16" y="92" width="8" height="8" rx="2" fill="#ff9100"/><rect x="96" y="92" width="8" height="8" rx="2" fill="#ff9100"/><line x1="25" y1="50" x2="30" y2="110" stroke="#00bcd4" stroke-width="2"/><line x1="95" y1="50" x2="90" y2="110" stroke="#00bcd4" stroke-width="2"/><line x1="30" y1="110" x2="90" y2="110" stroke="#00bcd4" stroke-width="2"/><line x1="45" y1="110" x2="40" y2="155" stroke="#00bcd4" stroke-width="2"/><line x1="40" y1="155" x2="38" y2="195" stroke="#00bcd4" stroke-width="2"/><line x1="75" y1="110" x2="80" y2="155" stroke="#00bcd4" stroke-width="2"/><line x1="80" y1="155" x2="82" y2="195" stroke="#00bcd4" stroke-width="2"/><text x="60" y="210" text-anchor="middle" fill="#ff9100" font-size="7">Punhos FECHADOS</text></svg>`,

  side_chest: `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg"><circle cx="55" cy="20" r="12" fill="none" stroke="#00bcd4" stroke-width="2"/><line x1="55" y1="32" x2="55" y2="45" stroke="#00bcd4" stroke-width="2"/><line x1="45" y1="48" x2="70" y2="52" stroke="#00bcd4" stroke-width="2.5"/><line x1="45" y1="48" x2="30" y2="72" stroke="#00bcd4" stroke-width="2"/><line x1="30" y1="72" x2="38" y2="88" stroke="#00e5ff" stroke-width="2.5"/><line x1="70" y1="52" x2="72" y2="78" stroke="#00bcd4" stroke-width="2"/><line x1="45" y1="48" x2="48" y2="108" stroke="#00bcd4" stroke-width="2"/><line x1="70" y1="52" x2="65" y2="108" stroke="#00bcd4" stroke-width="2"/><line x1="50" y1="108" x2="42" y2="152" stroke="#00bcd4" stroke-width="2"/><line x1="42" y1="152" x2="40" y2="190" stroke="#00bcd4" stroke-width="2"/><line x1="63" y1="108" x2="70" y2="155" stroke="#00bcd4" stroke-width="2"/><line x1="70" y1="155" x2="72" y2="190" stroke="#00bcd4" stroke-width="2"/><text x="55" y="205" text-anchor="middle" fill="#00bcd4" font-size="7">Braço 90° lateral</text></svg>`,

  quarter_turn_front: `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="20" r="12" fill="none" stroke="#00bcd4" stroke-width="2"/><line x1="60" y1="32" x2="60" y2="45" stroke="#00bcd4" stroke-width="2"/><line x1="30" y1="50" x2="90" y2="50" stroke="#00bcd4" stroke-width="2.5"/><line x1="30" y1="50" x2="25" y2="85" stroke="#00bcd4" stroke-width="2"/><line x1="90" y1="50" x2="95" y2="85" stroke="#00bcd4" stroke-width="2"/><line x1="30" y1="50" x2="35" y2="105" stroke="#00bcd4" stroke-width="2"/><line x1="90" y1="50" x2="85" y2="105" stroke="#00bcd4" stroke-width="2"/><line x1="35" y1="105" x2="85" y2="105" stroke="#00bcd4" stroke-width="2"/><line x1="48" y1="105" x2="45" y2="150" stroke="#00bcd4" stroke-width="2"/><line x1="45" y1="150" x2="43" y2="190" stroke="#00bcd4" stroke-width="2"/><line x1="72" y1="105" x2="75" y2="150" stroke="#00bcd4" stroke-width="2"/><line x1="75" y1="150" x2="77" y2="190" stroke="#00bcd4" stroke-width="2"/><text x="60" y="205" text-anchor="middle" fill="#00bcd4" font-size="7">Postura atlética</text></svg>`,

  neutral_stage_presence: `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="20" r="12" fill="none" stroke="#00bcd4" stroke-width="2"/><line x1="60" y1="32" x2="60" y2="45" stroke="#00bcd4" stroke-width="2"/><line x1="35" y1="50" x2="85" y2="50" stroke="#00bcd4" stroke-width="2.5"/><line x1="35" y1="50" x2="30" y2="88" stroke="#00bcd4" stroke-width="2"/><line x1="85" y1="50" x2="90" y2="88" stroke="#00bcd4" stroke-width="2"/><line x1="35" y1="50" x2="38" y2="105" stroke="#00bcd4" stroke-width="2"/><line x1="85" y1="50" x2="82" y2="105" stroke="#00bcd4" stroke-width="2"/><line x1="38" y1="105" x2="82" y2="105" stroke="#00bcd4" stroke-width="2"/><line x1="48" y1="105" x2="46" y2="150" stroke="#00bcd4" stroke-width="2"/><line x1="46" y1="150" x2="45" y2="192" stroke="#00bcd4" stroke-width="2"/><line x1="72" y1="105" x2="74" y2="150" stroke="#00bcd4" stroke-width="2"/><line x1="74" y1="150" x2="75" y2="192" stroke="#00bcd4" stroke-width="2"/><text x="60" y="207" text-anchor="middle" fill="#69f0ae" font-size="7">Postura de palco</text></svg>`,
};

const DEFAULT_SVG = `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="20" r="12" fill="none" stroke="#64748b" stroke-width="2"/><line x1="60" y1="32" x2="60" y2="45" stroke="#64748b" stroke-width="2"/><line x1="30" y1="50" x2="90" y2="50" stroke="#64748b" stroke-width="2.5"/><line x1="30" y1="50" x2="25" y2="85" stroke="#64748b" stroke-width="2"/><line x1="90" y1="50" x2="95" y2="85" stroke="#64748b" stroke-width="2"/><line x1="30" y1="50" x2="35" y2="105" stroke="#64748b" stroke-width="2"/><line x1="90" y1="50" x2="85" y2="105" stroke="#64748b" stroke-width="2"/><line x1="35" y1="105" x2="85" y2="105" stroke="#64748b" stroke-width="2"/><line x1="48" y1="105" x2="45" y2="150" stroke="#64748b" stroke-width="2"/><line x1="45" y1="150" x2="43" y2="190" stroke="#64748b" stroke-width="2"/><line x1="72" y1="105" x2="75" y2="150" stroke="#64748b" stroke-width="2"/><line x1="75" y1="150" x2="77" y2="190" stroke="#64748b" stroke-width="2"/></svg>`;

interface PoseIllustrationProps {
  poseId: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PoseIllustration({
  poseId,
  size = 'md',
}: PoseIllustrationProps) {
  const svg =
    POSE_SVGS[poseId] ??
    POSE_SVGS[poseId.replace(/^(bb_|b212_|wb_|wp_|fig_)/, '')] ??
    DEFAULT_SVG;

  const sizeClass =
    size === 'sm'
      ? 'w-16 h-24'
      : size === 'lg'
        ? 'w-40 h-56'
        : 'w-24 h-36';

  return (
    <div
      className={`${sizeClass} flex-shrink-0`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

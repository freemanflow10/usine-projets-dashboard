import { Html } from "@react-three/drei";
import type { ReactElement } from "react";

export interface StationLabelProps {
  label: string;
  position?: [number, number, number];
}

export default function StationLabel({
  label,
  position = [0, 1.8, 0],
}: StationLabelProps): ReactElement {
  return (
    <Html
      position={position}
      center
      distanceFactor={24}
      style={{ pointerEvents: "none" }}
    >
      <span className="pointer-events-none whitespace-nowrap rounded border border-white/15 bg-[#0e1116]/85 px-2 py-0.5 text-[11px] font-medium text-slate-200 shadow backdrop-blur-sm">
        {label}
      </span>
    </Html>
  );
}

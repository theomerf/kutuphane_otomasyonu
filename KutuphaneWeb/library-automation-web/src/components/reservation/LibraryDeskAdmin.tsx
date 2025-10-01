import { useId } from "react";
import type { Table } from "../../types/table";
import SeatIconAdmin from "./SeatIconAdmin";
import type { SeatInfo } from "../../pages/Admin/ReservationsManager/Seats/SeatsAdmin";

type LibraryDeskTopProps = {
  table: Table;
  hoveredSeat: SeatInfo | null;
  onHoverSeat: (seatId: number, seatNumber: number, tableName: string) => void;
  noHoverSeat: () => void;
  handleSeatDelete: (seatId: number) => void;
  width?: number | string;
  height?: number | string;
  className?: string;
  deskColor?: string;
  edgeColor?: string;
  legColor?: string;
  strokeColor?: string;
  shadow?: boolean;
  ariaLabel?: string;
  label?: string;
  labelColor?: string;
  labelFontSize?: number;
};

export default function LibraryDeskTopAdmin({
  table,
  hoveredSeat,
  onHoverSeat,
  noHoverSeat,
  handleSeatDelete,
  width = 400,
  height = 160,
  className,
  deskColor = "#B8860B",
  edgeColor = "#8B4513",
  legColor = "#654321",
  strokeColor = "rgba(0,0,0,0.2)",
  shadow = true,
  ariaLabel = "Library desk top view",
  label = undefined,
  labelColor = "#2D1810",
  labelFontSize = 16,
}: LibraryDeskTopProps) {
  const gradId = useId();
  const woodId = `wood-${gradId}`;
  const sheenId = `sheen-${gradId}`;
  const shadowId = `shadow-${gradId}`;

  return (
    <div className="flex flex-col items-center w-full pt-4">
      <div className="flex flex-row gap-5 justify-center">
        {table.seats.map(seat => {
          return (
            <SeatIconAdmin
              key={seat.id}
              hovered={hoveredSeat?.seatId === seat.id}
              onHover={() => {onHoverSeat(seat.id, seat.seatNumber, table.name);}}
              onMouseLeave={noHoverSeat}
              handleSeatDelete={() => handleSeatDelete(seat.id)}
              seatNumber={seat.seatNumber}
            />
          );
        })}
      </div>

      <svg
        role="img"
        aria-label={ariaLabel}
        width={width}
        height={height}
        viewBox="0 0 320 120"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={woodId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={deskColor} />
            <stop offset="20%" stopColor={lightenColor(deskColor, 8)} />
            <stop offset="80%" stopColor={deskColor} />
            <stop offset="100%" stopColor={shadeColor(deskColor, -15)} />
          </linearGradient>

          <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
          </linearGradient>

          <filter id={shadowId}>
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.15)" />
          </filter>
        </defs>

        <g filter={shadow ? `url(#${shadowId})` : undefined}>
          <rect 
            x="20" 
            y="25" 
            width="280" 
            height="70" 
            rx="8" 
            fill={edgeColor}
            stroke={strokeColor}
            strokeWidth="1"
          />
          
          <rect 
            x="24" 
            y="29" 
            width="272" 
            height="62" 
            rx="6" 
            fill={`url(#${woodId})`}
          />

          <rect 
            x="24" 
            y="29" 
            width="272" 
            height="62" 
            rx="6" 
            fill={`url(#${sheenId})`}
            opacity="0.6"
          />
        </g>

        <g opacity="0.8">
          <ellipse cx="45" cy="100" rx="8" ry="4" fill={legColor} />
          <rect x="41" y="95" width="8" height="10" fill={shadeColor(legColor, -10)} />
          
          <ellipse cx="275" cy="100" rx="8" ry="4" fill={legColor} />
          <rect x="271" y="95" width="8" height="10" fill={shadeColor(legColor, -10)} />
          
          <ellipse cx="50" cy="20" rx="6" ry="3" fill={shadeColor(legColor, -20)} />
          <rect x="47" y="20" width="6" height="8" fill={shadeColor(legColor, -25)} />
          
          <ellipse cx="270" cy="20" rx="6" ry="3" fill={shadeColor(legColor, -20)} />
          <rect x="267" y="20" width="6" height="8" fill={shadeColor(legColor, -25)} />
        </g>

        {woodGrainLines().map((d, i) => (
          <path 
            key={i} 
            d={d} 
            fill="none" 
            stroke="rgba(0,0,0,0.08)" 
            strokeWidth="1.5"
            opacity="0.6"
          />
        ))}

        <rect 
          x="28" 
          y="33" 
          width="264" 
          height="54" 
          rx="4" 
          fill="none" 
          stroke="rgba(255,255,255,0.15)" 
          strokeWidth="1"
        />

        {(label ?? table.name) && (
          <text
            x="160"
            y="60"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={labelColor}
            fontSize={labelFontSize}
            fontWeight="600"
            fontFamily="system-ui, sans-serif"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {label ?? table.name}
          </text>
        )}
      </svg>
    </div>
  );
}

function shadeColor(hex: string, percent: number) {
  const p = Math.max(-100, Math.min(100, percent)) / 100;
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.round(r + (p < 0 ? r : 255 - r) * p);
  const ng = Math.round(g + (p < 0 ? g : 255 - g) * p);
  const nb = Math.round(b + (p < 0 ? b : 255 - b) * p);
  return rgbToHex(nr, ng, nb);
}

function lightenColor(hex: string, percent: number) {
  return shadeColor(hex, Math.abs(percent));
}

function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  const bigint = parseInt(c.length === 3 ? c.split("").map(ch => ch + ch).join("") : c, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function woodGrainLines() {
  const paths: string[] = [];
  
  for (let i = 0; i < 4; i++) {
    const y = 35 + i * 15;
    const d = `M 30 ${y} 
               Q 80 ${y - 2} 130 ${y}
               Q 180 ${y + 1} 230 ${y - 1}
               Q 270 ${y} 290 ${y}`;
    paths.push(d);
  }
  
  for (let i = 0; i < 3; i++) {
    const x = 60 + i * 80;
    const d = `M ${x} 32
               Q ${x + 2} 45 ${x - 1} 58
               Q ${x + 1} 71 ${x} 88`;
    paths.push(d);
  }
  
  return paths;
}
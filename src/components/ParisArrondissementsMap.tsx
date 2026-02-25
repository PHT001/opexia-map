'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { TrendingUp, MapPin } from 'lucide-react';
import {
  PARIS_ARRONDISSEMENTS,
  PARIS_VIEWBOX,
  SEINE_PATH,
  ArrondissementAggregate,
} from '@/lib/paris-arrondissements';
import { getTypeEmoji } from '@/lib/utils';

interface ParisArrondissementsMapProps {
  arrondissementData: Map<number, ArrondissementAggregate>;
  onNavigateToCity: (city: string) => void;
}

export default function ParisArrondissementsMap({
  arrondissementData,
  onNavigateToCity,
}: ParisArrondissementsMapProps) {
  const [hoveredArr, setHoveredArr] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-compute styles per arrondissement
  const arrStyles = useMemo(() => {
    const styles = new Map<
      number,
      { fill: string; fillHover: string; stroke: string; strokeHover: string; hasData: boolean }
    >();
    for (const arr of PARIS_ARRONDISSEMENTS) {
      const agg = arrondissementData.get(arr.number);
      const hasData = agg?.hasData ?? false;
      if (!hasData) {
        styles.set(arr.number, {
          fill: 'rgba(255,255,255,0.04)',
          fillHover: 'rgba(255,255,255,0.10)',
          stroke: 'rgba(255,255,255,0.08)',
          strokeHover: 'rgba(255,255,255,0.18)',
          hasData: false,
        });
      } else {
        const intensity = Math.min((agg?.totalOpportunities ?? 0) / 5, 1);
        const baseAlpha = 0.2 + intensity * 0.25;
        const hoverAlpha = baseAlpha + 0.2;
        styles.set(arr.number, {
          fill: `rgba(248,113,113,${baseAlpha.toFixed(2)})`,
          fillHover: `rgba(248,113,113,${hoverAlpha.toFixed(2)})`,
          stroke: 'rgba(248,113,113,0.35)',
          strokeHover: 'rgba(248,113,113,0.8)',
          hasData: true,
        });
      }
    }
    return styles;
  }, [arrondissementData]);

  const handleMouseMove = useCallback((e: React.MouseEvent, num: number) => {
    setHoveredArr(num);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + 12;
      const y = e.clientY - rect.top - 8;
      const maxX = rect.width - 220;
      const maxY = rect.height - 100;
      setTooltipPos({
        x: x > maxX ? x - 230 : x,
        y: y > maxY ? y - 90 : y < 0 ? 8 : y,
      });
    }
  }, []);

  // Stats
  const stats = useMemo(() => {
    let total = 0, opp = 0, explored = 0;
    for (const [, agg] of arrondissementData) {
      if (agg.hasData) {
        explored++;
        total += agg.totalRestaurants;
        opp += agg.totalOpportunities;
      }
    }
    return { total, opp, explored };
  }, [arrondissementData]);

  const hoveredData = hoveredArr ? arrondissementData.get(hoveredArr) : null;

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col">
      {/* Stats bar */}
      <div className="flex gap-4 text-[10px] mb-2 px-1">
        <span className="text-text-dim">
          <span className="text-red font-bold">{stats.explored}</span>/20 arrondissements
        </span>
        <span className="text-text-dim">
          {stats.total} restaurants
        </span>
        {stats.opp > 0 && (
          <span className="text-red flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" /> {stats.opp} opp.
          </span>
        )}
      </div>

      {/* SVG Map */}
      <div className="flex-1 min-h-0">
        <svg
          viewBox={PARIS_VIEWBOX}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background grid */}
          <defs>
            <pattern id="parisGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <circle cx="7.5" cy="7.5" r="0.4" fill="rgba(255,255,255,0.03)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="500" height="420" fill="url(#parisGrid)" />

          {/* Arrondissement paths */}
          {PARIS_ARRONDISSEMENTS.map(arr => {
            const isHovered = hoveredArr === arr.number;
            const s = arrStyles.get(arr.number)!;

            return (
              <g key={arr.number}>
                <path
                  d={arr.path}
                  fill={isHovered ? s.fillHover : s.fill}
                  stroke={isHovered ? s.strokeHover : s.stroke}
                  strokeWidth={isHovered ? 1.8 : 0.8}
                  strokeLinejoin="round"
                  className="arr-path"
                  style={{
                    cursor: 'pointer',
                    transition: 'fill 0.2s ease, stroke 0.2s ease, stroke-width 0.15s ease',
                  }}
                  onMouseMove={(e) => handleMouseMove(e, arr.number)}
                  onMouseLeave={() => setHoveredArr(null)}
                  onClick={() => onNavigateToCity(arr.cityName)}
                />
                {/* Arrondissement number label */}
                <text
                  x={arr.labelX}
                  y={arr.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={arr.number <= 4 ? '8' : '9'}
                  fontWeight="700"
                  fontFamily="SF Pro Display, -apple-system, system-ui, sans-serif"
                  fill={
                    s.hasData
                      ? isHovered ? 'rgba(248,113,113,1)' : 'rgba(248,113,113,0.85)'
                      : isHovered ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)'
                  }
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    transition: 'fill 0.2s ease',
                  }}
                >
                  {arr.shortName}
                </text>
                {/* Data indicator dot */}
                {s.hasData && (
                  <circle
                    cx={arr.labelX + (arr.number <= 4 ? 12 : 14)}
                    cy={arr.labelY - (arr.number <= 4 ? 6 : 7)}
                    r="2.5"
                    fill="rgba(248,113,113,0.6)"
                    stroke="rgba(248,113,113,0.3)"
                    strokeWidth="1.5"
                    style={{
                      pointerEvents: 'none',
                      animation: 'dotPulse 2.5s ease-in-out infinite',
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Seine river overlay */}
          <path
            d={SEINE_PATH}
            fill="none"
            stroke="rgba(94,158,255,0.15)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pointerEvents: 'none' }}
          />
          <path
            d={SEINE_PATH}
            fill="none"
            stroke="rgba(94,158,255,0.08)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pointerEvents: 'none' }}
          />

          <style>{`
            @keyframes dotPulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
          `}</style>
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredArr && hoveredData && (
        <div
          className="map-tooltip"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-text">{hoveredData.name}</span>
          </div>
          {hoveredData.hasData ? (
            <>
              <div className="flex gap-3 text-[10px]">
                <span className="text-text-muted">{hoveredData.totalRestaurants} restaurant{hoveredData.totalRestaurants > 1 ? 's' : ''}</span>
                {hoveredData.totalOpportunities > 0 && (
                  <span className="text-red flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> {hoveredData.totalOpportunities} opp.
                  </span>
                )}
              </div>
              {hoveredData.types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {hoveredData.types.slice(0, 4).map(t => (
                    <span key={t} className="glass-pill px-1.5 py-0.5 text-[8px] text-text-muted">
                      {getTypeEmoji(t)} {t}
                    </span>
                  ))}
                  {hoveredData.types.length > 4 && (
                    <span className="text-[8px] text-text-dim">+{hoveredData.types.length - 4}</span>
                  )}
                </div>
              )}
              <div className="mt-1 text-[9px] text-blue flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Cliquer pour explorer →
              </div>
            </>
          ) : (
            <p className="text-[10px] text-text-dim mt-0.5">Pas encore exploré</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[9px] text-text-dim mt-2">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: 'rgba(248,113,113,0.5)', boxShadow: '0 0 4px rgba(248,113,113,0.3)' }}
          />
          Exploré
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
          Non exploré
        </span>
      </div>
    </div>
  );
}

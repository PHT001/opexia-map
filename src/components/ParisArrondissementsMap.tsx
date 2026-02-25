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

  const handleMouseMove = useCallback((e: React.MouseEvent, num: number) => {
    setHoveredArr(num);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + 14;
      const y = e.clientY - rect.top - 10;
      const maxX = rect.width - 240;
      const maxY = rect.height - 120;
      setTooltipPos({
        x: x > maxX ? x - 250 : x,
        y: y > maxY ? y - 100 : y < 0 ? 10 : y,
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
      {/* ═══ Header ═══ */}
      <div className="text-center mb-3">
        <h3 className="text-[14px] font-bold text-white tracking-wide">
          Arrondissements de Paris
        </h3>
        <div className="flex items-center justify-center gap-4 mt-1 text-[10px]">
          <span className="text-white/40">
            <span className="text-[#e84393] font-bold">{stats.explored}</span>/20 explorés
          </span>
          {stats.total > 0 && (
            <span className="text-white/40">
              {stats.total} restaurants
            </span>
          )}
          {stats.opp > 0 && (
            <span className="text-[#e84393] flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> {stats.opp} opp.
            </span>
          )}
        </div>
      </div>

      {/* ═══ SVG Map ═══ */}
      <div className="flex-1 min-h-0 relative">
        <svg
          viewBox={PARIS_VIEWBOX}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: 'drop-shadow(0 0 40px rgba(232,67,147,0.05))' }}
        >
          {/* Background */}
          <rect x="0" y="0" width="600" height="500" fill="transparent" />

          {/* ── La Seine ── dark curve through Paris */}
          <path
            d={SEINE_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pointerEvents: 'none' }}
          />
          <path
            d={SEINE_PATH}
            fill="none"
            stroke="rgba(100,100,120,0.15)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pointerEvents: 'none' }}
          />

          {/* ── Arrondissement paths ── */}
          {PARIS_ARRONDISSEMENTS.map(arr => {
            const agg = arrondissementData.get(arr.number);
            const hasData = agg?.hasData ?? false;
            const isHovered = hoveredArr === arr.number;

            // Colors matching the reference image — dark fill, pink/rose borders
            const fillColor = hasData
              ? isHovered ? 'rgba(232,67,147,0.18)' : 'rgba(232,67,147,0.08)'
              : isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)';

            const strokeColor = hasData
              ? isHovered ? 'rgba(232,67,147,0.8)' : 'rgba(232,67,147,0.35)'
              : isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)';

            return (
              <g key={arr.number}>
                <path
                  d={arr.path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeLinejoin="round"
                  style={{
                    cursor: 'pointer',
                    transition: 'fill 0.25s ease, stroke 0.25s ease, stroke-width 0.15s ease',
                    willChange: 'opacity',
                    transform: 'translateZ(0)',
                  }}
                  onMouseMove={(e) => handleMouseMove(e, arr.number)}
                  onMouseLeave={() => setHoveredArr(null)}
                  onClick={() => onNavigateToCity(arr.cityName)}
                />

                {/* ── Pink dot marker ── */}
                <circle
                  cx={arr.labelX}
                  cy={arr.labelY}
                  r={isHovered ? 4 : 3}
                  fill={hasData ? '#e84393' : 'rgba(232,67,147,0.3)'}
                  stroke={hasData ? 'rgba(232,67,147,0.4)' : 'rgba(232,67,147,0.15)'}
                  strokeWidth="1.5"
                  style={{
                    pointerEvents: 'none',
                    transition: 'r 0.2s ease, fill 0.2s ease',
                    filter: hasData ? 'drop-shadow(0 0 3px rgba(232,67,147,0.5))' : 'none',
                  }}
                />
                {/* Pulse ring for explored arrondissements */}
                {hasData && (
                  <circle
                    cx={arr.labelX}
                    cy={arr.labelY}
                    r="6"
                    fill="none"
                    stroke="rgba(232,67,147,0.25)"
                    strokeWidth="1"
                    style={{
                      pointerEvents: 'none',
                      animation: 'arrPulse 3s ease-in-out infinite',
                    }}
                  />
                )}

                {/* ── Arrondissement number label ── */}
                <text
                  x={arr.labelX}
                  y={arr.labelY - 10}
                  textAnchor="middle"
                  dominantBaseline="auto"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="SF Pro Display, -apple-system, system-ui, sans-serif"
                  fill={
                    hasData
                      ? isHovered ? 'rgba(232,67,147,1)' : 'rgba(232,67,147,0.85)'
                      : isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)'
                  }
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    transition: 'fill 0.2s ease',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  {arr.shortName}
                </text>
              </g>
            );
          })}

          <style>{`
            @keyframes arrPulse {
              0%, 100% { opacity: 1; r: 6; }
              50% { opacity: 0.3; r: 8; }
            }
          `}</style>
        </svg>
      </div>

      {/* ═══ Tooltip ═══ */}
      {hoveredArr && hoveredData && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            background: 'rgba(8,8,16,0.95)',
            border: '1px solid rgba(232,67,147,0.25)',
            borderRadius: '12px',
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(232,67,147,0.08)',
            backdropFilter: 'blur(12px)',
            minWidth: '180px',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-white">{hoveredData.name}</span>
          </div>
          {hoveredData.hasData ? (
            <>
              <div className="flex gap-3 text-[10px]">
                <span className="text-white/50">{hoveredData.totalRestaurants} restaurant{hoveredData.totalRestaurants > 1 ? 's' : ''}</span>
                {hoveredData.totalOpportunities > 0 && (
                  <span className="text-[#e84393] flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> {hoveredData.totalOpportunities} opp.
                  </span>
                )}
              </div>
              {hoveredData.types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {hoveredData.types.slice(0, 4).map(t => (
                    <span key={t} className="px-1.5 py-0.5 text-[8px] text-white/40 rounded-md"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {getTypeEmoji(t)} {t}
                    </span>
                  ))}
                  {hoveredData.types.length > 4 && (
                    <span className="text-[8px] text-white/25">+{hoveredData.types.length - 4}</span>
                  )}
                </div>
              )}
              <div className="mt-1.5 text-[9px] text-[#e84393]/70 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Cliquer pour explorer
              </div>
            </>
          ) : (
            <p className="text-[10px] text-white/30 mt-0.5">Pas encore exploré</p>
          )}
        </div>
      )}

      {/* ═══ Legend ═══ */}
      <div className="flex items-center justify-center gap-5 text-[9px] text-white/35 mt-3">
        <span className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{
              background: '#e84393',
              boxShadow: '0 0 6px rgba(232,67,147,0.5)',
            }}
          />
          Exploré
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{
              background: 'rgba(232,67,147,0.2)',
              border: '1px solid rgba(232,67,147,0.15)',
            }}
          />
          Non exploré
        </span>
      </div>
    </div>
  );
}

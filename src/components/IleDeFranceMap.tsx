'use client';

import { useState, useRef, useCallback } from 'react';
import { X, TrendingUp, MapPin } from 'lucide-react';
import { IDF_DEPARTMENTS, DepartmentAggregate } from '@/lib/idf-departments';
import { getTypeEmoji } from '@/lib/utils';

interface IleDeFranceMapProps {
  departmentData: Map<string, DepartmentAggregate>;
  onNavigateToCity: (city: string) => void;
}

export default function IleDeFranceMap({ departmentData, onNavigateToCity }: IleDeFranceMapProps) {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getDeptFill = useCallback((code: string, isHovered: boolean): string => {
    const dept = departmentData.get(code);
    if (!dept?.hasData) {
      return isHovered ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)';
    }
    // Intensity based on opportunity count
    const intensity = Math.min(dept.totalOpportunities / 10, 1);
    const baseAlpha = 0.2 + intensity * 0.2;
    const hoverAlpha = baseAlpha + 0.2;
    return isHovered
      ? `rgba(248,113,113,${hoverAlpha.toFixed(2)})`
      : `rgba(248,113,113,${baseAlpha.toFixed(2)})`;
  }, [departmentData]);

  const getDeptStroke = useCallback((code: string, isHovered: boolean): string => {
    const dept = departmentData.get(code);
    if (!dept?.hasData) return isHovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)';
    return isHovered ? 'rgba(248,113,113,0.8)' : 'rgba(248,113,113,0.35)';
  }, [departmentData]);

  const handleMouseMove = useCallback((e: React.MouseEvent, code: string) => {
    setHoveredDept(code);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + 14;
      const y = e.clientY - rect.top - 10;
      // Prevent tooltip overflow
      const maxX = rect.width - 270;
      const maxY = rect.height - 140;
      setTooltipPos({
        x: x > maxX ? x - 280 : x,
        y: y > maxY ? y - 120 : y < 0 ? 10 : y,
      });
    }
  }, []);

  const handleDeptClick = useCallback((code: string) => {
    const dept = departmentData.get(code);
    if (!dept?.hasData) return;

    if (dept.cities.length === 1) {
      onNavigateToCity(dept.cities[0].city);
    } else {
      setSelectedDept(prev => prev === code ? null : code);
    }
  }, [departmentData, onNavigateToCity]);

  const hoveredData = hoveredDept ? departmentData.get(hoveredDept) : null;
  const selectedData = selectedDept ? departmentData.get(selectedDept) : null;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* SVG Map — full width, no max height restriction */}
      <svg
        viewBox="0 0 520 460"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background grid dots for visual depth */}
        <defs>
          <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="rgba(255,255,255,0.04)" />
          </pattern>
        </defs>
        <rect width="520" height="460" fill="url(#mapGrid)" />

        {/* Department paths — render outer first, inner last for z-order */}
        {IDF_DEPARTMENTS.map(dept => {
          const isHovered = hoveredDept === dept.code;
          const isSelected = selectedDept === dept.code;
          const agg = departmentData.get(dept.code);

          return (
            <g key={dept.code}>
              <path
                d={dept.path}
                fill={getDeptFill(dept.code, isHovered || isSelected)}
                stroke={getDeptStroke(dept.code, isHovered || isSelected)}
                strokeWidth={isHovered || isSelected ? 2 : 1}
                strokeLinejoin="round"
                className="dept-path"
                style={{
                  cursor: agg?.hasData ? 'pointer' : 'default',
                  transition: 'fill 0.3s ease, stroke 0.3s ease, filter 0.3s ease, stroke-width 0.2s ease',
                  filter: (isHovered || isSelected) && agg?.hasData
                    ? 'drop-shadow(0 0 12px rgba(248,113,113,0.5))'
                    : 'none',
                }}
                onMouseMove={(e) => handleMouseMove(e, dept.code)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={() => handleDeptClick(dept.code)}
              />
              {/* Department code label */}
              <text
                x={dept.labelX}
                y={dept.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={dept.code === '77' || dept.code === '78' || dept.code === '95' ? '12' : '10'}
                fontWeight="700"
                fontFamily="SF Pro Display, -apple-system, system-ui, sans-serif"
                fill={
                  agg?.hasData
                    ? isHovered || isSelected
                      ? 'rgba(248,113,113,1)'
                      : 'rgba(248,113,113,0.85)'
                    : isHovered
                      ? 'rgba(255,255,255,0.45)'
                      : 'rgba(255,255,255,0.2)'
                }
                style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.3s ease' }}
              >
                {dept.code}
              </text>
              {/* Department name under the code */}
              <text
                x={dept.labelX}
                y={dept.labelY + 13}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="6.5"
                fontWeight="500"
                fontFamily="SF Pro Display, -apple-system, system-ui, sans-serif"
                fill={agg?.hasData ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}
                style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.3s ease' }}
              >
                {dept.shortName}
              </text>
              {/* Data indicator dot */}
              {agg?.hasData && (
                <circle
                  cx={dept.labelX + 18}
                  cy={dept.labelY - 8}
                  r="4"
                  fill="rgba(248,113,113,0.6)"
                  stroke="rgba(248,113,113,0.3)"
                  strokeWidth="2"
                  style={{ pointerEvents: 'none' }}
                >
                  <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredDept && hoveredData && !selectedDept && (
        <div
          className="map-tooltip"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-bold text-text">{hoveredData.name}</span>
            <span className="text-[10px] font-mono text-text-dim">{hoveredData.code}</span>
          </div>
          {hoveredData.hasData ? (
            <>
              <div className="flex gap-3 text-[11px]">
                <span className="text-text-muted">{hoveredData.totalRestaurants} restaurant{hoveredData.totalRestaurants > 1 ? 's' : ''}</span>
                {hoveredData.totalOpportunities > 0 && (
                  <span className="text-red flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> {hoveredData.totalOpportunities} opp.
                  </span>
                )}
              </div>
              <div className="mt-1 text-[10px] text-text-dim">
                {hoveredData.cities.length} ville{hoveredData.cities.length > 1 ? 's' : ''} : {hoveredData.cities.map(c => c.city).join(', ')}
              </div>
              {hoveredData.types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {hoveredData.types.slice(0, 4).map(t => (
                    <span key={t} className="glass-pill px-1.5 py-0.5 text-[9px] text-text-muted">
                      {getTypeEmoji(t)} {t}
                    </span>
                  ))}
                  {hoveredData.types.length > 4 && (
                    <span className="text-[9px] text-text-dim">+{hoveredData.types.length - 4}</span>
                  )}
                </div>
              )}
              <div className="mt-1.5 text-[10px] text-blue">
                {hoveredData.cities.length === 1 ? 'Cliquer pour voir les détails →' : 'Cliquer pour choisir une ville →'}
              </div>
            </>
          ) : (
            <p className="text-[11px] text-text-dim mt-0.5">Aucune donnée de scraping</p>
          )}
        </div>
      )}

      {/* Multi-city sidebar panel */}
      {selectedDept && selectedData && selectedData.cities.length > 1 && (
        <div
          className="absolute top-0 right-0 w-64 h-full map-city-panel"
          style={{
            background: 'rgba(12,12,20,0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
          }}
        >
          <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-text-dim uppercase tracking-wider">Département {selectedData.code}</p>
                <p className="text-[14px] font-bold text-text">{selectedData.name}</p>
              </div>
              <button
                onClick={() => setSelectedDept(null)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4 text-text-dim" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-3 text-[11px]">
              <span className="text-text-muted">{selectedData.totalRestaurants} restaurants</span>
              {selectedData.totalOpportunities > 0 && (
                <span className="text-red flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {selectedData.totalOpportunities}
                </span>
              )}
            </div>

            {/* City list */}
            <div className="space-y-2 flex-1">
              {selectedData.cities.map(city => (
                <button
                  key={city.city}
                  className="w-full text-left p-3 rounded-xl transition-all hover:bg-white/[0.06]"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => onNavigateToCity(city.city)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-text flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-red" /> {city.city}
                    </span>
                    {city.opportunityCount > 0 && (
                      <span className="text-[10px] font-bold text-red">{city.opportunityCount} opp.</span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-dim mt-0.5 ml-[18px]">
                    {city.totalRestaurants} restaurants &middot; {city.types.slice(0, 3).join(', ')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { X, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import { IDF_DEPARTMENTS, DepartmentAggregate } from '@/lib/idf-departments';
import { ArrondissementAggregate } from '@/lib/paris-arrondissements';
import ParisArrondissementsMap from './ParisArrondissementsMap';
import { getTypeEmoji } from '@/lib/utils';

interface IleDeFranceMapProps {
  departmentData: Map<string, DepartmentAggregate>;
  onNavigateToCity: (city: string) => void;
  arrondissementData?: Map<number, ArrondissementAggregate>;
}

// Parse SVG path to get bounding box
function getPathBBox(path: string): { cx: number; cy: number; x: number; y: number; w: number; h: number } {
  const nums = path.match(/[\d.]+/g)?.map(Number) ?? [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < nums.length; i += 2) {
    const x = nums[i], y = nums[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Smooth easing function (ease-out cubic)
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const DEFAULT_VB = { x: 0, y: 0, w: 520, h: 460 };
const ZOOM_DURATION = 500; // ms

interface ViewBox { x: number; y: number; w: number; h: number }

export default function IleDeFranceMap({ departmentData, onNavigateToCity, arrondissementData }: IleDeFranceMapProps) {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  // Animated viewBox
  const [viewBox, setViewBox] = useState<ViewBox>(DEFAULT_VB);
  const animRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animate viewBox from current to target
  const animateViewBox = useCallback((from: ViewBox, to: ViewBox, onDone?: () => void) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / ZOOM_DURATION, 1);
      const t = easeOutCubic(progress);

      setViewBox({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        w: from.w + (to.w - from.w) * t,
        h: from.h + (to.h - from.h) * t,
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
        onDone?.();
      }
    };

    animRef.current = requestAnimationFrame(tick);
  }, []);

  // Pre-compute department styles
  const deptStyles = useMemo(() => {
    const styles = new Map<string, { fill: string; fillHover: string; stroke: string; strokeHover: string; hasData: boolean }>();
    for (const dept of IDF_DEPARTMENTS) {
      const agg = departmentData.get(dept.code);
      const hasData = agg?.hasData ?? false;
      const isParis = dept.code === '75' && !!arrondissementData;

      if (isParis && !hasData) {
        // Paris always shows as interactive (blue accent) even without data
        styles.set(dept.code, {
          fill: 'rgba(94,158,255,0.08)',
          fillHover: 'rgba(94,158,255,0.18)',
          stroke: 'rgba(94,158,255,0.25)',
          strokeHover: 'rgba(94,158,255,0.6)',
          hasData: false,
        });
      } else if (!hasData) {
        styles.set(dept.code, {
          fill: 'rgba(255,255,255,0.04)',
          fillHover: 'rgba(255,255,255,0.10)',
          stroke: 'rgba(255,255,255,0.08)',
          strokeHover: 'rgba(255,255,255,0.18)',
          hasData: false,
        });
      } else {
        const intensity = Math.min((agg?.totalOpportunities ?? 0) / 10, 1);
        const baseAlpha = 0.2 + intensity * 0.2;
        const hoverAlpha = baseAlpha + 0.2;
        styles.set(dept.code, {
          fill: `rgba(248,113,113,${baseAlpha.toFixed(2)})`,
          fillHover: `rgba(248,113,113,${hoverAlpha.toFixed(2)})`,
          stroke: 'rgba(248,113,113,0.35)',
          strokeHover: 'rgba(248,113,113,0.8)',
          hasData: true,
        });
      }
    }
    return styles;
  }, [departmentData, arrondissementData]);

  // Pre-compute bounding boxes
  const deptBBoxes = useMemo(() => {
    const boxes = new Map<string, ReturnType<typeof getPathBBox>>();
    for (const dept of IDF_DEPARTMENTS) {
      boxes.set(dept.code, getPathBBox(dept.path));
    }
    return boxes;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent, code: string) => {
    if (isZoomed) return;
    setHoveredDept(code);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + 14;
      const y = e.clientY - rect.top - 10;
      const maxX = rect.width - 270;
      const maxY = rect.height - 140;
      setTooltipPos({
        x: x > maxX ? x - 280 : x,
        y: y > maxY ? y - 120 : y < 0 ? 10 : y,
      });
    }
  }, [isZoomed]);

  const zoomToDept = useCallback((code: string) => {
    const bbox = deptBBoxes.get(code);
    if (!bbox) return;

    const padding = 60;
    const x = bbox.x - padding;
    const y = bbox.y - padding;
    const w = bbox.w + padding * 2;
    const h = bbox.h + padding * 2;

    // Keep aspect ratio
    const targetRatio = 520 / 460;
    let finalW = w, finalH = h, finalX = x, finalY = y;
    if (w / h > targetRatio) {
      finalH = w / targetRatio;
      finalY = y - (finalH - h) / 2;
    } else {
      finalW = h * targetRatio;
      finalX = x - (finalW - w) / 2;
    }

    const target = { x: finalX, y: finalY, w: finalW, h: finalH };

    setIsZoomed(true);
    setSelectedDept(code);
    setHoveredDept(null);
    setShowPanel(false);

    // Animate zoom
    animateViewBox(viewBox, target, () => {
      // Show panel after zoom finishes
      if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
      panelTimeoutRef.current = setTimeout(() => setShowPanel(true), 50);
    });
  }, [deptBBoxes, viewBox, animateViewBox]);

  const zoomOut = useCallback(() => {
    setShowPanel(false);

    // Small delay for panel to fade, then animate zoom out
    setTimeout(() => {
      animateViewBox(viewBox, DEFAULT_VB, () => {
        setIsZoomed(false);
        setSelectedDept(null);
      });
    }, 120);
  }, [viewBox, animateViewBox]);

  const handleDeptClick = useCallback((code: string) => {
    const dept = departmentData.get(code);
    // Allow Paris (75) to always be clickable for arrondissement view
    const isParis = code === '75' && !!arrondissementData;
    if (!dept?.hasData && !isParis) return;

    if (isZoomed && selectedDept === code) {
      zoomOut();
    } else {
      zoomToDept(code);
    }
  }, [departmentData, arrondissementData, isZoomed, selectedDept, zoomToDept, zoomOut]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const hoveredData = hoveredDept ? departmentData.get(hoveredDept) : null;
  const selectedData = selectedDept ? departmentData.get(selectedDept) : null;

  const vbStr = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* SVG Map */}
      <svg
        viewBox={vbStr}
        className="w-full h-auto map-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="rgba(255,255,255,0.04)" />
          </pattern>
        </defs>
        <rect x="-100" y="-100" width="720" height="660" fill="url(#mapGrid)" />

        {IDF_DEPARTMENTS.map(dept => {
          const isHovered = hoveredDept === dept.code;
          const isSelected = selectedDept === dept.code;
          const active = isHovered || isSelected;
          const s = deptStyles.get(dept.code)!;
          const dimmed = isZoomed && !isSelected;

          return (
            <g
              key={dept.code}
              style={{
                opacity: dimmed ? 0.15 : 1,
                transition: 'opacity 0.4s ease',
              }}
            >
              <path
                d={dept.path}
                fill={active ? s.fillHover : s.fill}
                stroke={active ? s.strokeHover : s.stroke}
                strokeWidth={active ? 2 : 1}
                strokeLinejoin="round"
                className="dept-path"
                style={{
                  cursor: (s.hasData || (dept.code === '75' && !!arrondissementData)) ? 'pointer' : 'default',
                  transition: 'fill 0.25s ease, stroke 0.25s ease, stroke-width 0.15s ease',
                }}
                onMouseMove={(e) => handleMouseMove(e, dept.code)}
                onMouseLeave={() => !isZoomed && setHoveredDept(null)}
                onClick={() => handleDeptClick(dept.code)}
              />
              <text
                x={dept.labelX}
                y={dept.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={dept.code === '77' || dept.code === '78' || dept.code === '95' ? '12' : '10'}
                fontWeight="700"
                fontFamily="SF Pro Display, -apple-system, system-ui, sans-serif"
                fill={
                  s.hasData
                    ? active ? 'rgba(248,113,113,1)' : 'rgba(248,113,113,0.85)'
                    : (dept.code === '75' && !!arrondissementData)
                      ? active ? 'rgba(94,158,255,1)' : 'rgba(94,158,255,0.7)'
                      : isHovered ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)'
                }
                style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.25s ease' }}
              >
                {dept.code}
              </text>
              <text
                x={dept.labelX}
                y={dept.labelY + 13}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="6.5"
                fontWeight="500"
                fontFamily="SF Pro Display, -apple-system, system-ui, sans-serif"
                fill={
                  s.hasData ? 'rgba(248,113,113,0.6)'
                    : (dept.code === '75' && !!arrondissementData) ? 'rgba(94,158,255,0.45)'
                    : 'rgba(255,255,255,0.12)'
                }
                style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.25s ease' }}
              >
                {dept.shortName}
              </text>
              {s.hasData && !dimmed && (
                <circle
                  cx={dept.labelX + 18}
                  cy={dept.labelY - 8}
                  r="4"
                  fill="rgba(248,113,113,0.6)"
                  stroke="rgba(248,113,113,0.3)"
                  strokeWidth="2"
                  style={{ pointerEvents: 'none', animation: 'dotPulse 2.5s ease-in-out infinite' }}
                />
              )}
            </g>
          );
        })}

        <style>{`
          @keyframes dotPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </svg>

      {/* Tooltip — only when NOT zoomed */}
      {!isZoomed && hoveredDept && hoveredData && (
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
                Cliquer pour zoomer →
              </div>
            </>
          ) : hoveredDept === '75' && arrondissementData ? (
            <>
              <p className="text-[11px] text-text-muted mt-0.5">20 arrondissements à explorer</p>
              <div className="mt-1 text-[10px] text-blue">
                Cliquer pour voir les arrondissements →
              </div>
            </>
          ) : (
            <p className="text-[11px] text-text-dim mt-0.5">Aucune donnée de scraping</p>
          )}
        </div>
      )}

      {/* Back button */}
      {isZoomed && (
        <button
          onClick={zoomOut}
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-text-muted hover:text-text map-back-btn transition-colors"
          style={{
            background: 'rgba(12,12,20,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          ← Retour
        </button>
      )}

      {/* Paris arrondissements panel — special case for dept 75 */}
      {isZoomed && showPanel && selectedDept === '75' && arrondissementData && (
        <div
          className="absolute top-0 right-0 h-full map-city-panel"
          style={{
            width: '460px',
            background: 'rgba(6,6,14,0.98)',
            border: '1px solid rgba(232,67,147,0.12)',
            borderRadius: '16px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 60px rgba(232,67,147,0.04)',
          }}
        >
          <div className="p-5 flex flex-col h-full">
            {/* Close button */}
            <div className="flex justify-end mb-1">
              <button
                onClick={zoomOut}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4 text-white/30 hover:text-white/60" />
              </button>
            </div>
            {/* Arrondissement map fills the rest */}
            <div className="flex-1 min-h-0">
              <ParisArrondissementsMap
                arrondissementData={arrondissementData}
                onNavigateToCity={onNavigateToCity}
              />
            </div>
          </div>
        </div>
      )}

      {/* Standard city panel — for all other departments (NEVER for Paris 75) */}
      {isZoomed && showPanel && selectedData && selectedDept !== '75' && (
        <div
          className="absolute top-0 right-0 w-72 h-full map-city-panel"
          style={{
            background: 'rgba(12,12,20,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}
        >
          <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-text-dim uppercase tracking-wider">Département {selectedData.code}</p>
                <p className="text-[15px] font-bold text-text">{selectedData.name}</p>
              </div>
              <button
                onClick={zoomOut}
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
                  <TrendingUp className="w-3 h-3" /> {selectedData.totalOpportunities} opp.
                </span>
              )}
            </div>

            <div className="h-px bg-white/[0.06]" />

            <p className="text-[10px] text-text-dim uppercase tracking-wider">
              {selectedData.cities.length} ville{selectedData.cities.length > 1 ? 's' : ''}
            </p>

            {/* City list */}
            <div className="space-y-2 flex-1">
              {selectedData.cities.map(city => (
                <button
                  key={city.city}
                  className="city-btn w-full text-left p-3 rounded-xl transition-colors hover:bg-white/[0.06] group"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => onNavigateToCity(city.city)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-text flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-red" /> {city.city}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {city.opportunityCount > 0 && (
                        <span className="text-[10px] font-bold text-red">{city.opportunityCount} opp.</span>
                      )}
                      <ArrowRight className="w-3 h-3 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <p className="text-[10px] text-text-dim mt-0.5 ml-[18px]">
                    {city.totalRestaurants} restaurants · {city.types.slice(0, 3).join(', ')}
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

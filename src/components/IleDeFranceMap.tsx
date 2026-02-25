'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import { IDF_DEPARTMENTS, DepartmentAggregate } from '@/lib/idf-departments';
import { ArrondissementAggregate } from '@/lib/paris-arrondissements';
import {
  PARIS_ARRONDISSEMENTS,
  SEINE_PATH,
} from '@/lib/paris-arrondissements';
import {
  VAL_DE_MARNE_COMMUNES,
  MARNE_PATH,
  CommuneAggregate,
  VDM_VIEWBOX,
} from '@/lib/val-de-marne-communes';
import {
  SEINE_SAINT_DENIS_COMMUNES,
  CANAL_SSD_PATH,
  SSD_VIEWBOX,
} from '@/lib/seine-saint-denis-communes';
import {
  HAUTS_DE_SEINE_COMMUNES,
  SEINE_HDS_PATH,
  HDS_VIEWBOX,
} from '@/lib/hauts-de-seine-communes';
import {
  ESSONNE_COMMUNES,
  ESSONNE_RIVER_PATH,
  ESS_VIEWBOX,
} from '@/lib/essonne-communes';
import {
  SEINE_ET_MARNE_COMMUNES,
  SEINE_SEM_PATH,
  SEM_VIEWBOX,
} from '@/lib/seine-et-marne-communes';
import {
  YVELINES_COMMUNES,
  SEINE_YVL_PATH,
  YVL_VIEWBOX,
} from '@/lib/yvelines-communes';
import {
  VAL_D_OISE_COMMUNES,
  OISE_PATH,
  VDO_VIEWBOX,
} from '@/lib/val-d-oise-communes';
import { getTypeEmoji } from '@/lib/utils';

// ══════════════════════════════════════════
// Commune overlay configuration per department
// ══════════════════════════════════════════

interface CommuneItem {
  name: string;
  shortName: string;
  cityName: string;
  labelX: number;
  labelY: number;
  path: string;
}

interface DeptOverlayConfig {
  communes: CommuneItem[];
  viewBox: { x: number; y: number; w: number; h: number };
  riverPath: string;
}

function parseViewBox(vb: string): { x: number; y: number; w: number; h: number } {
  const [x, y, w, h] = vb.split(/\s+/).map(Number);
  return { x, y, w, h };
}

const DEPT_OVERLAY_CONFIGS: Record<string, DeptOverlayConfig> = {
  '94': { communes: VAL_DE_MARNE_COMMUNES, viewBox: parseViewBox(VDM_VIEWBOX), riverPath: MARNE_PATH },
  '93': { communes: SEINE_SAINT_DENIS_COMMUNES, viewBox: parseViewBox(SSD_VIEWBOX), riverPath: CANAL_SSD_PATH },
  '92': { communes: HAUTS_DE_SEINE_COMMUNES, viewBox: parseViewBox(HDS_VIEWBOX), riverPath: SEINE_HDS_PATH },
  '91': { communes: ESSONNE_COMMUNES, viewBox: parseViewBox(ESS_VIEWBOX), riverPath: ESSONNE_RIVER_PATH },
  '77': { communes: SEINE_ET_MARNE_COMMUNES, viewBox: parseViewBox(SEM_VIEWBOX), riverPath: SEINE_SEM_PATH },
  '78': { communes: YVELINES_COMMUNES, viewBox: parseViewBox(YVL_VIEWBOX), riverPath: SEINE_YVL_PATH },
  '95': { communes: VAL_D_OISE_COMMUNES, viewBox: parseViewBox(VDO_VIEWBOX), riverPath: OISE_PATH },
};

// Departments that have commune overlays
const COMMUNE_DEPT_CODES = new Set(Object.keys(DEPT_OVERLAY_CONFIGS));

interface IleDeFranceMapProps {
  departmentData: Map<string, DepartmentAggregate>;
  onNavigateToCity: (city: string) => void;
  arrondissementData?: Map<number, ArrondissementAggregate>;
  communeData?: Map<string, Map<string, CommuneAggregate>>;  // deptCode → cityName → CommuneAggregate
  onZoomChange?: (zoomed: boolean) => void;
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

const BASE_VB = { x: 30, y: 20, w: 460, h: 400 }; // tighter IDF bounding box — less padding

interface ViewBox { x: number; y: number; w: number; h: number }

export default function IleDeFranceMap({ departmentData, onNavigateToCity, arrondissementData, communeData, onZoomChange }: IleDeFranceMapProps) {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  // Paris arrondissement state
  const [showArrondissements, setShowArrondissements] = useState(false);
  const [hoveredArr, setHoveredArr] = useState<number | null>(null);
  const [arrTooltipPos, setArrTooltipPos] = useState({ x: 0, y: 0 });
  // Generic commune overlay state (works for any department with commune data)
  const [overlayDeptCode, setOverlayDeptCode] = useState<string | null>(null);
  const [hoveredCommune, setHoveredCommune] = useState<string | null>(null);
  const [communeTooltipPos, setCommuneTooltipPos] = useState({ x: 0, y: 0 });

  const [viewBox, setViewBox] = useState<ViewBox>(BASE_VB);
  const [containerRatio, setContainerRatio] = useState(520 / 460);
  const [fading, setFading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure container to match viewBox ratio for maximum fill
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerRatio(rect.width / rect.height);
        }
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Dynamic default viewBox that matches the container aspect ratio
  const defaultVB = useMemo<ViewBox>(() => {
    const base = BASE_VB;
    const baseRatio = base.w / base.h;
    if (containerRatio > baseRatio) {
      const newW = base.h * containerRatio;
      return { x: base.x - (newW - base.w) / 2, y: base.y, w: newW, h: base.h };
    } else {
      const newH = base.w / containerRatio;
      return { x: base.x, y: base.y - (newH - base.h) / 2, w: base.w, h: newH };
    }
  }, [containerRatio]);

  useEffect(() => {
    if (!isZoomed) {
      setViewBox(defaultVB);
    }
  }, [defaultVB, isZoomed]);

  // Check which departments have commune overlay data available
  const deptHasOverlay = useCallback((code: string): boolean => {
    if (code === '75') return !!arrondissementData;
    return COMMUNE_DEPT_CODES.has(code) && !!communeData?.has(code);
  }, [arrondissementData, communeData]);

  // Pre-compute department styles
  const deptStyles = useMemo(() => {
    const styles = new Map<string, { fill: string; fillHover: string; stroke: string; strokeHover: string; hasData: boolean }>();
    for (const dept of IDF_DEPARTMENTS) {
      const agg = departmentData.get(dept.code);
      const hasData = agg?.hasData ?? false;
      const hasOverlay = deptHasOverlay(dept.code);

      if (hasOverlay && !hasData) {
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
  }, [departmentData, deptHasOverlay]);

  // Pre-compute bounding boxes
  const deptBBoxes = useMemo(() => {
    const boxes = new Map<string, ReturnType<typeof getPathBBox>>();
    for (const dept of IDF_DEPARTMENTS) {
      boxes.set(dept.code, getPathBBox(dept.path));
    }
    return boxes;
  }, []);

  // ── Generic commune overlay transform computation ──
  // Computes the SVG transform to map commune paths into the zoomed department viewBox
  const computeOverlayTransform = useCallback((deptCode: string, zoomTarget: ViewBox) => {
    const config = DEPT_OVERLAY_CONFIGS[deptCode];
    if (!config) return { translateX: 0, translateY: 0, scale: 1 };

    const { viewBox: sourceVB } = config;
    const pad = zoomTarget.w * 0.03;
    const availW = zoomTarget.w - pad * 2;
    const availH = zoomTarget.h - pad * 2;
    const scaleX = availW / sourceVB.w;
    const scaleY = availH / sourceVB.h;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = zoomTarget.x + pad + (availW - sourceVB.w * scale) / 2 - sourceVB.x * scale;
    const offsetY = zoomTarget.y + pad + (availH - sourceVB.h * scale) / 2 - sourceVB.y * scale;
    return { translateX: offsetX, translateY: offsetY, scale };
  }, []);

  // ── Paris arrondissement overlay computation ──
  const arrBBox = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const arr of PARIS_ARRONDISSEMENTS) {
      const nums = arr.path.match(/[\d.]+/g)?.map(Number) ?? [];
      for (let i = 0; i < nums.length; i += 2) {
        if (nums[i] < minX) minX = nums[i];
        if (nums[i] > maxX) maxX = nums[i];
        if (nums[i + 1] < minY) minY = nums[i + 1];
        if (nums[i + 1] > maxY) maxY = nums[i + 1];
      }
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, []);

  const parisZoomTarget = useMemo(() => {
    const bbox = deptBBoxes.get('75');
    if (!bbox) return null;
    const padding = 2;
    const x = bbox.x - padding;
    const y = bbox.y - padding;
    const w = bbox.w + padding * 2;
    const h = bbox.h + padding * 2;
    const targetRatio = containerRatio;
    let finalW = w, finalH = h, finalX = x, finalY = y;
    if (w / h > targetRatio) {
      finalH = w / targetRatio;
      finalY = y - (finalH - h) / 2;
    } else {
      finalW = h * targetRatio;
      finalX = x - (finalW - w) / 2;
    }
    return { x: finalX, y: finalY, w: finalW, h: finalH };
  }, [deptBBoxes, containerRatio]);

  const parisTransform = useMemo(() => {
    if (!parisZoomTarget) return { translateX: 0, translateY: 0, scale: 1 };
    const target = parisZoomTarget;
    const pad = target.w * 0.03;
    const availW = target.w - pad * 2;
    const availH = target.h - pad * 2;
    const scaleX = availW / arrBBox.w;
    const scaleY = availH / arrBBox.h;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = target.x + pad + (availW - arrBBox.w * scale) / 2 - arrBBox.x * scale;
    const offsetY = target.y + pad + (availH - arrBBox.h * scale) / 2 - arrBBox.y * scale;
    return { translateX: offsetX, translateY: offsetY, scale };
  }, [parisZoomTarget, arrBBox]);

  // ── Commune department zoom targets + transforms (memoized per dept) ──
  const communeZoomTargets = useMemo(() => {
    const targets = new Map<string, ViewBox>();
    for (const code of COMMUNE_DEPT_CODES) {
      const bbox = deptBBoxes.get(code);
      if (!bbox) continue;
      const padding = 2;
      const x = bbox.x - padding;
      const y = bbox.y - padding;
      const w = bbox.w + padding * 2;
      const h = bbox.h + padding * 2;
      const targetRatio = containerRatio;
      let finalW = w, finalH = h, finalX = x, finalY = y;
      if (w / h > targetRatio) {
        finalH = w / targetRatio;
        finalY = y - (finalH - h) / 2;
      } else {
        finalW = h * targetRatio;
        finalX = x - (finalW - w) / 2;
      }
      targets.set(code, { x: finalX, y: finalY, w: finalW, h: finalH });
    }
    return targets;
  }, [deptBBoxes, containerRatio]);

  const communeTransforms = useMemo(() => {
    const transforms = new Map<string, { translateX: number; translateY: number; scale: number }>();
    for (const code of COMMUNE_DEPT_CODES) {
      const target = communeZoomTargets.get(code);
      if (!target) continue;
      transforms.set(code, computeOverlayTransform(code, target));
    }
    return transforms;
  }, [communeZoomTargets, computeOverlayTransform]);

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

  const handleArrMouseMove = useCallback((e: React.MouseEvent, num: number) => {
    setHoveredArr(num);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + 14;
      const y = e.clientY - rect.top - 10;
      const maxX = rect.width - 240;
      const maxY = rect.height - 120;
      setArrTooltipPos({
        x: x > maxX ? x - 250 : x,
        y: y > maxY ? y - 100 : y < 0 ? 10 : y,
      });
    }
  }, []);

  const handleCommuneMouseMove = useCallback((e: React.MouseEvent, cityName: string) => {
    setHoveredCommune(cityName);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + 14;
      const y = e.clientY - rect.top - 10;
      const maxX = rect.width - 240;
      const maxY = rect.height - 120;
      setCommuneTooltipPos({
        x: x > maxX ? x - 250 : x,
        y: y > maxY ? y - 100 : y < 0 ? 10 : y,
      });
    }
  }, []);

  const zoomToDept = useCallback((code: string) => {
    const bbox = deptBBoxes.get(code);
    if (!bbox || fading) return;

    const isParis = code === '75';
    const hasCommuneOverlay = COMMUNE_DEPT_CODES.has(code) && !!communeData?.has(code);
    const padding = (isParis || hasCommuneOverlay) ? 2 : 60;
    const x = bbox.x - padding;
    const y = bbox.y - padding;
    const w = bbox.w + padding * 2;
    const h = bbox.h + padding * 2;

    const targetRatio = containerRatio;
    let finalW = w, finalH = h, finalX = x, finalY = y;
    if (w / h > targetRatio) {
      finalH = w / targetRatio;
      finalY = y - (finalH - h) / 2;
    } else {
      finalW = h * targetRatio;
      finalX = x - (finalW - w) / 2;
    }

    const target = { x: finalX, y: finalY, w: finalW, h: finalH };

    // Phase 1: Fade out
    setFading(true);
    setHoveredDept(null);

    let done = false;
    const doSwitch = () => {
      if (done) return;
      done = true;
      if (fallbackRef.current) { clearTimeout(fallbackRef.current); fallbackRef.current = null; }
      svgRef.current?.removeEventListener('transitionend', onEnd);

      // Phase 2: Instant switch while fully invisible
      setViewBox(target);
      setIsZoomed(true);
      setSelectedDept(code);
      setShowPanel(isParis || hasCommuneOverlay ? false : true);
      setShowArrondissements(isParis && !!arrondissementData);
      setOverlayDeptCode(hasCommuneOverlay ? code : null);
      onZoomChange?.(true);

      // Phase 3: Fade in after browser paints the new content
      requestAnimationFrame(() => requestAnimationFrame(() => setFading(false)));
    };

    const onEnd = (e: Event) => {
      if ((e as TransitionEvent).propertyName === 'opacity') doSwitch();
    };

    svgRef.current?.addEventListener('transitionend', onEnd);
    fallbackRef.current = setTimeout(doSwitch, 300);
  }, [deptBBoxes, fading, arrondissementData, communeData, containerRatio, onZoomChange]);

  const zoomOut = useCallback(() => {
    if (fading) return;

    // Phase 1: Fade out
    setFading(true);
    setHoveredArr(null);
    setHoveredCommune(null);

    let done = false;
    const doSwitch = () => {
      if (done) return;
      done = true;
      if (fallbackRef.current) { clearTimeout(fallbackRef.current); fallbackRef.current = null; }
      svgRef.current?.removeEventListener('transitionend', onEnd);

      // Phase 2: Instant switch while fully invisible
      setShowPanel(false);
      setShowArrondissements(false);
      setOverlayDeptCode(null);
      setViewBox(defaultVB);
      setIsZoomed(false);
      setSelectedDept(null);
      onZoomChange?.(false);

      // Phase 3: Fade in after browser paints
      requestAnimationFrame(() => requestAnimationFrame(() => setFading(false)));
    };

    const onEnd = (e: Event) => {
      if ((e as TransitionEvent).propertyName === 'opacity') doSwitch();
    };

    svgRef.current?.addEventListener('transitionend', onEnd);
    fallbackRef.current = setTimeout(doSwitch, 300);
  }, [fading, onZoomChange, defaultVB]);

  const handleDeptClick = useCallback((code: string) => {
    const dept = departmentData.get(code);
    const hasOverlay = deptHasOverlay(code);
    if (!dept?.hasData && !hasOverlay) return;

    if (isZoomed && selectedDept === code) {
      zoomOut();
    } else {
      zoomToDept(code);
    }
  }, [departmentData, deptHasOverlay, isZoomed, selectedDept, zoomToDept, zoomOut]);

  useEffect(() => {
    return () => {
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    };
  }, []);

  const hoveredData = hoveredDept ? departmentData.get(hoveredDept) : null;
  const selectedData = selectedDept ? departmentData.get(selectedDept) : null;
  const hoveredArrData = hoveredArr ? arrondissementData?.get(hoveredArr) : null;
  const activeOverlayData = overlayDeptCode ? communeData?.get(overlayDeptCode) : null;
  const hoveredCommuneData = hoveredCommune && activeOverlayData ? activeOverlayData.get(hoveredCommune) : null;
  const showOverlay = showArrondissements || !!overlayDeptCode;

  // Get the active overlay config
  const activeOverlayConfig = overlayDeptCode ? DEPT_OVERLAY_CONFIGS[overlayDeptCode] : null;
  const activeTransform = overlayDeptCode ? communeTransforms.get(overlayDeptCode) : null;

  const vbStr = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;
  const aspectRatio = 'xMidYMid meet';

  // Determine label font size based on number of communes
  const communeLabelSize = activeOverlayConfig
    ? activeOverlayConfig.communes.length > 100 ? '6' : activeOverlayConfig.communes.length > 50 ? '9' : '12'
    : '12';
  const communeDotSize = activeOverlayConfig
    ? activeOverlayConfig.communes.length > 100 ? { normal: 2, hovered: 3 } : activeOverlayConfig.communes.length > 50 ? { normal: 3, hovered: 4.5 } : { normal: 3.5, hovered: 5 }
    : { normal: 3.5, hovered: 5 };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* SVG Map */}
      <svg
        ref={svgRef}
        viewBox={vbStr}
        className="w-full h-full map-svg"
        preserveAspectRatio={aspectRatio}
        style={{
          transition: 'opacity 250ms ease',
          opacity: fading ? 0 : 1,
          cursor: isZoomed ? 'pointer' : 'default',
        }}
        onClick={(e) => {
          if (isZoomed && e.target === e.currentTarget) zoomOut();
        }}
      >
        <rect
          x="-500" y="-500" width="1500" height="1500"
          fill="transparent"
          onClick={() => isZoomed && zoomOut()}
        />

        {/* ── Departments ── */}
        {!showOverlay && IDF_DEPARTMENTS.map(dept => {
          const isHovered = hoveredDept === dept.code;
          const isSelected = selectedDept === dept.code;
          const active = isHovered || isSelected;
          const s = deptStyles.get(dept.code)!;
          const hidden = isZoomed && !isSelected;

          if (hidden) return null;

          return (
            <g key={dept.code}>
              <path
                d={dept.path}
                fill={active ? s.fillHover : s.fill}
                stroke={active ? s.strokeHover : s.stroke}
                strokeWidth={active ? 2 : 1}
                strokeLinejoin="round"
                className="dept-path"
                style={{
                  cursor: (s.hasData || deptHasOverlay(dept.code)) ? 'pointer' : 'default',
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
                    : deptHasOverlay(dept.code)
                      ? active ? 'rgba(94,158,255,1)' : 'rgba(94,158,255,0.7)'
                      : isHovered ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)'
                }
                style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.25s ease' }}
              >
                {dept.code}
              </text>
              {s.hasData && (
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

        {/* ═══ PARIS ARRONDISSEMENTS OVERLAY ═══ */}
        {showArrondissements && arrondissementData && (
          <g>
            <g transform={`translate(${parisTransform.translateX}, ${parisTransform.translateY}) scale(${parisTransform.scale})`}>
              {/* Seine — glow + stroke */}
              <path
                d={SEINE_PATH}
                fill="none"
                stroke="rgba(94,158,255,0.05)"
                strokeWidth={12}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: 'none' }}
              />
              <path
                d={SEINE_PATH}
                fill="none"
                stroke="rgba(94,158,255,0.10)"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: 'none' }}
              />

              {/* Arrondissement paths */}
              {PARIS_ARRONDISSEMENTS.map(arr => {
                const agg = arrondissementData.get(arr.number);
                const hasData = agg?.hasData ?? false;
                const isHovered = hoveredArr === arr.number;

                const fillColor = hasData
                  ? isHovered ? 'rgba(248,113,113,0.30)' : 'rgba(248,113,113,0.14)'
                  : isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';

                const strokeColor = hasData
                  ? isHovered ? 'rgba(248,113,113,0.9)' : 'rgba(248,113,113,0.35)'
                  : isHovered ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.10)';

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
                        transition: 'fill 0.25s ease, stroke 0.25s ease',
                      }}
                      onMouseMove={(e) => handleArrMouseMove(e, arr.number)}
                      onMouseLeave={() => setHoveredArr(null)}
                      onClick={() => onNavigateToCity(arr.cityName)}
                    />
                    <circle
                      cx={arr.labelX}
                      cy={arr.labelY}
                      r={isHovered ? 6 : 4.5}
                      fill={hasData ? 'rgba(248,113,113,0.8)' : 'rgba(248,113,113,0.2)'}
                      stroke={hasData ? 'rgba(248,113,113,0.4)' : 'rgba(248,113,113,0.1)'}
                      strokeWidth={1}
                      style={{
                        pointerEvents: 'none',
                        transition: 'fill 0.2s ease',
                        filter: hasData ? 'drop-shadow(0 0 4px rgba(248,113,113,0.4))' : 'none',
                      }}
                    />
                    {hasData && (
                      <circle
                        cx={arr.labelX}
                        cy={arr.labelY}
                        r={9}
                        fill="none"
                        stroke="rgba(248,113,113,0.25)"
                        strokeWidth={0.8}
                        style={{ pointerEvents: 'none', animation: 'arrPulse 3s ease-in-out infinite' }}
                      />
                    )}
                    <text
                      x={arr.labelX}
                      y={arr.labelY - 12}
                      textAnchor="middle"
                      dominantBaseline="auto"
                      fontSize="18"
                      fontWeight="700"
                      fontFamily="SF Pro Display, -apple-system, system-ui, sans-serif"
                      fill={
                        hasData
                          ? isHovered ? 'rgba(248,113,113,1)' : 'rgba(248,113,113,0.85)'
                          : isHovered ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.22)'
                      }
                      style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                        transition: 'fill 0.2s ease',
                      }}
                    >
                      {arr.shortName}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        )}

        {/* ═══ GENERIC COMMUNE OVERLAY (works for 94, 93, 92, 91, 77, 78, 95) ═══ */}
        {overlayDeptCode && activeOverlayConfig && activeTransform && activeOverlayData && (
          <g>
            <g transform={`translate(${activeTransform.translateX}, ${activeTransform.translateY}) scale(${activeTransform.scale})`}>
              {/* River — glow + stroke */}
              {activeOverlayConfig.riverPath && (
                <>
                  <path
                    d={activeOverlayConfig.riverPath}
                    fill="none"
                    stroke="rgba(94,158,255,0.05)"
                    strokeWidth={12}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ pointerEvents: 'none' }}
                  />
                  <path
                    d={activeOverlayConfig.riverPath}
                    fill="none"
                    stroke="rgba(94,158,255,0.10)"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ pointerEvents: 'none' }}
                  />
                </>
              )}

              {/* Commune paths */}
              {activeOverlayConfig.communes.map(commune => {
                const agg = activeOverlayData.get(commune.cityName);
                const hasData = agg?.hasData ?? false;
                const isHovered = hoveredCommune === commune.cityName;

                const fillColor = hasData
                  ? isHovered ? 'rgba(248,113,113,0.30)' : 'rgba(248,113,113,0.14)'
                  : isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';

                const strokeColor = hasData
                  ? isHovered ? 'rgba(248,113,113,0.9)' : 'rgba(248,113,113,0.35)'
                  : isHovered ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.10)';

                return (
                  <g key={commune.cityName}>
                    <path
                      d={commune.path}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 2 : 1}
                      strokeLinejoin="round"
                      style={{
                        cursor: 'pointer',
                        transition: 'fill 0.25s ease, stroke 0.25s ease',
                      }}
                      onMouseMove={(e) => handleCommuneMouseMove(e, commune.cityName)}
                      onMouseLeave={() => setHoveredCommune(null)}
                      onClick={() => onNavigateToCity(commune.cityName)}
                    />
                    {/* Small dot */}
                    <circle
                      cx={commune.labelX}
                      cy={commune.labelY}
                      r={isHovered ? communeDotSize.hovered : communeDotSize.normal}
                      fill={hasData ? 'rgba(248,113,113,0.8)' : 'rgba(248,113,113,0.2)'}
                      stroke={hasData ? 'rgba(248,113,113,0.4)' : 'rgba(248,113,113,0.1)'}
                      strokeWidth={1}
                      style={{
                        pointerEvents: 'none',
                        transition: 'fill 0.2s ease',
                        filter: hasData ? 'drop-shadow(0 0 4px rgba(248,113,113,0.4))' : 'none',
                      }}
                    />
                    {hasData && (
                      <circle
                        cx={commune.labelX}
                        cy={commune.labelY}
                        r={7}
                        fill="none"
                        stroke="rgba(248,113,113,0.25)"
                        strokeWidth={0.8}
                        style={{ pointerEvents: 'none', animation: 'arrPulse 3s ease-in-out infinite' }}
                      />
                    )}
                    {/* Commune name */}
                    <text
                      x={commune.labelX}
                      y={commune.labelY - (communeLabelSize === '6' ? 6 : 10)}
                      textAnchor="middle"
                      dominantBaseline="auto"
                      fontSize={communeLabelSize}
                      fontWeight="700"
                      fontFamily="SF Pro Display, -apple-system, system-ui, sans-serif"
                      fill={
                        hasData
                          ? isHovered ? 'rgba(248,113,113,1)' : 'rgba(248,113,113,0.85)'
                          : isHovered ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.22)'
                      }
                      style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                        transition: 'fill 0.2s ease',
                      }}
                    >
                      {commune.shortName}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        )}

        <style>{`
          @keyframes dotPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          @keyframes arrPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </svg>

      {/* ═══ Tooltip IDF ═══ */}
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
          ) : deptHasOverlay(hoveredDept) ? (
            <>
              <p className="text-[11px] text-text-muted mt-0.5">
                {hoveredDept === '75' ? '20 arrondissements' : `${DEPT_OVERLAY_CONFIGS[hoveredDept]?.communes.length ?? 0} communes`} à explorer
              </p>
              <div className="mt-1 text-[10px] text-blue">
                Cliquer pour voir {hoveredDept === '75' ? 'les arrondissements' : 'les communes'} →
              </div>
            </>
          ) : (
            <p className="text-[11px] text-text-dim mt-0.5">Aucune donnée de scraping</p>
          )}
        </div>
      )}

      {/* ═══ Tooltip Arrondissements ═══ */}
      {showArrondissements && hoveredArr && hoveredArrData && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: arrTooltipPos.x,
            top: arrTooltipPos.y,
            background: 'rgba(8,8,16,0.95)',
            border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: '12px',
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(248,113,113,0.08)',
            backdropFilter: 'blur(12px)',
            minWidth: '180px',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-white">{hoveredArrData.name}</span>
          </div>
          {hoveredArrData.hasData ? (
            <>
              <div className="flex gap-3 text-[10px]">
                <span className="text-white/50">{hoveredArrData.totalRestaurants} restaurant{hoveredArrData.totalRestaurants > 1 ? 's' : ''}</span>
                {hoveredArrData.totalOpportunities > 0 && (
                  <span className="text-red flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> {hoveredArrData.totalOpportunities} opp.
                  </span>
                )}
              </div>
              {hoveredArrData.types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {hoveredArrData.types.slice(0, 4).map(t => (
                    <span key={t} className="px-1.5 py-0.5 text-[8px] text-white/40 rounded-md"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {getTypeEmoji(t)} {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-1.5 text-[9px] text-red/70 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Cliquer pour explorer
              </div>
            </>
          ) : (
            <p className="text-[10px] text-white/30 mt-0.5">Pas encore exploré</p>
          )}
        </div>
      )}

      {/* ═══ Tooltip Communes (generic for any department) ═══ */}
      {overlayDeptCode && hoveredCommune && hoveredCommuneData && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: communeTooltipPos.x,
            top: communeTooltipPos.y,
            background: 'rgba(8,8,16,0.95)',
            border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: '12px',
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(248,113,113,0.08)',
            backdropFilter: 'blur(12px)',
            minWidth: '180px',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-white">{hoveredCommuneData.name}</span>
          </div>
          {hoveredCommuneData.hasData ? (
            <>
              <div className="flex gap-3 text-[10px]">
                <span className="text-white/50">{hoveredCommuneData.totalRestaurants} restaurant{hoveredCommuneData.totalRestaurants > 1 ? 's' : ''}</span>
                {hoveredCommuneData.totalOpportunities > 0 && (
                  <span className="text-red flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> {hoveredCommuneData.totalOpportunities} opp.
                  </span>
                )}
              </div>
              {hoveredCommuneData.types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {hoveredCommuneData.types.slice(0, 4).map(t => (
                    <span key={t} className="px-1.5 py-0.5 text-[8px] text-white/40 rounded-md"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {getTypeEmoji(t)} {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-1.5 text-[9px] text-red/70 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Cliquer pour explorer
              </div>
            </>
          ) : (
            <p className="text-[10px] text-white/30 mt-0.5">Pas encore exploré</p>
          )}
        </div>
      )}

      {/* ═══ Back button ═══ */}
      {isZoomed && (
        <button
          onClick={zoomOut}
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-text-muted hover:text-text transition-all"
          style={{
            background: 'rgba(12,12,20,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          ← Retour
        </button>
      )}

      {/* ═══ Standard city panel — for departments without commune overlay ═══ */}
      {isZoomed && showPanel && selectedData && selectedDept !== '75' && !overlayDeptCode && (
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-text-dim uppercase tracking-wider">Département {selectedData.code}</p>
                <p className="text-[15px] font-bold text-text">{selectedData.name}</p>
              </div>
              <button
                onClick={zoomOut}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <span className="text-text-dim text-sm">✕</span>
              </button>
            </div>
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

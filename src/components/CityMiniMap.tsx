import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Crosshair, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { CityZone, ColonyHouse } from '../types';

export interface MiniMapSyncState {
  x: number;
  z: number;
  heading: number;
  camYaw: number;
  isInsideColony: boolean;
  inGateProximity: boolean;
  gateOpen: boolean;
  isWalking: boolean;
  destX: number | null;
  destZ: number | null;
  zoneName: string;
  orbitTargetX: number;
  orbitTargetZ: number;
  followPerson: boolean;
}

export interface CityMiniMapHandle {
  sync: (state: MiniMapSyncState) => void;
}

interface CityMiniMapProps {
  colonyHouses: ColonyHouse[];
  selectedHouseId: string | null;
  activeZone: CityZone | null;
  emergencyActive: boolean;
  onNavigateTo: (x: number, z: number) => void;
  onFocusCharacter: () => void;
}

// World extent matching NEXUS Smart City + Harbor + Shanti Vihar Colony
const WORLD_MIN_X = -220;
const WORLD_MAX_X = 455;
const WORLD_MIN_Z = -195;
const WORLD_MAX_Z = 245;
const WORLD_SPAN_X = WORLD_MAX_X - WORLD_MIN_X; // 675m
const WORLD_SPAN_Z = WORLD_MAX_Z - WORLD_MIN_Z; // 440m

// Logical CSS canvas dimensions (aspect ~1.534 matches 675/440)
const MAP_W = 224;
const MAP_H = 146;

const CITY_BUILDINGS_FOOTPRINTS = [
  { x: -50, z: -40, w: 26, d: 26, hero: true }, // NEXUS TOWER 01
  { x: -30, z: 70, w: 30, d: 30, hero: false }, // CIVIC CENTER
  { x: -70, z: 20, w: 20, d: 20, hero: false }, // WEST COMMERCIAL
  { x: -50, z: 140, w: 26, d: 26, hero: false }, // SOUTH COMMERCE
  { x: 30, z: -60, w: 24, d: 24, hero: true }, // SMART HOSPITAL
  { x: 10, z: -120, w: 26, d: 26, hero: false }, // MEDTECH RESEARCH
  { x: -60, z: -110, w: 22, d: 22, hero: false }, // GENOMICS LABS
  { x: -20, z: -170, w: 24, d: 24, hero: false }, // NORTH AIR-HUB
  { x: 60, z: 20, w: 28, d: 28, hero: true }, // VERTICAL SKY-FARM
  { x: 40, z: 90, w: 22, d: 22, hero: false }, // BIO-DOME
  { x: 70, z: 150, w: 22, d: 22, hero: false }, // AGRI-VALLEY
  { x: 80, z: -30, w: 25, d: 25, hero: false }, // AEROSPACE LOGISTICS
  { x: 130, z: -100, w: 35, d: 35, hero: false }, // SMART SUBSTATION
];

const worldToMapX = (wx: number) => ((wx - WORLD_MIN_X) / WORLD_SPAN_X) * MAP_W;
const worldToMapY = (wz: number) => ((wz - WORLD_MIN_Z) / WORLD_SPAN_Z) * MAP_H;
const worldToMapW = (ww: number) => (ww / WORLD_SPAN_X) * MAP_W;
const worldToMapH = (wd: number) => (wd / WORLD_SPAN_Z) * MAP_H;

export const CityMiniMap = React.forwardRef<CityMiniMapHandle, CityMiniMapProps>(
  ({ colonyHouses, selectedHouseId, activeZone, emergencyActive, onNavigateTo, onFocusCharacter }, ref) => {
    const [collapsed, setCollapsed] = useState(false);
    const collapsedRef = useRef(false);
    collapsedRef.current = collapsed;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const coordSpanRef = useRef<HTMLSpanElement | null>(null);
    const zoneSpanRef = useRef<HTMLSpanElement | null>(null);

    const lastStateRef = useRef<MiniMapSyncState>({
      x: 136,
      z: 120,
      heading: Math.PI / 2,
      camYaw: Math.PI / 2,
      isInsideColony: false,
      inGateProximity: false,
      gateOpen: false,
      isWalking: false,
      destX: null,
      destZ: null,
      zoneName: 'Colony Approach Road',
      orbitTargetX: 0,
      orbitTargetZ: 0,
      followPerson: false,
    });
    const lastDrawnSnapshotRef = useRef<string>('');
    const lastDrawMsRef = useRef<number>(0);

    // Draw Dynamic Layer over Cached Static Architectural Blueprint
    const renderDynamicFrame = (st: MiniMapSyncState) => {
      const canvas = canvasRef.current;
      const staticCanvas = staticCanvasRef.current;
      if (!canvas || !staticCanvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(staticCanvas, 0, 0);
      ctx.scale(dpr, dpr);

      // 1. Colony Main Gate Status Marker (x=160, z=120)
      const gx = worldToMapX(160);
      const gy = worldToMapY(120);
      if (st.inGateProximity) {
        const ringR = (16.5 / WORLD_SPAN_X) * MAP_W;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(gx, gy, Math.max(4, ringR), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = st.gateOpen || st.inGateProximity ? '#34d399' : '#f43f5e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      if (st.gateOpen || st.inGateProximity) {
        ctx.moveTo(gx, gy - 4.5);
        ctx.lineTo(gx + 3.5, gy - 4.5);
      } else {
        ctx.moveTo(gx, gy - 4.5);
        ctx.lineTo(gx, gy + 4.5);
      }
      ctx.stroke();

      // 2. Active Walk Waypoint Route & Destination Pin
      const px = worldToMapX(st.x);
      const py = worldToMapY(st.z);
      if (st.destX !== null && st.destZ !== null) {
        const dx = worldToMapX(st.destX);
        const dy = worldToMapY(st.destZ);

        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(232, 198, 120, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(dx, dy);
        ctx.stroke();
        ctx.restore();

        // Target Diamond Pin
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#09090d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dx, dy - 3.8);
        ctx.lineTo(dx + 3.4, dy);
        ctx.lineTo(dx, dy + 3.8);
        ctx.lineTo(dx - 3.4, dy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 3. Subtle Orbit Focus Marker when not locked to 3P Follow Mode
      if (!st.followPerson) {
        const ox = worldToMapX(st.orbitTargetX);
        const oy = worldToMapY(st.orbitTargetZ);
        if (ox >= 0 && ox <= MAP_W && oy >= 0 && oy <= MAP_H) {
          ctx.strokeStyle = 'rgba(244, 241, 234, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox - 3, oy);
          ctx.lineTo(ox + 3, oy);
          ctx.moveTo(ox, oy - 3);
          ctx.lineTo(ox, oy + 3);
          ctx.stroke();
        }
      }

      // 4. Subtle Camera Look Wedge centered on Character (or Orbit Focus)
      const lookOriginX = st.followPerson ? px : worldToMapX(st.orbitTargetX);
      const lookOriginY = st.followPerson ? py : worldToMapY(st.orbitTargetZ);
      const camDirX = Math.sin(st.camYaw);
      const camDirY = Math.cos(st.camYaw);
      const camAngle = Math.atan2(camDirY, camDirX);
      ctx.fillStyle = 'rgba(212, 168, 83, 0.14)';
      ctx.beginPath();
      ctx.moveTo(lookOriginX, lookOriginY);
      ctx.arc(lookOriginX, lookOriginY, 18, camAngle - 0.42, camAngle + 0.42);
      ctx.closePath();
      ctx.fill();

      // 5. Character Position Halo & Directional Heading Chevron
      const fx = Math.sin(st.heading);
      const fz = Math.cos(st.heading);
      const rx = -fz;
      const rz = fx;

      // Soft translucent status halo
      ctx.fillStyle = st.isInsideColony ? 'rgba(16, 185, 129, 0.28)' : 'rgba(212, 168, 83, 0.30)';
      ctx.beginPath();
      ctx.arc(px, py, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Directional chevron arrow pointing in Three.js world facing vector
      const tipLen = 6.2;
      const backLen = 3.6;
      const sideSpan = 4.2;
      ctx.fillStyle = st.isInsideColony ? '#34d399' : '#e8c678';
      ctx.strokeStyle = '#09090d';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(px + fx * tipLen, py + fz * tipLen);
      ctx.lineTo(px - fx * backLen + rx * sideSpan, py - fz * backLen + rz * sideSpan);
      ctx.lineTo(px - fx * 1.4, py - fz * 1.4);
      ctx.lineTo(px - fx * backLen - rx * sideSpan, py - fz * backLen - rz * sideSpan);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crisp warm ivory center core
      ctx.fillStyle = '#f4f1ea';
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Build / Rebuild Static City Blueprint Cache whenever static scene state changes
    useEffect(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = Math.round(MAP_W * dpr);
        canvas.height = Math.round(MAP_H * dpr);
      }

      const offscreen = staticCanvasRef.current || document.createElement('canvas');
      staticCanvasRef.current = offscreen;
      offscreen.width = Math.round(MAP_W * dpr);
      offscreen.height = Math.round(MAP_H * dpr);

      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Deep Obsidian Architectural Surface
      ctx.fillStyle = '#0b0b10';
      ctx.fillRect(0, 0, MAP_W, MAP_H);

      // 2. Subtle Coordinate Grid (50m intervals)
      ctx.strokeStyle = emergencyActive ? 'rgba(244, 63, 94, 0.10)' : 'rgba(212, 168, 83, 0.08)';
      ctx.lineWidth = 0.6;
      for (let gx = -200; gx <= 450; gx += 50) {
        const cx = worldToMapX(gx);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, MAP_H);
        ctx.stroke();
      }
      for (let gz = -150; gz <= 200; gz += 50) {
        const cy = worldToMapY(gz);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(MAP_W, cy);
        ctx.stroke();
      }

      // 3. Harbor Canal Waterway & Embankment
      const waterX = worldToMapX(-230);
      const waterW = worldToMapW(100);
      ctx.fillStyle = '#0f1f33';
      ctx.fillRect(waterX, 0, waterW, MAP_H);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(worldToMapX(-130), 0);
      ctx.lineTo(worldToMapX(-130), MAP_H);
      ctx.stroke();

      // Harbor Bridge (x: -250..-110, z: -10..10)
      ctx.fillStyle = '#272730';
      ctx.fillRect(worldToMapX(-220), worldToMapY(-10), worldToMapW(110), worldToMapH(20));

      // 4. Shanti Vihar Residential Colony Enclosure (x: 160..434, z: 12..228)
      const colX = worldToMapX(160);
      const colY = worldToMapY(12);
      const colW = worldToMapW(274);
      const colH = worldToMapH(216);
      ctx.fillStyle = 'rgba(24, 24, 32, 0.9)';
      ctx.fillRect(colX, colY, colW, colH);
      ctx.strokeStyle = 'rgba(212, 168, 83, 0.48)';
      ctx.lineWidth = 1.1;
      ctx.strokeRect(colX, colY, colW, colH);

      // Community Park (x: 246..298, z: 72..168)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.fillRect(worldToMapX(246), worldToMapY(72), worldToMapW(52), worldToMapH(96));
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(worldToMapX(246), worldToMapY(72), worldToMapW(52), worldToMapH(96));

      // 5. Smart City & Colony Roads
      const drawRoad = (rx: number, rz: number, rw: number, rd: number, centerLine = false) => {
        const mx = worldToMapX(rx - rw / 2);
        const my = worldToMapY(rz - rd / 2);
        const mw = Math.max(1.5, worldToMapW(rw));
        const mh = Math.max(1.5, worldToMapH(rd));
        ctx.fillStyle = '#262834';
        ctx.fillRect(mx, my, mw, mh);
        if (centerLine) {
          ctx.strokeStyle = 'rgba(212, 168, 83, 0.28)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          if (rw > rd) {
            ctx.moveTo(mx, worldToMapY(rz));
            ctx.lineTo(mx + mw, worldToMapY(rz));
          } else {
            ctx.moveTo(worldToMapX(rx), my);
            ctx.lineTo(worldToMapX(rx), my + mh);
          }
          ctx.stroke();
        }
      };

      // Main Metropolitan Corridors
      drawRoad(0, 0, 14, 435, true); // Metro Central Ave
      drawRoad(70, 0, 14, 435, true); // Innovation Blvd
      drawRoad(35, 0, 220, 14, true); // Cross-Boulevard
      drawRoad(116, 120, 92, 14, true); // Colony Approach Road

      // Internal Colony Streets
      drawRoad(295, 120, 274, 12, true); // Central Colony Ave
      drawRoad(288, 58, 214, 10, false); // North Street
      drawRoad(288, 182, 214, 10, false); // South Street
      drawRoad(182, 120, 10, 132, false); // West Spine Road
      drawRoad(242, 120, 9, 124, false); // Park West Lane
      drawRoad(302, 120, 9, 124, false); // Park East Lane
      drawRoad(388, 112, 11, 168, false); // East Spine Road

      // 6. Active Sector Highlight Ring (if selected)
      if (activeZone) {
        const zx = worldToMapX(activeZone.center[0]);
        const zy = worldToMapY(activeZone.center[2]);
        const zr = worldToMapW(activeZone.boundsRadius);
        ctx.strokeStyle = activeZone.accentColor;
        ctx.fillStyle = `${activeZone.accentColor}1c`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(zx, zy, Math.max(8, zr), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 7. Smart City Skyscrapers & Substation
      CITY_BUILDINGS_FOOTPRINTS.forEach((b) => {
        const bx = worldToMapX(b.x - b.w / 2);
        const by = worldToMapY(b.z - b.d / 2);
        const bw = Math.max(3, worldToMapW(b.w));
        const bh = Math.max(3, worldToMapH(b.d));
        ctx.fillStyle = b.hero ? '#2c2519' : '#181a24';
        ctx.strokeStyle = b.hero ? '#d4a853' : 'rgba(161, 161, 170, 0.55)';
        ctx.lineWidth = b.hero ? 1 : 0.7;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);
      });

      // 8. Colony Houses (H-01 .. H-30) colored by live security status
      colonyHouses.forEach((h) => {
        const hx = worldToMapX(h.coordinates[0]);
        const hy = worldToMapY(h.coordinates[2]);
        const isSel = selectedHouseId === h.id;
        const size = isSel ? 4.2 : 3.2;

        if (h.status === 'ALERT_ACTIVE') {
          ctx.fillStyle = '#f43f5e';
        } else if (h.awayMode.enabled) {
          ctx.fillStyle = '#f59e0b';
        } else {
          ctx.fillStyle = '#71717a';
        }

        ctx.fillRect(hx - size / 2, hy - size / 2, size, size);
        if (isSel) {
          ctx.strokeStyle = '#e8c678';
          ctx.lineWidth = 1.1;
          ctx.strokeRect(hx - size / 2 - 1, hy - size / 2 - 1, size + 2, size + 2);
        }
      });

      // 9. Key Checkpoints (Guard Cabin, City Arch, East Exit)
      // Guard Cabin (166, 104)
      ctx.fillStyle = '#d4a853';
      ctx.fillRect(worldToMapX(166) - 2, worldToMapY(104) - 1.5, 4, 3);
      // City Entrance Arch (0, 235)
      ctx.fillStyle = '#e8c678';
      ctx.fillRect(worldToMapX(0) - 4, worldToMapY(235) - 1, 8, 2);

      // 10. Crisp Micro Architectural Labels & North Compass
      ctx.font = '600 7px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(244, 241, 234, 0.45)';
      ctx.fillText('HARBOR', worldToMapX(-212), 11);
      ctx.fillText('CITY CORE', worldToMapX(-64), 11);
      ctx.fillStyle = 'rgba(232, 198, 120, 0.78)';
      ctx.fillText('SHANTI VIHAR COLONY', worldToMapX(168), worldToMapY(23));
      ctx.fillStyle = 'rgba(52, 211, 153, 0.78)';
      ctx.fillText('PARK', worldToMapX(254), worldToMapY(122));

      // North Arrow in Top-Right corner of blueprint
      ctx.fillStyle = '#d4a853';
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.fillText('N', MAP_W - 11, 11);
      ctx.strokeStyle = '#d4a853';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(MAP_W - 8.5, 22);
      ctx.lineTo(MAP_W - 8.5, 13);
      ctx.lineTo(MAP_W - 11, 16);
      ctx.stroke();

      // Re-draw dynamic layer immediately so static rebuilds never flash blank
      lastDrawnSnapshotRef.current = '';
      if (!collapsedRef.current) {
        renderDynamicFrame(lastStateRef.current);
      }
    }, [colonyHouses, selectedHouseId, activeZone, emergencyActive, collapsed]);

    // Imperative 60fps-safe sync invoked from Three.js animate() with zero React re-renders
    useImperativeHandle(ref, () => ({
      sync(st: MiniMapSyncState) {
        lastStateRef.current = { ...st };

        // Update tiny text readouts via DOM refs directly
        if (coordSpanRef.current) {
          const nextCoord = `${Math.round(st.x)}, ${Math.round(st.z)}`;
          if (coordSpanRef.current.textContent !== nextCoord) {
            coordSpanRef.current.textContent = nextCoord;
          }
        }
        if (zoneSpanRef.current) {
          if (zoneSpanRef.current.textContent !== st.zoneName) {
            zoneSpanRef.current.textContent = st.zoneName;
          }
        }

        if (collapsedRef.current) return;

        const now = performance.now();
        if (now - lastDrawMsRef.current < 32) return; // Cap mini-map canvas redraws at ~30fps

        const snap = `${st.x.toFixed(1)}_${st.z.toFixed(1)}_${st.heading.toFixed(2)}_${st.camYaw.toFixed(2)}_${st.gateOpen}_${st.inGateProximity}_${st.isInsideColony}_${st.destX?.toFixed(0) ?? ''}_${st.destZ?.toFixed(0) ?? ''}_${st.followPerson}_${st.followPerson ? '' : `${st.orbitTargetX.toFixed(0)}_${st.orbitTargetZ.toFixed(0)}`}`;
        if (snap === lastDrawnSnapshotRef.current) return;

        lastDrawnSnapshotRef.current = snap;
        lastDrawMsRef.current = now;
        renderDynamicFrame(st);
      },
    }));

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const worldX = WORLD_MIN_X + nx * WORLD_SPAN_X;
      const worldZ = WORLD_MIN_Z + ny * WORLD_SPAN_Z;
      onNavigateTo(worldX, worldZ);
    };

    return (
      <div className="bg-[#111116]/95 border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden w-[206px] sm:w-[238px] select-none">
        {/* Mini-Map Header Bar */}
        <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-[#0d0d12] border-b border-white/[0.08]">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapIcon className="w-3 h-3 text-[#d4a853] shrink-0" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#f4f1ea] uppercase">
              MINI-MAP
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span
              ref={coordSpanRef}
              className="text-[10px] font-mono text-[#e8c678] tabular-nums"
              title="Character World Coordinates (X, Z)"
            >
              136, 120
            </span>
            <button
              onClick={onFocusCharacter}
              className="p-1 rounded hover:bg-[#d4a853]/15 text-zinc-400 hover:text-[#e8c678] transition-colors cursor-pointer"
              title="Center Camera on Character"
            >
              <Crosshair className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={collapsed ? 'Expand Mini-Map' : 'Minimize Mini-Map'}
            >
              {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Interactive Blueprint Canvas */}
        {!collapsed && (
          <>
            <div className="p-1.5 pb-1 bg-[#09090d]">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ width: '100%', height: 'auto', aspectRatio: `${MAP_W} / ${MAP_H}` }}
                className="block rounded-lg border border-white/[0.08] cursor-crosshair"
                title="Click anywhere on the map to walk character there"
              />
            </div>

            {/* Compact Live Sector & Legend Strip */}
            <div className="px-2.5 py-1 bg-[#0d0d12] border-t border-white/[0.06] flex items-center justify-between gap-2 text-[9px] font-mono">
              <span ref={zoneSpanRef} className="text-zinc-300 truncate">
                Colony Approach Road
              </span>
              <span className="text-zinc-500 shrink-0">CLICK TO WALK</span>
            </div>
          </>
        )}
      </div>
    );
  }
);

CityMiniMap.displayName = 'CityMiniMap';

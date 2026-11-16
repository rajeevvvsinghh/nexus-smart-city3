import React from 'react';
import {
  Footprints,
  UserCheck,
  Navigation,
  Shield,
  DoorOpen,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { ThirdPersonTelemetry, GATE_PROXIMITY_RADIUS } from '../three/ThirdPersonController';

interface ThirdPersonHudProps {
  active: boolean;
  onToggleMode: (active: boolean) => void;
  telemetry: ThirdPersonTelemetry;
  gateOpen: boolean;
  onWalkToDestination: (x: number, z: number, label?: string) => void;
  onResetToGate: () => void;
  onVirtualMoveStart: (dir: 'w' | 'a' | 's' | 'd') => void;
  onVirtualMoveEnd: (dir: 'w' | 'a' | 's' | 'd') => void;
  onSprintToggle: () => void;
  sprintLocked: boolean;
  onJump: () => void;
  onInspectHouse: (houseId: string) => void;
  onInspectLandmark: (landmarkId: string) => void;
  onOpenHouseInControlRoom: (houseId: string) => void;
}

export const ThirdPersonHud: React.FC<ThirdPersonHudProps> = ({
  active,
  onToggleMode,
  telemetry,
  gateOpen,
  onWalkToDestination,
  onResetToGate,
  onVirtualMoveStart,
  onVirtualMoveEnd,
  onSprintToggle,
  sprintLocked,
  onJump,
  onInspectHouse,
  onInspectLandmark,
  onOpenHouseInControlRoom,
}) => {
  const proximityPct = Math.max(
    0,
    Math.min(100, Math.round((1 - telemetry.distToGate / (GATE_PROXIMITY_RADIUS * 2.2)) * 100))
  );

  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 max-w-[94%] sm:max-w-md">
      {/* Proximity Trigger Banner when approaching or inside Gate Sensor Ring */}
      {telemetry.inGateProximity && (
        <div className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1b16]/95 border border-emerald-500/50 text-emerald-200 shadow-xl">
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono font-bold">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <DoorOpen className="w-4 h-4" />
              {telemetry.isInsideColony
                ? 'GATE PROXIMITY CLEARED · INSIDE SHANTI VIHAR'
                : 'PROXIMITY SENSOR TRIGGERED · BOOM BARRIER OPEN'}
            </span>
            <span className="tabular-nums">{telemetry.distToGate.toFixed(1)}m</span>
          </div>
          <div className="w-full h-1.5 bg-[#09090d] rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-emerald-400 transition-all duration-150"
              style={{ width: `${Math.max(35, proximityPct)}%` }}
            />
          </div>
        </div>
      )}

      {/* Nearby House Context Prompt */}
      {telemetry.nearbyHouse && (
        <div className="w-full px-3.5 py-2.5 rounded-xl bg-[#111116]/95 border border-[#d4a853]/50 shadow-xl flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono text-[#d4a853] font-bold">
              NEARBY HOME ({telemetry.nearbyHouse.securityId}) · PRESS [E]
            </div>
            <div className="text-xs font-heading font-bold text-[#f4f1ea]">
              {telemetry.nearbyHouse.id} · {telemetry.nearbyHouse.ownerName}
              <span className="ml-2 text-[10px] font-mono text-amber-300">
                {telemetry.nearbyHouse.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onInspectHouse(telemetry.nearbyHouse!.id)}
              className="px-2.5 py-1 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-[11px] font-mono font-bold cursor-pointer"
            >
              Inspect 3D
            </button>
            <button
              onClick={() => onOpenHouseInControlRoom(telemetry.nearbyHouse!.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#09090d] text-[11px] font-mono font-bold cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              Operations
            </button>
          </div>
        </div>
      )}

      {/* Nearby Smart City Landmark Prompt */}
      {!telemetry.nearbyHouse && telemetry.nearbyLandmarkId && telemetry.nearbyLandmarkName && (
        <div className="w-full px-3.5 py-2 rounded-xl bg-[#111116]/95 border border-[#d4a853]/45 shadow-xl flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono text-[#d4a853] font-bold">
              CITY LANDMARK IN RANGE · PRESS [E]
            </div>
            <div className="text-xs font-heading font-bold text-[#f4f1ea] truncate">
              {telemetry.nearbyLandmarkName}
            </div>
          </div>
          <button
            onClick={() => onInspectLandmark(telemetry.nearbyLandmarkId!)}
            className="px-2.5 py-1 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-[11px] font-mono font-bold cursor-pointer shrink-0"
          >
            Inspect Building
          </button>
        </div>
      )}

      {/* Compact Mode Header & Quick Walk Buttons */}
      <div className="w-full p-2.5 rounded-2xl bg-[#111116]/95 border border-white/[0.12] shadow-2xl space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => onToggleMode(!active)}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors ${
              active
                ? 'bg-emerald-500 text-[#09090d]'
                : 'bg-[#d4a853]/15 hover:bg-[#d4a853]/25 border border-[#d4a853]/45 text-[#e8c678]'
            }`}
            title="Toggle Third-Person Character Camera Controller"
          >
            <Footprints className="w-4 h-4" />
            <span>{active ? '3P CONTROLLER: ACTIVE' : 'ENTER 3P WALK MODE'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                telemetry.isInsideColony
                  ? onWalkToDestination(250, 120, 'Colony Central Park')
                  : onWalkToDestination(192, 120, 'Walking through Gate into Colony')
              }
              className="px-2.5 py-1.5 rounded-lg bg-[#d4a853] hover:bg-[#e8c678] text-[#09090d] text-[11px] font-mono font-bold cursor-pointer flex items-center gap-1 transition-colors"
              title="Walk toward colony gate & trigger proximity entry automatically"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{telemetry.isInsideColony ? 'Walk to Park' : 'Walk In Gate'}</span>
            </button>
            <button
              onClick={onResetToGate}
              className="p-1.5 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-white/[0.1] text-zinc-300 cursor-pointer"
              title="Reset Character Outside Main Gate"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Zone, Gate & cannon-es Physics Telemetry Strip */}
        <div className="flex flex-col gap-1 px-2.5 py-1.5 rounded-xl bg-[#0d0d12] border border-white/[0.06] text-[10px] font-mono">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-[#e8c678] font-bold truncate">
              <MapPin className="w-3 h-3 text-[#d4a853] shrink-0" />
              {telemetry.zoneName}
            </span>
            <span className="text-zinc-400 tabular-nums">
              Gate:{' '}
              <strong className={telemetry.inGateProximity ? 'text-emerald-400' : 'text-[#e8c678]'}>
                {telemetry.distToGate.toFixed(0)}m
              </strong>{' '}
              ·{' '}
              <strong className={gateOpen ? 'text-emerald-400' : 'text-zinc-300'}>
                {gateOpen ? 'OPEN' : 'AUTO-PROXIMITY'}
              </strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
            <span className="text-zinc-400 truncate">
              Physics:{' '}
              <strong className={telemetry.isGrounded ? 'text-emerald-300' : 'text-amber-300'}>
                {telemetry.physicsSurface}
              </strong>
            </span>
            {telemetry.physicsContact ? (
              <span className="text-rose-300 font-bold truncate">
                Collision: {telemetry.physicsContact}
              </span>
            ) : (
              <span className="text-zinc-500">No Obstacle Contact</span>
            )}
          </div>
        </div>

        {/* Expanded Road Nav & Virtual Walk Controls when 3P Mode is Active */}
        {active && (
          <div className="pt-1 border-t border-white/[0.08] space-y-2">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-mono text-zinc-400 mr-1">GO:</span>
              {[
                { label: 'Approach', x: 142, z: 120 },
                { label: 'Gate Inside', x: 186, z: 120 },
                { label: 'H-08 Villa', x: 200, z: 72 },
                { label: 'Park', x: 272, z: 120 },
                { label: 'Exit Gate', x: 422, z: 120 },
                { label: 'Smart Tower', x: -24, z: -20 },
              ].map((pt) => (
                <button
                  key={pt.label}
                  onClick={() => onWalkToDestination(pt.x, pt.z, pt.label)}
                  className="px-2 py-1 rounded bg-[#0d0d12] hover:bg-[#d4a853]/15 border border-white/[0.08] hover:border-[#d4a853]/40 text-[10px] font-mono text-zinc-200 cursor-pointer"
                >
                  {pt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {(['a', 'w', 's', 'd'] as const).map((key) => {
                  const Icon =
                    key === 'w' ? ArrowUp : key === 's' ? ArrowDown : key === 'a' ? ArrowLeft : ArrowRight;
                  return (
                    <button
                      key={key}
                      onPointerDown={() => onVirtualMoveStart(key)}
                      onPointerUp={() => onVirtualMoveEnd(key)}
                      onPointerLeave={() => onVirtualMoveEnd(key)}
                      className="w-8 h-8 rounded-lg bg-[#0d0d12] active:bg-[#d4a853] active:text-[#09090d] border border-white/[0.1] text-zinc-200 flex items-center justify-center cursor-pointer select-none"
                      title={`Hold to walk (${key.toUpperCase()})`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={onSprintToggle}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 cursor-pointer ${
                    sprintLocked
                      ? 'bg-[#d4a853]/20 border-[#d4a853] text-[#e8c678]'
                      : 'bg-[#0d0d12] border-white/[0.1] text-zinc-300'
                  }`}
                  title="Toggle Sprint (or hold Shift)"
                >
                  <Zap className="w-3 h-3" />
                  SPRINT
                </button>
                <button
                  onClick={onJump}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0d0d12] hover:bg-[#17171f] border border-white/[0.1] text-[10px] font-mono font-bold text-zinc-200 cursor-pointer"
                  title="Jump (Space)"
                >
                  JUMP
                </button>
              </div>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#d4a853] shrink-0" />
              <span>WASD walk · Shift sprint · Space jump · Click any road to navigate</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

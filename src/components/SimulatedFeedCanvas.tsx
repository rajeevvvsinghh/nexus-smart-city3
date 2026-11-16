import React, { useEffect, useRef } from 'react';
import { ColonyHouse } from '../types';

interface SimulatedFeedCanvasProps {
  house: ColonyHouse;
  mode?: 'live-feed' | 'object-before' | 'object-after';
  objectName?: string;
  height?: number;
}

export const SimulatedFeedCanvas: React.FC<SimulatedFeedCanvasProps> = ({
  house,
  mode = 'live-feed',
  objectName = 'Study Room Safe Locker',
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const drawFrame = (tick: number) => {
      ctx.clearRect(0, 0, w, h);

      // 1. Camera Offline / Tamper State
      if (mode === 'live-feed' && house.devices.cameraStatus === 'OFFLINE_TAMPER') {
        ctx.fillStyle = '#09090d';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        for (let y = 0; y < h; y += 6) {
          ctx.fillRect(0, y, w, 2);
        }

        for (let i = 0; i < 65; i++) {
          const nx = (i * 73 + tick * 19) % w;
          const ny = (i * 41 + tick * 11) % h;
          ctx.fillStyle = 'rgba(161, 161, 170, 0.25)';
          ctx.fillRect(nx, ny, 3, 2);
        }

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 15px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CAMERA OFFLINE — TAMPER DETECTED', w / 2, h / 2 - 14);

        ctx.fillStyle = '#e8c678';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(
          `INDEPENDENT SENSORS ACTIVE: DOOR=${house.sensors.doorSensor} · PIR=${house.sensors.motionSensor}`,
          w / 2,
          h / 2 + 14
        );

        ctx.fillStyle = '#f59e0b';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(
          `BACKUP: ${house.devices.powerSource} (${house.devices.batteryPct}%) · MESH ${house.sensors.wirelessMesh}`,
          w / 2,
          h / 2 + 36
        );
        return;
      }

      // 2. Architectural Room / Porch Backdrop (Obsidian + Warm Brass Wireframe)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0d0d12');
      grad.addColorStop(0.65, '#13131b');
      grad.addColorStop(1, '#1a1a24');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(212, 168, 83, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(75, h - 55);
      ctx.lineTo(w - 75, h - 55);
      ctx.lineTo(w, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(75, 25);
      ctx.lineTo(75, h - 55);
      ctx.moveTo(w - 75, 25);
      ctx.lineTo(w - 75, h - 55);
      ctx.stroke();

      // Doorway frame on right wall
      const doorOpen = house.sensors.doorSensor !== 'CLOSED';
      ctx.fillStyle = doorOpen ? '#1f1a1c' : '#23232e';
      ctx.fillRect(w - 145, 58, 46, h - 113);
      ctx.strokeStyle = doorOpen ? '#ef4444' : '#71717a';
      ctx.lineWidth = doorOpen ? 2 : 1;
      ctx.strokeRect(w - 145, 58, 46, h - 113);

      // Desk / shelf unit on left
      ctx.fillStyle = '#1f1f29';
      ctx.fillRect(92, h - 98, 95, 43);
      ctx.strokeStyle = '#52525b';
      ctx.strokeRect(92, h - 98, 95, 43);

      // Registered Object
      const objectMoved =
        mode === 'object-after' ||
        (mode === 'live-feed' && house.sensors.objectPresence !== 'VERIFIED');

      if (!objectMoved) {
        ctx.fillStyle = '#b48a3e';
        ctx.fillRect(118, h - 130, 40, 32);
        ctx.strokeStyle = '#e8c678';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(118, h - 130, 40, 32);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(146, h - 120, 6, 8);

        if (mode === 'object-before') {
          ctx.strokeStyle = '#10b981';
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(112, h - 136, 52, 42);
          ctx.setLineDash([]);
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`BASELINE: ${objectName.slice(0, 18)}`, 104, h - 144);
        }
      } else {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(116, h - 132, 44, 34);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
        ctx.fillRect(116, h - 132, 44, 34);

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('OBJECT ABSENT / MOVED', 96, h - 142);
      }

      // 3. Simulated Unknown Motion Event Silhouette
      if (mode === 'live-feed' && house.sensors.motionSensor === 'DETECTED') {
        const sx = 235 + Math.sin(tick * 0.08) * 14;
        const sy = h - 122;

        ctx.fillStyle = 'rgba(239, 68, 68, 0.32)';
        ctx.beginPath();
        ctx.arc(sx + 16, sy + 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(sx + 4, sy + 24, 24, 42);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx - 4, sy - 4, 40, 74);

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sx - 4, sy - 20, 148, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('UNKNOWN MOTION (NO BIO-ID)', sx, sy - 8);
      }

      // 4. HUD Watermark Overlay
      ctx.fillStyle = 'rgba(9, 9, 13, 0.85)';
      ctx.fillRect(0, 0, w, 24);
      ctx.fillStyle = house.status === 'ALERT_ACTIVE' ? '#f87171' : '#e8c678';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const label =
        mode === 'object-before'
          ? `BEFORE SNAPSHOT · ${house.id}`
          : mode === 'object-after'
            ? `AFTER SNAPSHOT · ${house.id}`
            : `SIMULATED FEED · ${house.id} (${house.securityId})`;
      ctx.fillText(label, 10, 15);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(
        house.devices.internetStatus === 'OFFLINE_LOCAL_MODE' ? 'LOCAL BUFFER' : 'DEMO VISUALIZATION',
        w - 10,
        15
      );
    };

    let animFrame = 0;
    let tick = 0;
    drawFrame(tick);

    const shouldAnimate =
      mode === 'live-feed' &&
      (house.sensors.motionSensor === 'DETECTED' || house.devices.cameraStatus === 'OFFLINE_TAMPER');

    if (shouldAnimate) {
      const interval = setInterval(() => {
        tick += 1;
        animFrame = requestAnimationFrame(() => drawFrame(tick));
      }, 140);
      return () => {
        clearInterval(interval);
        cancelAnimationFrame(animFrame);
      };
    }
  }, [house, mode, objectName]);

  return (
    <canvas
      ref={canvasRef}
      width={440}
      height={height}
      className="w-full rounded-xl border border-white/[0.08] bg-[#0d0d12] block"
    />
  );
};

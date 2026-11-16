import * as THREE from 'three';
import { ColonyHouse } from '../types';

export interface ColonySceneHandle {
  group: THREE.Group;
  updateHouseVisuals: (houses: ColonyHouse[], time: number) => void;
  setGateOpen: (open: boolean) => void;
  setGateWarning: (warning: boolean) => void;
  setDayNight: (progress: number) => void;
  update: (delta: number, time: number) => void;
  dispose: () => void;
}

function createSignCanvasTexture(
  text: string,
  subtext: string,
  bgHex: string,
  accentHex: string,
  width = 512,
  height = 128,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(height * 0.34)}px Rajdhani, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, subtext ? height * 0.38 : height * 0.5);

    if (subtext) {
      ctx.fillStyle = accentHex;
      ctx.font = `600 ${Math.round(height * 0.19)}px "JetBrains Mono", monospace`;
      ctx.fillText(subtext, width / 2, height * 0.72);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createHouseNumberTexture(houseId: string, maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 128, 64);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, 122, 58);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(houseId, 64, 33);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function buildResidentialColony(
  parentGroup: THREE.Group,
  houses: ColonyHouse[],
  clickableMeshes: THREE.Mesh[],
  maxAnisotropy = 4
): ColonySceneHandle {
  const colonyGroup = new THREE.Group();
  colonyGroup.name = 'ShantiViharResidentialColony';
  parentGroup.add(colonyGroup);

  const disposableGeos: THREE.BufferGeometry[] = [];
  const disposableMats: THREE.Material[] = [];
  const disposableTexs: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposableMats.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    disposableTexs.push(t);
    return t;
  };

  // ==========================================================
  // 1. SMART CITY MAIN ENTRANCE ARCH (Step 1: x=0, z=235)
  // ==========================================================
  const cityArchGroup = new THREE.Group();
  cityArchGroup.position.set(0, 0, 235);
  colonyGroup.add(cityArchGroup);

  const archSteelMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.25 })
  );
  const archGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    })
  );

  const archPillarGeo = trackGeo(new THREE.BoxGeometry(3.2, 24, 3.2));
  const leftCityPillar = new THREE.Mesh(archPillarGeo, archSteelMat);
  leftCityPillar.position.set(-14, 12, 0);
  leftCityPillar.castShadow = true;
  const rightCityPillar = new THREE.Mesh(archPillarGeo, archSteelMat);
  rightCityPillar.position.set(14, 12, 0);
  rightCityPillar.castShadow = true;
  cityArchGroup.add(leftCityPillar, rightCityPillar);

  const cityCrossBeam = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(34, 4.5, 3.8)), archSteelMat);
  cityCrossBeam.position.set(0, 22, 0);
  cityArchGroup.add(cityCrossBeam);

  const citySignTex = trackTex(
    createSignCanvasTexture(
      'NEXUS SMART CITY',
      'MAIN METROPOLITAN ENTRANCE',
      '#061024',
      '#00f0ff',
      512,
      128,
      maxAnisotropy
    )
  );
  const citySignMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(24, 3.8, 4.1)),
    [
      archSteelMat,
      archSteelMat,
      archSteelMat,
      archSteelMat,
      trackMat(new THREE.MeshBasicMaterial({ map: citySignTex })),
      trackMat(new THREE.MeshBasicMaterial({ map: citySignTex })),
    ]
  );
  citySignMesh.position.set(0, 22, 0);
  citySignMesh.userData = {
    id: 'city-entrance-arch',
    name: 'NEXUS SMART CITY MAIN ENTRANCE',
    zoneId: 'zone-skyline',
  };
  clickableMeshes.push(citySignMesh);
  cityArchGroup.add(citySignMesh);

  const cityArchStrip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(28, 0.35, 4.2)), archGlowMat);
  cityArchStrip.position.set(0, 19.6, 0);
  cityArchGroup.add(cityArchStrip);

  // ==========================================================
  // 2. COLONY GROUND BASE, APPROACH ROAD & INTERNAL STREETS
  // ==========================================================
  // Colony ground slab (warm concrete/earth landscaping substrate over cyber-grid)
  const colonyGroundMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x16202a,
      roughness: 0.92,
      metalness: 0.08,
    })
  );
  const colonyGround = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(286, 0.28, 224)), colonyGroundMat);
  colonyGround.position.set(298, 0.04, 120);
  colonyGround.receiveShadow = true;
  colonyGroup.add(colonyGround);

  // Asphalt road material & sidewalk paving material
  const asphaltMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1b222c,
      roughness: 0.88,
      metalness: 0.1,
    })
  );
  const sidewalkMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
      metalness: 0.05,
    })
  );
  const roadMarkingMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.65,
    })
  );
  const yellowCurbMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.75,
    })
  );

  // Approach Road from Innovation Blvd (x=70) eastbound to Colony Gate (x=160) along z=120
  const approachSidewalk = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(92, 0.24, 18)), sidewalkMat);
  approachSidewalk.position.set(116, 0.12, 120);
  approachSidewalk.receiveShadow = true;
  colonyGroup.add(approachSidewalk);

  const approachRoad = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(92, 0.26, 12)), asphaltMat);
  approachRoad.position.set(116, 0.14, 120);
  approachRoad.receiveShadow = true;
  colonyGroup.add(approachRoad);

  // Approach dashed road stripes
  const dashGeo = trackGeo(new THREE.PlaneGeometry(4.5, 0.55));
  for (let x = 78; x <= 152; x += 10) {
    const dash = new THREE.Mesh(dashGeo, roadMarkingMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(x, 0.29, 120);
    colonyGroup.add(dash);
  }

  // Internal Colony Roads (with sidewalk edges)
  const internalRoadDefs = [
    // Central Colony Avenue (z=120, x=158..432)
    { x: 295, z: 120, w: 274, d: 12, sw: 274, sd: 17 },
    // North Street (z=58, x=182..394)
    { x: 288, z: 58, w: 214, d: 10, sw: 218, sd: 14 },
    // South Street (z=182, x=182..394)
    { x: 288, z: 182, w: 214, d: 10, sw: 218, sd: 14 },
    // West Spine Road (x=182, z=54..186)
    { x: 182, z: 120, w: 10, d: 132, sw: 14, sd: 136 },
    // Mid-West Park Connector (x=242, z=58..182)
    { x: 242, z: 120, w: 9, d: 124, sw: 13, sd: 128 },
    // Mid-East Park Connector (x=302, z=58..182)
    { x: 302, z: 120, w: 9, d: 124, sw: 13, sd: 128 },
    // East Spine Road (x=388, z=28..194)
    { x: 388, z: 112, w: 11, d: 168, sw: 15, sd: 172 },
  ];

  internalRoadDefs.forEach((r) => {
    const swMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(r.sw, 0.22, r.sd)), sidewalkMat);
    swMesh.position.set(r.x, 0.11, r.z);
    swMesh.receiveShadow = true;
    colonyGroup.add(swMesh);

    const rdMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(r.w, 0.26, r.d)), asphaltMat);
    rdMesh.position.set(r.x, 0.14, r.z);
    rdMesh.receiveShadow = true;
    colonyGroup.add(rdMesh);
  });

  // Central Avenue dashed center line
  for (let x = 172; x <= 420; x += 12) {
    const dash = new THREE.Mesh(dashGeo, yellowCurbMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(x, 0.29, 120);
    colonyGroup.add(dash);
  }

  // ==========================================================
  // 3. CENTRAL COMMUNITY PARK (North & South Landscaped Greens)
  // ==========================================================
  const lawnMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9, metalness: 0.02 })
  );
  const parkPathMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85, metalness: 0.05 })
  );
  const gazeboWoodMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7, metalness: 0.1 })
  );
  const benchMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 })
  );

  [90, 150].forEach((parkZ, pIdx) => {
    const parkGroup = new THREE.Group();
    parkGroup.position.set(272, 0.18, parkZ);
    colonyGroup.add(parkGroup);

    const lawn = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(44, 0.25, 32)), lawnMat);
    lawn.receiveShadow = true;
    lawn.userData = {
      id: 'colony-park',
      name: pIdx === 0 ? 'SHANTI VIHAR COMMUNITY PARK (NORTH)' : 'COMMUNITY PLAYGROUND & GAZEBO LAWN',
      zoneId: 'zone-colony',
    };
    clickableMeshes.push(lawn);
    parkGroup.add(lawn);

    // Circular walking track inside park
    const trackRing = new THREE.Mesh(trackGeo(new THREE.RingGeometry(9, 11.5, 28)), parkPathMat);
    trackRing.rotation.x = -Math.PI / 2;
    trackRing.position.y = 0.16;
    parkGroup.add(trackRing);

    // Central Gazebo Pergola
    const gazeboBase = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(4.5, 4.8, 0.4, 8)), parkPathMat);
    gazeboBase.position.y = 0.32;
    parkGroup.add(gazeboBase);

    const postGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 4.2, 6));
    for (let k = 0; k < 4; k++) {
      const ang = (k * Math.PI) / 2 + Math.PI / 4;
      const post = new THREE.Mesh(postGeo, gazeboWoodMat);
      post.position.set(Math.cos(ang) * 3.1, 2.4, Math.sin(ang) * 3.1);
      parkGroup.add(post);
    }

    const gazeboRoof = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(5.2, 2.2, 8)), gazeboWoodMat);
    gazeboRoof.position.y = 5.4;
    gazeboRoof.castShadow = true;
    parkGroup.add(gazeboRoof);

    // Park benches
    const benchGeo = trackGeo(new THREE.BoxGeometry(3.2, 0.7, 1.1));
    [-12, 12].forEach((bx) => {
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(bx, 0.5, 0);
      parkGroup.add(bench);
    });
  });

  // ==========================================================
  // 4. GRAND GATED COLONY ENTRANCE, BOOM BARRIER & GUARD CABIN
  // ==========================================================
  const gateGroup = new THREE.Group();
  gateGroup.position.set(160, 0, 120);
  colonyGroup.add(gateGroup);

  const stonePillarMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.75, metalness: 0.1 })
  );
  const darkMetalMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.8 })
  );

  // Twin Gate Stone Columns
  const gateTowerGeo = trackGeo(new THREE.BoxGeometry(4, 11.5, 4));
  const leftGateTower = new THREE.Mesh(gateTowerGeo, stonePillarMat);
  leftGateTower.position.set(0, 5.75, -10);
  leftGateTower.castShadow = true;
  const rightGateTower = new THREE.Mesh(gateTowerGeo, stonePillarMat);
  rightGateTower.position.set(0, 5.75, 10);
  rightGateTower.castShadow = true;
  gateGroup.add(leftGateTower, rightGateTower);

  // Overhead Residency Nameplate Arch
  const gateArchTex = trackTex(
    createSignCanvasTexture(
      'SHANTI VIHAR RESIDENCY',
      'ENGINEER-X · AI SMART SECURITY COLONY',
      '#0b1324',
      '#22d3ee',
      512,
      128,
      maxAnisotropy
    )
  );
  const gateBeam = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.6, 3.8, 24)),
    [
      trackMat(new THREE.MeshBasicMaterial({ map: gateArchTex })),
      trackMat(new THREE.MeshBasicMaterial({ map: gateArchTex })),
      darkMetalMat,
      darkMetalMat,
      darkMetalMat,
      darkMetalMat,
    ]
  );
  gateBeam.position.set(0, 10.2, 0);
  gateBeam.castShadow = true;
  gateBeam.userData = {
    id: 'colony-main-gate',
    name: 'SHANTI VIHAR MAIN SECURITY GATE',
    zoneId: 'zone-colony',
  };
  clickableMeshes.push(gateBeam);
  gateGroup.add(gateBeam);

  // Gate Status Warning Beacon Light
  const gateBeaconMat = trackMat(
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  );
  const gateBeacon = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.65, 10, 10)), gateBeaconMat);
  gateBeacon.position.set(0, 12.6, 0);
  gateGroup.add(gateBeacon);

  // Automated Boom Barrier Pivot (at x=1.8 inside gate)
  const boomPedestal = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.4, 2.2, 1.4)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.3 }))
  );
  boomPedestal.position.set(2, 1.1, -6.5);
  gateGroup.add(boomPedestal);

  const boomPivot = new THREE.Group();
  boomPivot.position.set(2, 1.9, -6.5);
  gateGroup.add(boomPivot);

  const boomArmMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.35,
      roughness: 0.3,
    })
  );
  const boomArm = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.45, 0.35, 11.5)), boomArmMat);
  boomArm.position.set(0, 0, 5.75);
  boomArm.userData = {
    id: 'colony-main-gate',
    name: 'AUTOMATED BOOM BARRIER',
    zoneId: 'zone-colony',
  };
  clickableMeshes.push(boomArm);
  boomPivot.add(boomArm);

  // White reflective bands on boom arm
  const whiteBandMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  for (let bz = 1.5; bz <= 10.5; bz += 2.2) {
    const band = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.48, 0.37, 0.7)), whiteBandMat);
    band.position.set(0, 0, bz);
    boomPivot.add(band);
  }

  // Clickable Invisible Gate Entry Trigger Zone (transparent opacity 0 so Raycaster reliably hits!)
  const gateHitbox = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(10, 13, 24)),
    trackMat(
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    )
  );
  gateHitbox.position.set(0, 6.5, 0);
  gateHitbox.userData = {
    id: 'colony-main-gate',
    name: 'SHANTI VIHAR MAIN GATE (CLICK TO ENTER)',
    zoneId: 'zone-colony',
  };
  clickableMeshes.push(gateHitbox);
  gateGroup.add(gateHitbox);

  // Security Guard Cabin (right beside gate at x=165, z=104)
  const cabinGroup = new THREE.Group();
  cabinGroup.position.set(166, 0.15, 104);
  colonyGroup.add(cabinGroup);

  const cabinWallMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65, metalness: 0.1 })
  );
  const cabinGlassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.6,
    })
  );
  const cabinBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.5, 5.2, 6.5)), cabinWallMat);
  cabinBody.position.y = 2.6;
  cabinBody.castShadow = true;
  cabinBody.userData = {
    id: 'colony-guard-cabin',
    name: 'COLONY SECURITY GUARD CABIN',
    zoneId: 'zone-colony',
  };
  clickableMeshes.push(cabinBody);
  cabinGroup.add(cabinBody);

  const cabinRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.6, 0.6, 7.6)), darkMetalMat);
  cabinRoof.position.y = 5.5;
  cabinGroup.add(cabinRoof);

  const cabinWindow = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.7, 2.0, 4.6)), cabinGlassMat);
  cabinWindow.position.y = 3.2;
  cabinGroup.add(cabinWindow);

  const cabinSignTex = trackTex(
    createSignCanvasTexture('SECURITY CABIN', '24x7 GUARD DESK', '#0f172a', '#10b981', 256, 64, maxAnisotropy)
  );
  const cabinSign = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.3, 1.2, 4.8)),
    trackMat(new THREE.MeshBasicMaterial({ map: cabinSignTex }))
  );
  cabinSign.position.set(-3.9, 4.7, 0);
  cabinGroup.add(cabinSign);

  // Visitor & Delivery Waiting Bay (x=152..158, z=98..112)
  const bayMat = trackMat(new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 }));
  const visitorBay = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(10, 12)), bayMat);
  visitorBay.rotation.x = -Math.PI / 2;
  visitorBay.position.set(174, 0.29, 92);
  colonyGroup.add(visitorBay);

  // ==========================================================
  // 5. INDEPENDENT EMERGENCY EXIT GATE (East Perimeter x=434, z=120)
  // ==========================================================
  const exitGroup = new THREE.Group();
  exitGroup.position.set(434, 0, 120);
  colonyGroup.add(exitGroup);

  const exitSignTex = trackTex(
    createSignCanvasTexture(
      'EMERGENCY EXIT',
      'FAIL-SAFE OPEN · ALWAYS ACCESSIBLE',
      '#052e16',
      '#22c55e',
      512,
      128,
      maxAnisotropy
    )
  );
  const exitPillar1 = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.4, 9, 2.4)), darkMetalMat);
  exitPillar1.position.set(0, 4.5, -8);
  const exitPillar2 = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.4, 9, 2.4)), darkMetalMat);
  exitPillar2.position.set(0, 4.5, 8);
  const exitBeam = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.2, 2.8, 18)),
    [
      trackMat(new THREE.MeshBasicMaterial({ map: exitSignTex })),
      trackMat(new THREE.MeshBasicMaterial({ map: exitSignTex })),
      darkMetalMat,
      darkMetalMat,
      darkMetalMat,
      darkMetalMat,
    ]
  );
  exitBeam.position.set(0, 8.2, 0);
  exitBeam.userData = {
    id: 'colony-emergency-exit',
    name: 'INDEPENDENT EMERGENCY EXIT GATE',
    zoneId: 'zone-colony',
  };
  clickableMeshes.push(exitBeam);
  exitGroup.add(exitPillar1, exitPillar2, exitBeam);

  // ==========================================================
  // 6. PERIMETER COMPOUND WALL & INSTANCED PILLARS
  // ==========================================================
  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85, metalness: 0.05 })
  );
  // North Wall (z=12, x=160..434)
  const northWall = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(274, 3.2, 0.8)), wallMat);
  northWall.position.set(297, 1.6, 12);
  // South Wall (z=228, x=160..434)
  const southWall = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(274, 3.2, 0.8)), wallMat);
  southWall.position.set(297, 1.6, 228);
  // West Wall segments around Main Gate
  const westWallN = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.8, 3.2, 96)), wallMat);
  westWallN.position.set(160, 1.6, 60);
  const westWallS = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.8, 3.2, 96)), wallMat);
  westWallS.position.set(160, 1.6, 180);
  // East Wall segments around Emergency Exit
  const eastWallN = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.8, 3.2, 98)), wallMat);
  eastWallN.position.set(434, 1.6, 61);
  const eastWallS = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.8, 3.2, 98)), wallMat);
  eastWallS.position.set(434, 1.6, 179);
  colonyGroup.add(northWall, southWall, westWallN, westWallS, eastWallN, eastWallS);

  // Instanced Perimeter Pillars (44 pillars)
  const pillarPositions: [number, number][] = [];
  for (let x = 160; x <= 434; x += 22) {
    pillarPositions.push([x, 12], [x, 228]);
  }
  for (let z = 34; z <= 206; z += 24) {
    if (Math.abs(z - 120) > 14) {
      pillarPositions.push([160, z], [434, z]);
    }
  }
  const wallPillarMesh = new THREE.InstancedMesh(
    trackGeo(new THREE.BoxGeometry(1.4, 4.0, 1.4)),
    stonePillarMat,
    pillarPositions.length
  );
  const dummy = new THREE.Object3D();
  pillarPositions.forEach(([px, pz], idx) => {
    dummy.position.set(px, 2.0, pz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    wallPillarMesh.setMatrixAt(idx, dummy.matrix);
  });
  wallPillarMesh.instanceMatrix.needsUpdate = true;
  wallPillarMesh.computeBoundingSphere();
  colonyGroup.add(wallPillarMesh);

  // ==========================================================
  // 7. 30 REALISTIC INDIAN HOUSES (H-01 TO H-30)
  // ==========================================================
  // Shared Geometries & Materials (Optimized for Intel i5-7200U + NVIDIA 940MX 2GB)
  const plotSlabGeo = trackGeo(new THREE.BoxGeometry(21, 0.35, 21));
  const frontLawnGeo = trackGeo(new THREE.BoxGeometry(8, 0.25, 5));
  const compoundSideGeo = trackGeo(new THREE.BoxGeometry(0.5, 1.8, 20.5));
  const compoundBackGeo = trackGeo(new THREE.BoxGeometry(20.5, 1.8, 0.5));
  const mainBody2Geo = trackGeo(new THREE.BoxGeometry(14, 7.6, 12.5));
  const mainBody3Geo = trackGeo(new THREE.BoxGeometry(14, 11.2, 12.5));
  const upperBandGeo = trackGeo(new THREE.BoxGeometry(14.3, 0.7, 12.8));
  const balconyDeckGeo = trackGeo(new THREE.BoxGeometry(10.5, 0.35, 2.6));
  const balconyRailGeo = trackGeo(new THREE.BoxGeometry(10.5, 1.1, 0.16));
  const chajjaGeo = trackGeo(new THREE.BoxGeometry(4.2, 0.22, 1.1));
  const doorGeo = trackGeo(new THREE.BoxGeometry(2.2, 3.2, 0.25));
  const windowGeo = trackGeo(new THREE.BoxGeometry(2.8, 2.0, 0.22));
  const parapetGeo = trackGeo(new THREE.BoxGeometry(14.4, 1.1, 12.9));
  const plaqueBoxGeo = trackGeo(new THREE.BoxGeometry(2.6, 1.2, 0.25));
  const beaconGeo = trackGeo(new THREE.SphereGeometry(0.7, 10, 10));
  const mastGeo = trackGeo(new THREE.CylinderGeometry(0.12, 0.14, 2.4, 6));

  const plotSlabMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 }));
  const grassPlotMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }));
  const glassBalconyMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55, roughness: 0.15, metalness: 0.7 })
  );
  const doorMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.65, metalness: 0.1 }));
  const houseWinMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    })
  );
  const compoundWallMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xdbe2ea, roughness: 0.8 }));

  // Cache house wall & accent materials by color hex so we only allocate ~6 pairs instead of 60
  const wallMatCache = new Map<number, THREE.MeshStandardMaterial>();
  const accentMatCache = new Map<number, THREE.MeshStandardMaterial>();
  const getWallMat = (hex: number) => {
    let m = wallMatCache.get(hex);
    if (!m) {
      m = trackMat(new THREE.MeshStandardMaterial({ color: hex, roughness: 0.78, metalness: 0.05 }));
      wallMatCache.set(hex, m);
    }
    return m;
  };
  const getAccentMat = (hex: number) => {
    let m = accentMatCache.get(hex);
    if (!m) {
      m = trackMat(new THREE.MeshStandardMaterial({ color: hex, roughness: 0.65, metalness: 0.12 }));
      accentMatCache.set(hex, m);
    }
    return m;
  };

  // Track house beacons & rooftop positions for instanced tanks/solar & live security state colors
  const houseBeaconMap = new Map<
    string,
    {
      beaconMesh: THREE.Mesh;
      beaconMat: THREE.MeshBasicMaterial;
      porchLightMat: THREE.MeshBasicMaterial;
    }
  >();

  const waterTankMatrices: THREE.Matrix4[] = [];
  const solarPanelMatrices: THREE.Matrix4[] = [];
  const carMatrices: { pos: THREE.Vector3; rotY: number; color: number }[] = [];

  houses.forEach((h, idx) => {
    const hGroup = new THREE.Group();
    hGroup.position.set(h.coordinates[0], 0.18, h.coordinates[2]);
    hGroup.rotation.y = h.facingAngle;
    colonyGroup.add(hGroup);

    const wMat = getWallMat(h.wallColor);
    const aMat = getAccentMat(h.accentColor);
    const is3Storey = h.floors === 3;
    const roofY = is3Storey ? 11.4 : 7.8;

    // 1. Ground plot slab & compound walls
    const slab = new THREE.Mesh(plotSlabGeo, plotSlabMat);
    slab.position.y = 0.17;
    slab.receiveShadow = true;
    hGroup.add(slab);

    const lawn = new THREE.Mesh(frontLawnGeo, grassPlotMat);
    lawn.position.set(-4.8, 0.36, 7.2);
    hGroup.add(lawn);

    const leftCW = new THREE.Mesh(compoundSideGeo, compoundWallMat);
    leftCW.position.set(-10.2, 1.0, 0);
    const rightCW = new THREE.Mesh(compoundSideGeo, compoundWallMat);
    rightCW.position.set(10.2, 1.0, 0);
    const backCW = new THREE.Mesh(compoundBackGeo, compoundWallMat);
    backCW.position.set(0, 1.0, -10.2);
    hGroup.add(leftCW, rightCW, backCW);

    // 2. Main House Volume (2 or 3 storeys)
    const body = new THREE.Mesh(is3Storey ? mainBody3Geo : mainBody2Geo, wMat);
    body.position.set(0, is3Storey ? 5.8 : 4.0, -1.6);
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData = {
      id: 'colony-house',
      colonyHouseId: h.id,
      name: `${h.id} · ${h.ownerName}`,
      zoneId: 'zone-colony',
    };
    clickableMeshes.push(body);
    hGroup.add(body);

    // Architectural Accent Band + Rooftop Parapet
    const band = new THREE.Mesh(upperBandGeo, aMat);
    band.position.set(0, is3Storey ? 7.6 : 4.1, -1.6);
    hGroup.add(band);

    const parapet = new THREE.Mesh(parapetGeo, aMat);
    parapet.position.set(0, roofY + 0.55, -1.6);
    hGroup.add(parapet);

    // 3. Balcony & Glass Railing (1st Floor & optional 2nd Floor)
    const balc1 = new THREE.Mesh(balconyDeckGeo, aMat);
    balc1.position.set(-1.2, 4.0, 5.6);
    const rail1 = new THREE.Mesh(balconyRailGeo, glassBalconyMat);
    rail1.position.set(-1.2, 4.7, 6.8);
    hGroup.add(balc1, rail1);

    if (is3Storey) {
      const balc2 = new THREE.Mesh(balconyDeckGeo, aMat);
      balc2.position.set(1.2, 7.6, 5.6);
      const rail2 = new THREE.Mesh(balconyRailGeo, glassBalconyMat);
      rail2.position.set(1.2, 8.3, 6.8);
      hGroup.add(balc2, rail2);
    }

    // 4. Main Door, Windows & Sunshade Chajjas
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(3.2, 1.9, 4.75);
    hGroup.add(door);

    const winCoords: [number, number][] = [
      [-3.4, 2.2],
      [-3.4, 5.6],
      [3.2, 5.6],
    ];
    if (is3Storey) {
      winCoords.push([-3.4, 9.2], [3.2, 9.2]);
    }
    winCoords.forEach(([wx, wy]) => {
      const win = new THREE.Mesh(windowGeo, houseWinMat);
      win.position.set(wx, wy, 4.72);
      const chajja = new THREE.Mesh(chajjaGeo, aMat);
      chajja.position.set(wx, wy + 1.15, 5.15);
      hGroup.add(win, chajja);
    });

    // 5. Front Gate Number Plaque (H-01 .. H-30)
    const plaqueTex = trackTex(createHouseNumberTexture(h.id, maxAnisotropy));
    const plaqueMat = trackMat(new THREE.MeshBasicMaterial({ map: plaqueTex }));
    const plaque = new THREE.Mesh(plaqueBoxGeo, plaqueMat);
    plaque.position.set(6.5, 2.2, 10.2);
    hGroup.add(plaque);

    // Porch Security Camera / Sensor Indicator Light
    const porchLightMat = trackMat(new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    const porchLight = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.32, 8, 8)), porchLightMat);
    porchLight.position.set(3.2, 3.8, 5.1);
    hGroup.add(porchLight);

    // 6. Rooftop AI Security Mast & Status Beacon
    const mast = new THREE.Mesh(mastGeo, darkMetalMat);
    mast.position.set(5.2, roofY + 1.4, -5.0);
    hGroup.add(mast);

    const beaconMat = trackMat(new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(5.2, roofY + 2.8, -5.0);
    hGroup.add(beacon);

    houseBeaconMap.set(h.id, {
      beaconMesh: beacon,
      beaconMat,
      porchLightMat,
    });

    // Compute world transforms for instanced rooftop Sintex Water Tank & Solar Panel
    hGroup.updateMatrixWorld(true);
    const localTank = new THREE.Object3D();
    localTank.position.set(-4.5, roofY + 1.35, -4.5);
    localTank.updateMatrix();
    const worldTankMat = new THREE.Matrix4().multiplyMatrices(hGroup.matrixWorld, localTank.matrix);
    waterTankMatrices.push(worldTankMat);

    const localSolar = new THREE.Object3D();
    localSolar.position.set(0.5, roofY + 0.85, 0.5);
    localSolar.rotation.set(0.28, 0, 0);
    localSolar.updateMatrix();
    const worldSolarMat = new THREE.Matrix4().multiplyMatrices(hGroup.matrixWorld, localSolar.matrix);
    solarPanelMatrices.push(worldSolarMat);

    // Add parked car in driveway for ~40% of homes
    if (idx % 3 === 0 || h.id === 'H-08') {
      const localCar = new THREE.Object3D();
      localCar.position.set(4.5, 0.9, 7.6);
      localCar.updateMatrix();
      const worldCarPos = new THREE.Vector3().setFromMatrixPosition(
        new THREE.Matrix4().multiplyMatrices(hGroup.matrixWorld, localCar.matrix)
      );
      carMatrices.push({
        pos: worldCarPos,
        rotY: h.facingAngle,
        color: idx % 2 === 0 ? 0xe2e8f0 : 0x3b82f6,
      });
    }
  });

  // Instanced Overhead Sintex Water Tanks (30 instances)
  const tankInstanced = new THREE.InstancedMesh(
    trackGeo(new THREE.CylinderGeometry(1.15, 1.15, 2.3, 10)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45, metalness: 0.1 })),
    waterTankMatrices.length
  );
  waterTankMatrices.forEach((m, i) => tankInstanced.setMatrixAt(i, m));
  tankInstanced.instanceMatrix.needsUpdate = true;
  tankInstanced.computeBoundingSphere();
  colonyGroup.add(tankInstanced);

  // Instanced Rooftop Solar Panels (30 instances)
  const solarInstanced = new THREE.InstancedMesh(
    trackGeo(new THREE.BoxGeometry(5.2, 0.16, 3.4)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x0f2b5b, roughness: 0.2, metalness: 0.85 })),
    solarPanelMatrices.length
  );
  solarPanelMatrices.forEach((m, i) => solarInstanced.setMatrixAt(i, m));
  solarInstanced.instanceMatrix.needsUpdate = true;
  solarInstanced.computeBoundingSphere();
  colonyGroup.add(solarInstanced);

  // Instanced Driveway & Visitor Parked Cars
  // Add 3 visitor parked cars near visitor parking bay (x=174, z=92)
  carMatrices.push(
    { pos: new THREE.Vector3(172, 0.9, 88), rotY: Math.PI / 2, color: 0x94a3b8 },
    { pos: new THREE.Vector3(172, 0.9, 95), rotY: Math.PI / 2, color: 0x0ea5e9 },
    { pos: new THREE.Vector3(184, 0.9, 91), rotY: 0, color: 0xf59e0b }
  );
  const carChassisInst = new THREE.InstancedMesh(
    trackGeo(new THREE.BoxGeometry(2.6, 1.1, 4.8)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.65 })),
    carMatrices.length
  );
  const carCabInst = new THREE.InstancedMesh(
    trackGeo(new THREE.BoxGeometry(2.1, 0.8, 2.5)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })),
    carMatrices.length
  );
  const tempColor = new THREE.Color();
  carMatrices.forEach((c, i) => {
    dummy.position.copy(c.pos);
    dummy.rotation.set(0, c.rotY, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    carChassisInst.setMatrixAt(i, dummy.matrix);
    tempColor.setHex(c.color);
    carChassisInst.setColorAt(i, tempColor);

    dummy.position.set(c.pos.x, c.pos.y + 0.85, c.pos.z);
    dummy.updateMatrix();
    carCabInst.setMatrixAt(i, dummy.matrix);
  });
  carChassisInst.instanceMatrix.needsUpdate = true;
  if (carChassisInst.instanceColor) carChassisInst.instanceColor.needsUpdate = true;
  carChassisInst.computeBoundingSphere();
  carCabInst.instanceMatrix.needsUpdate = true;
  carCabInst.computeBoundingSphere();
  colonyGroup.add(carChassisInst, carCabInst);

  // ==========================================================
  // 8. INSTANCED TREES & LANDSCAPING (Approach Road, Park & Streets)
  // ==========================================================
  const treeCoords: [number, number, number][] = [];
  // Approach road boulevard trees (x=82..150, z=108 & 132)
  for (let x = 82; x <= 150; x += 17) {
    treeCoords.push([x, 108, 1.0], [x, 132, 1.0]);
  }
  // Colony central avenue & park trees
  for (let x = 186; x <= 422; x += 26) {
    treeCoords.push([x, 109, 0.92], [x, 131, 0.92]);
  }
  // Park interior shade trees
  treeCoords.push(
    [256, 80, 1.25],
    [288, 80, 1.2],
    [256, 100, 1.15],
    [288, 100, 1.15],
    [256, 140, 1.2],
    [288, 140, 1.2],
    [256, 160, 1.25],
    [288, 160, 1.15],
    // Perimeter corner groves
    [168, 22, 1.1],
    [168, 218, 1.1],
    [424, 22, 1.1],
    [424, 218, 1.1]
  );

  const trunkInst = new THREE.InstancedMesh(
    trackGeo(new THREE.CylinderGeometry(0.35, 0.55, 4.2, 6)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 })),
    treeCoords.length
  );
  const foliageInst = new THREE.InstancedMesh(
    trackGeo(new THREE.DodecahedronGeometry(2.8, 1)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.02 })),
    treeCoords.length
  );
  const foliageTints = [0x15803d, 0x16a34a, 0x22c55e, 0x166534];
  treeCoords.forEach(([tx, tz, scale], idx) => {
    dummy.position.set(tx, 2.1 * scale, tz);
    dummy.rotation.set(0, idx * 0.7, 0);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tx, 5.2 * scale, tz);
    dummy.scale.set(scale, scale * 0.95, scale);
    dummy.updateMatrix();
    foliageInst.setMatrixAt(idx, dummy.matrix);
    tempColor.setHex(foliageTints[idx % foliageTints.length]);
    foliageInst.setColorAt(idx, tempColor);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  foliageInst.instanceMatrix.needsUpdate = true;
  if (foliageInst.instanceColor) foliageInst.instanceColor.needsUpdate = true;
  foliageInst.computeBoundingSphere();
  colonyGroup.add(trunkInst, foliageInst);

  // ==========================================================
  // 9. INSTANCED COLONY STREETLIGHTS (Warm LED Luminaires)
  // ==========================================================
  const lampCoords: [number, number][] = [];
  for (let x = 90; x <= 415; x += 32) {
    lampCoords.push([x, 112.5]);
  }
  for (let x = 192; x <= 380; x += 36) {
    lampCoords.push([x, 51.5], [x, 188.5]);
  }
  const lampPoleInst = new THREE.InstancedMesh(
    trackGeo(new THREE.CylinderGeometry(0.18, 0.28, 9.5, 6)),
    darkMetalMat,
    lampCoords.length
  );
  const lampHeadMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    })
  );
  const lampHeadInst = new THREE.InstancedMesh(
    trackGeo(new THREE.BoxGeometry(1.1, 0.3, 0.7)),
    lampHeadMat,
    lampCoords.length
  );
  const lampPuddleMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })
  );
  const lampPuddleInst = new THREE.InstancedMesh(
    trackGeo(new THREE.CircleGeometry(5.5, 14)),
    lampPuddleMat,
    lampCoords.length
  );

  lampCoords.forEach(([lx, lz], idx) => {
    dummy.position.set(lx, 4.75, lz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    lampPoleInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(lx, 9.5, lz + (lz > 115 ? -0.6 : 0.6));
    dummy.updateMatrix();
    lampHeadInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(lx, 0.3, lz + (lz > 115 ? -1.5 : 1.5));
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.updateMatrix();
    lampPuddleInst.setMatrixAt(idx, dummy.matrix);
  });
  lampPoleInst.instanceMatrix.needsUpdate = true;
  lampPoleInst.computeBoundingSphere();
  lampHeadInst.instanceMatrix.needsUpdate = true;
  lampHeadInst.computeBoundingSphere();
  lampPuddleInst.instanceMatrix.needsUpdate = true;
  lampPuddleInst.computeBoundingSphere();
  colonyGroup.add(lampPoleInst, lampHeadInst, lampPuddleInst);

  // Soft Colony Ambient Fill Light (warm residential glow without extra shadow passes)
  const colonyFillLight = new THREE.PointLight(0xfef3c7, 1.4, 240, 1.2);
  colonyFillLight.position.set(275, 45, 120);
  colonyFillLight.castShadow = false;
  colonyGroup.add(colonyFillLight);

  // ==========================================================
  // 10. SECURITY GUARD OFFICER BESIDE GUARD CABIN
  // ==========================================================
  const guardFigure = new THREE.Group();
  guardFigure.position.set(162.5, 0.28, 110.5);
  guardFigure.rotation.y = Math.PI * 0.15;
  colonyGroup.add(guardFigure);

  const skinMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd9a074, roughness: 0.7 }));
  const guardUniformMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.65 }));
  const darkPantsMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.75 }));
  const guardLegGeo = trackGeo(new THREE.BoxGeometry(0.45, 1.35, 0.45));
  const guardTorsoGeo = trackGeo(new THREE.BoxGeometry(1.1, 1.35, 0.62));
  const guardHeadGeo = trackGeo(new THREE.SphereGeometry(0.42, 10, 10));

  const gLegL = new THREE.Mesh(guardLegGeo, darkPantsMat);
  gLegL.position.set(-0.26, 0.68, 0);
  const gLegR = new THREE.Mesh(guardLegGeo, darkPantsMat);
  gLegR.position.set(0.26, 0.68, 0);
  const gTorso = new THREE.Mesh(guardTorsoGeo, guardUniformMat);
  gTorso.position.set(0, 2.02, 0);
  gTorso.castShadow = true;
  const gHead = new THREE.Mesh(guardHeadGeo, skinMat);
  gHead.position.set(0, 3.05, 0);
  const gCap = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.45, 0.48, 0.28, 10)), darkMetalMat);
  gCap.position.set(0, 3.42, 0);
  guardFigure.add(gLegL, gLegR, gTorso, gHead, gCap);

  // ==========================================================
  // 11. DYNAMIC CONTROLLER STATE
  // ==========================================================
  let targetGateAngle = 0; // 0 = closed, Math.PI / 2.25 = open
  let currentGateAngle = 0;
  let gateWarningActive = false;

  const updateHouseVisuals = (latestHouses: ColonyHouse[], time: number) => {
    latestHouses.forEach((h) => {
      const entry = houseBeaconMap.get(h.id);
      if (!entry) return;
      if (h.status === 'ALERT_ACTIVE') {
        const flash = Math.sin(time * 9) > 0 ? 0xff1e42 : 0x7f1d1d;
        entry.beaconMat.color.setHex(flash);
        entry.porchLightMat.color.setHex(0xff1e42);
      } else if (h.devices.cameraTamper || h.devices.powerSource === 'BATTERY_BACKUP') {
        entry.beaconMat.color.setHex(0xf59e0b);
        entry.porchLightMat.color.setHex(0xf59e0b);
      } else if (h.status === 'AWAY_MODE') {
        entry.beaconMat.color.setHex(0x22d3ee);
        entry.porchLightMat.color.setHex(0x22d3ee);
      } else {
        entry.beaconMat.color.setHex(0x10b981);
        entry.porchLightMat.color.setHex(0x10b981);
      }
    });
  };

  return {
    group: colonyGroup,
    updateHouseVisuals,
    setGateOpen: (open: boolean) => {
      targetGateAngle = open ? Math.PI / 2.25 : 0;
    },
    setGateWarning: (warning: boolean) => {
      gateWarningActive = warning;
    },
    setDayNight: (progress: number) => {
      const nightFactor = THREE.MathUtils.clamp(1.0 - progress, 0, 1);
      lampHeadMat.emissiveIntensity = THREE.MathUtils.lerp(0.15, 1.8, nightFactor);
      lampPuddleMat.opacity = THREE.MathUtils.lerp(0.02, 0.22, nightFactor);
      houseWinMat.emissiveIntensity = THREE.MathUtils.lerp(0.08, 1.05, nightFactor);
      colonyFillLight.intensity = THREE.MathUtils.lerp(0.3, 1.5, nightFactor);
    },
    update: (delta: number, time: number) => {
      currentGateAngle = THREE.MathUtils.damp(currentGateAngle, targetGateAngle, 6, delta);
      boomPivot.rotation.x = currentGateAngle;

      if (gateWarningActive) {
        gateBeaconMat.color.setHex(Math.sin(time * 10) > 0 ? 0xef4444 : 0x7f1d1d);
      } else if (targetGateAngle > 0.2) {
        gateBeaconMat.color.setHex(0x22d3ee);
      } else {
        gateBeaconMat.color.setHex(0x10b981);
      }

      // Guard slight idle alert turn
      guardFigure.rotation.y = Math.PI * 0.15 + Math.sin(time * 0.9) * 0.18;
    },
    dispose: () => {
      parentGroup.remove(colonyGroup);
      disposableGeos.forEach((g) => g.dispose());
      disposableMats.forEach((m) => m.dispose());
      disposableTexs.forEach((t) => t.dispose());
    },
  };
}

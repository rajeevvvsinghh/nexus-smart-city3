import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { ColonyHouse } from '../types';

export interface CityPhysicsContext {
  world: CANNON.World;
  playerMaterial: CANNON.Material;
  roadBodyNames: Map<number, string>;
  buildingBodyNames: Map<number, string>;
  gateBarrierBody: CANNON.Body;
  dispose: () => void;
}

export interface ThirdPersonTelemetry {
  x: number;
  z: number;
  zoneName: string;
  isInsideColony: boolean;
  distToGate: number;
  inGateProximity: boolean;
  nearbyHouse: ColonyHouse | null;
  nearbyLandmarkId: string | null;
  nearbyLandmarkName: string | null;
  nearGuardCabin: boolean;
  nearEmergencyExit: boolean;
  nearSmartBuilding: boolean;
  isWalking: boolean;
  isSprinting: boolean;
  physicsSurface: string;
  physicsContact: string | null;
  isGrounded: boolean;
}

export interface ThirdPersonInputState {
  forward: number; // -1..1
  strafe: number; // -1..1
  sprint: boolean;
  jumpRequested: boolean;
}

interface CityLandmarkInfo {
  id: string;
  name: string;
  x: number;
  z: number;
  halfW: number;
  halfD: number;
  inspectRadius: number;
}

const CITY_LANDMARKS: CityLandmarkInfo[] = [
  { id: 'smart-building', name: 'NEXUS TOWER 01', x: -50, z: -40, halfW: 14, halfD: 14, inspectRadius: 34 },
  { id: 'smart-building-2', name: 'CIVIC CENTER', x: -30, z: 70, halfW: 16, halfD: 16, inspectRadius: 32 },
  { id: 'west-tower', name: 'WEST COMMERCIAL TOWER', x: -70, z: 20, halfW: 11, halfD: 11, inspectRadius: 26 },
  { id: 'south-commerce', name: 'SOUTH COMMERCE TOWER', x: -50, z: 140, halfW: 14, halfD: 14, inspectRadius: 28 },
  { id: 'smart-hospital', name: 'SMART HOSPITAL', x: 30, z: -60, halfW: 13, halfD: 13, inspectRadius: 32 },
  { id: 'medtech-research', name: 'MEDTECH RESEARCH TOWER', x: 10, z: -120, halfW: 14, halfD: 14, inspectRadius: 30 },
  { id: 'genomics-labs', name: 'GENOMICS LABS', x: -60, z: -110, halfW: 12, halfD: 12, inspectRadius: 28 },
  { id: 'north-airhub', name: 'NORTH AIR-HUB', x: -20, z: -170, halfW: 13, halfD: 13, inspectRadius: 28 },
  { id: 'smart-farm', name: 'VERTICAL SKY-FARM', x: 60, z: 20, halfW: 15, halfD: 15, inspectRadius: 32 },
  { id: 'bio-dome', name: 'BIO-DOME TOWER', x: 40, z: 90, halfW: 12, halfD: 12, inspectRadius: 28 },
  { id: 'agri-valley', name: 'AGRI-VALLEY COMMONS', x: 70, z: 150, halfW: 12, halfD: 12, inspectRadius: 28 },
  { id: 'aerospace-logistics', name: 'AEROSPACE LOGISTICS TOWER', x: 80, z: -30, halfW: 13.5, halfD: 13.5, inspectRadius: 30 },
  { id: 'smart-grid', name: 'DISTRICT 02 SMART SUBSTATION', x: 130, z: -100, halfW: 18.5, halfD: 18.5, inspectRadius: 34 },
];

// Reusable math helpers outside animation loop (zero per-frame allocations)
const _camForward = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _camWorldPos = new THREE.Vector3();

function createCharacterBadgeTexture(
  title: string,
  subtitle: string,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 72;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#041224';
    ctx.fillRect(0, 0, 256, 72);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, 250, 66);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 23px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 128, 25);

    ctx.fillStyle = '#34d399';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText(subtitle, 128, 51);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0.72)');
    grad.addColorStop(0.55, 'rgba(2, 6, 23, 0.32)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export const GATE_POSITION = new THREE.Vector2(160, 120);
export const GATE_PROXIMITY_RADIUS = 16.5;

export class ThirdPersonController {
  public readonly group = new THREE.Group();
  public readonly characterGroup = new THREE.Group();
  public readonly playerBody: CANNON.Body;
  private readonly physics: CityPhysicsContext;

  private readonly bodyPivot = new THREE.Group();
  private readonly leftLegPivot = new THREE.Group();
  private readonly rightLegPivot = new THREE.Group();
  private readonly leftArmPivot = new THREE.Group();
  private readonly rightArmPivot = new THREE.Group();
  private readonly badgeMesh: THREE.Mesh;
  private readonly walkerRing: THREE.Mesh;
  private readonly walkerRingMat: THREE.MeshBasicMaterial;
  private readonly destMarker: THREE.Mesh;
  private readonly walkSurfaceMesh: THREE.Mesh;
  private readonly gateSensorRing: THREE.Mesh;
  private readonly gateSensorMat: THREE.MeshBasicMaterial;

  private readonly disposableGeos: THREE.BufferGeometry[] = [];
  private readonly disposableMats: THREE.Material[] = [];
  private readonly disposableTexs: THREE.Texture[] = [];

  private readonly houses: ColonyHouse[];
  private readonly waypointQueue: THREE.Vector2[] = [];

  private isGrounded = true;
  private currentSurfaceName = 'Colony Approach Road';
  private currentBuildingContact: string | null = null;
  private walkCyclePhase = 0;
  private prevGateProximity = false;
  private prevInsideColony = false;
  private currentGateOpen = false;
  private onGateProximityChange?: (inProximity: boolean, enteredColony: boolean, distToGate: number) => void;

  constructor(
    parentGroup: THREE.Group,
    houses: ColonyHouse[],
    clickableMeshes: THREE.Mesh[],
    physics: CityPhysicsContext,
    maxAnisotropy = 4,
    onGateProximityChange?: (inProximity: boolean, enteredColony: boolean, distToGate: number) => void
  ) {
    this.houses = houses;
    this.physics = physics;
    this.onGateProximityChange = onGateProximityChange;
    this.group.name = 'ThirdPersonCharacterController';
    parentGroup.add(this.group);

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      this.disposableGeos.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      this.disposableMats.push(m);
      return m;
    };
    const trackTex = <T extends THREE.Texture>(t: T): T => {
      this.disposableTexs.push(t);
      return t;
    };

    // 1. Create Dynamic cannon-es Character Rigid Body (2-sphere upright capsule with fixedRotation)
    this.playerBody = new CANNON.Body({
      mass: 75,
      material: physics.playerMaterial,
      fixedRotation: true,
      linearDamping: 0.08,
      allowSleep: false,
      position: new CANNON.Vec3(136, 0.3, 120),
    });
    // Lower sphere contacts ground/roads smoothly; upper sphere covers torso/head collisions
    this.playerBody.addShape(new CANNON.Sphere(0.95), new CANNON.Vec3(0, 0.95, 0));
    this.playerBody.addShape(new CANNON.Sphere(0.95), new CANNON.Vec3(0, 2.35, 0));
    this.playerBody.updateMassProperties();
    physics.world.addBody(this.playerBody);

    // 2. Full City & Colony Navigable Ground Raycast Plane (1140 x 840)
    this.walkSurfaceMesh = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(1140, 840)),
      trackMat(
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        })
      )
    );
    this.walkSurfaceMesh.rotation.x = -Math.PI / 2;
    this.walkSurfaceMesh.position.set(125, 0.28, 20);
    this.walkSurfaceMesh.userData = {
      id: 'city-walk-surface',
      walkSurface: true,
    };
    clickableMeshes.push(this.walkSurfaceMesh);
    this.group.add(this.walkSurfaceMesh);

    // 3. Physical Proximity Sensor Ring on Asphalt at Colony Gate Threshold (x=160, z=120)
    this.gateSensorMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      })
    );
    this.gateSensorRing = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(GATE_PROXIMITY_RADIUS - 0.8, GATE_PROXIMITY_RADIUS, 40)),
      this.gateSensorMat
    );
    this.gateSensorRing.rotation.x = -Math.PI / 2;
    this.gateSensorRing.position.set(GATE_POSITION.x, 0.35, GATE_POSITION.y);
    this.group.add(this.gateSensorRing);

    // 4. Composite 11-Part Articulated 3D Character Avatar (synced to cannon-es playerBody)
    this.characterGroup.name = 'UserCharacterAvatar';
    this.characterGroup.position.set(136, this.groundHeightAt(136, 120), 120);
    this.characterGroup.rotation.y = Math.PI / 2; // Facing +X toward Shanti Vihar Gate
    this.group.add(this.characterGroup);

    const skinMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd9a074, roughness: 0.72, metalness: 0.05 }));
    const jacketMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.42, metalness: 0.18 }));
    const trimMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x0891b2,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.6,
      })
    );
    const visorMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 1.1,
        roughness: 0.12,
        metalness: 0.85,
      })
    );
    const pantsMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.05 }));
    const hairMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.88, metalness: 0.02 }));
    const shoeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, metalness: 0.1 }));

    const legGeo = trackGeo(new THREE.BoxGeometry(0.46, 1.45, 0.48));
    legGeo.translate(0, -0.725, 0);
    const armGeo = trackGeo(new THREE.BoxGeometry(0.35, 1.25, 0.38));
    armGeo.translate(0, -0.62, 0);

    this.leftLegPivot.position.set(-0.3, 1.5, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.castShadow = true;
    const leftShoe = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.48, 0.26, 0.74)), shoeMat);
    leftShoe.position.set(0, -1.35, 0.12);
    this.leftLegPivot.add(leftLegMesh, leftShoe);

    this.rightLegPivot.position.set(0.3, 1.5, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.castShadow = true;
    const rightShoe = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.48, 0.26, 0.74)), shoeMat);
    rightShoe.position.set(0, -1.35, 0.12);
    this.rightLegPivot.add(rightLegMesh, rightShoe);

    this.bodyPivot.position.set(0, 1.5, 0);
    const torsoMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.18, 1.45, 0.66)), jacketMat);
    torsoMesh.position.set(0, 0.72, 0);
    torsoMesh.castShadow = true;

    const chestBeaconMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.38, 0.38, 0.1)), trimMat);
    chestBeaconMesh.position.set(0, 0.92, 0.35);

    const backpackMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.84, 1.0, 0.32)), trimMat);
    backpackMesh.position.set(0, 0.78, -0.42);

    const headMesh = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.45, 14, 14)), skinMat);
    headMesh.position.set(0, 1.88, 0);
    headMesh.castShadow = true;

    const visorMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.7, 0.18, 0.2)), visorMat);
    visorMesh.position.set(0, 1.9, 0.38);

    const hairMesh = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.47, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58)),
      hairMat
    );
    hairMesh.position.set(0, 1.94, -0.02);

    this.leftArmPivot.position.set(-0.78, 1.35, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, jacketMat);
    leftArmMesh.castShadow = true;
    this.leftArmPivot.add(leftArmMesh);

    this.rightArmPivot.position.set(0.78, 1.35, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, jacketMat);
    rightArmMesh.castShadow = true;
    this.rightArmPivot.add(rightArmMesh);

    this.bodyPivot.add(
      torsoMesh,
      chestBeaconMesh,
      backpackMesh,
      headMesh,
      visorMesh,
      hairMesh,
      this.leftArmPivot,
      this.rightArmPivot
    );

    // Contact shadow plane directly under feet
    const contactShadowTex = trackTex(createContactShadowTexture());
    const contactShadow = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(3.2, 3.2)),
      trackMat(
        new THREE.MeshBasicMaterial({
          map: contactShadowTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.65,
        })
      )
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.04;

    // Base beacon ring under character feet
    this.walkerRingMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
      })
    );
    this.walkerRing = new THREE.Mesh(trackGeo(new THREE.RingGeometry(1.15, 1.65, 28)), this.walkerRingMat);
    this.walkerRing.rotation.x = -Math.PI / 2;
    this.walkerRing.position.y = 0.08;

    // Overhead billboarded nameplate badge
    const badgeTex = trackTex(createCharacterBadgeTexture('RESIDENT EXPLORER', 'WASD + CANNON-ES', maxAnisotropy));
    this.badgeMesh = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(4.6, 1.28)),
      trackMat(new THREE.MeshBasicMaterial({ map: badgeTex, side: THREE.DoubleSide }))
    );
    this.badgeMesh.position.set(0, 4.75, 0);

    // Generous transparent click hitbox around the character
    const hitbox = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(4.6, 6.4, 4.6)),
      trackMat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
    );
    hitbox.position.set(0, 2.8, 0);
    hitbox.userData = {
      id: 'colony-entry-person',
      name: 'RESIDENT EXPLORER (3P CONTROLLER)',
      zoneId: 'zone-colony',
    };
    clickableMeshes.push(hitbox);

    this.characterGroup.add(
      this.leftLegPivot,
      this.rightLegPivot,
      this.bodyPivot,
      contactShadow,
      this.walkerRing,
      this.badgeMesh,
      hitbox
    );

    // 5. Animated Ground Destination Marker Ring
    this.destMarker = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(1.05, 1.65, 24)),
      trackMat(
        new THREE.MeshBasicMaterial({
          color: 0x34d399,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
        })
      )
    );
    this.destMarker.rotation.x = -Math.PI / 2;
    this.destMarker.position.set(136, 0.36, 120);
    this.destMarker.visible = false;
    this.group.add(this.destMarker);
  }

  public groundHeightAt(x: number, z: number): number {
    if (x >= 160 && x <= 434 && z >= 12 && z <= 228) {
      return 0.3;
    }
    return 0.28;
  }

  public setGateOpenState(open: boolean) {
    this.currentGateOpen = open;
  }

  public getPosition(): THREE.Vector3 {
    return this.characterGroup.position.clone();
  }

  public getHeading(): number {
    return this.characterGroup.rotation.y;
  }

  public isWalking(): boolean {
    return this.waypointQueue.length > 0;
  }

  public getActiveDestination(): { x: number; z: number } | null {
    if (this.waypointQueue.length === 0) return null;
    const last = this.waypointQueue[this.waypointQueue.length - 1];
    return { x: last.x, z: last.y };
  }

  public clearWaypoints() {
    this.waypointQueue.length = 0;
    this.destMarker.visible = false;
  }

  public walkTo(x: number, z: number) {
    const targetX = THREE.MathUtils.clamp(x, -126, 430);
    const targetZ = THREE.MathUtils.clamp(z, -210, 224);
    this.waypointQueue.length = 0;

    const curX = this.playerBody.position.x;
    const curZ = this.playerBody.position.z;
    const curInColonyBand = curZ >= 12 && curZ <= 228;
    const targetInColonyBand = targetZ >= 12 && targetZ <= 228;

    // Smart auto-routing through Shanti Vihar Main Gate (160, 120) when entering from Approach Road / City
    if (curX < 157 && targetX >= 159 && targetInColonyBand) {
      if (curX < 75) {
        this.waypointQueue.push(new THREE.Vector2(76, 120));
      }
      this.waypointQueue.push(
        new THREE.Vector2(146, 120),
        new THREE.Vector2(160, 120),
        new THREE.Vector2(174, 120)
      );
    } else if (curX > 163 && curInColonyBand && targetX < 157) {
      // Routing cleanly back out through the Main Security Gate toward Smart Building / City
      this.waypointQueue.push(
        new THREE.Vector2(172, 120),
        new THREE.Vector2(158, 120),
        new THREE.Vector2(144, 120)
      );
    }

    this.waypointQueue.push(new THREE.Vector2(targetX, targetZ));
    this.destMarker.position.set(targetX, this.groundHeightAt(targetX, targetZ) + 0.08, targetZ);
    this.destMarker.visible = true;
  }

  public teleportTo(x: number, z: number, facingRad = Math.PI / 2) {
    this.clearWaypoints();
    const gy = this.groundHeightAt(x, z) + 0.04;
    this.playerBody.position.set(x, gy, z);
    this.playerBody.velocity.set(0, 0, 0);
    this.playerBody.wakeUp();
    this.characterGroup.position.set(x, gy, z);
    this.characterGroup.rotation.y = facingRad;
    this.isGrounded = true;
  }

  public triggerJump() {
    if (this.isGrounded) {
      this.playerBody.velocity.y = 12.2;
      this.playerBody.wakeUp();
      this.isGrounded = false;
    }
  }

  private samplePhysicsContacts() {
    let groundedNow = false;
    let surfaceName = 'Airborne';
    let buildingHit: string | null = null;

    const contacts = this.physics.world.contacts;
    for (let i = 0; i < contacts.length; i++) {
      const c = contacts[i];
      if (c.bi !== this.playerBody && c.bj !== this.playerBody) continue;

      const other = c.bi === this.playerBody ? c.bj : c.bi;
      // Normal pointing upward onto playerBody
      const upDot = c.bj === this.playerBody ? c.ni.y : -c.ni.y;

      if (upDot > 0.55) {
        groundedNow = true;
        const roadName = this.physics.roadBodyNames.get(other.id);
        if (roadName) {
          surfaceName = roadName;
        } else if (surfaceName === 'Airborne') {
          surfaceName = 'City Terrain';
        }
      } else if (Math.abs(upDot) < 0.5) {
        const bName = this.physics.buildingBodyNames.get(other.id);
        if (bName) {
          buildingHit = bName;
        }
      }
    }

    // Fallback ground safeguard if resting flush on world floor slab
    if (!groundedNow && this.playerBody.position.y <= 0.34 && Math.abs(this.playerBody.velocity.y) < 0.35) {
      groundedNow = true;
      surfaceName = 'City Terrain';
    }

    this.isGrounded = groundedNow;
    this.currentSurfaceName = groundedNow ? surfaceName : 'Airborne';
    this.currentBuildingContact = buildingHit;
  }

  public computeTelemetry(movingNow: boolean, sprintingNow: boolean): ThirdPersonTelemetry {
    const px = this.characterGroup.position.x;
    const pz = this.characterGroup.position.z;

    const distToGate = Math.hypot(px - GATE_POSITION.x, pz - GATE_POSITION.y);
    const inGateProximity = distToGate <= GATE_PROXIMITY_RADIUS;
    const isInsideColony = px >= 160 && px <= 434 && pz >= 12 && pz <= 228;

    let zoneName = 'NEXUS Smart City Core';
    if (inGateProximity) {
      zoneName = isInsideColony ? 'Colony Gate · Entry Cleared' : 'Main Security Checkpoint';
    } else if (isInsideColony) {
      if (px >= 246 && px <= 298 && pz >= 72 && pz <= 168) {
        zoneName = 'Community Park & Gazebo';
      } else {
        zoneName = 'Shanti Vihar Residency';
      }
    } else if (px >= 68 && px < 160 && pz >= 100 && pz <= 140) {
      zoneName = 'Colony Approach Road';
    } else if (Math.hypot(px - -50, pz - -40) <= 55) {
      zoneName = 'NEXUS Tower 01 Plaza';
    } else if (Math.hypot(px - 30, pz - -60) <= 45) {
      zoneName = 'Biomedical & Smart Hospital';
    } else if (Math.hypot(px - 60, pz - 20) <= 42) {
      zoneName = 'Vertical Sky-Farm Corridor';
    }

    let nearbyHouse: ColonyHouse | null = null;
    let bestHouseDist = 19;
    for (let i = 0; i < this.houses.length; i++) {
      const h = this.houses[i];
      const d = Math.hypot(px - h.coordinates[0], pz - h.coordinates[2]);
      if (d < bestHouseDist) {
        bestHouseDist = d;
        nearbyHouse = h;
      }
    }

    let nearbyLandmarkId: string | null = null;
    let nearbyLandmarkName: string | null = null;
    if (!nearbyHouse) {
      let bestLmDist = Infinity;
      for (let i = 0; i < CITY_LANDMARKS.length; i++) {
        const lm = CITY_LANDMARKS[i];
        const d = Math.hypot(px - lm.x, pz - lm.z);
        if (d <= lm.inspectRadius && d < bestLmDist) {
          bestLmDist = d;
          nearbyLandmarkId = lm.id;
          nearbyLandmarkName = lm.name;
        }
      }
    }

    const nearGuardCabin = Math.hypot(px - 166, pz - 104) <= 14;
    const nearEmergencyExit = Math.hypot(px - 434, pz - 120) <= 15;
    const nearSmartBuilding = Math.hypot(px - -50, pz - -40) <= 38;

    return {
      x: px,
      z: pz,
      zoneName,
      isInsideColony,
      distToGate,
      inGateProximity,
      nearbyHouse,
      nearbyLandmarkId,
      nearbyLandmarkName,
      nearGuardCabin,
      nearEmergencyExit,
      nearSmartBuilding,
      isWalking: movingNow,
      isSprinting: sprintingNow,
      physicsSurface: this.currentSurfaceName,
      physicsContact: this.currentBuildingContact,
      isGrounded: this.isGrounded,
    };
  }

  public update(
    delta: number,
    time: number,
    camera: THREE.Camera,
    input: ThirdPersonInputState
  ): { deltaX: number; deltaZ: number; telemetry: ThirdPersonTelemetry } {
    const prevX = this.characterGroup.position.x;
    const prevZ = this.characterGroup.position.z;

    if (input.jumpRequested) {
      this.triggerJump();
    }

    const manualActive = Math.abs(input.forward) > 0.01 || Math.abs(input.strafe) > 0.01;
    let movingNow = false;
    let targetVx = 0;
    let targetVz = 0;

    const speed = input.sprint ? 34 : 20;

    if (manualActive) {
      this.clearWaypoints();
      camera.getWorldDirection(_camForward);
      _camForward.y = 0;
      if (_camForward.lengthSq() < 0.0001) _camForward.set(1, 0, 0);
      _camForward.normalize();
      _camRight.set(-_camForward.z, 0, _camForward.x);

      const dirX = _camForward.x * input.forward + _camRight.x * input.strafe;
      const dirZ = _camForward.z * input.forward + _camRight.z * input.strafe;
      const len = Math.hypot(dirX, dirZ);
      if (len > 0.001) {
        targetVx = (dirX / len) * speed;
        targetVz = (dirZ / len) * speed;
        movingNow = true;
      }
    } else if (this.waypointQueue.length > 0) {
      const target = this.waypointQueue[0];
      const wx = target.x - this.playerBody.position.x;
      const wz = target.y - this.playerBody.position.z;
      const dist = Math.hypot(wx, wz);
      const wpSpeed = input.sprint ? 30 : 21;
      if (dist <= 0.75) {
        this.waypointQueue.shift();
        if (this.waypointQueue.length === 0) {
          this.destMarker.visible = false;
        }
      } else {
        targetVx = (wx / dist) * wpSpeed;
        targetVz = (wz / dist) * wpSpeed;
        movingNow = true;
      }
    }

    // Update dynamic cannon-es Main Gate Barrier collider (blocks unless open or in proximity trigger)
    const distGateBody = Math.hypot(
      this.playerBody.position.x - GATE_POSITION.x,
      this.playerBody.position.z - GATE_POSITION.y
    );
    const gateAllowPass = this.currentGateOpen || distGateBody <= GATE_PROXIMITY_RADIUS;
    this.physics.gateBarrierBody.collisionResponse = !gateAllowPass;

    // Drive cannon-es RigidBody horizontal velocity while preserving gravity/jumps
    if (movingNow) {
      this.playerBody.velocity.x = THREE.MathUtils.lerp(this.playerBody.velocity.x, targetVx, Math.min(1, delta * 16));
      this.playerBody.velocity.z = THREE.MathUtils.lerp(this.playerBody.velocity.z, targetVz, Math.min(1, delta * 16));
      this.playerBody.wakeUp();
    } else {
      this.playerBody.velocity.x = THREE.MathUtils.damp(this.playerBody.velocity.x, 0, 14, delta);
      this.playerBody.velocity.z = THREE.MathUtils.damp(this.playerBody.velocity.z, 0, 14, delta);
    }

    // Step cannon-es physics world
    this.physics.world.step(1 / 60, delta, 4);

    // Keep player inside outer world perimeter safeguard
    this.playerBody.position.x = THREE.MathUtils.clamp(this.playerBody.position.x, -128, 444);
    this.playerBody.position.z = THREE.MathUtils.clamp(this.playerBody.position.z, -215, 240);
    if (this.playerBody.position.y < 0.25) {
      this.playerBody.position.y = 0.28;
      if (this.playerBody.velocity.y < 0) this.playerBody.velocity.y = 0;
    }

    // Sample cannon-es contact manifold for road/ground & building collisions
    this.samplePhysicsContacts();

    // Sync visual character mesh directly from cannon-es rigid body transform
    this.characterGroup.position.set(
      this.playerBody.position.x,
      this.playerBody.position.y,
      this.playerBody.position.z
    );

    const actualDx = this.characterGroup.position.x - prevX;
    const actualDz = this.characterGroup.position.z - prevZ;
    const actualMoved = Math.hypot(actualDx, actualDz);

    if (movingNow && actualMoved > 0.002) {
      const desiredYaw = Math.atan2(actualDx, actualDz);
      let diff = desiredYaw - this.characterGroup.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.characterGroup.rotation.y += diff * Math.min(1, delta * 12);

      // Stride Gait Animation
      this.walkCyclePhase += delta * (input.sprint ? 16 : 11);
      const amp = input.sprint ? 0.85 : 0.65;
      const swing = Math.sin(this.walkCyclePhase) * amp;
      this.leftLegPivot.rotation.x = swing;
      this.rightLegPivot.rotation.x = -swing;
      this.leftArmPivot.rotation.x = -swing * 0.8;
      this.rightArmPivot.rotation.x = swing * 0.8;
      this.bodyPivot.position.y = 1.5 + Math.abs(Math.sin(this.walkCyclePhase * 2)) * 0.09;
    } else {
      this.leftLegPivot.rotation.x = THREE.MathUtils.damp(this.leftLegPivot.rotation.x, 0, 10, delta);
      this.rightLegPivot.rotation.x = THREE.MathUtils.damp(this.rightLegPivot.rotation.x, 0, 10, delta);
      this.leftArmPivot.rotation.x = THREE.MathUtils.damp(this.leftArmPivot.rotation.x, 0, 10, delta);
      this.rightArmPivot.rotation.x = THREE.MathUtils.damp(this.rightArmPivot.rotation.x, 0, 10, delta);
      this.bodyPivot.position.y = 1.5 + Math.sin(time * 2.5) * 0.03;
    }

    // Keep overhead nameplate cleanly facing camera
    camera.getWorldPosition(_camWorldPos);
    this.badgeMesh.lookAt(_camWorldPos);

    // Animate ground rings
    const ringScale = 1 + Math.sin(time * 4) * 0.08;
    this.walkerRing.scale.set(ringScale, ringScale, 1);
    if (this.destMarker.visible) {
      const dScale = 1 + Math.sin(time * 6) * 0.16;
      this.destMarker.scale.set(dScale, dScale, 1);
    }

    // Physical Proximity Check to Colony Main Security Gate
    const telemetry = this.computeTelemetry(movingNow, movingNow && input.sprint);
    this.gateSensorMat.color.setHex(telemetry.inGateProximity ? 0x10b981 : 0x22d3ee);
    this.gateSensorMat.opacity = telemetry.inGateProximity ? 0.68 : 0.28;
    this.walkerRingMat.color.setHex(telemetry.isInsideColony ? 0x10b981 : 0x22d3ee);

    if (
      telemetry.inGateProximity !== this.prevGateProximity ||
      telemetry.isInsideColony !== this.prevInsideColony
    ) {
      this.prevGateProximity = telemetry.inGateProximity;
      this.prevInsideColony = telemetry.isInsideColony;
      this.onGateProximityChange?.(
        telemetry.inGateProximity,
        telemetry.isInsideColony,
        telemetry.distToGate
      );
    }

    return {
      deltaX: actualDx,
      deltaZ: actualDz,
      telemetry,
    };
  }

  public dispose() {
    this.physics.world.removeBody(this.playerBody);
    this.group.parent?.remove(this.group);
    this.disposableGeos.forEach((g) => g.dispose());
    this.disposableMats.forEach((m) => m.dispose());
    this.disposableTexs.forEach((t) => t.dispose());
  }
}

import * as THREE from "three";

export interface ShardDef {
  startPos: THREE.Vector3;
  velocity: THREE.Vector3;
  angVelX: number;
  angVelY: number;
  angVelZ: number;
  scaleX: number;
  scaleY: number;
  groundTime: number; // t [0,1] when shard hits floor
}

/** Impact world position when phone hits ground (progress=0.35) */
export const IMPACT_WORLD = new THREE.Vector3(-0.1, -0.5, 0.055);

const GRAVITY = -5.5;
const GROUND_Y = -1.55; // relative to scene root

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = ((s * 1664525 + 1013904223) | 0) >>> 0;
    return s / 0xffffffff;
  };
}

export function generateShards(count: number): ShardDef[] {
  const rand = lcg(1337);
  const shards: ShardDef[] = [];

  for (let i = 0; i < count; i++) {
    const startPos = new THREE.Vector3(
      IMPACT_WORLD.x + (rand() - 0.5) * 0.22,
      IMPACT_WORLD.y + (rand() - 0.5) * 0.18,
      IMPACT_WORLD.z,
    );

    const angle = rand() * Math.PI * 2;
    const speed = 1.2 + rand() * 2.8;
    const velocity = new THREE.Vector3(
      Math.cos(angle) * speed * (0.5 + rand() * 0.5),
      0.8 + rand() * 2.2 + speed * 0.25,
      (rand() - 0.5) * speed * 0.4 + 0.3,
    );

    // Solve for when shard hits GROUND_Y:
    // sy + vy*t + 0.5*g*t² = GROUND_Y
    const a = 0.5 * GRAVITY;
    const b = velocity.y;
    const c = startPos.y - GROUND_Y;
    const disc = b * b - 4 * a * c;
    let gt = 1.0;
    if (disc >= 0) {
      const t1 = (-b + Math.sqrt(disc)) / (2 * a);
      const t2 = (-b - Math.sqrt(disc)) / (2 * a);
      const tHit = Math.max(t1, t2);
      gt = Math.min(Math.max(tHit, 0), 1.0);
    }

    shards.push({
      startPos,
      velocity,
      angVelX: (rand() - 0.5) * 18,
      angVelY: (rand() - 0.5) * 18,
      angVelZ: (rand() - 0.5) * 18,
      scaleX: 0.014 + rand() * 0.028,
      scaleY: 0.012 + rand() * 0.022,
      groundTime: gt,
    });
  }
  return shards;
}

// Reusable temporaries to avoid GC pressure in useFrame
const _pos  = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scl  = new THREE.Vector3();
const _euler = new THREE.Euler();

/**
 * Write the InstancedMesh matrix for shard[i] at time t [0,1].
 * t = 0 → at impact position (shards just born)
 * t = 1 → fully dispersed (or reversed back to origin)
 */
export function applyShardMatrix(
  shard: ShardDef,
  t: number,
  mesh: THREE.InstancedMesh,
  index: number,
): void {
  const tClamped = Math.min(t, shard.groundTime);

  _pos.set(
    shard.startPos.x + shard.velocity.x * tClamped,
    shard.startPos.y + shard.velocity.y * tClamped + 0.5 * GRAVITY * tClamped * tClamped,
    shard.startPos.z + shard.velocity.z * tClamped,
  );

  if (t >= shard.groundTime) {
    _pos.y = shard.startPos.y
      + shard.velocity.y * shard.groundTime
      + 0.5 * GRAVITY * shard.groundTime * shard.groundTime;
  }

  _euler.set(
    shard.angVelX * tClamped,
    shard.angVelY * tClamped,
    shard.angVelZ * tClamped,
  );
  _quat.setFromEuler(_euler);

  _scl.set(shard.scaleX, shard.scaleY, 0.003);

  const m4 = new THREE.Matrix4();
  m4.compose(_pos, _quat, _scl);
  mesh.setMatrixAt(index, m4);
}

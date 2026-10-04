import { Vector } from './vector';
import { Forces } from './forces';
import { Collision } from './collision';
import { Thermo } from './thermo';
import { Fields } from './fields';
import { ParticleSystem, type ParticleSystemOptions } from './particles';

export const Physics = {
  Vector,
  vec2: Vector,
  Forces,
  forces: Forces,
  Collision,
  collision: Collision,
  Thermo,
  thermo: Thermo,
  Fields,
  fields: Fields,
  ParticleSystem,
  createParticleSystem(options: ParticleSystemOptions): ParticleSystem {
    return new ParticleSystem(options);
  },
};

// Expose on globalThis so user scripts running in Worker, Node, or Window can access `Physics` directly
if (typeof globalThis !== 'undefined') {
  (globalThis as unknown as { Physics: typeof Physics }).Physics = Physics;
}

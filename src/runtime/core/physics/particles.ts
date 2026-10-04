import { Collision, type BoxBounds } from './collision';
import { Thermo } from './thermo';

export interface ParticleSystemOptions {
  count: number;
  bounds: BoxBounds;
  radius?: number;
  mass?: number;
  temperature?: number;
  restitution?: number;
}

export class ParticleSystem {
  readonly count: number;
  readonly radius: number;
  readonly mass: number;
  bounds: BoxBounds;
  restitution: number;

  readonly px: Float64Array;
  readonly py: Float64Array;
  readonly vx: Float64Array;
  readonly vy: Float64Array;

  private accumulatedImpulse = 0;
  private impulseTime = 0;
  private currentPressure = 0;

  constructor(options: ParticleSystemOptions) {
    this.count = options.count;
    this.bounds = { ...options.bounds };
    this.radius = options.radius ?? 0.08;
    this.mass = options.mass ?? 1.0;
    this.restitution = options.restitution ?? 1.0;

    this.px = new Float64Array(this.count);
    this.py = new Float64Array(this.count);
    this.vx = new Float64Array(this.count);
    this.vy = new Float64Array(this.count);

    this.initPositionsAndVelocities(options.temperature ?? 1.0);
  }

  private initPositionsAndVelocities(temperature: number): void {
    const spanX = (this.bounds.maxX - this.bounds.minX) - 4 * this.radius;
    const spanY = (this.bounds.maxY - this.bounds.minY) - 4 * this.radius;

    for (let i = 0; i < this.count; i++) {
      this.px[i] = this.bounds.minX + 2 * this.radius + Math.random() * spanX;
      this.py[i] = this.bounds.minY + 2 * this.radius + Math.random() * spanY;

      const v = Thermo.sampleMaxwellBoltzmann2D(temperature, this.mass);
      this.vx[i] = v.vx;
      this.vy[i] = v.vy;
    }
  }

  step(dt: number, thermostatTargetT?: number): void {
    // 1. Advance positions
    for (let i = 0; i < this.count; i++) {
      this.px[i] += this.vx[i] * dt;
      this.py[i] += this.vy[i] * dt;
    }

    // 2. Resolve inter-particle and wall collisions
    const result = Collision.resolveParticleArrays(
      this.px,
      this.py,
      this.vx,
      this.vy,
      this.count,
      this.radius,
      this.mass,
      this.bounds,
      this.restitution
    );

    // 3. Track pressure
    this.accumulatedImpulse += result.wallImpulse;
    this.impulseTime += dt;

    if (this.impulseTime >= 0.2) {
      const perimeter =
        2 * ((this.bounds.maxX - this.bounds.minX) + (this.bounds.maxY - this.bounds.minY));
      this.currentPressure = Thermo.pressure(this.accumulatedImpulse, this.impulseTime, perimeter);
      this.accumulatedImpulse = 0;
      this.impulseTime = 0;
    }

    // 4. Thermostat if requested
    if (thermostatTargetT !== undefined && thermostatTargetT > 0) {
      const curT = this.getTemperature();
      Thermo.applyBerendsenThermostat(
        this.vx,
        this.vy,
        this.count,
        thermostatTargetT,
        curT,
        dt,
        0.4
      );
    }
  }

  getTemperature(): number {
    return Thermo.temperature2D(this.vx, this.vy, this.count, this.mass);
  }

  getPressure(): number {
    return this.currentPressure;
  }

  getKineticEnergy(): number {
    let sum = 0;
    for (let i = 0; i < this.count; i++) {
      sum += 0.5 * this.mass * (this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i]);
    }
    return sum;
  }
}

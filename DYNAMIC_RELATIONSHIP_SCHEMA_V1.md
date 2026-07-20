# DYNAMIC ENGINEERING RELATIONSHIP SCHEMA V1

Status: Approved for animation-ready foundation
Schema version: `1.0.0`
Owner: ChatGPT
Date: 2026-07-20

## 1. Purpose

This specification defines how objects will be connected for future engineering-based motion and simulation. Early phases shall store and validate these relationships but shall not yet run full machine animation or physics.

The model separates:

1. Geometry.
2. Object hierarchy.
3. Engineering relationships.
4. Motion state.
5. Simulation logic.
6. Visual animation.

## 2. Engineering chain example

```text
Motor → Gearbox → Drive Pulley → Conveyor Belt → Cookie
```

The motor is a power source, the gearbox modifies speed and torque, the pulley converts rotation to belt linear speed, the belt transports the product, and the product orientation and position update relative to the transport path.

## 3. Relationship record

```json
{
  "relationshipId": "REL-0001",
  "type": "drives",
  "sourceObjectId": "motor-001",
  "targetObjectId": "gearbox-001",
  "sourceConnectorId": "shaft-output",
  "targetConnectorId": "shaft-input",
  "enabled": true,
  "status": "configured",
  "parameters": {},
  "validation": {
    "status": "not_evaluated",
    "messages": []
  }
}
```

## 4. Supported relationship types

### Mechanical power

- `drives`
- `transmitsPowerTo`
- `rotates`
- `coupledTo`
- `gearCoupledTo`
- `beltCoupledTo`

### Product transport

- `carries`
- `follows`
- `feeds`
- `receives`
- `transfersTo`
- `accumulates`
- `indexes`
- `pushes`
- `blocks`

### Structural and load

- `supports`
- `mountedOn`
- `attachedTo`
- `loads`

### Control and inspection

- `detects`
- `tracks`
- `rejects`
- `stops`
- `enables`
- `interlocks`

## 5. Dynamic object roles

Allowed roles:

- `driver`
- `transmission`
- `transporter`
- `payload`
- `support`
- `sensor`
- `actuator`
- `processor`
- `buffer`
- `rejector`
- `static_structure`

An object may have more than one role.

## 6. Motor properties

Minimum future-ready motor properties:

```json
{
  "motor": {
    "ratedPowerKw": 1.5,
    "ratedSpeedRpm": 1450,
    "ratedTorqueNm": 9.88,
    "efficiency": 0.88,
    "rotationDirection": "clockwise",
    "accelerationTimeSec": 1.5,
    "decelerationTimeSec": 1.5,
    "state": "stopped",
    "driveAxisLocal": [0, 0, 1]
  }
}
```

Future calculated torque:

```text
T(Nm) = 9550 × P(kW) / n(rpm)
```

## 7. Gearbox properties

```json
{
  "gearbox": {
    "ratio": 10,
    "ratioConvention": "input_to_output",
    "efficiency": 0.94,
    "reversesDirection": false,
    "inputSpeedRpm": null,
    "outputSpeedRpm": null,
    "inputTorqueNm": null,
    "outputTorqueNm": null
  }
}
```

Future calculations:

```text
outputSpeed = inputSpeed / ratio
outputTorque = inputTorque × ratio × efficiency
```

## 8. Pulley and belt properties

```json
{
  "pulley": {
    "diameterMm": 200,
    "speedRpm": null,
    "rotationDirection": "clockwise",
    "slipRatio": 0
  },
  "belt": {
    "speedMode": "drive_calculated",
    "commandedSpeedMps": null,
    "calculatedSpeedMps": null,
    "direction": "forward",
    "accelerationMps2": 0.3,
    "decelerationMps2": 0.3,
    "pathId": "PATH-CONV-001",
    "loop": true
  }
}
```

Future belt speed calculation:

```text
beltSpeed(m/s) = π × pulleyDiameter(m) × pulleySpeed(rpm) / 60 × (1 - slipRatio)
```

## 9. Product transport properties

```json
{
  "transportBinding": {
    "transporterObjectId": "belt-001",
    "pathId": "PATH-CONV-001",
    "pathPositionMm": 0,
    "laneId": "L1",
    "movementMode": "no_slip",
    "orientationBehavior": "follow_tangent",
    "state": "waiting"
  }
}
```

Allowed product states:

- `waiting`
- `moving`
- `accumulating`
- `transferring`
- `blocked`
- `rejected`
- `falling`
- `jammed`
- `completed`

## 10. Product kinematics

Future no-slip calculation:

```text
productSpeed = beltSpeed
position(t + dt) = position(t) + productSpeed × dt
```

Movement is permitted only when:

- transporter is running
- product is supported by the transporter
- no active blocker prevents travel
- path and lane are valid
- downstream transfer is available
- collision rules do not require a stop

## 11. Orientation coupling

Product movement shall use `PRODUCT_ORIENTATION_SCHEMA_V1.md`.

Dynamic updates shall consider:

- path tangent
- surface normal
- lane lateral axis
- transfer orientation rule
- guide or alignment action
- collision envelope
- receiving-machine tolerance

Orientation change shall trigger recalculation of projected dimensions, pitch, lane occupancy, throughput, and collision risk.

## 12. Friction and slip preparation

```json
{
  "contactProperties": {
    "staticFrictionCoefficient": null,
    "dynamicFrictionCoefficient": null,
    "contactAreaMm2": null,
    "contactStatus": "unknown"
  }
}
```

Future preliminary horizontal-belt rule:

```text
maximumNoSlipAcceleration = staticFrictionCoefficient × gravity
```

If commanded acceleration exceeds this value, the simulation shall issue a slip warning or switch to a later physics model.

## 13. Support and load relationships

```json
{
  "supportRelationship": {
    "supportObjectId": "platform-001",
    "payloadObjectId": "machine-001",
    "contactPatchIds": ["foot-1", "foot-2", "foot-3", "foot-4"],
    "loadDistributionMode": "equal",
    "currentLoadKg": null,
    "utilizationPercent": null
  }
}
```

Support capacity fields:

- maximum total load, kg
- maximum distributed load, kg/m²
- maximum line load, kg/m
- maximum point load, kg
- safety factor
- usable support area
- support polygon

## 14. Load validation

Future rules shall distinguish:

- total load
- distributed load
- line load
- point load
- local foot load
- dynamic load factor

Warning levels:

- `info`
- `advisory`
- `warning`
- `critical`
- `simulation_stop`

Example:

```json
{
  "warning": {
    "code": "SUPPORT_POINT_OVERLOAD",
    "severity": "critical",
    "objectId": "platform-001",
    "relatedObjectId": "machine-001",
    "message": "Foot 2 exceeds maximum point load by 18%.",
    "calculatedValue": 354,
    "limitValue": 300,
    "unit": "kg"
  }
}
```

## 15. Center of mass and stability preparation

Minimum future-ready fields:

- center of mass in local coordinates
- world center of mass
- support contact points
- support polygon
- projected center of mass on support plane
- stability margin
- inclination angle

A future stability warning shall occur when the projected center of mass lies outside the valid support polygon or within a configured minimum margin.

## 16. Machine states

Standard equipment states:

- `off`
- `starting`
- `running`
- `stopping`
- `stopped`
- `starved`
- `blocked`
- `faulted`
- `changeover`
- `cleaning`
- `maintenance`

These states will later feed OEE calculations. They are stored now as allowed-state metadata only.

## 17. Event preparation

```json
{
  "eventDefinition": {
    "eventId": "EVT-001",
    "type": "product_arrival",
    "sourceObjectId": "sensor-001",
    "targetObjectId": "wrapper-001",
    "condition": {},
    "actions": [],
    "enabled": false
  }
}
```

Prepared event types:

- product arrival
- sensor on/off
- motor started/stopped
- machine state changed
- downstream available/unavailable
- overload detected
- orientation invalid
- collision detected
- animation clip completed

## 18. Validation rules for early phases

Blocking errors:

- relationship references a missing object
- connector references are invalid
- a rotational relationship has no valid axis or pivot
- a path-following relationship has no path
- a carries relationship has no support/contact definition
- released transporter has no direction or path

Warnings:

- unknown motor efficiency
- unknown friction
- support capacity not configured
- incomplete torque chain
- downstream interface orientation tolerance missing

## 19. Phase implementation boundary

Initial release:

- store and edit all relationship records
- validate object references and connectors
- display relationship graph
- preserve data through save/export
- optionally calculate simple derived values in engineering panels
- no continuous dynamic simulation required

Future Dynamic Phase 1:

- motor/gearbox/pulley/belt calculations
- path movement
- product position and orientation update
- pitch, throughput, and travel time
- basic blocking and accumulation

Future Dynamic Phase 2:

- torque adequacy
- friction and slip
- support load and stability
- dynamic warnings

Future Dynamic Phase 3–4:

- timeline animation
- discrete-event simulation
- waste and OEE

## 20. Required test fixtures

Claude shall eventually provide fixtures for:

1. Motor driving gearbox and pulley.
2. Belt speed calculated from drive chain.
3. Cookie carried by belt in no-slip mode.
4. Belt stopped while cookie remains stationary.
5. Product rejected for invalid orientation.
6. Platform overload warning.
7. Invalid relationship referencing missing object.

# PRODUCT ORIENTATION SCHEMA V1

Status: Approved for Phase 0 implementation
Schema version: `1.0.0`
Owner: ChatGPT
Date: 2026-07-20

## 1. Purpose

Product orientation is a first-class engineering property. It shall affect geometry projection, pitch, lane occupancy, product spacing, collision envelope, transfers, machine acceptance, reject logic, packing arrangement, and future dynamic simulation.

## 2. Orientation reference frames

Every product orientation shall be expressible in three coordinate frames:

1. `world` — absolute project X/Y/Z.
2. `transport` — local path tangent, lateral axis, and surface normal of the active conveyor or transporter.
3. `processInterface` — target infeed coordinate system of the receiving machine.

The application shall not assume that product orientation follows conveyor direction automatically.

## 3. Mandatory orientation object

```json
{
  "orientation": {
    "mode": "lengthwise",
    "referenceFrame": "transport",
    "forwardVectorLocal": [1, 0, 0],
    "upVectorLocal": [0, 1, 0],
    "rightVectorLocal": [0, 0, 1],
    "faceUp": "embossed_face",
    "contactFace": "bottom_face",
    "leadingEdge": "short_edge_a",
    "trailingEdge": "short_edge_b",
    "rotationRelativeToFlowDeg": 0,
    "skewAngleDeg": 0,
    "tiltAngleDeg": 0,
    "rollAngleDeg": 0,
    "laneId": "L1",
    "lateralOffsetMm": 0,
    "verticalOffsetMm": 0,
    "pathBehavior": "follow_tangent",
    "status": "correct",
    "confidence": 1.0,
    "source": "user_defined"
  }
}
```

All fields above must exist for product objects. Draft products may use explicit `unknown` values, but released products may not.

## 4. Orientation modes

Allowed modes:

- `lengthwise`
- `crosswise`
- `edge_leading`
- `corner_leading`
- `fixed_angle`
- `face_up`
- `face_down`
- `random`
- `stacked`
- `nested`
- `custom`

## 5. Path behavior

Allowed behaviors:

- `follow_tangent` — forward vector aligns with path tangent.
- `maintain_world_orientation` — product keeps world rotation while moving.
- `maintain_relative_orientation` — product keeps fixed rotation relative to transporter.
- `rotate_fixed_angle` — transfer adds a configured angular change.
- `rotate_gradually` — angular change is distributed along a path segment.
- `align_to_centerline` — correct lateral offset and skew.
- `free_rotation` — rotation is uncontrolled and may require later physics.
- `flip` — up vector is intentionally reversed.

## 6. Orientation status

Allowed status:

- `correct`
- `acceptable`
- `misaligned`
- `rotated`
- `flipped`
- `overlapped`
- `tilted`
- `unknown`
- `rejected`

## 7. Product geometry landmarks

Each product template shall define named landmarks where applicable:

```json
{
  "orientationLandmarks": {
    "faces": ["embossed_face", "bottom_face"],
    "edges": ["short_edge_a", "short_edge_b", "long_edge_left", "long_edge_right"],
    "axes": {
      "longAxisLocal": [1, 0, 0],
      "shortAxisLocal": [0, 0, 1],
      "thicknessAxisLocal": [0, 1, 0]
    }
  }
}
```

These landmarks permit stable orientation definitions even when the object rotates in world space.

## 8. Projected dimensions

The simulation shall calculate the effective product dimensions along transport axes from the oriented bounding box.

Required calculated values:

- `projectedLengthAlongFlowMm`
- `projectedWidthAcrossFlowMm`
- `projectedHeightNormalToSurfaceMm`

For a rectangular product with local length `L`, width `W`, and in-plane rotation angle `theta` relative to flow, the preliminary 2D projection may use:

```text
projectedLength = |L cos(theta)| + |W sin(theta)|
projectedWidth  = |L sin(theta)| + |W cos(theta)|
```

The production implementation shall prefer oriented bounding-box projection so irregular scanned products are also supported.

## 9. Pitch and capacity dependency

Product pitch shall not use a fixed nominal length. It shall use:

```text
pitch = projectedLengthAlongFlow + targetGap
```

Nominal single-lane throughput:

```text
productsPerMinute = beltSpeedMps / pitchM × 60
```

Whenever orientation changes, the application shall recalculate:

- pitch
- gap
- products per minute
- lane occupancy
- minimum conveyor width
- overlap risk
- receiving-machine compatibility

## 10. Lane and offset

Mandatory transport-relative placement fields:

- `laneId`
- `lateralOffsetMm`
- `verticalOffsetMm`
- `skewAngleDeg`

A lane definition shall contain:

```json
{
  "laneId": "L1",
  "centerOffsetMm": 0,
  "usableWidthMm": 120,
  "allowedProductWidthMm": 110,
  "orientationRequirementId": "REQ-FW-INFEED-01"
}
```

## 11. Orientation requirements at machine interfaces

Each receiving machine connector may define an orientation acceptance window:

```json
{
  "orientationRequirement": {
    "requirementId": "REQ-FW-INFEED-01",
    "requiredMode": "lengthwise",
    "targetRotationRelativeToFlowDeg": 0,
    "rotationToleranceDeg": 5,
    "skewToleranceDeg": 3,
    "tiltToleranceDeg": 2,
    "lateralOffsetToleranceMm": 10,
    "requiredFaceUp": "embossed_face",
    "requiredLeadingEdge": "short_edge_a",
    "allowedLaneIds": ["L1", "L2"],
    "actionIfInvalid": "reject"
  }
}
```

Allowed invalid actions:

- `warn`
- `realign`
- `slow_down`
- `reject`
- `stop_machine`
- `mark_jam_risk`

## 12. Transfer orientation rules

Every transfer connector shall define the expected transformation:

```json
{
  "transferOrientationRule": {
    "ruleId": "TOR-001",
    "inputReference": "source_transport",
    "outputReference": "target_transport",
    "mode": "rotate_fixed_angle",
    "rotationDeltaDeg": 90,
    "flip": false,
    "preserveFaceUp": true,
    "preserveLeadingEdge": false,
    "targetLaneId": "L1",
    "targetLateralOffsetMm": 0,
    "uncertaintyDeg": 1.5
  }
}
```

Transfer validation shall produce both predicted output orientation and acceptance status at the next interface.

## 13. Collision behavior

The product collision volume shall follow actual orientation.

Minimum collision checks:

- product-to-product overlap
- product-to-guide collision
- product-to-machine-opening collision
- tilted-product height clearance
- transfer-gap bridging risk
- cross-lane encroachment

Axis-aligned bounding boxes may be used only as a broad-phase test. Oriented bounding boxes or mesh colliders shall be used for final orientation-sensitive checks.

## 14. Cookie-specific properties

Cookie templates may additionally define:

- `embossedFace`
- `creamFace`
- `brokenEdgeDirection`
- `flatOrTilted`
- `overlapState`
- `contactFace`
- `orientationSymmetry`

`orientationSymmetry` may declare rotations that are visually or mechanically equivalent, for example 180-degree rotational symmetry.

## 15. Hierarchical orientation

Orientation shall be retained through packaging hierarchy:

```text
Cookie → Row → Primary Pack → Multipack → Case → Pallet
```

Each parent level shall store:

- child orientation relative to parent
- parent orientation relative to transporter
- packing pattern reference
- label/print face direction
- pallet layer orientation

## 16. Orientation source and confidence

Allowed source:

- `user_defined`
- `cad_defined`
- `vision_detected`
- `simulation_calculated`
- `sensor_reported`
- `estimated`
- `unknown`

`confidence` ranges from 0 to 1. Released manually engineered product definitions may use 1.0 after verification.

## 17. Validation rules

Blocking errors:

- Missing orientation structure for a product.
- Zero forward or up vector.
- Forward and up vectors are not sufficiently independent.
- Face-up landmark does not exist.
- Leading edge landmark does not exist.
- Released product has unknown mode or status.
- Machine requirement cannot be evaluated because projected dimensions are unavailable.

Warnings:

- Orientation confidence below configured threshold.
- Product width approaches lane limit.
- Transfer uncertainty consumes most of the receiving tolerance.
- Symmetry makes leading-edge identification ambiguous.

## 18. Required test fixtures

Claude shall implement tests for:

1. Lengthwise cookie at 0 degrees.
2. Crosswise cookie at 90 degrees.
3. Cookie skewed 12 degrees and rejected by a ±5-degree infeed rule.
4. Cookie rotated through a 90-degree transfer.
5. Flipped cookie rejected by face-up requirement.
6. Oriented product causing lane-width overflow.
7. Orientation change recalculating pitch and nominal throughput.

## 19. Phase boundaries

Phase 0–7:

- Store, edit, validate, display, and transfer orientation metadata.
- Recalculate projected geometry, pitch, lane use, and warnings.

Future Dynamic Phase:

- Continuously update orientation over time.
- Couple orientation to contact, guides, friction, collision, and machine actions.
- Read orientation from vision/sensor models.

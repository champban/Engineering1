# CORE OBJECT SCHEMA V1

Status: Draft for implementation
Schema version: `1.0.0`
Owner: ChatGPT
Date: 2026-07-20

## 1. Purpose

This document defines the minimum native data contract for every 3D object in the application. The schema must support static creation and editing now, while remaining compatible with future animation, engineering dynamics, product transport, load validation, and OEE simulation.

## 2. Core principles

1. Mandatory fields must exist in every object.
2. Unknown values are represented explicitly and never replaced with zero.
3. `N/A` means not applicable; `Unknown` means applicable but not known; `Pending` means planned for later verification.
4. Released objects may not contain unresolved mandatory engineering values.
5. Shape-dependent parameters are validated conditionally.
6. Product orientation is a first-class property.
7. Static objects remain motion-ready.
8. Grouping must preserve child objects and hierarchy.
9. Geometry, appearance, physical properties, orientation, and behavior are separate layers.
10. Future fields may be added without breaking older object packages.

## 3. Top-level object structure

```json
{
  "schemaVersion": "1.0.0",
  "objectId": "OBJ-000001",
  "identity": {},
  "lifecycle": {},
  "geometry": {},
  "dimensions": {},
  "surface": {},
  "physical": {},
  "transform": {},
  "hierarchy": {},
  "orientation": {},
  "motion": {},
  "collision": {},
  "connections": [],
  "measurements": [],
  "extendedProperties": {},
  "audit": {}
}
```

## 4. Mandatory top-level fields

The following fields must always exist:

- `schemaVersion`
- `objectId`
- `identity`
- `lifecycle`
- `geometry`
- `dimensions`
- `surface`
- `physical`
- `transform`
- `hierarchy`
- `orientation`
- `motion`
- `collision`
- `connections`
- `measurements`
- `extendedProperties`
- `audit`

## 5. Identity

```json
{
  "identity": {
    "name": "Conveyor Roller",
    "category": "machine_component",
    "subCategory": "roller",
    "description": "N/A",
    "manufacturer": "N/A",
    "model": "N/A",
    "partNumber": "N/A",
    "serialNumber": "N/A",
    "tags": []
  }
}
```

Mandatory:

- `name`
- `category`
- `subCategory`

Optional fields must exist with `N/A` or empty-array defaults.

## 6. Lifecycle and verification

```json
{
  "lifecycle": {
    "status": "draft",
    "revision": "R000",
    "verificationStatus": "unverified",
    "verifiedBy": "N/A",
    "verifiedAt": null
  }
}
```

Allowed object status:

- `draft`
- `verified`
- `released`
- `obsolete`

Release gate:

- Shape valid.
- Mandatory dimensions known.
- Applicable diameter known.
- Surface/material complete.
- Mass known.
- Unit valid.
- Orientation valid for product objects.
- Revision assigned.

## 7. Geometry

```json
{
  "geometry": {
    "shapeType": "hollow_cylinder",
    "source": "parametric",
    "representation": "brep",
    "geometryFile": "models/working/model.glb",
    "lod": "engineering",
    "accuracy": {
      "status": "verified",
      "linearToleranceMm": 0.1,
      "angularToleranceDeg": 0.1
    }
  }
}
```

Allowed `shapeType` examples:

- `box`
- `rounded_box`
- `cylinder`
- `hollow_cylinder`
- `sphere`
- `hemisphere`
- `cone`
- `truncated_cone`
- `pipe`
- `torus`
- `extruded_profile`
- `revolved_profile`
- `mesh_scan`
- `custom`

Allowed `source`:

- `parametric`
- `scan`
- `imported_cad`
- `imported_mesh`
- `estimated`
- `ai_generated`

## 8. Shape-dependent dimensions

All dimensions use structured values:

```json
{
  "value": 60,
  "unit": "mm",
  "source": "measured",
  "status": "verified",
  "tolerance": 0.1
}
```

Allowed status:

- `verified`
- `estimated`
- `unknown`
- `pending`
- `not_applicable`

### Required parameters by shape

| Shape | Required parameters |
|---|---|
| Box | length, width, height |
| Rounded box | length, width, height, cornerRadius |
| Cylinder | diameter, length |
| Hollow cylinder | outerDiameter, innerDiameter or wallThickness, length |
| Sphere | diameter |
| Hemisphere | diameter |
| Cone | baseDiameter, height |
| Truncated cone | baseDiameter, topDiameter, height |
| Pipe | outerDiameter, innerDiameter or wallThickness, length |
| Torus | majorDiameter, minorDiameter |
| Extruded profile | profileBoundingWidth, profileBoundingHeight, extrusionLength |
| Revolved profile | profile reference, revolutionAxis |
| Mesh scan | boundingLength, boundingWidth, boundingHeight |
| Custom | boundingLength, boundingWidth, boundingHeight, customParameterReference |

Example:

```json
{
  "dimensions": {
    "unitSystem": "metric",
    "length": {"value": 500, "unit": "mm", "source": "measured", "status": "verified", "tolerance": 0.2},
    "outerDiameter": {"value": 60, "unit": "mm", "source": "measured", "status": "verified", "tolerance": 0.1},
    "innerDiameter": {"value": 25, "unit": "mm", "source": "measured", "status": "verified", "tolerance": 0.1},
    "boundingBox": {
      "lengthMm": 500,
      "widthMm": 60,
      "heightMm": 60
    }
  }
}
```

Validation rules:

- Applicable diameter fields may not be absent.
- Unknown dimensions use `value: null`, never `0`.
- Outer diameter must exceed inner diameter.
- Length, width, height, diameter, radius, and thickness must be positive when known.
- Bounding-box values are calculated and refreshed after geometry changes.

## 9. Surface and material

Surface is mandatory for every object.

```json
{
  "surface": {
    "material": "stainless_steel",
    "materialGrade": "AISI_304",
    "finish": "brushed",
    "baseColor": "#A0A0A0",
    "textureMode": "procedural",
    "textureReference": "N/A",
    "mappingMode": "triplanar",
    "roughness": 0.35,
    "metallic": 0.9,
    "opacity": 1.0,
    "normalMap": "N/A",
    "displacementMap": "N/A",
    "sourceUrl": "N/A",
    "license": "N/A",
    "status": "verified"
  }
}
```

Mandatory:

- `material`
- `finish`
- `baseColor`
- `textureMode`
- `mappingMode`
- `roughness`
- `metallic`
- `opacity`
- `status`

If no texture is used, store `textureMode: "none"` rather than leaving the field empty.

## 10. Physical properties

Mass is mandatory.

```json
{
  "physical": {
    "mass": {
      "value": 12.45,
      "unit": "kg",
      "source": "measured",
      "status": "verified",
      "tolerance": 0.05
    },
    "densityKgM3": "N/A",
    "volumeM3": "N/A",
    "surfaceAreaM2": "N/A",
    "centerOfMassLocalMm": [0, 0, 0],
    "staticOrMovable": "movable"
  }
}
```

Rules:

- Mass must use g, kg, or t in the UI.
- Internal normalized mass is kg.
- Unknown mass uses `value: null`, `status: "unknown"`.
- `0 kg` is valid only when physically meaningful and explicitly verified.
- Released objects require verified or accepted estimated mass.

## 11. Transform and coordinate system

```json
{
  "transform": {
    "positionMm": [0, 0, 0],
    "rotationDegXYZ": [0, 0, 0],
    "quaternionXYZW": [0, 0, 0, 1],
    "scaleXYZ": [1, 1, 1],
    "originLocalMm": [0, 0, 0],
    "coordinateSpace": "local",
    "homeTransform": {
      "positionMm": [0, 0, 0],
      "rotationDegXYZ": [0, 0, 0],
      "scaleXYZ": [1, 1, 1]
    }
  }
}
```

Mandatory:

- Initial transform.
- Home transform.
- Origin/pivot basis.
- Coordinate space.

## 12. Hierarchy and grouping

```json
{
  "hierarchy": {
    "parentObjectId": "root",
    "childrenObjectIds": [],
    "groupId": "N/A",
    "moduleId": "N/A",
    "inheritParentTransform": true,
    "locked": false
  }
}
```

Rules:

- Grouping does not destroy child identity.
- Join/flatten creates a copy by default.
- Parent/child transforms must remain valid for future animation.

## 13. Product orientation

Orientation exists for all objects; product objects require complete values.

```json
{
  "orientation": {
    "mode": "lengthwise",
    "forwardVectorLocal": [1, 0, 0],
    "upVectorLocal": [0, 1, 0],
    "faceUp": "embossed_face",
    "leadingEdge": "short_edge",
    "rotationRelativeToFlowDeg": 0,
    "skewAngleDeg": 0,
    "tiltAngleDeg": 0,
    "laneId": "L1",
    "lateralOffsetMm": 0,
    "pathBehavior": "follow_tangent",
    "status": "correct"
  }
}
```

Allowed status:

- `correct`
- `acceptable`
- `misaligned`
- `rotated`
- `flipped`
- `unknown`
- `rejected`

Orientation validation for products:

- Forward and up vectors must not be zero vectors.
- Forward and up vectors must be approximately orthogonal.
- Projected dimensions along and across flow must be calculable.
- Collision envelope must follow actual orientation.
- Pitch calculations use projected dimension along flow.

## 14. Motion-ready properties

Motion data exists even when no animation is implemented.

```json
{
  "motion": {
    "capability": "rotatable",
    "type": "rotation",
    "enabled": false,
    "axisVectorLocal": [0, 0, 1],
    "pivotLocalMm": [0, 0, 0],
    "allowedTranslationAxes": [],
    "allowedRotationAxes": ["z"],
    "limits": {
      "minimumPositionMm": null,
      "maximumPositionMm": null,
      "minimumAngleDeg": null,
      "maximumAngleDeg": null,
      "continuousRotation": true,
      "status": "configured"
    },
    "initialState": "stopped",
    "homeState": "stopped",
    "availableStates": ["stopped", "running"],
    "animationTracks": [],
    "events": []
  }
}
```

Allowed capability:

- `static`
- `movable`
- `rotatable`
- `linear`
- `path_following`
- `compound`
- `unknown`

Static default:

- `capability: "static"`
- `type: "none"`
- Empty allowed axes.
- Initial state `static`.
- Empty animation/event arrays.

## 15. Collision and support role

```json
{
  "collision": {
    "enabled": true,
    "role": "solid",
    "shapeSource": "geometry",
    "clearanceEnvelopeMm": 0,
    "supportCapability": {
      "enabled": false,
      "maximumTotalLoadKg": "N/A",
      "maximumDistributedLoadKgM2": "N/A",
      "maximumLineLoadKgM": "N/A",
      "maximumPointLoadKg": "N/A",
      "safetyFactor": "N/A"
    }
  }
}
```

Allowed collision role:

- `solid`
- `trigger`
- `support_surface`
- `ignore`

## 16. Connections and engineering relationships

```json
{
  "connections": [
    {
      "connectionId": "CONN-001",
      "type": "drives",
      "targetObjectId": "pulley-001",
      "connectorId": "shaft-output",
      "status": "configured"
    }
  ]
}
```

Supported relationship types prepared for future use:

- `drives`
- `transmitsPowerTo`
- `rotates`
- `carries`
- `supports`
- `follows`
- `feeds`
- `receives`
- `pushes`
- `blocks`
- `detects`
- `rejects`
- `accumulates`

## 17. Measurements

```json
{
  "measurements": [
    {
      "measurementId": "MEAS-001",
      "type": "diameter",
      "value": 60,
      "unit": "mm",
      "source": "manual_measurement",
      "status": "verified",
      "tolerance": 0.1,
      "annotationVisible": true
    }
  ]
}
```

## 18. Extended properties

```json
{
  "extendedProperties": {
    "loadCapacity": {"status": "pending", "value": null, "unit": "kg"},
    "frictionCoefficient": {"status": "unknown", "value": null},
    "foodContactStatus": {"status": "not_applicable", "value": null}
  }
}
```

Extended fields remain optional for release unless an object template makes them mandatory.

## 19. Audit

```json
{
  "audit": {
    "createdBy": "P'Boy",
    "createdAt": "2026-07-20T00:00:00Z",
    "modifiedBy": "ChatGPT",
    "modifiedAt": "2026-07-20T00:00:00Z",
    "sourceFiles": [],
    "notes": "N/A"
  }
}
```

## 20. Example object templates required for implementation

The implementation phase must include fixtures for:

1. Cookie product.
2. Electric motor.
3. Conveyor belt.
4. Support platform.

Each fixture must demonstrate different mandatory fields and validation logic.

## 21. Validation summary

### Save as Draft

Allowed:

- Mandatory fields exist but selected values may be `unknown` or `pending`.

Not allowed:

- Missing mandatory field structure.
- Invalid units.
- Negative known dimensions or mass.
- Invalid vector formats.

### Mark as Verified

Required:

- Geometry and mandatory dimensions resolved.
- Surface resolved.
- Mass resolved.
- Shape-dependent fields valid.
- Product orientation resolved for product objects.

### Mark as Released

Required:

- All Verified requirements.
- Revision assigned.
- No mandatory `unknown` or `pending` values.
- Validation completed without blocking errors.

## 22. Implementation handoff requirements

Claude must implement this schema using:

- Strong TypeScript types.
- Runtime schema validation.
- Human-readable validation errors.
- Version field and migration placeholder.
- Valid and invalid test fixtures.
- Unit tests for all blocking validation rules.

Claude must not rename or remove mandatory fields without a new approved schema version.

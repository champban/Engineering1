# Engineering1 — AI-Native 3D Object, Layout & Simulation Platform

Engineering1 is a browser-first, local-first engineering platform. The current stacked Phase 1 alpha prioritizes converting arbitrary real-world objects from camera images or video frames into reusable Gallery assets, then placing those assets in mechanical layouts and transport simulations.

## Current alpha workflow

1. Upload an image or video.
2. Select the target object and exclude its surroundings.
3. Use manual extraction or server-side AI segmentation.
4. Create a calibrated proxy or request AI image-to-3D reconstruction.
5. Review the object in an interactive Three.js viewport.
6. Save the reusable Engineering Object to the Gallery.
7. Duplicate, delete, calibrate, or insert the asset into a layout.
8. Add conveyor paths and inspect product transport in Visual Runtime.

## Current branch scope

- Phase 1A — Camera/Image/Video to reusable Object Gallery.
- Phase 1B — Mechanical Layout Assembly alpha.
- Phase 1C — Conveyor Transport Visual Runtime alpha.
- Direct Three.js GLB review with orbit/zoom and calibrated proxy fallback.
- Server-side AI provider adapters. Provider secrets are never exposed in browser code.
- Planned HMI/SCADA and PLC functions remain visible, grey, and disabled.

## Commands

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run dev
```

## AI preview configuration

The current Netlify Functions prototype expects `FAL_KEY` as a server-side environment variable. Never place the key in source code, browser variables, downloadable packages, or chat messages.

## Branch discipline

- `Doc`: project context, decisions, QA, and backlog.
- Feature branches: bounded implementation and acceptance candidates.
- `develop`: integration after acceptance.
- `main`: production candidate only.

Production deployment and merges require explicit approval.

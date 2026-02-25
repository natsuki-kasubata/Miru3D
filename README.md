# Miru3D

A simple 3D model viewer for Windows. Drag & drop or double-click to instantly view 3D models.

## Supported Formats

| Format | Extension | Engine |
|--------|-----------|--------|
| glTF Binary | `.glb` | Three.js (R3F) |
| glTF | `.gltf` | Three.js (R3F) |
| FBX | `.fbx` | Three.js (R3F) |
| Wavefront OBJ | `.obj` | Three.js (R3F) |
| VRM Avatar | `.vrm` | Three.js + @pixiv/three-vrm |
| 3D Gaussian Splat | `.ply` `.splat` `.ksplat` | @mkkellogg/gaussian-splats-3d |

## Features

- Drag & drop any supported 3D file to view it
- Double-click or right-click "Open with" from Windows Explorer
- Auto camera positioning based on model size
- FBX auto-scale correction (cm → m)
- VRM avatar support with correct orientation
- 3D Gaussian Splatting with progressive loading
- Grid and environment lighting
- File info overlay (format, size, vertex/triangle count)
- Single instance — opening another file switches the model in the existing window

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+O` | Open file |
| `R` | Reset camera |
| `G` | Toggle grid |

## Development

### Prerequisites

- Node.js 20 LTS
- Visual Studio Build Tools 2022 (for native addons if needed)

### Setup

```bash
npm install
npm run dev
```

### Build & Package

```bash
npm run build
npm run package
```

The installer will be created in the `release/` directory.

## License

MIT

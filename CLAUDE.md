# Miru3D

3Dモデル (GLB, FBX, OBJ, VRM, 3DGS) をドラッグ&ドロップ or 右クリックでサクッと表示するデスクトップビューア。

## 技術スタック
- **Electron 30** + **Vite** + **React 18** + **TypeScript 5** + **Tailwind CSS 3**
- **Three.js** + **React Three Fiber** + **drei** (メッシュ系フォーマット)
- **@pixiv/three-vrm** (VRM)
- **@mkkellogg/gaussian-splats-3d** (3DGS)
- **electron-builder** + **NSIS** (インストーラ・ファイル関連付け)

## プロジェクト構造
```
Miru3D/
├── app/
│   ├── main/          # Electron Mainプロセス
│   ├── preload/       # contextBridge (IPC Bridge)
│   ├── renderer/      # React UI
│   │   ├── components/  # UIコンポーネント
│   │   ├── hooks/       # カスタムフック
│   │   ├── loaders/     # フォーマット別ローダ
│   │   └── lib/         # ユーティリティ
│   └── shared/        # 共通型・定数
├── resources/         # アイコン等
└── dist/              # ビルド出力
```

## アーキテクチャ

### ファイルオープンフロー
1. D&D / 右クリック / Ctrl+O でファイル指定
2. Main プロセスで `fs.readFile` → `Uint8Array`
3. IPC 経由で Renderer へ送信
4. 拡張子判定 → メッシュ or 3DGS に分岐

### 3DGS vs メッシュの分岐
- **メッシュ系** (GLB/FBX/OBJ/VRM): React Three Fiber `<Canvas>` + OrbitControls
- **3DGS** (.ply/.splat/.ksplat): `@mkkellogg/gaussian-splats-3d` 独立レンダラ

### 自動カメラ配置
- BoundingBox → BoundingSphere → 半径 × 2.5 の距離
- モデルはY=0の地面に設置（底面基準）

## コマンド
```bash
npm run dev       # 開発モード
npm run build     # ビルド
npm run package   # インストーラ作成
```

## キーボードショートカット
- **Ctrl+O**: ファイルオープン
- **R**: カメラリセット
- **G**: グリッド表示切替

## 関連ドキュメント
- [Desktop共通ルール](../CLAUDE.md)
- [グローバル設定](../../../.claude/CLAUDE.md)

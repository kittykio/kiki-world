# Kiki World

Kiki World is an immersive, story-driven 3D experience built around a simple idea: creativity needs space to make, rest, and connect. Visitors guide Kiki through three floating rooms, each with its own atmosphere, purpose, color, and character animation.

The experience pairs expressive avatar motion with smooth room-to-room travel, responsive camera work, neon art direction, and controls designed for desktop, tablet, and mobile devices.

## The rooms

- **Make** — a focused study where ideas become playful interfaces. Kiki settles in and types.
- **Rest** — a quiet bedroom that represents recovery as part of the creative process. Kiki takes a seat.
- **Connect** — a lively shared space where finished work becomes a social experience. Kiki dances.

When a visitor changes rooms, Kiki walks toward the new destination, turns with the direction of travel, waves on arrival, and transitions into the room's activity. Horizontal root motion is removed from the animation clips so the avatar stays aligned with each destination.

## Features

- Three explorable 3D rooms with individual narratives and neon lighting
- Smooth avatar movement and blended walking, waving, typing, sitting, dancing, and idle animations
- Four switchable outfits that preserve the current room and journey state
- Camera transitions tailored to portrait, landscape, and short-screen layouts
- Mouse, keyboard, pointer, swipe, and touch navigation
- Loading progress and automatic asset preloading
- Manual performance mode and automatic detail reduction under sustained frame-rate pressure
- Reduced-motion support for visitors who prefer minimal animation
- Responsive interface with safe-area-aware positioning for mobile devices

## Controls

- Scroll the mouse wheel or swipe vertically to move between rooms.
- Use the arrow keys or `A` and `D` to move backward and forward.
- Press `1`, `2`, or `3` to jump directly to a room.
- Select a room in the bottom navigation or click its 3D scene.
- Choose an outfit from the outfit selector.
- Toggle **High detail** and **Performance** from the top-right control.

## Technology

- Next.js and React
- React Three Fiber
- Drei
- Three.js
- TypeScript
- GLB room and avatar assets
- Mixamo FBX animation clips

## Accessibility and responsive behavior

Kiki World provides semantic HTML navigation alongside the 3D scene, keyboard-accessible controls, descriptive labels, visible focus states, and live updates for room changes and loading progress. In-scene labels are replaced by the compact HTML controls on smaller screens to keep the experience readable and touch-friendly.

With `prefers-reduced-motion` enabled, avatar travel and camera interpolation are removed while room navigation and activities remain usable.

## Performance approach

The renderer caps device pixel ratio in high-detail mode and uses a fixed pixel ratio of `1` in performance mode. Adaptive DPR responds to rendering pressure, while the performance monitor can lower visual quality automatically. Mobile and short landscape layouts use smaller models and wider camera framing.

The project ships only the six animation clips used by the experience. The largest remaining payloads are the room and avatar models; future optimization can add Draco or Meshopt geometry compression and KTX2 textures.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Validation

```bash
npm run typecheck
npm run build
```

## Credits

Room models: CGTrader. Avatar: Ready Player Me. Animation clips: Mixamo.

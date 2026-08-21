# One Asteroid

Single-asteroid arcade game inspired by the [2019 GMTK Game Jam](https://itch.io/jam/gmtk-2019) theme “only one”. Destroy the asteroid, survive its debris, and keep your rocket moving through the void.

## Play online

[Launch One Asteroid on Vercel](https://v0-one-asteroid.vercel.app)

## Modernization

The project now runs on a modern React and Vite toolchain:

- React 19 with `createRoot`
- Vite for development and production builds
- Node.js 22 LTS, pinned in `.nvmrc` and `package.json`
- Production output optimized through Vite’s modern bundling pipeline
- Stable animation-frame lifecycle with cleanup on unmount
- Per-frame React state updates removed from the game loop
- Reverse iteration for safe, allocation-conscious entity removal
- Cached canvas context, dimensions, and keyboard state for smoother gameplay

The visual direction has also been converted from neon arcade to dark baroque: antique-gold highlights, oxblood accents, serif display typography, and ornate framed panels now carry through the menus, game-over screens, and canvas entities.

## Controls

- `A` / `D` or left/right arrows: steer
- `W` or up arrow: thrust
- `S` or down arrow: halt
- `Space`: fire

## Available scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

Open the development server at [http://localhost:3000](http://localhost:3000).

## License

Open-source project by [CerxMe](https://github.com/CerxMe/Asteroid).

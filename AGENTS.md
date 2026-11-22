# Architecture decisions

- Serve FFmpeg's class worker through Vite's bundled asset URL and pair it with the ESM FFmpeg core; module workers cannot import the UMD build, and Vite's optimized worker path is not stable.
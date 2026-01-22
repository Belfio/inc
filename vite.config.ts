import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ["buffer", "crypto", "stream", "util", "process"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "~": "/app",
    },
  },
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    include: ["buffer", "@coral-xyz/anchor", "@solana/web3.js"],
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    target: "esnext",
  },
});

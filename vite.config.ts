import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/picklist-pwa/', // GitHub Pages subdirectory
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // Enable PWA in development mode
      },

      // App metadata for installation
      manifest: {
        name: 'Picklist - Smart Nutrition Tracker',
        short_name: 'Picklist',
        description: 'AI-powered nutrition tracking and product analysis for CrossFit athletes',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/picklist-pwa/',
        scope: '/picklist-pwa/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },

      workbox: {
        // Cache ALL files in public directory for complete offline functionality
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,wasm,jsonl}',
          '**/products-by-category/**/*'
        ],

        // Handle large dataset - increase cache size limits
        maximumFileSizeToCacheInBytes: 100 * 1024 * 1024, // 100MB per file

        // Offline-first strategy
        skipWaiting: true,
        clientsClaim: true,

        // Exclude problematic worker files from service worker processing
        globIgnores: [
          '**/node_modules/**',
          '**/dist/**'
        ],

        // Runtime caching for dynamic content
        runtimeCaching: [
          {
            // Cache all product data files
            urlPattern: /^\/products-by-category\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'product-data-offline',
              expiration: {
                maxEntries: 5000,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Cache WASM files for SQLite
            urlPattern: /.*\.wasm$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wasm-cache',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            // Catch-all for any other public files
            urlPattern: /^\/(?!api)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'offline-cache',
              expiration: {
                maxEntries: 10000,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    }),
    {
      name: 'configure-response-headers',
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: [
      'sqlocal'
    ]
  },
  server: {
    fs: {
      allow: ['..']
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    proxy: {
      '/api/images': {
        target: 'https://static.ah.nl',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/images/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Remove CORP headers for image requests
            proxyReq.setHeader('Access-Control-Allow-Origin', '*');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Remove restrictive CORS headers from image responses
            delete proxyRes.headers['cross-origin-resource-policy'];
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          });
        }
      }
    }
  },
  // Ensure WASM files are served with correct MIME type
  assetsInclude: ['**/*.wasm'],

  // Worker configuration for SQLite compatibility
  worker: {
    format: 'es' // Use ES modules for workers instead of IIFE
  },

  // Build optimizations for PWA
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          sqlite: ['sqlocal']
        }
      }
    }
  }
});

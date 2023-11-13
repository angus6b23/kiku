import path from 'path'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const SRC_DIR = path.resolve(__dirname, './src')
const PUBLIC_DIR = path.resolve(__dirname, './public')
const BUILD_DIR = path.resolve(__dirname, './dist')
export default async () => {
    return {
        plugins: [react(), tsconfigPaths()],
        root: SRC_DIR,
        base: '',
        publicDir: PUBLIC_DIR,
        build: {
            outDir: BUILD_DIR,
            assetsInlineLimit: 0,
            emptyOutDir: true,
            rollupOptions: {
                treeshake: false,
            },
        },
        resolve: {
            alias: {
                '@': SRC_DIR,
            },
        },
        server: {
            host: true,
        },
    }
}

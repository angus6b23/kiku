import path from 'path'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import electron from 'vite-plugin-electron'
import fs from 'fs'

const SRC_DIR = path.resolve(__dirname, './src')
const PUBLIC_DIR = path.resolve(__dirname, './public')
const BUILD_DIR = path.resolve(__dirname, './dist')
const ELECTRON_DIR = path.resolve(__dirname, './electron');

export default async () => {
    let electronModules = await fs.promises.readdir(ELECTRON_DIR)
    electronModules = electronModules.filter(file => file !== 'main.js');
    const generateInput = (files) => {
        const res = {}
        for (const file of files) {
            const [name, _] = file.split('.');
            res[name] =  path.join(ELECTRON_DIR, file);
        }
        return res
    }

    return {
        plugins: [
            react(),
            tsconfigPaths(),
            electron({
                entry: path.join(ELECTRON_DIR, 'main.js'),
                vite: {
                    build: {
                        lib: {
                            entry: electronModules.map(file => path.join(ELECTRON_DIR, file)),
                        }
                    }
                }
                // onstart: (args) => {
                //     args.startup()
                // },
            },
                    ),
        ],
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

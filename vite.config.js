import { defineConfig } from 'vite';

export default defineConfig( {
    // config options
    "base": "./",
    "publicDir": "assets",

    "build": {
        "outDir": "dist",
        "assetsDir": "assets",
    },
});
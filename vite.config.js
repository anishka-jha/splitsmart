import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
const bundledScheduler=fileURLToPath(new URL('./node_modules/.pnpm/scheduler@0.28.0/node_modules/scheduler/index.js',import.meta.url));
export default defineConfig({resolve:{preserveSymlinks:process.platform==='win32',alias:existsSync(bundledScheduler)?{scheduler:bundledScheduler}:{}}});

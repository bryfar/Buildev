import path from "node:path";
import { config } from "dotenv";

/**
 * Carga variables desde `apps/buildev-backend/.env` aunque el proceso se arranque
 * desde la raíz del monorepo (`yarn dev`), donde `dotenv/config` solo leería `./.env`.
 */
const backendRoot = path.resolve(__dirname, "..");
config({ path: path.join(backendRoot, ".env") });
config();

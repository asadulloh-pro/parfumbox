import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Resolves to `apps/api/uploads` when compiled to `dist/src/*.js`.
 */
export function getUploadsDir(): string {
  const dir = join(__dirname, '..', '..', 'uploads');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

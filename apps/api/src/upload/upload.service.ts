import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { getUploadsDir } from '../storage/upload-path';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function safeExt(original: string): string {
  const e = extname(original).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(e)) {
    return e === '.jpeg' ? '.jpg' : e;
  }
  return '.jpg';
}

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private s3: S3Client | null = null;
  private bucket = 'parfumbox';
  private useMinio = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const endpoint = this.config.get<string>('MINIO_ENDPOINT')?.trim();
    if (!endpoint) {
      this.logger.log('MINIO_ENDPOINT not set; uploads use local disk (apps/api/uploads)');
      return;
    }

    const accessKey = this.config.get<string>('MINIO_ACCESS_KEY')?.trim();
    const secretKey = this.config.get<string>('MINIO_SECRET_KEY')?.trim();
    if (!accessKey || !secretKey) {
      throw new Error(
        'MINIO_ACCESS_KEY and MINIO_SECRET_KEY are required when MINIO_ENDPOINT is set',
      );
    }

    this.useMinio = true;
    this.bucket = this.config.get<string>('MINIO_BUCKET')?.trim() || 'parfumbox';

    this.s3 = new S3Client({
      region: this.config.get<string>('MINIO_REGION')?.trim() || 'us-east-1',
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });

    await this.ensureBucket();
    this.logger.log(`MinIO uploads enabled (bucket: ${this.bucket})`);
  }

  private async ensureBucket() {
    if (!this.s3) return;
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Created MinIO bucket: ${this.bucket}`);
    }
  }

  /**
   * Store file and return a public URL for clients (mini app / admin).
   */
  async saveUploadedFile(file: Express.Multer.File): Promise<string> {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, and GIF images are allowed',
      );
    }

    const filename = `${randomUUID()}${safeExt(file.originalname)}`;
    const key = `uploads/${filename}`;

    if (this.useMinio && this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return this.publicUrlForMinioKey(key);
    }

    const dir = getUploadsDir();
    await writeFile(join(dir, filename), file.buffer);
    return this.publicUrlForLocalFile(filename);
  }

  private publicUrlForMinioKey(key: string): string {
    const explicit = this.config.get<string>('MINIO_PUBLIC_URL')?.replace(/\/$/, '');
    if (explicit) {
      return `${explicit}/${key}`;
    }
    const endpoint = this.config.get<string>('MINIO_ENDPOINT')!.replace(/\/$/, '');
    return `${endpoint}/${this.bucket}/${key}`;
  }

  private publicUrlForLocalFile(filename: string): string {
    const base =
      this.config.get<string>('PUBLIC_BASE_URL')?.replace(/\/$/, '') ??
      `http://localhost:${this.config.get<number>('PORT', 3000)}`;
    return `${base}/uploads/${encodeURIComponent(filename)}`;
  }
}

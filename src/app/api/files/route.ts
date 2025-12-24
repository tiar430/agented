import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { writeFile, mkdir, readFile, readdir, stat, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

// Schema for file operations
const fileOperationSchema = z.object({
  operation: z.enum(['read', 'write', 'delete', 'list', 'move', 'copy', 'organize']),
  path: z.string(),
  content: z.string().optional(),
  targetPath: z.string().optional(),
  userId: z.string(),
});

// Base storage path for Android
const BASE_STORAGE_PATH = process.env.ANDROID_STORAGE_PATH || '/data/data/com.termux/files/home/storage/shared';

// GET /api/files - List files and directories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const fullPath = join(BASE_STORAGE_PATH, path);
    
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Path does not exist' },
        { status: 404 }
      );
    }

    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      // List directory contents
      const items = await readdir(fullPath);
      const fileList = await Promise.all(
        items.map(async (item) => {
          const itemPath = join(fullPath, item);
          const itemStats = await stat(itemPath);
          
          return {
            name: item,
            path: join(path, item),
            type: itemStats.isDirectory() ? 'directory' : 'file',
            size: itemStats.size,
            lastModified: itemStats.mtime,
            extension: itemStats.isFile() ? extname(item) : null,
          };
        })
      );

      // Sort: directories first, then files, both alphabetically
      fileList.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return NextResponse.json({
        path,
        type: 'directory',
        contents: fileList,
      });
    } else {
      // Return file info
      return NextResponse.json({
        path,
        type: 'file',
        size: stats.size,
        lastModified: stats.mtime,
        extension: extname(fullPath),
      });
    }
  } catch (error) {
    console.error('Error reading files:', error);
    return NextResponse.json(
      { error: 'Failed to read files' },
      { status: 500 }
    );
  }
}

// POST /api/files - Perform file operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = fileOperationSchema.parse(body);

    const fullPath = join(BASE_STORAGE_PATH, validatedData.path);
    
    // Log the operation
    await db.fileOperation.create({
      data: {
        type: validatedData.operation,
        sourcePath: validatedData.path,
        targetPath: validatedData.targetPath,
        status: 'running',
        metadata: {
          userId: validatedData.userId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    let result;

    switch (validatedData.operation) {
      case 'read':
        result = await readFileOperation(fullPath);
        break;
      case 'write':
        result = await writeFileOperation(fullPath, validatedData.content);
        break;
      case 'delete':
        result = await deleteFileOperation(fullPath);
        break;
      case 'list':
        result = await listDirectoryOperation(fullPath);
        break;
      case 'move':
        if (!validatedData.targetPath) {
          throw new Error('Target path is required for move operation');
        }
        result = await moveFileOperation(fullPath, join(BASE_STORAGE_PATH, validatedData.targetPath));
        break;
      case 'copy':
        if (!validatedData.targetPath) {
          throw new Error('Target path is required for copy operation');
        }
        result = await copyFileOperation(fullPath, join(BASE_STORAGE_PATH, validatedData.targetPath));
        break;
      case 'organize':
        result = await organizeDirectoryOperation(fullPath);
        break;
      default:
        throw new Error(`Unknown operation: ${validatedData.operation}`);
    }

    // Update file system entry in database
    await updateFileSystemEntry(validatedData.path, result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in file operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'File operation failed' },
      { status: 500 }
    );
  }
}

// File operation implementations
async function readFileOperation(path: string): Promise<any> {
  try {
    const content = await readFile(path, 'utf-8');
    const stats = await stat(path);
    
    return {
      operation: 'read',
      path,
      content,
      size: stats.size,
      lastModified: stats.mtime,
      success: true,
    };
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

async function writeFileOperation(path: string, content?: string): Promise<any> {
  try {
    // Ensure directory exists
    const dir = dirname(path);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(path, content || '', 'utf-8');
    const stats = await stat(path);
    
    return {
      operation: 'write',
      path,
      size: stats.size,
      lastModified: stats.mtime,
      success: true,
    };
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}

async function deleteFileOperation(path: string): Promise<any> {
  try {
    await unlink(path);
    
    return {
      operation: 'delete',
      path,
      success: true,
    };
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}

async function listDirectoryOperation(path: string): Promise<any> {
  try {
    const items = await readdir(path);
    const fileList = await Promise.all(
      items.map(async (item) => {
        const itemPath = join(path, item);
        const stats = await stat(itemPath);
        
        return {
          name: item,
          path: itemPath,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          lastModified: stats.mtime,
          extension: stats.isFile() ? extname(item) : null,
        };
      })
    );

    return {
      operation: 'list',
      path,
      contents: fileList,
      count: fileList.length,
      success: true,
    };
  } catch (error) {
    throw new Error(`Failed to list directory: ${error}`);
  }
}

async function moveFileOperation(sourcePath: string, targetPath: string): Promise<any> {
  try {
    // Ensure target directory exists
    const targetDir = dirname(targetPath);
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    const content = await readFile(sourcePath);
    await writeFile(targetPath, content);
    await unlink(sourcePath);
    
    return {
      operation: 'move',
      sourcePath,
      targetPath,
      success: true,
    };
  } catch (error) {
    throw new Error(`Failed to move file: ${error}`);
  }
}

async function copyFileOperation(sourcePath: string, targetPath: string): Promise<any> {
  try {
    // Ensure target directory exists
    const targetDir = dirname(targetPath);
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    const content = await readFile(sourcePath);
    await writeFile(targetPath, content);
    
    return {
      operation: 'copy',
      sourcePath,
      targetPath,
      success: true,
    };
  } catch (error) {
    throw new Error(`Failed to copy file: ${error}`);
  }
}

async function organizeDirectoryOperation(path: string): Promise<any> {
  try {
    const items = await readdir(path);
    const operations = [];

    // Create organized directory structure
    const organizedDirs = {
      images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
      documents: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
      videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
      audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
      archives: ['zip', 'rar', '7z', 'tar', 'gz'],
      code: ['js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c'],
    };

    // Create directories if they don't exist
    for (const dir of Object.keys(organizedDirs)) {
      const dirPath = join(path, dir);
      if (!existsSync(dirPath)) {
        await mkdir(dirPath);
      }
    }

    // Move files to appropriate directories
    for (const item of items) {
      const itemPath = join(path, item);
      const stats = await stat(itemPath);
      
      if (stats.isFile()) {
        const ext = extname(item).toLowerCase().slice(1);
        
        for (const [dir, extensions] of Object.entries(organizedDirs)) {
          if (extensions.includes(ext)) {
            const targetPath = join(path, dir, item);
            await rename(itemPath, targetPath);
            operations.push({
              type: 'move',
              from: item,
              to: `${dir}/${item}`,
            });
            break;
          }
        }
      }
    }

    return {
      operation: 'organize',
      path,
      operations,
      success: true,
    };
  } catch (error) {
    throw new Error(`Failed to organize directory: ${error}`);
  }
}

// Helper function to update database entry
async function updateFileSystemEntry(path: string, result: any) {
  try {
    const fullPath = join(BASE_STORAGE_PATH, path);
    
    if (existsSync(fullPath)) {
      const stats = await stat(fullPath);
      
      await db.fileSystemEntry.upsert({
        where: { path },
        update: {
          name: basename(path),
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          lastModified: stats.mtime,
          updatedAt: new Date(),
        },
        create: {
          path,
          name: basename(path),
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          lastModified: stats.mtime,
        },
      });
    } else {
      // File was deleted, remove from database
      await db.fileSystemEntry.deleteMany({
        where: { path },
      });
    }
  } catch (error) {
    console.error('Error updating file system entry:', error);
  }
}

// Helper function for dirname
function dirname(path: string): string {
  return path.split('/').slice(0, -1).join('/');
}

// Helper function for rename (move)
async function rename(oldPath: string, newPath: string): Promise<void> {
  const content = await readFile(oldPath);
  await writeFile(newPath, content);
  await unlink(oldPath);
}
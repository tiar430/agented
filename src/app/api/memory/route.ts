import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { writeFile, mkdir, readFile, unlink, readdir, stat } from 'fs/promises';
import { join } from 'path';

// Schema for memory entries
const memoryEntrySchema = z.object({
  type: z.enum(['user_preference', 'conversation_context', 'task_result', 'system_config']),
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
  metadata: z.record(z.any()).optional(),
});

// Local storage path
const MEMORY_STORAGE_PATH = join(process.cwd(), 'data', 'memory');

// Ensure memory storage directory exists
async function ensureMemoryDirectory() {
  try {
    await mkdir(MEMORY_STORAGE_PATH, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Save memory entry to local file
async function saveMemoryToFile(entry: any) {
  await ensureMemoryDirectory();
  const filename = `${entry.type}_${entry.id}.json`;
  const filepath = join(MEMORY_STORAGE_PATH, filename);
  await writeFile(filepath, JSON.stringify(entry, null, 2), 'utf-8');
}

// Load memory entries from local files
async function loadMemoryFromFiles() {
  await ensureMemoryDirectory();
  try {
    const files = await readFile(join(MEMORY_STORAGE_PATH, 'index.json'), 'utf-8');
    return JSON.parse(files);
  } catch (error) {
    // Index file doesn't exist, return empty array
    return [];
  }
}

// Update memory index file
async function updateMemoryIndex(entries: any[]) {
  await ensureMemoryDirectory();
  const indexPath = join(MEMORY_STORAGE_PATH, 'index.json');
  await writeFile(indexPath, JSON.stringify(entries, null, 2), 'utf-8');
}

// GET /api/memory - List all memory entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const key = searchParams.get('key');

    let entries = await loadMemoryFromFiles();

    // Filter by type if specified
    if (type) {
      entries = entries.filter((entry: any) => entry.type === type);
    }

    // Filter by key if specified
    if (key) {
      entries = entries.filter((entry: any) => entry.key.includes(key));
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching memory entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory entries' },
      { status: 500 }
    );
  }
}

// POST /api/memory - Create new memory entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = memoryEntrySchema.parse(body);

    const entry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: validatedData.type,
      key: validatedData.key,
      value: validatedData.value,
      metadata: validatedData.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    await db.memoryEntry.create({
      data: entry,
    });

    // Save to local file storage
    await saveMemoryToFile(entry);

    // Update index
    const entries = await loadMemoryFromFiles();
    entries.push(entry);
    await updateMemoryIndex(entries);

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating memory entry:', error);
    return NextResponse.json(
      { error: 'Failed to create memory entry' },
      { status: 500 }
    );
  }
}

// PUT /api/memory - Update memory entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Update in database
    const entry = await db.memoryEntry.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    // Update in local file
    const entries = await loadMemoryFromFiles();
    const entryIndex = entries.findIndex((e: any) => e.id === id);
    
    if (entryIndex !== -1) {
      entries[entryIndex] = { ...entries[entryIndex], ...updateData, updatedAt: new Date().toISOString() };
      await updateMemoryIndex(entries);
      
      // Update individual file
      const filename = `${entries[entryIndex].type}_${id}.json`;
      const filepath = join(MEMORY_STORAGE_PATH, filename);
      await writeFile(filepath, JSON.stringify(entries[entryIndex], null, 2), 'utf-8');
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error updating memory entry:', error);
    return NextResponse.json(
      { error: 'Failed to update memory entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/memory/[id] - Delete memory entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete from database
    await db.memoryEntry.delete({
      where: { id },
    });

    // Delete from local file storage
    const entries = await loadMemoryFromFiles();
    const entryIndex = entries.findIndex((e: any) => e.id === id);
    
    if (entryIndex !== -1) {
      const entry = entries[entryIndex];
      const filename = `${entry.type}_${id}.json`;
      const filepath = join(MEMORY_STORAGE_PATH, filename);
      
      try {
        await unlink(filepath);
      } catch (error) {
        // File might not exist, continue
      }
      
      entries.splice(entryIndex, 1);
      await updateMemoryIndex(entries);
    }

    return NextResponse.json({ message: 'Memory entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting memory entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete memory entry' },
      { status: 500 }
    );
  }
}

// GET /api/memory/stats - Get memory statistics
export async function GET_STATS() {
  try {
    const entries = await loadMemoryFromFiles();
    
    const stats = {
      totalEntries: entries.length,
      typeDistribution: entries.reduce((acc: any, entry: any) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      }, {}),
      storageUsed: 0, // Calculate actual file size
      lastUpdated: entries.length > 0 ? Math.max(...entries.map((e: any) => new Date(e.updatedAt).getTime())) : null,
    };

    // Calculate storage size
    try {
      const files = await readdir(MEMORY_STORAGE_PATH);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filepath = join(MEMORY_STORAGE_PATH, file);
          const stats = await stat(filepath);
          stats.storageUsed += stats.size;
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching memory statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory statistics' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// Schema for creating a new task
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  type: z.enum(['file_management', 'web_scraping', 'data_analysis', 'github_integration', 'custom']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  input: z.object({}).optional(),
  userId: z.string(),
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
});

// GET /api/tasks - List all tasks for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const where: any = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              model: true,
            },
          },
          session: {
            select: {
              id: true,
              title: true,
              startTime: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const task = await db.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        priority: validatedData.priority,
        input: validatedData.input,
        userId: validatedData.userId,
        agentId: validatedData.agentId,
        sessionId: validatedData.sessionId,
        status: 'pending',
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            model: true,
            config: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Start processing the task asynchronously
    processTask(task.id).catch(console.error);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// Async function to process tasks
async function processTask(taskId: string) {
  try {
    // Update task status to running
    await db.task.update({
      where: { id: taskId },
      data: { status: 'running' },
    });

    // Fetch task with agent details
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        agent: true,
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    let result;

    // Process task based on type
    switch (task.type) {
      case 'file_management':
        result = await processFileManagementTask(task);
        break;
      case 'web_scraping':
        result = await processWebScrapingTask(task);
        break;
      case 'data_analysis':
        result = await processDataAnalysisTask(task);
        break;
      case 'github_integration':
        result = await processGitHubTask(task);
        break;
      default:
        result = await processCustomTask(task);
    }

    // Update task with result
    await db.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        output: result,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error processing task:', error);
    
    // Update task with error
    await db.task.update({
      where: { id: taskId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });
  }
}

// Task processing functions
async function processFileManagementTask(task: any) {
  const { operation, path, content } = task.input || {};
  
  switch (operation) {
    case 'read':
      return await readFile(path);
    case 'write':
      return await writeFile(path, content);
    case 'delete':
      return await deleteFile(path);
    case 'list':
      return await listDirectory(path);
    case 'organize':
      return await organizeDirectory(path);
    default:
      throw new Error(`Unknown file operation: ${operation}`);
  }
}

async function processWebScrapingTask(task: any) {
  const { url, selectors } = task.input || {};
  
  try {
    const zai = await ZAI.create();
    const searchResult = await zai.functions.invoke("web_search", {
      query: url,
      num: 10
    });
    
    return {
      scraped_data: searchResult,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Web scraping failed: ${error}`);
  }
}

async function processDataAnalysisTask(task: any) {
  const { data, analysis_type } = task.input || {};
  
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a data analysis assistant. Analyze the provided data and provide insights.',
        },
        {
          role: 'user',
          content: `Please analyze this data: ${JSON.stringify(data)}\n\nAnalysis type: ${analysis_type}`,
        },
      ],
    });

    return {
      analysis: completion.choices[0]?.message?.content,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Data analysis failed: ${error}`);
  }
}

async function processGitHubTask(task: any) {
  const { operation, repository, data } = task.input || {};
  
  // This would integrate with GitHub API
  // For now, return a placeholder response
  return {
    operation,
    repository,
    result: `GitHub ${operation} operation completed successfully`,
    timestamp: new Date().toISOString(),
  };
}

async function processCustomTask(task: any) {
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant helping with custom tasks.',
        },
        {
          role: 'user',
          content: `Task: ${task.title}\nDescription: ${task.description}\nInput: ${JSON.stringify(task.input)}`,
        },
      ],
    });

    return {
      result: completion.choices[0]?.message?.content,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Custom task processing failed: ${error}`);
  }
}

// File system helper functions (placeholder implementations)
async function readFile(path: string) {
  return { operation: 'read', path, content: 'File content placeholder' };
}

async function writeFile(path: string, content: string) {
  return { operation: 'write', path, success: true };
}

async function deleteFile(path: string) {
  return { operation: 'delete', path, success: true };
}

async function listDirectory(path: string) {
  return { operation: 'list', path, files: ['file1.txt', 'file2.txt'] };
}

async function organizeDirectory(path: string) {
  return { operation: 'organize', path, organized: true };
}
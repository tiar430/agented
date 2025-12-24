import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Schema for creating a new AI Agent
const createAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().optional(),
  model: z.string().default('phi-2'),
  config: z.object({}).optional(),
  userId: z.string(),
});

// GET /api/agents - List all agents for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const agents = await db.aIAgent.findMany({
      where: { userId },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            type: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            tasks: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAgentSchema.parse(body);

    // Ensure user exists, create if not
    await db.user.upsert({
      where: { id: validatedData.userId },
      update: {},
      create: {
        id: validatedData.userId,
        email: `${validatedData.userId}@example.com`,
        name: `User ${validatedData.userId}`,
      },
    });

    const agent = await db.aIAgent.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        model: validatedData.model,
        config: validatedData.config,
        userId: validatedData.userId,
        status: 'inactive',
      },
      include: {
        capabilities: true,
        _count: {
          select: {
            tasks: true,
            sessions: true,
          },
        },
      },
    });

    // Create default capabilities for the agent
    const defaultCapabilities = [
      {
        name: 'file_management',
        description: 'File system operations (read, write, delete, organize)',
        type: 'builtin',
        config: {
          permissions: ['read', 'write', 'delete', 'move', 'copy'],
          scope: 'full',
        },
        enabled: true,
      },
      {
        name: 'web_scraping',
        description: 'Web scraping and data extraction capabilities',
        type: 'mcp',
        config: {
          service: 'playwright',
          timeout: 30000,
        },
        enabled: true,
      },
      {
        name: 'github_integration',
        description: 'GitHub repository management and operations',
        type: 'mcp',
        config: {
          service: 'github',
          permissions: ['read', 'write'],
        },
        enabled: true,
      },
      {
        name: 'data_analysis',
        description: 'Data processing and analysis capabilities',
        type: 'builtin',
        config: {
          supportedFormats: ['csv', 'json', 'txt'],
          maxFileSize: '10MB',
        },
        enabled: true,
      },
    ];

    await db.capability.createMany({
      data: defaultCapabilities.map(cap => ({
        ...cap,
        agentId: agent.id,
      })),
    });

    // Fetch the created agent with capabilities
    const createdAgent = await db.aIAgent.findUnique({
      where: { id: agent.id },
      include: {
        capabilities: true,
        _count: {
          select: {
            tasks: true,
            sessions: true,
          },
        },
      },
    });

    return NextResponse.json({ agent: createdAgent }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
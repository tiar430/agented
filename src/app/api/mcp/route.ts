import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Schema for MCP connections
const mcpConnectionSchema = z.object({
  name: z.string().min(1, 'Server name is required'),
  type: z.enum(['playwright', 'github', 'filesystem', 'custom']),
  endpoint: z.string().optional(),
  config: z.record(z.any()).optional(),
  status: z.enum(['connected', 'disconnected', 'error']).default('disconnected'),
});

// GET /api/mcp - List all MCP connections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const connections = await db.mCPConnection.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching MCP connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MCP connections' },
      { status: 500 }
    );
  }
}

// POST /api/mcp - Create new MCP connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = mcpConnectionSchema.parse(body);

    const connection = await db.mCPConnection.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        endpoint: validatedData.endpoint,
        config: validatedData.config || {},
        status: validatedData.status,
      },
    });

    // Test connection if endpoint is provided
    if (validatedData.endpoint) {
      try {
        const testResponse = await fetch(validatedData.endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (testResponse.ok) {
          await db.mCPConnection.update({
            where: { id: connection.id },
            data: { 
              status: 'connected',
              lastUsed: new Date(),
            },
          });
        } else {
          await db.mCPConnection.update({
            where: { id: connection.id },
            data: { status: 'error' },
          });
        }
      } catch (error) {
        await db.mCPConnection.update({
          where: { id: connection.id },
          data: { status: 'error' },
        });
      }
    }

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating MCP connection:', error);
    return NextResponse.json(
      { error: 'Failed to create MCP connection' },
      { status: 500 }
    );
  }
}

// PUT /api/mcp - Update MCP connection
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    const connection = await db.mCPConnection.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('Error updating MCP connection:', error);
    return NextResponse.json(
      { error: 'Failed to update MCP connection' },
      { status: 500 }
    );
  }
}

// DELETE /api/mcp/[id] - Delete MCP connection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await db.mCPConnection.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'MCP connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting MCP connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete MCP connection' },
      { status: 500 }
    );
  }
}
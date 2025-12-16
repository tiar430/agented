import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// Schema for chat messages
const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  sessionId: z.string().optional(),
  agentId: z.string().optional(),
  userId: z.string(),
});

// POST /api/chat - Send a message and get AI response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = chatMessageSchema.parse(body);

    // Ensure user exists
    await db.user.upsert({
      where: { id: validatedData.userId },
      update: {},
      create: {
        id: validatedData.userId,
        email: `${validatedData.userId}@example.com`,
        name: `User ${validatedData.userId}`,
      },
    });

    // Get or create session
    let session;
    if (validatedData.sessionId) {
      session = await db.session.findUnique({
        where: { id: validatedData.sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // Last 20 messages for context
          },
          agent: true,
        },
      });
    }

    if (!session) {
      // Create new session
      session = await db.session.create({
        data: {
          userId: validatedData.userId,
          agentId: validatedData.agentId,
          status: 'active',
          context: {},
        },
        include: {
          agent: true,
          messages: true,
        },
      });
    }

    // Save user message
    await db.message.create({
      data: {
        content: validatedData.message,
        type: 'user',
        sessionId: session.id,
      },
    });

    // Get AI response
    const aiResponse = await getAIResponse(validatedData.message, session);

    // Save AI response
    await db.message.create({
      data: {
        content: aiResponse.content,
        type: 'assistant',
        sessionId: session.id,
        metadata: aiResponse.metadata,
      },
    });

    // Update session context
    await db.session.update({
      where: { id: session.id },
      data: {
        context: {
          lastMessage: validatedData.message,
          lastResponse: aiResponse.content,
          messageCount: (session.messages?.length || 0) + 2,
        },
      },
    });

    return NextResponse.json({
      response: aiResponse.content,
      sessionId: session.id,
      metadata: aiResponse.metadata,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// GET /api/chat - Get chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'Session ID or User ID is required' },
        { status: 400 }
      );
    }

    if (sessionId) {
      // Get specific session
      const session = await db.session.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          agent: {
            select: {
              id: true,
              name: true,
              model: true,
            },
          },
        },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ session });
    } else {
      // Get all sessions for user
      const sessions = await db.session.findMany({
        where: { userId },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              model: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ sessions });
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat - Clear chat history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Delete all messages in the session
    await db.message.deleteMany({
      where: { sessionId },
    });

    // Update session
    await db.session.update({
      where: { id: sessionId },
      data: {
        context: {},
        status: 'active',
      },
    });

    return NextResponse.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    );
  }
}

// AI Response Generation
async function getAIResponse(message: string, session: any) {
  try {
    const zai = await ZAI.create();

    // Build conversation history
    const conversationHistory = session.messages?.map((msg: any) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })) || [];

    // System prompt based on agent capabilities
    let systemPrompt = `You are an AI assistant integrated with an Android mobile app. You have the following capabilities:
    
1. File Management - You can read, write, organize, and manage files on the device storage
2. Web Scraping - You can extract data from websites using Playwright
3. GitHub Integration - You can interact with GitHub repositories
4. Data Analysis - You can analyze and process various data formats
5. General Assistance - You can help with various tasks using your general knowledge

Current agent: ${session.agent?.name || 'Default Assistant'}
Model: ${session.agent?.model || 'phi-2'}

Please respond helpfully and indicate when you need to perform specific actions that require task creation.`;

    // Add agent-specific context if available
    if (session.agent?.config) {
      systemPrompt += `\n\nAgent Configuration: ${JSON.stringify(session.agent.config)}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: message },
    ];

    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    // Check if response indicates need for task creation
    const needsTask = checkIfTaskNeeded(response);
    
    return {
      content: response,
      metadata: {
        model: session.agent?.model || 'phi-2',
        needsTask,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error getting AI response:', error);
    return {
      content: 'I apologize, but I encountered an error while processing your request. Please try again.',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Check if the AI response indicates a task needs to be created
function checkIfTaskNeeded(response: string): boolean {
  const taskKeywords = [
    'I will',
    'Let me',
    'I can',
    'I need to',
    'I should',
    'perform',
    'execute',
    'process',
    'analyze',
    'scrape',
    'organize',
    'create',
    'delete',
    'modify',
  ];

  return taskKeywords.some(keyword => 
    response.toLowerCase().includes(keyword.toLowerCase())
  );
}
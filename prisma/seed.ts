import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample AI agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        id: 'agent-1',
        name: 'Data Analysis Agent',
        description: 'Specializes in data processing and analysis tasks',
        model: 'phi-2',
        status: 'active',
        capabilities: ['data_analysis', 'file_processing', 'report_generation'],
        config: {
          maxTokens: 2048,
          temperature: 0.7,
          systemPrompt: 'You are a helpful data analysis assistant.'
        }
      }
    }),
    prisma.agent.create({
      data: {
        id: 'agent-2',
        name: 'Web Automation Agent',
        description: 'Automates web interactions and data extraction',
        model: 'gpt-3.5-turbo',
        status: 'active',
        capabilities: ['web_automation', 'data_extraction', 'form_filling'],
        config: {
          maxTokens: 4096,
          temperature: 0.3,
          systemPrompt: 'You are a web automation specialist.'
        }
      }
    }),
    prisma.agent.create({
      data: {
        id: 'agent-3',
        name: 'File Management Agent',
        description: 'Manages file operations and organization',
        model: 'phi-2',
        status: 'inactive',
        capabilities: ['file_organization', 'backup_management', 'cleanup'],
        config: {
          maxTokens: 1024,
          temperature: 0.1,
          systemPrompt: 'You are a file management assistant.'
        }
      }
    })
  ])

  console.log(`✅ Created ${agents.length} AI agents`)

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        id: 'task-1',
        title: 'Analyze sales data',
        description: 'Process and analyze Q4 sales data',
        type: 'data_analysis',
        status: 'pending',
        priority: 'high',
        agentId: 'agent-1',
        config: {
          inputFile: '/data/sales_q4.csv',
          outputFile: '/reports/sales_analysis.pdf',
          format: 'pdf'
        }
      }
    }),
    prisma.task.create({
      data: {
        id: 'task-2',
        title: 'Extract product prices',
        description: 'Scrape product prices from e-commerce sites',
        type: 'web_automation',
        status: 'in_progress',
        priority: 'medium',
        agentId: 'agent-2',
        config: {
          targetUrl: 'https://example-shop.com/products',
          selectors: {
            price: '.price',
            name: '.product-name'
          }
        }
      }
    }),
    prisma.task.create({
      data: {
        id: 'task-3',
        title: 'Organize downloads folder',
        description: 'Clean up and organize the downloads folder',
        type: 'file_management',
        status: 'completed',
        priority: 'low',
        agentId: 'agent-3',
        result: {
          filesOrganized: 156,
          foldersCreated: 12,
          spaceFreed: '2.3GB'
        }
      }
    })
  ])

  console.log(`✅ Created ${tasks.length} tasks`)

  // Create sample chat messages
  const messages = await Promise.all([
    prisma.chatMessage.create({
      data: {
        id: 'msg-1',
        content: 'Hello! Can you help me analyze my sales data?',
        role: 'user',
        agentId: 'agent-1',
        sessionId: 'session-1'
      }
    }),
    prisma.chatMessage.create({
      data: {
        id: 'msg-2',
        content: 'I\'d be happy to help you analyze your sales data! Could you please provide the file path and specify what kind of analysis you need?',
        role: 'assistant',
        agentId: 'agent-1',
        sessionId: 'session-1'
      }
    }),
    prisma.chatMessage.create({
      data: {
        id: 'msg-3',
        content: 'The file is at /data/sales_q4.csv and I need a summary with charts.',
        role: 'user',
        agentId: 'agent-1',
        sessionId: 'session-1'
      }
    })
  ])

  console.log(`✅ Created ${messages.length} chat messages`)

  // Create MCP connections
  const mcpConnections = await Promise.all([
    prisma.mcpConnection.create({
      data: {
        id: 'mcp-1',
        name: 'Playwright Automation',
        type: 'playwright',
        endpoint: 'http://localhost:3001',
        status: 'connected',
        config: {
          browser: 'chromium',
          headless: true,
          timeout: 30000
        }
      }
    }),
    prisma.mcpConnection.create({
      data: {
        id: 'mcp-2',
        name: 'GitHub Integration',
        type: 'github',
        endpoint: 'https://api.github.com',
        status: 'connected',
        config: {
          username: 'tiar430',
          token: 'ghp_***'
        }
      }
    }),
    prisma.mcpConnection.create({
      data: {
        id: 'mcp-3',
        name: 'File System Access',
        type: 'filesystem',
        status: 'connected',
        config: {
          basePath: '/storage/emulated/0',
          permissions: ['read', 'write', 'execute']
        }
      }
    })
  ])

  console.log(`✅ Created ${mcpConnections.length} MCP connections`)

  // Create memory entries
  const memoryEntries = await Promise.all([
    prisma.memoryEntry.create({
      data: {
        id: 'mem-1',
        type: 'user_preference',
        key: 'theme',
        value: 'dark',
        metadata: {
          category: 'ui',
          lastUpdated: new Date().toISOString()
        }
      }
    }),
    prisma.memoryEntry.create({
      data: {
        id: 'mem-2',
        type: 'conversation_context',
        key: 'last_analysis_type',
        value: 'sales_data',
        metadata: {
          sessionId: 'session-1',
          timestamp: new Date().toISOString()
        }
      }
    }),
    prisma.memoryEntry.create({
      data: {
        id: 'mem-3',
        type: 'system_config',
        key: 'max_file_size',
        value: '104857600', // 100MB
        metadata: {
          unit: 'bytes',
          description: 'Maximum file size for uploads'
        }
      }
    })
  ])

  console.log(`✅ Created ${memoryEntries.length} memory entries`)

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
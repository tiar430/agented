'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Plus, 
  Server, 
  Bot, 
  Database, 
  Save, 
  Trash2, 
  ExternalLink,
  HardDrive,
  Cpu,
  Shield,
  Zap
} from 'lucide-react';

interface MCPConnection {
  id: string;
  name: string;
  type: 'playwright' | 'github' | 'filesystem' | 'custom';
  endpoint?: string;
  config: Record<string, any>;
  status: 'connected' | 'disconnected' | 'error';
  lastUsed?: string;
}

interface AIAgent {
  id: string;
  name: string;
  description?: string;
  model: string;
  status: 'active' | 'inactive' | 'training';
  capabilities: string[];
  tasks: number;
  sessions: number;
  createdAt: string;
}

interface MemoryEntry {
  id: string;
  type: 'user_preference' | 'conversation_context' | 'task_result' | 'system_config';
  key: string;
  value: any;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function SideMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'mcp' | 'agents' | 'memory'>('mcp');
  const [mounted, setMounted] = useState(false);

  // MCP Server state
  const [mcpConnections, setMcpConnections] = useState<MCPConnection[]>([
    {
      id: '1',
      name: 'Playwright Web Scraper',
      type: 'playwright',
      endpoint: 'http://localhost:3001',
      config: { timeout: 30000, headless: true },
      status: 'connected',
      lastUsed: new Date().toISOString()
    },
    {
      id: '2',
      name: 'GitHub Integration',
      type: 'github',
      config: { permissions: ['read', 'write'], token: '' },
      status: 'disconnected'
    },
    {
      id: '3',
      name: 'Local File System',
      type: 'filesystem',
      config: { path: '/storage/emulated/0', permissions: 'full' },
      status: 'connected'
    }
  ]);

  // AI Agents state
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([
    {
      id: '1',
      name: 'Android Assistant',
      description: 'Multi-tasking AI assistant for Android',
      model: 'phi-2',
      status: 'active',
      capabilities: ['file_management', 'web_scraping', 'data_analysis'],
      tasks: 12,
      sessions: 5,
      createdAt: new Date().toISOString()
    }
  ]);

  // Memory state
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>([
    {
      id: '1',
      type: 'user_preference',
      key: 'theme',
      value: 'dark',
      metadata: { category: 'ui', priority: 'medium' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'conversation_context',
      key: 'last_session',
      value: { sessionId: 'sess_123', topic: 'file_organization' },
      metadata: { context_type: 'chat', tokens: 150 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Form states
  const [newMcpServer, setNewMcpServer] = useState({
    name: '',
    type: 'custom' as const,
    endpoint: '',
    config: {}
  });

  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    model: 'phi-2',
    capabilities: [] as string[]
  });

  const [newMemoryEntry, setNewMemoryEntry] = useState({
    type: 'user_preference' as const,
    key: '',
    value: '',
    metadata: {}
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle MCP Server creation
  const handleAddMcpServer = async () => {
    if (!newMcpServer.name || !newMcpServer.endpoint) {
      alert('Please fill in server name and endpoint');
      return;
    }

    const newConnection: MCPConnection = {
      id: Date.now().toString(),
      name: newMcpServer.name,
      type: newMcpServer.type,
      endpoint: newMcpServer.endpoint,
      config: newMcpServer.config,
      status: 'disconnected'
    };

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConnection)
      });

      if (response.ok) {
        setMcpConnections(prev => [...prev, newConnection]);
        setNewMcpServer({ name: '', type: 'custom', endpoint: '', config: {} });
        alert('MCP Server added successfully!');
      } else {
        alert('Failed to add MCP Server');
      }
    } catch (error) {
      console.error('Error adding MCP server:', error);
      alert('Error adding MCP Server');
    }
  };

  // Handle AI Agent creation
  const handleAddAgent = async () => {
    if (!newAgent.name) {
      alert('Please enter agent name');
      return;
    }

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAgent.name,
          description: newAgent.description,
          model: newAgent.model,
          userId: 'demo-user-android'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAgents(prev => [...prev, data.agent]);
        setNewAgent({ name: '', description: '', model: 'phi-2', capabilities: [] });
        alert('AI Agent created successfully!');
      } else {
        alert('Failed to create AI Agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Error creating AI Agent');
    }
  };

  // Handle Memory entry creation
  const handleAddMemoryEntry = async () => {
    if (!newMemoryEntry.key || !newMemoryEntry.value) {
      alert('Please fill in key and value');
      return;
    }

    const entry: MemoryEntry = {
      id: Date.now().toString(),
      type: newMemoryEntry.type,
      key: newMemoryEntry.key,
      value: typeof newMemoryEntry.value === 'string' ? newMemoryEntry.value : JSON.parse(newMemoryEntry.value),
      metadata: newMemoryEntry.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });

      if (response.ok) {
        setMemoryEntries(prev => [...prev, entry]);
        setNewMemoryEntry({ type: 'user_preference', key: '', value: '', metadata: {} });
        alert('Memory entry saved successfully!');
      } else {
        alert('Failed to save memory entry');
      }
    } catch (error) {
      console.error('Error saving memory entry:', error);
      alert('Error saving memory entry');
    }
  };

  // Handle MCP Server deletion
  const handleDeleteMcpServer = async (id: string) => {
    try {
      const response = await fetch(`/api/mcp/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMcpConnections(prev => prev.filter(conn => conn.id !== id));
        alert('MCP Server removed successfully!');
      } else {
        alert('Failed to remove MCP Server');
      }
    } catch (error) {
      console.error('Error removing MCP server:', error);
      alert('Error removing MCP Server');
    }
  };

  // Handle Memory entry deletion
  const handleDeleteMemoryEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/memory/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMemoryEntries(prev => prev.filter(entry => entry.id !== id));
        alert('Memory entry deleted successfully!');
      } else {
        alert('Failed to delete memory entry');
      }
    } catch (error) {
      console.error('Error deleting memory entry:', error);
      alert('Error deleting memory entry');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'training': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getMcpIcon = (type: string) => {
    switch (type) {
      case 'playwright': return <Server className="h-4 w-4" />;
      case 'github': return <Database className="h-4 w-4" />;
      case 'filesystem': return <HardDrive className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case 'user_preference': return <Settings className="h-4 w-4" />;
      case 'conversation_context': return <HardDrive className="h-4 w-4" />;
      case 'task_result': return <Zap className="h-4 w-4" />;
      case 'system_config': return <Cpu className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Control Panel
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'mcp'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('mcp')}
          >
            <Server className="h-4 w-4 inline mr-2" />
            MCP Servers
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'agents'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('agents')}
          >
            <Bot className="h-4 w-4 inline mr-2" />
            AI Agents
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'memory'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('memory')}
          >
            <HardDrive className="h-4 w-4 inline mr-2" />
            Memory
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {activeTab === 'mcp' && (
                <div className="space-y-4">
                  {/* Add MCP Server Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add MCP Server
                      </CardTitle>
                      <CardDescription>
                        Add a new Model Context Protocol server connection
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="mcp-name">Server Name</Label>
                        <Input
                          id="mcp-name"
                          placeholder="e.g., Custom API Server"
                          value={newMcpServer.name}
                          onChange={(e) => setNewMcpServer(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mcp-type">Server Type</Label>
                        <select
                          id="mcp-type"
                          value={newMcpServer.type}
                          onChange={(e) => setNewMcpServer(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-800"
                        >
                          <option value="playwright">Playwright</option>
                          <option value="github">GitHub</option>
                          <option value="filesystem">File System</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="mcp-endpoint">Endpoint URL</Label>
                        <Input
                          id="mcp-endpoint"
                          placeholder="http://localhost:3001"
                          value={newMcpServer.endpoint}
                          onChange={(e) => setNewMcpServer(prev => ({ ...prev, endpoint: e.target.value }))}
                        />
                      </div>
                      <Button onClick={handleAddMcpServer} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Server
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Existing MCP Connections */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Active Connections</h3>
                    {mcpConnections.map((conn) => (
                      <Card key={conn.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getMcpIcon(conn.type)}
                            <div>
                              <p className="font-medium text-sm">{conn.name}</p>
                              <p className="text-xs text-slate-500">{conn.endpoint || 'Built-in'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(conn.status)}`} />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMcpServer(conn.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'agents' && (
                <div className="space-y-4">
                  {/* Add AI Agent Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add AI Agent
                      </CardTitle>
                      <CardDescription>
                        Create a new AI agent with specific capabilities
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="agent-name">Agent Name</Label>
                        <Input
                          id="agent-name"
                          placeholder="e.g., Data Analysis Agent"
                          value={newAgent.name}
                          onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="agent-description">Description</Label>
                        <textarea
                          id="agent-description"
                          placeholder="Describe what this agent does..."
                          value={newAgent.description}
                          onChange={(e) => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                          className="min-h-[80px] w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="agent-model">AI Model</Label>
                        <select
                          id="agent-model"
                          value={newAgent.model}
                          onChange={(e) => setNewAgent(prev => ({ ...prev, model: e.target.value }))}
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-800"
                        >
                          <option value="phi-2">Phi-2 (Local)</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="gpt-4">GPT-4</option>
                          <option value="claude-3-haiku">Claude-3 Haiku</option>
                        </select>
                      </div>
                      <Button onClick={handleAddAgent} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Agent
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Existing AI Agents */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Available Agents</h3>
                    {aiAgents.map((agent) => (
                      <Card key={agent.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{agent.name}</p>
                            <p className="text-xs text-slate-500">{agent.model}</p>
                            <div className="flex gap-1 mt-1">
                              {agent.capabilities.slice(0, 2).map((cap) => (
                                <Badge key={cap} variant="secondary" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                              {agent.capabilities.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{agent.capabilities.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'memory' && (
                <div className="space-y-4">
                  {/* Add Memory Entry Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Memory Entry
                      </CardTitle>
                      <CardDescription>
                        Store preferences, context, or system data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="memory-type">Entry Type</Label>
                        <select
                          id="memory-type"
                          value={newMemoryEntry.type}
                          onChange={(e) => setNewMemoryEntry(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-800"
                        >
                          <option value="user_preference">User Preference</option>
                          <option value="conversation_context">Conversation Context</option>
                          <option value="task_result">Task Result</option>
                          <option value="system_config">System Config</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="memory-key">Key</Label>
                        <Input
                          id="memory-key"
                          placeholder="e.g., theme, last_session, api_key"
                          value={newMemoryEntry.key}
                          onChange={(e) => setNewMemoryEntry(prev => ({ ...prev, key: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="memory-value">Value</Label>
                        <textarea
                          id="memory-value"
                          placeholder="Enter value (JSON format for complex data)"
                          value={newMemoryEntry.value}
                          onChange={(e) => setNewMemoryEntry(prev => ({ ...prev, value: e.target.value }))}
                          className="min-h-[80px] w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
                        />
                      </div>
                      <Button onClick={handleAddMemoryEntry} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Save Entry
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Memory Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Memory Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Total Entries</p>
                          <p className="font-medium">{memoryEntries.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Storage Used</p>
                          <p className="font-medium">~2.4 MB</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Existing Memory Entries */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Stored Entries</h3>
                    {memoryEntries.map((entry) => (
                      <Card key={entry.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            {getMemoryIcon(entry.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{entry.key}</p>
                              <p className="text-xs text-slate-500 truncate">
                                {typeof entry.value === 'string' 
                                  ? entry.value 
                                  : JSON.stringify(entry.value).substring(0, 50) + '...'
                                }
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(entry.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMemoryEntry(entry.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span>Local Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>Optimized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
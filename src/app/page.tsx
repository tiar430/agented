'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  MessageCircle, 
  FolderOpen, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  FileText,
  Globe,
  Github,
  BarChart3,
  Smartphone,
  Cpu,
  Zap,
  Shield,
  Database
} from 'lucide-react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, content: string, type: 'user' | 'assistant'}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'processing'>('idle');
  const [userId] = useState('demo-user-android');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data for demonstration
  const [agents] = useState([
    {
      id: '1',
      name: 'Android Assistant',
      model: 'phi-2',
      status: 'active',
      capabilities: ['file_management', 'web_scraping', 'data_analysis'],
      tasks: 12,
      sessions: 5,
    },
  ]);

  const [recentTasks] = useState([
    { id: '1', title: 'Organize Downloads folder', type: 'file_management', status: 'completed', time: '2 min ago' },
    { id: '2', title: 'Scrape product prices', type: 'web_scraping', status: 'running', time: '5 min ago' },
    { id: '3', title: 'Analyze sales data', type: 'data_analysis', status: 'pending', time: '10 min ago' },
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: message,
      type: 'user' as const,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setAgentStatus('thinking');

    try {
      // Simulate API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          userId: userId,
          agentId: agents[0]?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          type: 'assistant' as const,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setAgentStatus('idle');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'file_management': return <FolderOpen className="h-4 w-4" />;
      case 'web_scraping': return <Globe className="h-4 w-4" />;
      case 'data_analysis': return <BarChart3 className="h-4 w-4" />;
      case 'github_integration': return <Github className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-600 dark:text-slate-400">Loading AI Agent...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-blue-600" />
                <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${agentStatus === 'idle' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Agent</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Android Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Smartphone className="h-3 w-3 mr-1" />
                Android
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Cpu className="h-3 w-3 mr-1" />
                {agents[0]?.model}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat Interface</span>
                </CardTitle>
                <CardDescription>
                  Interact with your AI assistant for various tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                          Start a conversation with your AI assistant
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <FolderOpen className="h-3 w-3 mr-1" />
                            File Management
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Web Scraping
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Data Analysis
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !message.trim()}
                      size="icon"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Status & Tasks */}
          <div className="space-y-6">
            {/* Agent Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>Agent Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={agentStatus === 'idle' ? 'bg-green-500' : 'bg-yellow-500'}>
                    {agentStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Model</span>
                  <Badge variant="outline">{agents[0]?.model}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tasks</span>
                  <span className="text-sm text-slate-500">{agents[0]?.tasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sessions</span>
                  <span className="text-sm text-slate-500">{agents[0]?.sessions}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Recent Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex-shrink-0">
                        {getTaskIcon(task.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.time}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Organize Files
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Web Scraping
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze Data
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
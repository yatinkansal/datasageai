import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Database, User, Loader2, Share2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import DashboardLayout from '../components/DashboardLayout';
import { chatWithAI, extractMetadata, profileTable } from '../../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  tableReferences?: string[];
}

const examplePrompts = [
  "What does the revenue column mean?",
  "Which table contains customer data?",
  "Explain the users table structure",
  "What are the relationships between orders and customers?",
];

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "👋 Hi! I'm your AI data assistant. I can help you understand your database schema, explain column meanings, find relationships, and answer questions about your data. How can I help you today?",
    timestamp: new Date(),
    suggestions: examplePrompts,
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleShareData = async () => {
    setDownloading(true);
    try {
      const schema = await extractMetadata();
      const tableNames = Object.keys(schema);
      const wb = XLSX.utils.book_new();

      // Schema sheet: Table | Column | Type | Nullable | Primary Key
      const schemaRows: (string | boolean)[][] = [['Table', 'Column', 'Type', 'Nullable', 'Primary Key']];
      for (const table of tableNames) {
        const cols = schema[table];
        const colList = Array.isArray(cols) ? cols : [];
        for (const c of colList) {
          const col = c as { name: string; type?: string; nullable?: boolean; primary_key?: boolean };
          schemaRows.push([
            table,
            col.name,
            col.type ?? '',
            col.nullable ?? false,
            col.primary_key ?? false,
          ]);
        }
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(schemaRows), 'Schema');

      // One sheet per table with sample data
      for (const table of tableNames) {
        try {
          const profile = await profileTable(table) as { sample?: Record<string, unknown>[]; columns?: { name: string }[] };
          const sample = profile?.sample ?? [];
          const cols = schema[table];
          const colList = Array.isArray(cols) ? cols : [];
          const headers = colList.map((c: { name: string }) => c.name);
          const rows = sample.map((row: Record<string, unknown>) => headers.map((h) => row[h] ?? ''));
          const sheetData = [headers, ...rows];
          const ws = XLSX.utils.aoa_to_sheet(sheetData);
          const safeName = table.replace(/[:\\/?*[\]]/g, '_').slice(0, 31);
          XLSX.utils.book_append_sheet(wb, ws, safeName || table);
        } catch {
          const cols = schema[table];
          const colList = Array.isArray(cols) ? cols : [];
          const headers = colList.map((c: { name: string }) => c.name);
          XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.aoa_to_sheet([headers]),
            table.replace(/[:\\/?*[\]]/g, '_').slice(0, 31) || table
          );
        }
      }

      const filename = `datasage-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadJson = async () => {
    setDownloading(true);
    try {
      const schema = await extractMetadata();
      const tableNames = Object.keys(schema);
      const profiles: Record<string, unknown> = {};
      for (const table of tableNames) {
        try {
          profiles[table] = await profileTable(table);
        } catch {
          profiles[table] = { error: 'Could not load profile' };
        }
      }
      const payload = {
        exportedAt: new Date().toISOString(),
        schema,
        profiles,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datasage-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await chatWithAI(text);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "Sorry, I couldn't process your request.",
        timestamp: new Date(),
        suggestions: [
          "Tell me more about this table",
          "Show me related tables",
          "Export this documentation",
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error communicating with the server. Please ensure the backend is running.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Ask Your Data</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-indigo-200 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all"
                onClick={handleShareData}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {downloading ? 'Downloading...' : 'Share Data'}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={handleDownloadJson}
                disabled={downloading}
              >
                <Download className="w-4 h-4" />
                Download as JSON
              </Button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Chat with AI to understand your database schema and documentation</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {message.role === 'user' ? (
                  // User Message
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-2xl shadow-lg">
                      <p className="leading-relaxed">{message.content}</p>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                ) : (
                  // Assistant Message
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-5 py-3 max-w-2xl border border-gray-200 dark:border-gray-600">
                        <div
                          className="leading-relaxed text-gray-800 dark:text-gray-200 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\n/g, '<br />'),
                          }}
                        />
                      </div>

                      {/* Table References */}
                      {message.tableReferences && message.tableReferences.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Database className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Referenced tables:</span>
                          {message.tableReferences.map((table) => (
                            <button
                              key={table}
                              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                            >
                              {table}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && index === messages.length - 1 && (
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(suggestion)}
                              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-5 py-3 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                    <span className="text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Example Prompts - Show only when no messages */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Try asking:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {examplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <Input
                type="text"
                placeholder="Ask a question about your data..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-12 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isTyping}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

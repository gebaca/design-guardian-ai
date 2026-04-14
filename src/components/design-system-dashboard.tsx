import { getDesignResponse } from '../services/ai';
import systempromptText from '/src/prompts/system-prompt-handoffds.md?raw';
import { useState, useRef, useEffect } from 'react';
import {
  Code2,
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send,
  Copy,
  RotateCcw,
  Check,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Settings,
  Palette,
  Type,
  Square,
  Bot,
  User,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DesignSystem {
  color?: {
    brand?: Record<string, string>;
    semantic?: Record<string, string>;
    neutral?: Record<string, string>;
  };
  typography?: {
    fontFamily?: Record<string, string>;
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, string>;
    lineHeight?: Record<string, string>;
  };
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
  shadow?: Record<string, string>;
}

// ============================================
// DEFAULT DESIGN SYSTEM JSON
// ============================================
const DEFAULT_DESIGN_SYSTEM = `{
  "color": {
    "brand": {
      "primary": "#6366F1",
      "primary-hover": "#4F46E5",
      "primary-subtle": "#EEF2FF",
      "primary-text": "#3730A3"
    },
    "semantic": {
      "success": "#10B981",
      "success-subtle": "#D1FAE5",
      "warning": "#F59E0B",
      "warning-subtle": "#FEF3C7",
      "danger": "#EF4444",
      "danger-subtle": "#FEE2E2"
    },
    "neutral": {
      "900": "#111827",
      "700": "#374151",
      "500": "#6B7280",
      "300": "#D1D5DB",
      "100": "#F3F4F6",
      "50": "#F9FAFB",
      "0": "#FFFFFF"
    }
  },
  "typography": {
    "fontFamily": {
      "heading": "Inter, system-ui, sans-serif",
      "body": "Inter, system-ui, sans-serif"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem"
    },
    "fontWeight": {
      "normal": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700"
    },
    "lineHeight": {
      "tight": "1.25",
      "normal": "1.5",
      "relaxed": "1.75"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem"
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.1)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)"
  }
}`;

// ============================================
// MAIN COMPONENT
// ============================================
export default function DesignSystemDashboard() {
  // Panel visibility state
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // JSON Editor state
  const [jsonContent, setJsonContent] = useState(DEFAULT_DESIGN_SYSTEM);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [parsedDesignSystem, setParsedDesignSystem] =
    useState<DesignSystem | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your design system assistant. I can help you modify colors, typography, spacing, and other design tokens. What would you like to change?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Preview state
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop'
  );
  const [activeTab, setActiveTab] = useState<
    'colors' | 'typography' | 'components'
  >('colors');

  useEffect(() => {
    try {
      // Si el contenido viene con marcas de markdown por error, las limpiamos
      const cleanContent = jsonContent.replace(/```json|```/g, '').trim();

      const parsed = JSON.parse(cleanContent);
      setParsedDesignSystem(parsed);
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON format');
      setParsedDesignSystem(null);
    }
  }, [jsonContent]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Handle sending a message to the AI
   * This is where you'll integrate your Groq API logic
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 1. Llamada a la IA
      const aiResponse = await getDesignResponse(
        inputValue,
        jsonContent,
        systempromptText
      );

      // 2. MÁGIA: Buscamos si la respuesta contiene un bloque de código JSON
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);

      if (jsonMatch && jsonMatch[1]) {
        const newJson = jsonMatch[1].trim();
        // ¡Esto actualiza el editor de la izquierda automáticamente!
        setJsonContent(newJson);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.replace(
          /```json[\s\S]*?```/g,
          '✨ **Sistema de diseño actualizado automáticamente.**'
        ),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetJson = () => {
    setJsonContent(DEFAULT_DESIGN_SYSTEM);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getLineNumbers = () => {
    const lines = jsonContent.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getViewWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      default:
        return 'w-full';
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className='flex flex-col h-screen bg-neutral-950 text-neutral-100'>
      {/* Header */}
      <header className='flex items-center justify-between px-4 h-14 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20'>
            <Palette className='w-4 h-4 text-indigo-400' />
          </div>
          <div>
            <h1 className='text-sm font-semibold text-neutral-100'>
              Design System Studio
            </h1>
            <p className='text-xs text-neutral-500'>
              Edit, preview, and iterate
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button className='p-2 rounded-lg hover:bg-neutral-800 transition-colors'>
            <Settings className='w-4 h-4 text-neutral-400' />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Panel - JSON Editor */}
        <div
          className={`flex flex-col border-r border-neutral-800 bg-neutral-900/30 transition-all duration-300 ${
            leftPanelOpen ? 'w-96' : 'w-0'
          }`}
        >
          {leftPanelOpen && (
            <>
              <div className='flex items-center justify-between px-4 h-12 border-b border-neutral-800'>
                <div className='flex items-center gap-2'>
                  <Code2 className='w-4 h-4 text-indigo-400' />
                  <span className='text-sm font-medium'>
                    design-system.json
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <button
                    onClick={handleCopyJson}
                    className='p-1.5 rounded hover:bg-neutral-800 transition-colors'
                    title='Copy JSON'
                  >
                    {copied ? (
                      <Check className='w-3.5 h-3.5 text-emerald-400' />
                    ) : (
                      <Copy className='w-3.5 h-3.5 text-neutral-400' />
                    )}
                  </button>
                  <button
                    onClick={handleResetJson}
                    className='p-1.5 rounded hover:bg-neutral-800 transition-colors'
                    title='Reset to default'
                  >
                    <RotateCcw className='w-3.5 h-3.5 text-neutral-400' />
                  </button>
                </div>
              </div>

              <div className='flex-1 overflow-auto'>
                <div className='flex text-xs font-mono'>
                  {/* Line numbers */}
                  <div className='flex flex-col items-end py-3 px-3 bg-neutral-900/50 text-neutral-600 select-none border-r border-neutral-800'>
                    {getLineNumbers().map((num) => (
                      <span key={num} className='leading-5'>
                        {num}
                      </span>
                    ))}
                  </div>
                  {/* Editor */}
                  <textarea
                    value={jsonContent}
                    onChange={(e) => setJsonContent(e.target.value)}
                    className='flex-1 p-3 bg-transparent text-neutral-300 resize-none outline-none leading-5'
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Error/Success indicator */}
              <div
                className={`px-4 py-2 text-xs border-t border-neutral-800 ${jsonError ? 'text-red-400' : 'text-emerald-400'}`}
              >
                <div className='flex items-center gap-2'>
                  {jsonError ? (
                    <>
                      <AlertCircle className='w-3.5 h-3.5' />
                      <span>{jsonError}</span>
                    </>
                  ) : (
                    <>
                      <Check className='w-3.5 h-3.5' />
                      <span>Valid JSON</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Left Panel Toggle */}
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className='flex items-center justify-center w-5 hover:bg-neutral-800 transition-colors border-r border-neutral-800'
        >
          {leftPanelOpen ? (
            <ChevronLeft className='w-4 h-4 text-neutral-500' />
          ) : (
            <ChevronRight className='w-4 h-4 text-neutral-500' />
          )}
        </button>

        {/* Center Panel - AI Chat */}
        <div className='flex flex-col flex-1 min-w-0'>
          <div className='flex items-center justify-between px-4 h-12 border-b border-neutral-800'>
            <div className='flex items-center gap-2'>
              <MessageSquare className='w-4 h-4 text-indigo-400' />
              <span className='text-sm font-medium'>AI Assistant</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Sparkles className='w-3.5 h-3.5 text-indigo-400' />
              <span className='text-xs text-neutral-500'>Powered by AI</span>
            </div>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                    message.role === 'assistant'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className='w-4 h-4' />
                  ) : (
                    <User className='w-4 h-4' />
                  )}
                </div>
                <div
                  className={`flex flex-col max-w-[80%] ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm ${
                      message.role === 'assistant'
                        ? 'bg-neutral-800 text-neutral-200 rounded-tl-sm'
                        : 'bg-indigo-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className='text-xs text-neutral-600 mt-1'>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className='flex gap-3'>
                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400'>
                  <Bot className='w-4 h-4' />
                </div>
                <div className='flex items-center gap-1 px-4 py-3 bg-neutral-800 rounded-2xl rounded-tl-sm'>
                  <span
                    className='w-2 h-2 bg-neutral-500 rounded-full animate-bounce'
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className='w-2 h-2 bg-neutral-500 rounded-full animate-bounce'
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className='w-2 h-2 bg-neutral-500 rounded-full animate-bounce'
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className='px-4 py-2 border-t border-neutral-800'>
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {[
                'Change primary color to blue',
                'Increase font sizes',
                'Add more spacing options',
                'Make corners more rounded',
              ].map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className='px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 rounded-full whitespace-nowrap transition-colors text-neutral-300'
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className='p-4 border-t border-neutral-800'>
            <div className='flex items-center gap-2 p-2 bg-neutral-800/50 rounded-xl border border-neutral-700 focus-within:border-indigo-500/50 transition-colors'>
              <input
                type='text'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder='Ask me to modify your design system...'
                className='flex-1 bg-transparent text-sm outline-none placeholder-neutral-500 px-2'
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className='p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg transition-colors'
              >
                <Send className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel Toggle */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className='flex items-center justify-center w-5 hover:bg-neutral-800 transition-colors border-l border-neutral-800'
        >
          {rightPanelOpen ? (
            <ChevronRight className='w-4 h-4 text-neutral-500' />
          ) : (
            <ChevronLeft className='w-4 h-4 text-neutral-500' />
          )}
        </button>

        {/* Right Panel - Preview Canvas */}
        <div
          className={`flex flex-col border-l border-neutral-800 bg-neutral-900/30 transition-all duration-300 ${
            rightPanelOpen ? 'w-120' : 'w-0'
          }`}
        >
          {rightPanelOpen && (
            <>
              <div className='flex items-center justify-between px-4 h-12 border-b border-neutral-800'>
                <div className='flex items-center gap-2'>
                  <Eye className='w-4 h-4 text-indigo-400' />
                  <span className='text-sm font-medium'>Preview</span>
                </div>
                <div className='flex items-center gap-1 p-1 bg-neutral-800 rounded-lg'>
                  {[
                    { mode: 'desktop' as const, icon: Monitor },
                    { mode: 'tablet' as const, icon: Tablet },
                    { mode: 'mobile' as const, icon: Smartphone },
                  ].map(({ mode, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === mode
                          ? 'bg-neutral-700 text-neutral-100'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      <Icon className='w-3.5 h-3.5' />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Tabs */}
              <div className='flex border-b border-neutral-800'>
                {[
                  { id: 'colors' as const, label: 'Colors', icon: Palette },
                  {
                    id: 'typography' as const,
                    label: 'Typography',
                    icon: Type,
                  },
                  {
                    id: 'components' as const,
                    label: 'Components',
                    icon: Square,
                  },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                      activeTab === id
                        ? 'text-indigo-400 border-b-2 border-indigo-400'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Icon className='w-3.5 h-3.5' />
                    {label}
                  </button>
                ))}
              </div>

              {/* Preview Content */}
              <div className='flex-1 overflow-y-auto p-4'>
                <div className={`mx-auto ${getViewWidth()}`}>
                  {activeTab === 'colors' && parsedDesignSystem?.color && (
                    <div className='space-y-6'>
                      {/* Brand Colors */}
                      {parsedDesignSystem.color.brand && (
                        <div>
                          <h3 className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
                            Brand Colors
                          </h3>
                          <div className='grid grid-cols-2 gap-2'>
                            {Object.entries(parsedDesignSystem.color.brand).map(
                              ([name, value]) => (
                                <div
                                  key={name}
                                  className='flex items-center gap-3 p-2 bg-neutral-800/50 rounded-lg'
                                >
                                  <div
                                    className='w-10 h-10 rounded-lg border border-neutral-700'
                                    style={{ backgroundColor: value }}
                                  />
                                  <div>
                                    <p className='text-xs font-medium text-neutral-200'>
                                      {name}
                                    </p>
                                    <p className='text-xs text-neutral-500'>
                                      {value}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Semantic Colors */}
                      {parsedDesignSystem.color.semantic && (
                        <div>
                          <h3 className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
                            Semantic Colors
                          </h3>
                          <div className='grid grid-cols-2 gap-2'>
                            {Object.entries(
                              parsedDesignSystem.color.semantic
                            ).map(([name, value]) => (
                              <div
                                key={name}
                                className='flex items-center gap-3 p-2 bg-neutral-800/50 rounded-lg'
                              >
                                <div
                                  className='w-10 h-10 rounded-lg border border-neutral-700'
                                  style={{ backgroundColor: value }}
                                />
                                <div>
                                  <p className='text-xs font-medium text-neutral-200'>
                                    {name}
                                  </p>
                                  <p className='text-xs text-neutral-500'>
                                    {value}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Neutral Colors */}
                      {parsedDesignSystem.color.neutral && (
                        <div>
                          <h3 className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
                            Neutral Colors
                          </h3>
                          <div className='flex gap-1'>
                            {Object.entries(
                              parsedDesignSystem.color.neutral
                            ).map(([name, value]) => (
                              <div key={name} className='flex-1 text-center'>
                                <div
                                  className='h-12 rounded-lg border border-neutral-700 mb-1'
                                  style={{ backgroundColor: value }}
                                />
                                <p className='text-xs text-neutral-500'>
                                  {name}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'typography' &&
                    parsedDesignSystem?.typography && (
                      <div className='space-y-6'>
                        {/* Font Families */}
                        {parsedDesignSystem.typography.fontFamily && (
                          <div>
                            <h3 className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
                              Font Families
                            </h3>
                            <div className='space-y-3'>
                              {Object.entries(
                                parsedDesignSystem.typography.fontFamily
                              ).map(([name, value]) => (
                                <div
                                  key={name}
                                  className='p-3 bg-neutral-800/50 rounded-lg'
                                >
                                  <p className='text-xs text-neutral-500 mb-1'>
                                    {name}
                                  </p>
                                  <p
                                    className='text-lg text-neutral-200'
                                    style={{ fontFamily: value }}
                                  >
                                    The quick brown fox jumps over the lazy dog
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Font Sizes */}
                        {parsedDesignSystem.typography.fontSize && (
                          <div>
                            <h3 className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
                              Font Sizes
                            </h3>
                            <div className='space-y-2'>
                              {Object.entries(
                                parsedDesignSystem.typography.fontSize
                              ).map(([name, value]) => (
                                <div
                                  key={name}
                                  className='flex items-center justify-between p-2 bg-neutral-800/50 rounded-lg'
                                >
                                  <span
                                    style={{ fontSize: value }}
                                    className='text-neutral-200'
                                  >
                                    {name}
                                  </span>
                                  <span className='text-xs text-neutral-500'>
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {activeTab === 'components' && parsedDesignSystem && (
                    <div className='space-y-6'>
                      {/* Buttons */}
                      <div>
                        <h3 className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
                          Buttons
                        </h3>
                        <div className='flex flex-wrap gap-2'>
                          <button
                            className='px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors'
                            style={{
                              backgroundColor:
                                parsedDesignSystem.color?.brand?.primary ||
                                '#6366F1',
                              borderRadius:
                                parsedDesignSystem.borderRadius?.md || '0.5rem',
                            }}
                          >
                            Primary
                          </button>
                          <button
                            className='px-4 py-2 rounded-lg text-sm font-medium border transition-colors'
                            style={{
                              borderColor:
                                parsedDesignSystem.color?.neutral?.['300'] ||
                                '#D1D5DB',
                              color:
                                parsedDesignSystem.color?.neutral?.['700'] ||
                                '#374151',
                              borderRadius:
                                parsedDesignSystem.borderRadius?.md || '0.5rem',
                            }}
                          >
                            Secondary
                          </button>
                          <button
                            className='px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors'
                            style={{
                              backgroundColor:
                                parsedDesignSystem.color?.semantic?.danger ||
                                '#EF4444',
                              borderRadius:
                                parsedDesignSystem.borderRadius?.md || '0.5rem',
                            }}
                          >
                            Danger
                          </button>
                        </div>
                      </div>

                      {/* Cards */}
                      <div>
                        <h3 className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
                          Cards
                        </h3>
                        <div
                          className='p-4 border'
                          style={{
                            backgroundColor:
                              parsedDesignSystem.color?.neutral?.['0'] ||
                              '#FFFFFF',
                            borderColor:
                              parsedDesignSystem.color?.neutral?.['300'] ||
                              '#D1D5DB',
                            borderRadius:
                              parsedDesignSystem.borderRadius?.lg || '0.75rem',
                            boxShadow:
                              parsedDesignSystem.shadow?.md ||
                              '0 4px 6px rgba(0,0,0,0.1)',
                          }}
                        >
                          <h4
                            className='font-semibold mb-2'
                            style={{
                              color:
                                parsedDesignSystem.color?.neutral?.['900'] ||
                                '#111827',
                              fontFamily:
                                parsedDesignSystem.typography?.fontFamily
                                  ?.heading,
                            }}
                          >
                            Card Title
                          </h4>
                          <p
                            className='text-sm'
                            style={{
                              color:
                                parsedDesignSystem.color?.neutral?.['500'] ||
                                '#6B7280',
                              fontFamily:
                                parsedDesignSystem.typography?.fontFamily?.body,
                            }}
                          >
                            This is a preview of how your card component will
                            look with the current design tokens.
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        <h3 className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
                          Status Badges
                        </h3>
                        <div className='flex flex-wrap gap-2'>
                          <span
                            className='px-3 py-1 text-xs font-medium rounded-full'
                            style={{
                              backgroundColor:
                                parsedDesignSystem.color?.semantic?.[
                                  'success-subtle'
                                ] || '#D1FAE5',
                              color:
                                parsedDesignSystem.color?.semantic?.success ||
                                '#10B981',
                            }}
                          >
                            Success
                          </span>
                          <span
                            className='px-3 py-1 text-xs font-medium rounded-full'
                            style={{
                              backgroundColor:
                                parsedDesignSystem.color?.semantic?.[
                                  'warning-subtle'
                                ] || '#FEF3C7',
                              color:
                                parsedDesignSystem.color?.semantic?.warning ||
                                '#F59E0B',
                            }}
                          >
                            Warning
                          </span>
                          <span
                            className='px-3 py-1 text-xs font-medium rounded-full'
                            style={{
                              backgroundColor:
                                parsedDesignSystem.color?.semantic?.[
                                  'danger-subtle'
                                ] || '#FEE2E2',
                              color:
                                parsedDesignSystem.color?.semantic?.danger ||
                                '#EF4444',
                            }}
                          >
                            Error
                          </span>
                        </div>
                      </div>

                      {/* Spacing Preview */}
                      {parsedDesignSystem.spacing && (
                        <div>
                          <h3 className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
                            Spacing Scale
                          </h3>
                          <div className='space-y-2'>
                            {Object.entries(parsedDesignSystem.spacing).map(
                              ([name, value]) => (
                                <div
                                  key={name}
                                  className='flex items-center gap-3'
                                >
                                  <span className='text-xs text-neutral-500 w-8'>
                                    {name}
                                  </span>
                                  <div
                                    className='h-4 bg-indigo-500/50 rounded'
                                    style={{ width: value }}
                                  />
                                  <span className='text-xs text-neutral-500'>
                                    {value}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!parsedDesignSystem && (
                    <div className='flex flex-col items-center justify-center h-64 text-neutral-500'>
                      <AlertCircle className='w-8 h-8 mb-2' />
                      <p className='text-sm'>Fix JSON errors to see preview</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <footer className='flex items-center justify-between px-4 h-8 border-t border-neutral-800 bg-neutral-900/50 text-xs text-neutral-500'>
        <div className='flex items-center gap-4'>
          <span>Design System Studio</span>
          <span>v1.0.0</span>
        </div>
        <div className='flex items-center gap-4'>
          <span>{jsonError ? 'JSON: Invalid' : 'JSON: Valid'}</span>
          <span>Ready</span>
        </div>
      </footer>
    </div>
  );
}

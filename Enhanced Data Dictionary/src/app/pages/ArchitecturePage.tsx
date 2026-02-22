import { Server, Brain, Database as DatabaseIcon, Workflow, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const architectureFlow = [
  {
    name: 'Frontend',
    icon: Workflow,
    description: 'React + TypeScript UI',
    color: 'indigo',
    details: ['Modern SaaS Interface', 'Real-time Updates', 'Responsive Design'],
  },
  {
    name: 'Flask Backend',
    icon: Server,
    description: 'Python API Server',
    color: 'blue',
    details: ['RESTful API', 'Authentication', 'Data Processing'],
  },
  {
    name: 'Metadata Extractor',
    icon: DatabaseIcon,
    description: 'Schema Analysis',
    color: 'green',
    details: ['Schema Discovery', 'Type Detection', 'Relationship Mapping'],
  },
  {
    name: 'AI Engine (LLM)',
    icon: Brain,
    description: 'GPT-4 / Claude',
    color: 'purple',
    details: ['Description Generation', 'Insight Analysis', 'Documentation'],
  },
  {
    name: 'Database',
    icon: DatabaseIcon,
    description: 'Your Data Source',
    color: 'amber',
    details: ['PostgreSQL', 'MySQL', 'Snowflake'],
  },
];

export default function ArchitecturePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fadeInUp">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">System Architecture</h1>
          <p className="text-gray-600 dark:text-gray-300">Understanding how DataSage AI works</p>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 animate-fadeInUp relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Data Flow Architecture</h2>
          
          {/* Carousel Container */}
          <div className="relative group">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Scrollable Chain */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex items-center gap-0 overflow-x-auto py-8 scroll-smooth hide-scrollbar px-4"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                scrollPaddingLeft: '16px',
                scrollPaddingRight: '16px'
              }}
            >
              {architectureFlow.map((component, index) => {
              const Icon = component.icon;
              const colorClasses = {
                indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
                blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
                green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
                purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
                amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
              }[component.color];

              return (
                <div key={component.name} className="flex items-center flex-shrink-0">
                  {/* Component Card with Chain Link */}
                  <div className="relative pt-8">
                    {/* Chain Link Before Card (Left) */}
                    {index > 0 && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-8 h-2 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                      </div>
                    )}

                    {/* Numbered Badge - Outside Card */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800 z-30">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>

                    {/* Main Card */}
                    <div 
                      className={`relative w-72 mx-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 ${colorClasses.border} dark:border-opacity-50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-700 hover:scale-105 hover:-translate-y-2 group cursor-pointer`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 ${colorClasses.bg} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 rounded-2xl transition-opacity duration-500 blur-xl`} />

                      {/* Icon Container */}
                      <div className={`relative w-20 h-20 ${colorClasses.bg} dark:opacity-90 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-700 ease-out group-hover:rotate-[360deg] group-hover:scale-110 shadow-lg`}>
                        <Icon className={`w-10 h-10 ${colorClasses.text} transition-transform duration-700`} />
                        {/* Icon Glow */}
                        <div className={`absolute inset-0 ${colorClasses.bg} opacity-50 blur-xl group-hover:opacity-75 transition-opacity duration-700`} />
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-500">
                          {component.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 font-medium transition-all duration-500">
                          {component.description}
                        </p>
                        
                        {/* Details */}
                        <ul className="space-y-2">
                          {component.details.map((detail, detailIndex) => (
                            <li 
                              key={detail} 
                              className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 bg-white/50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg backdrop-blur-sm transform transition-all duration-500 hover:scale-105 hover:bg-white dark:hover:bg-gray-700"
                              style={{ transitionDelay: `${detailIndex * 50}ms` }}
                            >
                              <div className={`w-2 h-2 ${colorClasses.bg} rounded-full animate-pulse`} />
                              <span className="font-medium">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Connecting Line Decoration */}
                      <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 dark:from-indigo-600 dark:to-purple-700 transition-all duration-700 group-hover:w-10 group-hover:h-1" />
                    </div>

                    {/* Animated Arrow */}
                    {index < architectureFlow.length - 1 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-10">
                        <ArrowRight className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-pulse drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* Scroll Hint */}
          <div className="flex items-center justify-center gap-2 mt-6 opacity-50">
            <div className={`w-2 h-2 rounded-full ${canScrollLeft ? 'bg-indigo-600' : 'bg-gray-300'} transition-colors`} />
            <div className="w-8 h-0.5 bg-gray-300" />
            <div className={`w-2 h-2 rounded-full ${canScrollRight ? 'bg-indigo-600' : 'bg-gray-300'} transition-colors`} />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Features</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Automatic schema discovery and analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                <span className="text-gray-700 dark:text-gray-300">AI-powered column description generation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Real-time data quality monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Interactive AI chat for data exploration</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Technology Stack</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>Frontend:</strong> React, TypeScript, Tailwind CSS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>Backend:</strong> Flask, Python</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>AI:</strong> GPT-4, Claude API</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>Databases:</strong> PostgreSQL, MySQL, Snowflake</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Process Flow */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:scale-[1.02] transition-transform">
              <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Connect Database</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Securely connect to your database using read-only credentials</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:scale-[1.02] transition-transform">
              <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Extract Metadata</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analyze database schema, tables, columns, types, and relationships</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:scale-[1.02] transition-transform">
              <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Use large language models to generate descriptions and documentation</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:scale-[1.02] transition-transform">
              <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Review & Export</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review AI-generated documentation and export to your preferred format</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

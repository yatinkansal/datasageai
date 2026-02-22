import { useState, useEffect } from 'react';
import { Database, FileText, AlertCircle, TrendingUp, Eye, CheckCircle2, Clock, XCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { extractMetadata } from '../../services/api';

const recentScans = [
  {
    id: 1,
    date: '2026-02-20 14:30',
    tables: 24,
    status: 'completed',
    duration: '2m 34s',
  },
  {
    id: 2,
    date: '2026-02-19 09:15',
    tables: 24,
    status: 'completed',
    duration: '2m 41s',
  },
  {
    id: 3,
    date: '2026-02-18 16:45',
    tables: 22,
    status: 'completed',
    duration: '2m 18s',
  },
  {
    id: 4,
    date: '2026-02-17 11:20',
    tables: 22,
    status: 'completed',
    duration: '2m 29s',
  },
  {
    id: 5,
    date: '2026-02-16 08:50',
    tables: 20,
    status: 'failed',
    duration: '0m 12s',
  },
];

const aiInsights = [
  {
    type: 'warning',
    title: 'Inconsistent naming detected',
    description: 'Table "user_profiles" and "UserData" follow different naming conventions',
    severity: 'medium',
  },
  {
    type: 'suggestion',
    title: 'Missing foreign key constraints',
    description: '3 tables have relationships that could benefit from foreign key constraints',
    severity: 'low',
  },
  {
    type: 'info',
    title: 'High documentation coverage',
    description: '89% of columns have AI-generated descriptions with high confidence',
    severity: 'success',
  },
];

export default function DashboardPage() {
  const [tableCount, setTableCount] = useState(0);
  const [columnCount, setColumnCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    extractMetadata()
      .then(data => {
        const tables = Object.keys(data);
        const cols = tables.reduce((sum, t) => {
          const c = data[t];
          return sum + (Array.isArray(c) ? c.length : 0);
        }, 0);
        setTableCount(tables.length);
        setColumnCount(cols);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    {
      label: 'Total Tables',
      value: loading ? '...' : String(tableCount),
      icon: Database,
      color: 'indigo',
      change: 'Live from backend',
    },
    {
      label: 'Total Columns',
      value: loading ? '...' : String(columnCount),
      icon: FileText,
      color: 'blue',
      change: 'Live from backend',
    },
    {
      label: 'Data Quality Score',
      value: '94%',
      icon: TrendingUp,
      color: 'green',
      change: '+3% vs last scan',
    },
    {
      label: 'Missing Values',
      value: '6%',
      icon: AlertCircle,
      color: 'amber',
      change: '-2% vs last scan',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fadeInUp">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Schema Overview</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor your database schema and data quality metrics</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const colorClasses = {
              indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
              blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
              green: { bg: 'bg-green-100', text: 'text-green-600' },
              amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
            }[metric.color];
            
            return (
              <div
                key={metric.label}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:border-indigo-300 dark:hover:border-indigo-600 animate-scaleIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center transition-transform hover:rotate-12 hover:scale-110 duration-300`}>
                    <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{metric.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid - Recent Scans and AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Scans Table */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Scans</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Latest database analysis runs</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Scan Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Tables
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.01]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-900 dark:text-white">{scan.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{scan.tables}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {scan.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {scan.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Insights</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Schema analysis suggestions</p>
            </div>
            <div className="p-6 space-y-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${
                    insight.severity === 'medium'
                      ? 'bg-amber-50 border-amber-200'
                      : insight.severity === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        insight.severity === 'medium'
                          ? 'bg-amber-100'
                          : insight.severity === 'success'
                          ? 'bg-green-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {insight.severity === 'medium' ? (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      ) : insight.severity === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-medium text-sm mb-1 ${
                          insight.severity === 'medium'
                            ? 'text-amber-900'
                            : insight.severity === 'success'
                            ? 'text-green-900'
                            : 'text-blue-900'
                        }`}
                      >
                        {insight.title}
                      </h3>
                      <p
                        className={`text-xs ${
                          insight.severity === 'medium'
                            ? 'text-amber-700'
                            : insight.severity === 'success'
                            ? 'text-green-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-4 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
                View All Insights
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

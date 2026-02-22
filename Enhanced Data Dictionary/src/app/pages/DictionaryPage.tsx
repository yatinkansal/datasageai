import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Download, RefreshCw, Edit2, ChevronRight, Filter } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { extractMetadata, profileTable, generateDocumentation, generateColumnDocumentation } from '../../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

interface TableInfo {
  name: string;
  columns: number;
  coverage: number;
}

interface ColumnInfo {
  name: string;
  type: string;
  description: string;
  confidence: number;
  nullable: boolean;
  isPrimaryKey: boolean;
}

export default function DictionaryPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [sampleColumns, setSampleColumns] = useState<ColumnInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'primary' | 'nullable'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnInfo | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [regeneratingColumn, setRegeneratingColumn] = useState<string | null>(null);
  const [customDescriptions, setCustomDescriptions] = useState<Record<string, string>>({});

  const EDIT_STORAGE_KEY = 'datasage_column_edits';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EDIT_STORAGE_KEY);
      if (stored) setCustomDescriptions(JSON.parse(stored));
    } catch {
      setCustomDescriptions({});
    }
  }, []);

  useEffect(() => {
    extractMetadata()
      .then(data => {
        const tableList: TableInfo[] = Object.keys(data).map(tableName => {
          const cols = data[tableName];
          const colCount = Array.isArray(cols) ? cols.length : 0;
          return {
            name: tableName,
            columns: colCount,
            coverage: 100,
          };
        });
        setTables(tableList);
        if (tableList.length > 0) {
          setSelectedTable(tableList[0].name);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching tables:', err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedTable) return;

    Promise.all([
      profileTable(selectedTable),
      extractMetadata()
    ])
      .then(([profileData, metaData]) => {
        const tableColumns = metaData[selectedTable];
        if (!tableColumns || !Array.isArray(tableColumns)) return;

        const stats = profileData.statistics || {};
        const rowCount = profileData.row_count || 0;

        const cols: ColumnInfo[] = tableColumns.map((c: { name: string; type: string; nullable?: boolean; primary_key?: boolean }) => {
          const colStats = stats[c.name] || {};
          const typeStr = c.type ? String(c.type) : 'UNKNOWN';
          let description = 'Column metadata';
          if ('min' in colStats && 'max' in colStats) {
            description = `Numeric: min=${colStats.min}, max=${colStats.max}${colStats.avg != null ? `, avg=${colStats.avg}` : ''}`;
          } else if ('distinct' in colStats) {
            const pct = rowCount > 0 ? Math.round((colStats.distinct / rowCount) * 100) : 0;
            description = `Distinct values: ${colStats.distinct} (${pct}% uniqueness)`;
          }
          const confidence = 90;

          return {
            name: c.name,
            type: typeStr,
            description,
            confidence,
            nullable: c.nullable ?? false,
            isPrimaryKey: c.primary_key ?? false
          };
        });
        setSampleColumns(cols);
      })
      .catch(err => console.error('Error fetching column details:', err));
  }, [selectedTable]);

  const handleRegenerateAll = async () => {
    if (!selectedTable) return;
    setRegenerating(true);
    try {
      const result = await generateDocumentation(selectedTable);
      if (result?.documentation) {
        // Could display AI doc in a modal - for now we refetch to show updated state
        const [profileData, metaData] = await Promise.all([
          profileTable(selectedTable),
          extractMetadata()
        ]);
        const tableColumns = metaData[selectedTable];
        if (tableColumns && Array.isArray(tableColumns)) {
          const stats = profileData.statistics || {};
          const rowCount = profileData.row_count || 0;
          const cols: ColumnInfo[] = tableColumns.map((c: { name: string; type: string; nullable?: boolean; primary_key?: boolean }) => {
            const colStats = stats[c.name] || {};
            const typeStr = c.type ? String(c.type) : 'UNKNOWN';
            let description = 'Column metadata';
            if ('min' in colStats && 'max' in colStats) {
              const s = colStats as { min: number; max: number; avg?: number };
              description = `Numeric: min=${s.min}, max=${s.max}${s.avg != null ? `, avg=${s.avg}` : ''}`;
            } else if ('distinct' in colStats) {
              const d = (colStats as { distinct: number }).distinct;
              const pct = rowCount > 0 ? Math.round((d / rowCount) * 100) : 0;
              description = `Distinct values: ${d} (${pct}% uniqueness)`;
            }
            return {
              name: c.name,
              type: typeStr,
              description,
              confidence: 90,
              nullable: c.nullable ?? false,
              isPrimaryKey: c.primary_key ?? false
            };
          });
          setSampleColumns(cols);
        }
      }
    } catch (err) {
      console.error('Error regenerating docs:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const filteredColumns = useMemo(() => {
    return sampleColumns.filter(col => {
      if (filterType === 'all') return true;
      if (filterType === 'primary') return col.isPrimaryKey;
      if (filterType === 'nullable') return col.nullable;
      return true;
    });
  }, [sampleColumns, filterType]);

  const getDisplayDescription = (col: ColumnInfo) =>
    customDescriptions[`${selectedTable}:${col.name}`] ?? col.description;

  const handleExportPDF = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family:sans-serif;padding:24px;max-width:800px;margin:0 auto">
        <h1>Data Dictionary - ${selectedTable}</h1>
        <p style="color:#666">Generated from DataSage AI</p>
        <hr/>
        ${filteredColumns.map(col => `
          <div style="margin:20px 0;padding:16px;border:1px solid #eee;border-radius:8px">
            <strong>${col.name}</strong> <span style="color:#888;font-size:12px">${col.type}</span>
            ${col.isPrimaryKey ? '<span style="margin-left:8px;font-size:11px;color:#4338ca">Primary Key</span>' : ''}
            ${col.nullable ? '<span style="margin-left:8px;font-size:11px;color:#666">Nullable</span>' : ''}
            <p style="margin:8px 0 0;color:#333">${getDisplayDescription(col)}</p>
          </div>
        `).join('')}
      </div>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(printContent.innerHTML);
      w.document.close();
      w.print();
      w.close();
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Column', 'Type', 'Description', 'Primary Key', 'Nullable', 'Confidence'];
    const rows = filteredColumns.map(col => [
      col.name,
      col.type,
      getDisplayDescription(col).replace(/"/g, '""'),
      col.isPrimaryKey ? 'Yes' : 'No',
      col.nullable ? 'Yes' : 'No',
      `${col.confidence}%`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dictionary_${selectedTable}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleEditClick = (col: ColumnInfo) => {
    setEditingColumn(col);
    setEditDescription(getDisplayDescription(col));
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editingColumn) return;
    const key = `${selectedTable}:${editingColumn.name}`;
    const next = { ...customDescriptions, [key]: editDescription };
    setCustomDescriptions(next);
    localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(next));
    setEditDialogOpen(false);
    setEditingColumn(null);
  };

  const handleRegenerateColumn = async (col: ColumnInfo) => {
    if (!selectedTable) return;
    setRegeneratingColumn(col.name);
    try {
      const result = await generateColumnDocumentation(selectedTable, col.name);
      if (result?.documentation) {
        const key = `${selectedTable}:${col.name}`;
        const next = { ...customDescriptions, [key]: result.documentation };
        setCustomDescriptions(next);
        localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(next));
        setSampleColumns(prev =>
          prev.map(c =>
            c.name === col.name ? { ...c, description: result.documentation } : c
          )
        );
      }
    } catch (err) {
      console.error('Error regenerating column doc:', err);
    } finally {
      setRegeneratingColumn(null);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 95) return { variant: 'default' as const, label: 'High', colorClass: 'bg-green-100 text-green-700 hover:bg-green-100' };
    if (confidence >= 85) return { variant: 'default' as const, label: 'Medium', colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-100' };
    return { variant: 'secondary' as const, label: 'Low', colorClass: 'bg-gray-100 text-gray-600 hover:bg-gray-100' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">AI-Generated Data Dictionary</h1>
            <p className="text-gray-600 dark:text-gray-300">Browse and manage your database documentation</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300" onClick={handleExportPDF} disabled={!selectedTable}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" className="border-gray-300" onClick={handleDownloadCSV} disabled={!selectedTable}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table List - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden lg:sticky lg:top-24">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search tables..."
                    className="pl-10 h-10 bg-gray-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {tables
                  .filter((table) => table.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((table) => (
                    <button
                      key={table.name}
                      onClick={() => setSelectedTable(table.name)}
                      className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors ${selectedTable === table.name
                        ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${selectedTable === table.name ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                          {table.name}
                        </span>
                        <ChevronRight className={`w-4 h-4 ${selectedTable === table.name ? 'text-indigo-600' : 'text-gray-400'
                          }`} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>{table.columns} columns</span>
                        <span>•</span>
                        <span className={table.coverage === 100 ? 'text-green-600' : 'text-amber-600'}>
                          {table.coverage}% coverage
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Table Details - Right Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Table Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{selectedTable}</h2>
                  <p className="text-gray-600 dark:text-gray-300">Complete column documentation with AI-generated descriptions</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                    onClick={handleRegenerateAll}
                    disabled={regenerating || !selectedTable}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                    {regenerating ? 'Regenerating...' : 'Regenerate All'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Filter:</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className={filterType === 'all' ? 'bg-indigo-600' : 'border-gray-300'}
                  >
                    All Columns
                  </Button>
                  <Button
                    variant={filterType === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('primary')}
                    className={filterType === 'primary' ? 'bg-indigo-600' : 'border-gray-300'}
                  >
                    Primary Keys
                  </Button>
                  <Button
                    variant={filterType === 'nullable' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('nullable')}
                    className={filterType === 'nullable' ? 'bg-indigo-600' : 'border-gray-300'}
                  >
                    Nullable
                  </Button>
                </div>
              </div>
            </div>

            {/* Columns List */}
            <div className="space-y-4">
              {filteredColumns.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 py-8 text-center">
                  No columns match the current filter. Try &quot;All Columns&quot;.
                </p>
              ) : (
              filteredColumns.map((column) => {
                const badge = getConfidenceBadge(column.confidence);

                return (
                  <div
                    key={column.name}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{column.name}</h3>
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-mono">
                            {column.type}
                          </span>
                          {column.isPrimaryKey && (
                            <Badge variant="default" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                              Primary Key
                            </Badge>
                          )}
                          {column.nullable && (
                            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              Nullable
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{getDisplayDescription(column)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <Badge
                            variant={badge.variant}
                            className={badge.colorClass}
                          >
                            {badge.label} ({column.confidence}%)
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleEditClick(column)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700"
                          onClick={() => handleRegenerateColumn(column)}
                          disabled={regeneratingColumn === column.name}
                        >
                          <RefreshCw className={`w-4 h-4 mr-1 ${regeneratingColumn === column.name ? 'animate-spin' : ''}`} />
                          {regeneratingColumn === column.name ? 'Regenerating...' : 'Regenerate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>
        </div>

        {/* Edit Column Description Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Column Description</DialogTitle>
              <DialogDescription>
                {editingColumn && (
                  <>Editing <strong>{editingColumn.name}</strong> ({editingColumn.type})</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                placeholder="Enter column description..."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSave} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

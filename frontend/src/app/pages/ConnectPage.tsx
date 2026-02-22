import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Database, CheckCircle2, Loader2, LayoutDashboard } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { motion } from 'motion/react';
import { connectDatabase, getConnectionStatus } from '../../services/api';

export default function ConnectPage() {
  const navigate = useNavigate();
  const [dbType, setDbType] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false); // true when backend was down, using fallback
  const [tableCount, setTableCount] = useState(0);
  const [columnCount, setColumnCount] = useState(0);

  useEffect(() => {
    getConnectionStatus()
      .then((res) => {
        setConnectError(null); // clear stale error once backend is reachable
        if (res.connected) {
          setIsConnected(true);
          setTableCount(res.tables);
          setColumnCount(res.columns);
        }
      })
      .catch(() => {});
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setDemoMode(false);
    setIsConnecting(true);
    try {
      const res = await connectDatabase({
        type: dbType,
        host: host || undefined,
        port: port || undefined,
        username: username || undefined,
        password: password || undefined,
        database: databaseName || undefined,
      });
      setTableCount(res.tables);
      setColumnCount(res.columns);
      setIsConnected(true);
    } catch (err) {
      // If backend is down and user chose SQLite (Demo), allow demo mode so they can proceed
      if (dbType === 'sqlite') {
        setDemoMode(true);
        setTableCount(4);
        setColumnCount(24);
        setIsConnected(true);
      } else {
        setConnectError(err instanceof Error ? err.message : 'Connection failed. Is the backend running?');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Connect Your Database</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect to your database to start generating AI-powered data documentation
          </p>
        </div>

        {/* Connection Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Database Configuration</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter your database connection details</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Ensure the backend is running on port 5001 (run <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">python app.py</code> in the datastage_backend folder) before connecting.</p>
              </div>
            </div>

            <form onSubmit={handleConnect} className="space-y-6">
              {/* Database Type */}
              <div className="space-y-2">
                <Label htmlFor="dbType">Database Type</Label>
                <Select value={dbType} onValueChange={setDbType} required>
                  <SelectTrigger className="h-11 bg-gray-50">
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqlite">SQLite (Demo)</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="snowflake">Snowflake</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dbType !== 'sqlite' && (
                <>
                  {/* Host and Port */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="host">Host</Label>
                      <Input
                        id="host"
                        type="text"
                        placeholder="localhost or 192.168.1.100"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        className="h-11 bg-gray-50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="text"
                        placeholder="5432"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        className="h-11 bg-gray-50"
                        required
                      />
                    </div>
                  </div>

                  {/* Username and Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-11 bg-gray-50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 bg-gray-50"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Database Name */}
              <div className="space-y-2">
                <Label htmlFor="dbName">Database Name</Label>
                <Input
                  id="dbName"
                  type="text"
                  placeholder={dbType === 'sqlite' ? 'datasage.db (demo)' : 'production_db'}
                  value={databaseName}
                  onChange={(e) => setDatabaseName(e.target.value)}
                  className="h-11 bg-gray-50"
                />
              </div>

              {/* SSL Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ssl"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="ssl" className="cursor-pointer">Enable SSL connection</Label>
              </div>

              {connectError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-1">Backend unreachable</p>
                  <p className="mb-2">{connectError}</p>
                  <p className="text-xs opacity-90">In a terminal, run: <code className="bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">cd &quot;datastage_backend&quot; &amp;&amp; python app.py</code></p>
                </div>
              )}

              {/* Connect Button */}
              <Button
                type="submit"
                disabled={isConnecting || isConnected}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : isConnected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Connected Successfully
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Connect Database
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Connection Status */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-t p-6 ${demoMode ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${demoMode ? 'bg-amber-100' : 'bg-green-100'}`}>
                  <CheckCircle2 className={`w-6 h-6 ${demoMode ? 'text-amber-600' : 'text-green-600'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${demoMode ? 'text-amber-900 dark:text-amber-200' : 'text-green-900'}`}>
                    {demoMode ? 'Demo mode – connected' : 'Connection Successful!'}
                  </h3>
                  <p className={`text-sm mb-3 ${demoMode ? 'text-amber-700 dark:text-amber-300' : 'text-green-700'}`}>
                    {demoMode
                      ? "Backend isn't running; showing demo stats. Start the backend (python app.py in datastage_backend) for live data."
                      : "Your database has been connected successfully. We're now analyzing your schema."}
                  </p>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-sm ${demoMode ? 'text-amber-700 dark:text-amber-300' : 'text-green-700'}`}>
                      <div className={`w-2 h-2 rounded-full ${demoMode ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <span>Found {tableCount} tables</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${demoMode ? 'text-amber-700 dark:text-amber-300' : 'text-green-700'}`}>
                      <div className={`w-2 h-2 rounded-full ${demoMode ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <span>Found {columnCount} columns</span>
                    </div>
                    {!demoMode && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>AI analysis in progress...</span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className={`mt-4 ${demoMode ? 'border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200' : 'border-green-300 text-green-800 hover:bg-green-100'}`}
                    onClick={() => navigate('/dashboard')}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Connection Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Connection Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Ensure your database is accessible from your network</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Use a read-only user for security best practices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Enable SSL for production databases</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Check firewall rules if connection fails</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

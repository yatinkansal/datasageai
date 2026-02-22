import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Database, Brain, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import ThemeToggle from '../components/ThemeToggle';
import GlitchText from '../components/GlitchText';
import FloatingParticles from '../components/FloatingParticles';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex relative overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10 animate-fadeInUp">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-3 z-10 animate-fadeInUp">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg animate-glow">
          <Brain className="w-6 h-6 text-white animate-float" />
        </div>
        <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          <GlitchText text="DataSage AI" />
        </span>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-8 animate-fadeInUp">
            <div className="relative animate-float">
              {/* AI + Database Illustration */}
              <div className="relative w-96 h-96">
                {/* Database Icon */}
                <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 duration-300">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl backdrop-blur-sm border border-indigo-200 flex items-center justify-center shadow-2xl hover:shadow-indigo-500/50 transition-shadow">
                    <Database className="w-16 h-16 text-indigo-600 animate-pulse" />
                  </div>
                </div>
                
                {/* AI Brain Icon */}
                <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 duration-300">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl backdrop-blur-sm border border-purple-200 flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition-shadow">
                    <Brain className="w-16 h-16 text-indigo-600 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>

                {/* Connection Line */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full animate-shimmer" />
                
                {/* Floating Particles */}
                <div className="absolute top-1/4 left-1/2 w-3 h-3 bg-indigo-400 rounded-full animate-pulse shadow-lg shadow-indigo-400/50" />
                <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" style={{ animationDelay: '0.75s' }} />
                <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" style={{ animationDelay: '1.5s' }} />
              </div>
            </div>
            
            <div className="text-center space-y-4 max-w-md">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                AI-Powered Data Documentation
              </h1>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Automatically generate comprehensive data dictionaries from your databases using advanced AI technology.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 sm:p-12 hover:shadow-indigo-500/20 transition-shadow duration-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome back</h2>
                  <p className="text-gray-600 dark:text-gray-300">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11 h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-11 h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-gray-600 dark:text-gray-300">Remember me</span>
                    </label>
                    <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                      Forgot password?
                    </a>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:shadow-indigo-500/50 hover:scale-[1.02]"
                    >
                      Sign In
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/connect')}
                      className="w-full h-12 border-indigo-200 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:scale-[1.02]"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Connect Database
                    </Button>
                  </div>
                </form>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                    Don't have an account?{' '}
                    <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                      Start free trial
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>© 2026 DataSage AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

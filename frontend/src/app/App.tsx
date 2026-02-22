/**
 * DataSage AI
 * A professional enterprise SaaS dashboard for AI-powered database documentation
 * 
 * Features:
 * - Login Page: Split-screen design with authentication
 * - Database Connection: Configure and connect to databases (PostgreSQL, MySQL, Snowflake)
 * - Dashboard: Schema overview with metrics, recent scans, and AI insights
 * - Data Dictionary: AI-generated column descriptions with confidence scores
 * - AI Chat: ChatGPT-style interface for querying your data schema
 * - Architecture: System architecture visualization
 * - Settings: User preferences and configuration
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ConnectPage from './pages/ConnectPage';
import DictionaryPage from './pages/DictionaryPage';
import ChatPage from './pages/ChatPage';
import ArchitecturePage from './pages/ArchitecturePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

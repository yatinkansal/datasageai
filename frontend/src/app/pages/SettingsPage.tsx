import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { User, Bell, Shield, Database, KeyRound, Smartphone } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const TWO_FA_STORAGE_KEY = 'datasage_2fa_enabled';

interface Settings {
  profile: { firstName: string; lastName: string; email: string };
  notifications: { schemaChanges: boolean; aiInsights: boolean; dataQualityAlerts: boolean };
}

const defaultSettings: Settings = {
  profile: { firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com' },
  notifications: { schemaChanges: true, aiInsights: true, dataQualityAlerts: false },
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useUser();
  const [settings, setSettings] = useState<Settings>(
    profile
      ? { profile, notifications: defaultSettings.notifications }
      : defaultSettings
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Change Password dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<'success' | 'error' | null>(null);

  // Two-Factor Authentication
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaDialogOpen, setTwoFaDialogOpen] = useState(false);
  const [twoFaConfirmCode, setTwoFaConfirmCode] = useState('');

  useEffect(() => {
    try {
      setTwoFaEnabled(localStorage.getItem(TWO_FA_STORAGE_KEY) === 'true');
    } catch {
      setTwoFaEnabled(false);
    }
  }, []);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileSaved(false);
    setLoadError(null);
    try {
      saveProfile(settings.profile);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      setLoadError('Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleNotificationChange = (
    key: keyof Settings['notifications'],
    value: boolean
  ) => {
    const next = { ...settings.notifications, [key]: value };
    setSettings((s) => ({ ...s, notifications: next }));
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage('error');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('error');
      return;
    }
    // Demo: no real auth backend; show success
    setPasswordMessage('success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordDialogOpen(false);
      setPasswordMessage(null);
    }, 1500);
  };

  const handleEnable2FA = () => {
    if (twoFaEnabled) {
      localStorage.setItem(TWO_FA_STORAGE_KEY, 'false');
      setTwoFaEnabled(false);
      setTwoFaDialogOpen(false);
      return;
    }
    setTwoFaDialogOpen(true);
  };

  const handle2FASetupComplete = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(TWO_FA_STORAGE_KEY, 'true');
    setTwoFaEnabled(true);
    setTwoFaConfirmCode('');
    setTwoFaDialogOpen(false);
  };

  const handleManageConnections = () => {
    navigate('/connect');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account and application preferences</p>
          {loadError && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{loadError}</p>
          )}
        </div>

        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your personal information</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={settings.profile.firstName}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      profile: { ...s.profile, firstName: e.target.value },
                    }))
                  }
                  className="h-11 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={settings.profile.lastName}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      profile: { ...s.profile, lastName: e.target.value },
                    }))
                  }
                  className="h-11 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={settings.profile.email}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    profile: { ...s.profile, email: e.target.value },
                  }))
                }
                className="h-11 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                onClick={handleSaveProfile}
                disabled={profileSaving}
              >
                {profileSaving ? 'Saving...' : profileSaved ? 'Saved!' : 'Save Changes'}
              </Button>
              {profileSaved && (
                <span className="text-sm text-green-600 dark:text-green-400">Profile updated.</span>
              )}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure your notification preferences</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Schema Changes</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when database schema changes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.schemaChanges}
                onChange={(e) => handleNotificationChange('schemaChanges', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">AI Insights</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive weekly AI-generated insights</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.aiInsights}
                onChange={(e) => handleNotificationChange('aiInsights', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Data Quality Alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alert me when data quality drops</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.dataQualityAlerts}
                onChange={(e) => handleNotificationChange('dataQualityAlerts', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your security settings</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setPasswordDialogOpen(true)}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleEnable2FA}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {twoFaEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
            </Button>
            {twoFaEnabled && (
              <p className="text-sm text-green-600 dark:text-green-400">Two-factor authentication is enabled.</p>
            )}
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Database</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage connected databases</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">PostgreSQL - Production</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">localhost:5432</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Connected</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={handleManageConnections}
            >
              Manage Connections
            </Button>
          </div>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one. Use at least 6 characters.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {passwordMessage === 'error' && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Passwords do not match or are too short (min 6 characters).
                </p>
              )}
              {passwordMessage === 'success' && (
                <p className="text-sm text-green-600 dark:text-green-400">Password updated successfully.</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  Update Password
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Enable Two-Factor Authentication Dialog */}
        <Dialog open={twoFaDialogOpen} onOpenChange={setTwoFaDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code with your authenticator app, then enter the 6-digit code below to verify.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">QR code placeholder</span>
              </div>
              <form onSubmit={handle2FASetupComplete} className="w-full space-y-4">
                <div className="space-y-2">
                  <Label>Verification code</Label>
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={twoFaConfirmCode}
                    onChange={(e) => setTwoFaConfirmCode(e.target.value.replace(/\D/g, ''))}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-lg tracking-widest"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setTwoFaDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    Enable 2FA
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

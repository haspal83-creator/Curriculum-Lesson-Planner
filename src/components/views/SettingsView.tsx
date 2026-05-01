import React from 'react';
import { Settings, User, Bell, Shield, Database, Globe, LogOut } from 'lucide-react';
import { Button, Card, Input, Select } from '../ui';
import { logout } from '../../firebase';

interface SettingsViewProps {
  user: any;
}

export function SettingsView({ user }: SettingsViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Settings</h2>
          <p className="text-sm text-gray-500">Manage your account and application preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <Card className="p-4 space-y-1">
            <SettingsButton active icon={<User className="w-5 h-5" />} label="Profile" />
            <SettingsButton icon={<Bell className="w-5 h-5" />} label="Notifications" />
            <SettingsButton icon={<Shield className="w-5 h-5" />} label="Security" />
            <SettingsButton icon={<Database className="w-5 h-5" />} label="Data Usage" />
            <SettingsButton icon={<Globe className="w-5 h-5" />} label="Language" />
          </Card>
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="p-8 space-y-8">
            <section className="space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-50 pb-4">Profile Information</h3>
              <div className="flex items-center gap-6">
                <img src={user.photoURL || ''} alt="" className="w-20 h-20 rounded-2xl bg-gray-100" />
                <div className="space-y-2">
                  <Button variant="secondary" size="sm">Change Photo</Button>
                  <p className="text-xs text-gray-400">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                  <Input defaultValue={user.displayName || ''} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                  <Input defaultValue={user.email || ''} disabled />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-50 pb-4">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Default Grade</label>
                  <Select 
                    options={[
                      { label: 'Infant 1', value: 'Infant 1' },
                      { label: 'Infant 2', value: 'Infant 2' },
                      { label: 'Standard 1', value: 'Standard 1' },
                      { label: 'Standard 2', value: 'Standard 2' },
                      { label: 'Standard 3', value: 'Standard 3' },
                      { label: 'Standard 4', value: 'Standard 4' },
                      { label: 'Standard 5', value: 'Standard 5' },
                      { label: 'Standard 6', value: 'Standard 6' }
                    ]} 
                    value="Standard 1" 
                    onChange={() => {}} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Default Subject</label>
                  <Select 
                    options={[
                      { label: 'Mathematics', value: 'Mathematics' },
                      { label: 'Language Arts', value: 'Language Arts' },
                      { label: 'Science and Technology', value: 'Science and Technology' },
                      { label: 'Belizean Studies', value: 'Belizean Studies' }
                    ]} 
                    value="Mathematics" 
                    onChange={() => {}} 
                  />
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
              <Button variant="secondary">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsButton({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      'w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-all duration-200',
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-600 hover:bg-gray-50'
    )}>
      {icon}
      {label}
    </button>
  );
}

import { cn } from '../../lib/utils';

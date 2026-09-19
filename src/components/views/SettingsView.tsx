import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Globe, LogOut, Check } from 'lucide-react';
import { Button, Card, Input, Select } from '../ui';
import { logout } from '../../firebase';
import { UserSettings, GradeLevel, Subject } from '../../types';
import { useToasts } from '../../context/ToastContext';
import { cn } from '../../lib/utils';

interface SettingsViewProps {
  user: any;
  userSettings?: UserSettings;
  onUpdateSettings?: (settings: Partial<UserSettings>) => Promise<void> | void;
}

export function SettingsView({ user, userSettings, onUpdateSettings }: SettingsViewProps) {
  const { showToast } = useToasts();
  const [academicYear, setAcademicYear] = useState<string>(userSettings?.defaultAcademicYear || '2026-2027');
  const [grade, setGrade] = useState<GradeLevel>(userSettings?.defaultGrade || 'Standard 4');
  const [subject, setSubject] = useState<Subject>(userSettings?.defaultSubject || 'Language Arts');
  const [schoolName, setSchoolName] = useState<string>(userSettings?.schoolName || 'SAN JUAN BOSCO R.C. SCHOOL');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdateSettings) return;
    try {
      setIsSaving(true);
      await onUpdateSettings({
        defaultAcademicYear: academicYear,
        defaultGrade: grade,
        defaultSubject: subject,
        schoolName: schoolName
      });
      showToast('Settings saved successfully', 'success');
    } catch (e) {
      console.error('Error saving settings:', e);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Settings</h2>
          <p className="text-sm text-gray-500">Manage your school profile, academic calendar year, and application preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <Card className="p-4 space-y-1">
            <SettingsButton active icon={<User className="w-5 h-5" />} label="Profile & Academic Year" />
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
                <img src={user?.photoURL || ''} alt="" className="w-20 h-20 rounded-2xl bg-gray-100" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">{user?.displayName || 'Educator'}</p>
                  <p className="text-xs text-gray-400">{user?.email || ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">School Name</label>
                  <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                  <Input defaultValue={user?.email || ''} disabled />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-50 pb-4">Academic & Planning Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Active Academic Year</label>
                  <Select 
                    options={[
                      { label: '2026-2027 (Current)', value: '2026-2027' },
                      { label: '2025-2026', value: '2025-2026' }
                    ]} 
                    value={academicYear} 
                    onChange={(val) => setAcademicYear(val)} 
                  />
                </div>
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
                    value={grade} 
                    onChange={(val) => setGrade(val as GradeLevel)} 
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
                    value={subject} 
                    onChange={(val) => setSubject(val as Subject)} 
                  />
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
              <Button onClick={handleSave} disabled={isSaving}>
                <Check className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
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


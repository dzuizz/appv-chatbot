'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import FileUploadTest from './FileUploadTest'

interface SettingsProps {
  onClose: () => void
}

export default function Settings({ onClose }: SettingsProps) {
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    theme: 'system',
    fontSize: 'medium',
    exportFormat: 'markdown'
  })

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-elev transition-colors"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <h3 className="font-medium text-sm">General</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted">Auto-save conversations</label>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                className="rounded border-border"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted">Enable notifications</label>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                className="rounded border-border"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Appearance</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="text-sm bg-elev border border-border rounded px-2 py-1"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted">Font size</label>
              <select
                value={settings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                className="text-sm bg-elev border border-border rounded px-2 py-1"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Export</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted">Default export format</label>
              <select
                value={settings.exportFormat}
                onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                className="text-sm bg-elev border border-border rounded px-2 py-1"
              >
                <option value="markdown">Markdown</option>
                <option value="json">JSON</option>
                <option value="txt">Plain Text</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Debug Tools</h3>
            <FileUploadTest />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
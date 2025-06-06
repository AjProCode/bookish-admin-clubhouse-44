
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'BookClub',
    siteDescription: 'A platform for book lovers to discover and share great reads',
    allowRegistration: true,
    requireEmailVerification: false,
    maxBooksPerUser: 50,
    enableNotifications: true,
    autoApproveUsers: false,
  });

  const handleSave = () => {
    // Here you would typically save to database
    toast({
      title: "Settings Updated",
      description: "Your settings have been saved successfully.",
    });
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-gray-600">Manage your application settings</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Configuration</CardTitle>
            <CardDescription>Basic site settings and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxBooks">Max Books Per User</Label>
              <Input
                id="maxBooks"
                type="number"
                value={settings.maxBooksPerUser.toString()}
                onChange={(e) => handleInputChange('maxBooksPerUser', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Control user registration and access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow New Registrations</Label>
                <p className="text-sm text-gray-500">Allow new users to register for accounts</p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => handleInputChange('allowRegistration', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-gray-500">Users must verify their email before accessing the site</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleInputChange('requireEmailVerification', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve New Users</Label>
                <p className="text-sm text-gray-500">Automatically approve new user registrations</p>
              </div>
              <Switch
                checked={settings.autoApproveUsers}
                onCheckedChange={(checked) => handleInputChange('autoApproveUsers', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure notification settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-gray-500">Send email notifications to users</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleInputChange('enableNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

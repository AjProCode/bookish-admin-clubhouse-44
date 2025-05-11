
import React, { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const AdminSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'SkillBag Book Club',
    siteDescription: 'A community of book lovers sharing knowledge and skills through reading.',
    contactEmail: 'contact@skillbagbooks.com',
    enableRegistration: true,
    requireApproval: false,
  });
  
  const [emailSettings, setEmailSettings] = useState({
    fromEmail: 'noreply@skillbagbooks.com',
    welcomeEmailSubject: 'Welcome to SkillBag Book Club',
    welcomeEmailContent: 'Thank you for joining our community of book lovers! We are excited to have you as a member...',
    enableNotifications: true,
  });
  
  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean, settingsType: 'general' | 'email') => {
    if (settingsType === 'general') {
      setGeneralSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setEmailSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };
  
  const handleSaveSettings = (settingsType: 'general' | 'email') => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Settings Saved",
        description: `Your ${settingsType} settings have been updated.`,
      });
    }, 1000);
  };
  
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Settings" />
      
      <div className="p-6 space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure the basic settings for your book club.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    name="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={handleGeneralSettingsChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableRegistration">Allow User Registration</Label>
                      <p className="text-sm text-gray-500">Enable or disable user registrations on the site</p>
                    </div>
                    <Switch
                      id="enableRegistration"
                      checked={generalSettings.enableRegistration}
                      onCheckedChange={(checked) => 
                        handleSwitchChange('enableRegistration', checked, 'general')
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireApproval">Require Admin Approval</Label>
                      <p className="text-sm text-gray-500">New users require admin approval before joining</p>
                    </div>
                    <Switch
                      id="requireApproval"
                      checked={generalSettings.requireApproval}
                      onCheckedChange={(checked) => 
                        handleSwitchChange('requireApproval', checked, 'general')
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSaveSettings('general')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure email notifications and templates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    name="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcomeEmailSubject">Welcome Email Subject</Label>
                  <Input
                    id="welcomeEmailSubject"
                    name="welcomeEmailSubject"
                    value={emailSettings.welcomeEmailSubject}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcomeEmailContent">Welcome Email Content</Label>
                  <Textarea
                    id="welcomeEmailContent"
                    name="welcomeEmailContent"
                    value={emailSettings.welcomeEmailContent}
                    onChange={handleEmailSettingsChange}
                    rows={5}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send emails for important events</p>
                  </div>
                  <Switch
                    id="enableNotifications"
                    checked={emailSettings.enableNotifications}
                    onCheckedChange={(checked) => 
                      handleSwitchChange('enableNotifications', checked, 'email')
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSaveSettings('email')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced settings for your book club.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-amber-600 mb-4">⚠️ These settings are for advanced users only.</p>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Database Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline">Export Data</Button>
                      <Button variant="outline">Import Data</Button>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">System Maintenance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline">Clear Cache</Button>
                      <Button variant="outline">System Logs</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Danger Zone</h3>
                    <Card className="border-red-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">Reset Application</h4>
                            <p className="text-sm text-gray-500">Reset all settings to default</p>
                          </div>
                          <Button variant="destructive">Reset</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsTabs = () => {
  return (
    <Tabs defaultValue="profile">
      <TabsList className="w-full">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="email-accounts">Email Accounts</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="luma-ai">Luma AI</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <form></form>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;

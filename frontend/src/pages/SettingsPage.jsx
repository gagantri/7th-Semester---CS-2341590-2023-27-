import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { api, humanError } from '@/lib/api';

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.default_city || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/me', {
        name: name.trim(),
        default_city: city.trim() || null,
      });
      await refresh();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(humanError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8 py-8 space-y-6">
      <header>
        <div className="text-sm text-muted-foreground">Account</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Profile & settings
        </h1>
      </header>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Personal info</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={save}>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Default city</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Delhi, Mumbai…"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Sign-in method</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Signed in via{' '}
          <span className="font-medium text-foreground capitalize">
            {user.auth_provider}
          </span>
          .
        </CardContent>
      </Card>
    </div>
  );
}

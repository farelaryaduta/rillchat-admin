import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';

const AnnouncementCreate: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: '',
    postedBy: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, 'announcements'), {
        title: formData.title,
        content: formData.content,
        date: formData.date ? Timestamp.fromDate(new Date(formData.date)) : Timestamp.now(),
        postedBy: formData.postedBy,
        createdAt: Timestamp.now()
      });

      toast.success('Announcement created successfully!');
      router.visit('/announcements');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="Create Announcement" />
      <div className="max-w-2xl mx-auto p-4">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-6">Create Announcement</h1>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={6}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postedBy">Posted By</Label>
                <Input
                  id="postedBy"
                  value={formData.postedBy}
                  onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.visit('/announcements')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Announcement'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default AnnouncementCreate; 
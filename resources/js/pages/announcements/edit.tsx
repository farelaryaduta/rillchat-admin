import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Head } from '@inertiajs/react';

interface Props {
  id: string;
}

export default function EditAnnouncement({ id }: Props) {
  console.log('EditAnnouncement props:', { id });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postedBy: '',
    date: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        console.error('Invalid announcement ID:', id);
        toast.error('Invalid announcement ID');
        router.visit('/announcements');
        return;
      }

      try {
        console.log('Fetching announcement with ID:', id);
        const docRef = doc(db, 'announcements', id);
        
        if (!docRef) {
          console.error('Failed to create document reference for ID:', id);
          toast.error('Invalid document reference');
          router.visit('/announcements');
          return;
        }

        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Found announcement:', { id: docSnap.id, ...data });
          
          // Convert Timestamp to string date if it exists
          const date = data.date instanceof Timestamp 
            ? new Date(data.date.seconds * 1000).toISOString().split('T')[0]
            : '';

          setFormData({
            title: data.title || '',
            content: data.content || '',
            postedBy: data.postedBy || '',
            date: date
          });
        } else {
          console.error('No announcement found for ID:', id);
          toast.error('Announcement not found');
          router.visit('/announcements');
        }
      } catch (error: any) {
        console.error('Error fetching announcement:', error);
        toast.error(error.message || 'Failed to fetch announcement');
        router.visit('/announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('Invalid announcement ID for update:', id);
      toast.error('Invalid announcement ID');
      return;
    }

    try {
      console.log('Updating announcement with ID:', id);
      const docRef = doc(db, 'announcements', id);
      
      if (!docRef) {
        console.error('Failed to create document reference for update. ID:', id);
        toast.error('Invalid document reference');
        return;
      }

      await updateDoc(docRef, {
        title: formData.title,
        content: formData.content,
        postedBy: formData.postedBy,
        date: formData.date ? Timestamp.fromDate(new Date(formData.date)) : Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      console.log('Successfully updated announcement:', id);
      toast.success('Announcement updated successfully');
      router.visit('/announcements');
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      toast.error(error.message || 'Failed to update announcement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title="Edit Announcement" />
      <div className="max-w-2xl mx-auto p-4">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-6">Edit Announcement</h1>
              <p className="text-sm text-muted-foreground">ID: {id}</p>
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
              <Button type="submit">
                Update Announcement
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
} 
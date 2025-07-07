import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, deleteDoc, doc, where } from 'firebase/firestore';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Head } from '@inertiajs/react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: { seconds: number; nanoseconds: number };
  postedBy: string;
  attachmentUrl?: string;
  attachmentType?: string;
}

const AnnouncementList: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching announcements...');
      const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const id = doc.id;
        const data = doc.data();
        console.log('Fetched announcement:', { id, ...data });
        return {
          id,
          ...data
        };
      }) as Announcement[];
      console.log('Total announcements fetched:', data.length);
      setAnnouncements(data);
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
      setError(err.message || 'Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) {
      console.error('No announcement selected for deletion');
      return;
    }

    if (!selectedAnnouncement.id || typeof selectedAnnouncement.id !== 'string' || selectedAnnouncement.id.trim() === '') {
      console.error('Invalid announcement ID for deletion:', selectedAnnouncement.id);
      toast.error('Invalid announcement ID');
      return;
    }

    try {
      console.log('Deleting announcement:', selectedAnnouncement.id);
      const docRef = doc(db, 'announcements', selectedAnnouncement.id);
      
      if (!docRef) {
        console.error('Failed to create document reference for deletion. ID:', selectedAnnouncement.id);
        toast.error('Invalid document reference');
        return;
      }

      await deleteDoc(docRef);
      console.log('Successfully deleted announcement:', selectedAnnouncement.id);
      
      setAnnouncements(prev => prev.filter(a => a.id !== selectedAnnouncement.id));
      toast.success('Announcement deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast.error(error.message || 'Failed to delete announcement');
    }
  };

  console.log('Announcements:', announcements);

  return (
    <>
      <Head title="Announcements" />
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Announcements</h1>
          <Link
            href="/announcements/create"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Create Announcement
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Loading announcements...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {announcements.map(announcement => (
            <div key={announcement.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl font-semibold">{announcement.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{new Date(announcement.date.seconds * 1000).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Posted by: {announcement.postedBy}</span>
                    <span>•</span>
                    <span className="text-xs">ID: {announcement.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                {/* {announcement.id && typeof announcement.id === 'string' && announcement.id.trim() !== '' && (
                  <Link href={`/announcements/${announcement.id}/edit`}>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                )} */}
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    onClick={() => {
                      setSelectedAnnouncement(announcement);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">{announcement.content}</div>
              {announcement.attachmentUrl && (
                <div className="mt-4">
                  <a
                    href={announcement.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {announcement.attachmentType?.startsWith('image/') ? (
                      <img src={announcement.attachmentUrl} alt="attachment" className="max-h-40 rounded-md" />
                    ) : (
                      'View Attachment'
                    )}
                  </a>
                </div>
              )}
            </div>
          ))}
          {announcements.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8">
              No announcements found.
            </div>
          )}
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Announcement</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this announcement? This action cannot be undone.
                {selectedAnnouncement && (
                  <div className="mt-2 text-sm">
                    <strong>Title:</strong> {selectedAnnouncement.title}
                    <br />
                    <strong>ID:</strong> {selectedAnnouncement.id}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AnnouncementList; 
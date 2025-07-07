import { useEffect, useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { db, auth } from '@/lib/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    where,
    getDocs,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile, updatePassword } from 'firebase/auth';
import { getInitials } from '@/hooks/use-initials';
import { Search, Plus, Pencil, Trash, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types/firebase';

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        email: '',
        password: '',
        nim: '',
    });
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        password: '',
        nim: '',
    });
    const [passwordVisibility, setPasswordVisibility] = useState<{ [userId: string]: boolean }>({});

    useEffect(() => {
        // Listen to users collection from Firestore
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, orderBy('name'));

        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as User[];
            setUsers(usersData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const filtered = users.filter(
            (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [users, searchTerm]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                createFormData.email,
                createFormData.password
            );

            // Update user profile
            await updateProfile(userCredential.user, {
                displayName: createFormData.name,
            });

            // Add user to Firestore
            const userRef = doc(db, 'users', userCredential.user.uid);
            await updateDoc(userRef, {
                name: createFormData.name,
                email: createFormData.email,
                nim: createFormData.nim,
                createdAt: new Date(),
                lastActive: new Date(),
            });

            setIsCreateDialogOpen(false);
            setCreateFormData({ name: '', email: '', password: '', nim: '' });
            toast.success('User created successfully');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            const userRef = doc(db, 'users', selectedUser.id);
            const updates = {
                name: editFormData.name,
                email: editFormData.email,
                nim: editFormData.nim,
            };

            // Only update password if it's provided
            if (editFormData.password) {
                // Update password in Firebase Auth
                const user = auth.currentUser;
                if (user) {
                    await updatePassword(user, editFormData.password);
                }
            }

            await updateDoc(userRef, updates);

            setIsEditDialogOpen(false);
            setSelectedUser(null);
            setEditFormData({ name: '', email: '', password: '', nim: '' });
            toast.success('User updated successfully');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            await deleteDoc(doc(db, 'users', selectedUser.id));
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
            toast.success('User deleted successfully');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openEditDialog = useCallback((user: User) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            password: '',
            nim: user.nim || '',
        });
        setIsEditDialogOpen(true);
    }, []);

    const openDeleteDialog = useCallback((user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    }, []);

    const togglePasswordVisibility = (userId: string) => {
        setPasswordVisibility((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    return (
        <>
            <Head title="Users" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">Users</h2>
                            <p className="text-sm text-muted-foreground">
                                Total Users: {filteredUsers.length}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Search className="w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleCreateUser}>
                                        <DialogHeader>
                                            <DialogTitle>Create New User</DialogTitle>
                                            <DialogDescription>
                                                Add a new user to the system.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-name">Name</Label>
                                                <Input
                                                    id="create-name"
                                                    value={createFormData.name}
                                                    onChange={(e) =>
                                                        setCreateFormData({ ...createFormData, name: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="create-nim">NIM</Label>
                                                <Input
                                                    id="create-nim"
                                                    value={createFormData.nim}
                                                    onChange={(e) =>
                                                        setCreateFormData({ ...createFormData, nim: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="create-email">Email</Label>
                                                <Input
                                                    id="create-email"
                                                    type="email"
                                                    value={createFormData.email}
                                                    onChange={(e) =>
                                                        setCreateFormData({ ...createFormData, email: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="create-password">Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="create-password"
                                                        type={passwordVisibility['new'] ? 'text' : 'password'}
                                                        value={createFormData.password}
                                                        onChange={(e) =>
                                                            setCreateFormData({
                                                                ...createFormData,
                                                                password: e.target.value,
                                                            })
                                                        }
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility('new')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                                    >
                                                        {passwordVisibility['new'] ? (
                                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Create User</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>NIM</TableHead>
                                    <TableHead>Password</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={user.photoURL || ''}
                                                        alt={user.name}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium">{user.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.nim}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <span>
                                                    {passwordVisibility[user.id] ? user.password : '**********'}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => togglePasswordVisibility(user.id)}
                                                    tabIndex={-1}
                                                >
                                                    {passwordVisibility[user.id] ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditDialog(user)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDeleteDialog(user)}
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleUpdateUser}>
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Update user information.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editFormData.name}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-nim">NIM</Label>
                                <Input
                                    id="edit-nim"
                                    value={editFormData.nim}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, nim: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, email: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="edit-password"
                                        type={passwordVisibility['edit'] ? 'text' : 'password'}
                                        value={editFormData.password}
                                        onChange={(e) =>
                                            setEditFormData({
                                                ...editFormData,
                                                password: e.target.value,
                                            })
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('edit')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        {passwordVisibility['edit'] ? (
                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Leave blank to keep current password
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update User</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 
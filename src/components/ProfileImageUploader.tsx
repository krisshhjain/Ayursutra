import { useState, useRef } from 'react';
import { Camera, Trash2, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProfileImageUploaderProps {
  userType: 'patient' | 'practitioner';
  currentImageUrl?: string | null;
  userName?: string;
  onImageUpdate?: (imageUrl: string | null) => void;
  editable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ProfileImageUploader = ({
  userType,
  currentImageUrl,
  userName = '',
  onImageUpdate,
  editable = true,
  size = 'md'
}: ProfileImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl'
  };

  const buttonSizeClasses = {
    sm: 'h-6 w-6 -bottom-1 -right-1',
    md: 'h-8 w-8 -bottom-2 -right-2',
    lg: 'h-10 w-10 -bottom-2 -right-2'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Get initials from name
  const getInitials = () => {
    if (!userName) return '?';
    const names = userName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0]?.toUpperCase() || '?';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size should be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/${userType}/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.data.profileImage);
        onImageUpdate?.(data.data.profileImage);
        toast({
          title: 'Success',
          description: 'Profile image uploaded successfully',
        });
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    setIsUploading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/${userType}/profile/image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(null);
        onImageUpdate?.(null);
        toast({
          title: 'Success',
          description: 'Profile image deleted successfully',
        });
      } else {
        throw new Error(data.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Profile Image or Placeholder */}
        <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center`}>
          {isUploading ? (
            <Loader2 className={`${iconSizeClasses[size]} animate-spin text-white`} />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-semibold text-white">
              {getInitials()}
            </span>
          )}
        </div>

        {/* Edit/Upload Button */}
        {editable && !isUploading && (
          <Button
            size="sm"
            variant="outline"
            className={`absolute ${buttonSizeClasses[size]} rounded-full p-0 bg-background border-2`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className={iconSizeClasses[size]} />
          </Button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Delete Button */}
      {editable && imageUrl && !isUploading && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-destructive hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Remove
        </Button>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete profile image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your profile image will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileImageUploader;

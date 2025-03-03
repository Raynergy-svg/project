import { useState, useRef } from 'react';
import { User as UserIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { uploadAvatar, updateUserProfile } from '@/lib/supabase/profileService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function AvatarUpload() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar_url);
  const [preview, setPreview] = useState<string | null>(user?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload a profile picture',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const response = await uploadAvatar(user.id, file);

      if (response.error) {
        throw response.error;
      }

      if (response.data?.avatarUrl) {
        setAvatarUrl(response.data.avatarUrl);
        
        // Update user context with new avatar
        updateUser({
          avatar_url: response.data.avatarUrl
        });

        toast({
          title: 'Avatar updated',
          description: 'Your profile picture has been successfully updated.',
        });
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred while uploading your avatar',
        variant: 'destructive',
      });
      
      // Reset preview if upload failed
      setPreview(user?.avatar_url || null);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = async () => {
    if (!user?.id) return;

    setUploading(true);

    try {
      const response = await updateUserProfile(user.id, { avatar_url: null });

      if (response.error) {
        throw response.error;
      }

      setAvatarUrl(undefined);
      setPreview(null);
      
      // Update user context
      updateUser({
        avatar_url: undefined
      });

      toast({
        title: 'Avatar removed',
        description: 'Your profile picture has been removed.',
      });
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      toast({
        title: 'Action failed',
        description: error instanceof Error ? error.message : 'An error occurred while removing your avatar',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a profile picture to personalize your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6">
          <div className="relative mb-4 md:mb-0">
            <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-16 w-16 text-gray-400" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              )}
            </div>
            {preview && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={uploading}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                aria-label="Remove avatar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col items-center space-y-3 md:items-start">
            <p className="text-sm text-gray-400 max-w-md">
              Upload a profile picture in JPEG, PNG, or GIF format. 
              Maximum file size is 2MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Picture'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
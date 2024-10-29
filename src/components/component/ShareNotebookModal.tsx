import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string | null;
}

const ShareNotebookModal: React.FC<ShareNotebookModalProps> = ({ isOpen, onClose, notebookId }) => {
  const [shareLink, setShareLink] = useState('');
  const [shareAccess, setShareAccess] = useState<'view' | 'edit' | 'admin'>('view');
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useAuth();

  const generateShareLink = async () => {
    if (!notebookId) {
      toast.error('No notebook selected for sharing');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:8080/api';
      const response = await axios.post(`${apiUrl}/notebooks/${notebookId}/share`, 
        { access: shareAccess },
        { headers: { Authorization: `Bearer ${user?.accessToken}` } }
      );
      setShareLink(response.data.shareUrl);
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    toast.success('Share link copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>Share Notebook</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Access Level</Label>
            <RadioGroup value={shareAccess} onValueChange={(value: 'view' | 'edit' | 'admin') => setShareAccess(value)} className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="view" id="view" />
                <Label htmlFor="view">View access</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="edit" id="edit" />
                <Label htmlFor="edit">Edit access</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin access</Label>
              </div>
            </RadioGroup>
          </div>
          <Button onClick={generateShareLink} className="w-full">Generate Share Link</Button>
          {shareLink && (
            <div className="space-y-2">
              <Label htmlFor="share-link" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Share link
              </Label>
              <div className="flex mt-1 rounded-md shadow-sm">
                <Input
                  id="share-link"
                  value={shareLink}
                  readOnly
                  className="flex-grow min-w-0 block w-full px-3 py-2 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <Button
                  onClick={copyToClipboard}
                  className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                  {isCopied ? (
                    <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareNotebookModal;

"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ChevronDownIcon, LockOpenIcon, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareNoteModalProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
  accessLevel: string;
}

const ShareNoteModal: React.FC<ShareNoteModalProps> = ({ noteId, isOpen, onClose, accessLevel }) => {
  const [shareLink, setShareLink] = useState('');
  const [accessType, setAccessType] = useState('view');
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      generateShareLink();
    }
  }, [isOpen, accessType]);

  const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV;
  
  const token = user?.accessToken;

  const generateShareLink = async () => {
    try {
      const response = await fetch(`${apiUrl}/notes/${noteId}/share`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessType }),
      });
      if (!response.ok) throw new Error('Failed to share note');
      const { shareLink } = await response.json();
      setShareLink(shareLink);
    } catch (error) {
      toast.error('Error sharing note: ' + (error as Error).message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    toast.success('Share link copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold leading-6 text-gray-900">
            Share Note
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Label className="text-sm font-medium text-gray-700">People with access</Label>
          <div className="mt-2 flex items-center space-x-2">
            <LockOpenIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Only people with access can open with the link</span>
          </div>
          <RadioGroup
            value={accessType}
            onValueChange={setAccessType}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="view" id="view" />
              <Label htmlFor="view">View only</Label>
            </div>
            {accessLevel === 'admin' && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin access</Label>
              </div>
            )}
          </RadioGroup>
        </div>
        <div className="mt-4">
          <Label htmlFor="share-link" className="text-sm font-medium text-gray-700">
            Share link
          </Label>
          <div className="mt-2 flex rounded-md shadow-sm">
            <Input
              type="text"
              name="share-link"
              id="share-link"
              value={shareLink}
              readOnly
              className="flex-grow min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
            />
            <Button
              type="button"
              onClick={handleCopy}
              className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {isCopied ? (
                <>
                  <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareNoteModal;
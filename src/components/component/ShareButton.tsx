'use client';

import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareModal from './ShareModal';

interface ShareButtonProps {
  type: 'notebook' | 'chapter';
  id: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ type, id }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Share2 size={16} />
        Share
      </Button>
      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        id={id}
      />
    </>
  );
};

export default ShareButton;

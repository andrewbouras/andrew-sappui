'use client';

import React from 'react';
import { Settings, Sun, Moon, Shuffle, Share2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import ShareModal from './ShareModal';

interface SettingsDropdownProps {
  isRandomized: boolean;
  toggleRandomization: () => void;
  shareId: string;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ 
  isRandomized, 
  toggleRandomization, 
  shareId 
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  const handleItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-white dark:bg-gray-800 text-black dark:text-white">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DropdownMenuItem onSelect={handleItemClick} className="flex items-center justify-between">
          <div className="flex items-center">
            <Shuffle className="mr-2 h-4 w-4" />
            <span>Randomize Questions</span>
          </div>
          <Switch checked={isRandomized} onClick={toggleRandomization} />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleItemClick} className="flex items-center justify-between">
          <div className="flex items-center">
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>Dark Mode</span>
          </div>
          <Switch 
            checked={theme === 'dark'} 
            onCheckedChange={toggleDarkMode}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setIsShareModalOpen(true)} className="flex items-center">
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        type="chapter"
        id={shareId}
      />
    </DropdownMenu>
  );
};

export default SettingsDropdown;
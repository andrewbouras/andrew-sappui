'use client';

import React, { useState } from 'react';
import { Notebook, QuestionBank } from '@/types';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronRight, Plus, MoreVertical, Share2, Trash2, X, Menu } from "lucide-react";
import Link from 'next/link';

interface SidebarProps {
  isPremium: boolean;
  onDeleteChapter: (notebookId: string, chapterId: string) => void;
  onShareChapter: (notebookId: string, chapterId: string) => void;
  onOpenNotebookCreation: () => void;
  onSelectNotebook: (notebookId: string) => void;
  selectedNotebookId: string | undefined;
  notebooks: Notebook[];
  onDeleteNotebook: (notebookId: string) => void;
  onShareNotebook: (notebookId: string) => void;
  onChapterClick: (notebookId: string, chapter: { _id: string; title: string; notebookId: string }) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isPremium,
  onDeleteChapter,
  onShareChapter,
  onOpenNotebookCreation,
  onSelectNotebook,
  selectedNotebookId,
  notebooks,
  onDeleteNotebook,
  onShareNotebook,
  onChapterClick,
  isOpen,
  onToggle
}) => {
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());

  const toggleNotebook = (notebookId: string) => {
    setExpandedNotebooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notebookId)) {
        newSet.delete(notebookId);
      } else {
        newSet.add(notebookId);
      }
      return newSet;
    });
  };

  const TruncatedTitle = ({ title, maxLength }: { title: string; maxLength: number }) => {
    const truncated = title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
    return (
      <span
        onMouseEnter={() => setHoveredTitle(title)}
        onMouseLeave={() => setHoveredTitle(null)}
      >
        {truncated}
      </span>
    );
  };

  return (
    <div className={`fixed h-full bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} overflow-hidden`}>
      <button onClick={onToggle} className="absolute top-4 right-4">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      
      {isOpen && (
        <>
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Notebooks</h2>
            <Button onClick={onOpenNotebookCreation} size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-64px)] px-4">
            {notebooks.map((notebook) => (
              <Collapsible key={notebook._id} className="mb-4">
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger 
                    className="flex items-center text-lg font-semibold hover:text-blue-500"
                    onClick={() => toggleNotebook(notebook._id)}
                  >
                    {expandedNotebooks.has(notebook._id) ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    {notebook.title}
                  </CollapsibleTrigger>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onShareNotebook(notebook._id)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        <span>Share Notebook</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteNotebook(notebook._id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>Delete Notebook</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CollapsibleContent>
                  <div>
                    {notebook.chapters.map((chapter) => (
                      <div
                        key={chapter._id}
                        className="mb-1 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 flex justify-between items-center"
                      >
                        <button
                          onClick={() => onChapterClick(notebook._id, chapter)}
                          aria-label={`Open chapter: ${chapter.title}`}
                          className="flex-grow text-left"
                        >
                          <span>{chapter.title}</span>
                        </button>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onShareChapter(notebook._id, chapter._id);
                            }}
                            aria-label={`Share chapter: ${chapter.title}`}
                            className="text-navy-900 hover:text-navy-700 hover:bg-gray-200 mr-1"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`More options for chapter: ${chapter.title}`}
                                className="text-navy-900 hover:text-navy-700 hover:bg-gray-200"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => onDeleteChapter(notebook._id, chapter._id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </ScrollArea>
        </>
      )}

      {hoveredTitle && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-2 text-center">
          <div className="animate-marquee whitespace-nowrap">
            {hoveredTitle}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

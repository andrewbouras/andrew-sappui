"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import ShareNoteModal from '@/components/component/ShareNoteModal';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Define the Note and EnrolledQuestionBank types
interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface EnrolledQuestionBank {
  _id: string;
  bankTitle: string;
  bankUrl: string;
  isEditor: boolean;
  isCreator: boolean;
}

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [enrolledQuestionBanks, setEnrolledQuestionBanks] = useState<EnrolledQuestionBank[]>([]);
  const [notebooks, setNotebooks] = useState<Note[]>([]);
  const [iconSize, setIconSize] = useState(25);
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState('none');

  useEffect(() => {
    const fetchNotes = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
      const token = user?.accessToken;

      if (!token) {
        console.error("No access token found");
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/notes`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch notes');
        const result: Note[] = await response.json();
        setNotes(result || []);
      } catch (error) {
        console.error('Error fetching notes:', (error as Error).message);
        setNotes([]);
      }
    };

    const fetchNotebooks = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
      const token = user?.accessToken;

      if (!token) {
        console.error("No access token found");
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/notebooks`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch notebooks');
        const result: Note[] = await response.json();
        setNotebooks(result || []);
      } catch (error) {
        console.error('Error fetching notebooks:', (error as Error).message);
        setNotebooks([]);
      }
    };

    const fetchEnrolledQuestionBanks = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
      const token = user?.accessToken;

      if (!token) {
        console.error("No access token found");
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/user/question-banks`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch enrolled question banks');
        const result: EnrolledQuestionBank[] = await response.json();
        setEnrolledQuestionBanks(result || []);
      } catch (error) {
        console.error('Error fetching enrolled question banks:', (error as Error).message);
        setEnrolledQuestionBanks([]);
      }
    };

    if (isAuthenticated) {
      fetchNotes();
      fetchEnrolledQuestionBanks();
      fetchNotebooks();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleResize = () => {
      const newSize = window.innerHeight < 500 ? 20 : 25;
      setIconSize(newSize);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = isSidebarOpen ? 'w-1/6' : 'w-0';
  const buttonPosition = isSidebarOpen ? 'left-[17%]' : 'left-0';

  const deleteNote = async (noteId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
    const token = user?.accessToken;

    try {
      const response = await fetch(`${apiUrl}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete note');
      const { message } = await response.json();
      toast.success(message);
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      toast.error('Error deleting note: ' + (error as Error).message);
    }
  };

  const openShareModal = async (noteId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
    setSelectedNoteId(noteId);
    setShareModalOpen(true);
    const token = user?.accessToken;
    if (!token) {
      console.error("No access token found");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/notes/${noteId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to fetch note details');
      const { accessLevel } = await response.json();
      setAccessLevel(accessLevel);
    } catch (error) {
      console.error('Error fetching note details:', (error as Error).message);
    }
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setSelectedNoteId(null);
    setAccessLevel('none');
  };

  return (
    <>
      <div className={`fixed h-full bg-gray-200 transition-all duration-500 ${sidebarWidth} overflow-hidden z-10`}>
        {isSidebarOpen && (
          <div className="flex items-center justify-between p-5">
            <h1 className="text-xl font-bold truncate">Luminous</h1>
            <Link href="/new">
              <Image src="https://www.svgrepo.com/show/313873/edit.svg" alt="Create New Note" width={20} height={20} />
            </Link>
          </div>
        )}
        {isSidebarOpen && (
          <div className="overflow-y-auto p-5 h-[80vh]">
            {enrolledQuestionBanks.length > 0 && (
              <div>
                {enrolledQuestionBanks.map(bank => (
                  <div key={bank._id} className={`group flex items-center justify-between px-4 py-2 rounded my-1 cursor-pointer ${pathname === `/bank/${bank.bankUrl}` ? 'bg-blue-600 text-white' : 'hover:bg-blue-200'}`}>
                    <Link href={`/bank/${bank.bankUrl}`} className="flex-grow truncate">
                      {bank.bankTitle}
                    </Link>
                    {(bank.isEditor || bank.isCreator) && (
                      <Link href={`/bank/${bank.bankUrl}/editor`}>
                        <Image src="/path-to-pencil-icon.svg" alt="Edit" width={20} height={20} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
            {notes.length > 0 && notes.map(note => (
              <Link href={`/notes/${note._id}`} key={note._id}>
                <div className={`group flex items-center justify-between px-4 py-2 rounded my-1 cursor-pointer ${pathname === `/notes/${note._id}` ? 'bg-blue-600 text-white' : 'hover:bg-gray-300'}`}>
                  <span className="flex-grow truncate">{note.title}</span>
                  <div className="flex opacity-0 group-hover:opacity-100">
                    <Image src="https://www.svgrepo.com/show/521184/more-horizontal.svg" alt="More" width={15} height={15} className="mr-2" onClick={(e) => { e.preventDefault(); openShareModal(note._id); }} />
                    <Image src="/trash.png" alt="Delete" width={20} height={20} onClick={(e) => { e.preventDefault(); deleteNote(note._id); }} />
                  </div>
                </div>
              </Link>
            ))}
            {notebooks.length > 0 && notebooks.map(notebook => (
              <Link href={`/notebook/${notebook._id}`} key={notebook._id}>
                <div className={`group flex items-center justify-between px-4 py-2 rounded my-1 cursor-pointer ${pathname === `/notebook/${notebook._id}` ? 'bg-blue-600 text-white' : 'hover:bg-gray-300'}`}>
                  <span className="flex-grow truncate">{notebook.title}</span>
                </div>
              </Link>
            ))}

          </div>
        )}
        {isSidebarOpen && (
          <div className="absolute bottom-5 w-full px-5">
            <Link href="/new-notebook">
              <button className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
                Create New Class
              </button>
            </Link>
            {/* <Link href="/createbank/new">
              <button className="w-full bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 mt-4">
                Create Question Bank
              </button>
            </Link> */}
          </div>
        )}
      </div>
      <div className={`fixed ${buttonPosition} top-1/2 transform -translate-y-1/2 z-20 bg-transparent w-[4%]`}>
        <button onClick={toggleSidebar} className="bg-transparent p-2 rounded-l focus:outline-none h-full flex items-center justify-center">
          <Image
            src={isSidebarOpen ? 'https://www.svgrepo.com/show/425979/left-arrow.svg' : 'https://www.svgrepo.com/show/425982/right-arrow.svg'}
            alt="Toggle"
            width={iconSize}
            height={iconSize}
          />
        </button>
      </div>
      {isShareModalOpen && selectedNoteId && (
        <ShareNoteModal
          noteId={selectedNoteId}
          isOpen={isShareModalOpen}
          onClose={closeShareModal}
          session={{ user }}
          accessLevel={accessLevel}
        />
      )}
    </>
  );
};

export default Sidebar;

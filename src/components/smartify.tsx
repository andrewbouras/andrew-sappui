'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Plus, Settings, MoreVertical, Share2, Upload, X, Copy, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { useAuth } from '@/contexts/AuthContext';

type Notebook = {
  _id: string
  title: string
  chapters: { _id: string; title: string; notebookId: string }[]
}

type QuestionBank = {
  _id: string
  bankTitle: string
  bankUrl: string
  isEditor: boolean
  isCreator: boolean
}

type UserRole = "admin" | "editor" | "viewer"

type Objective = {
  id: string
  text: string
}

const SidebarComponent = ({ notebooks, questionBanks, selectedNotebook, setSelectedNotebook, addNotebook, deleteNotebook, setShowSettings, isPremium, setIsPremium, gradientEffect, userRole, shareAccess, setShareAccess, generateShareLink, shareLink, setShowShareModal }: {
  notebooks: Notebook[]
  questionBanks: QuestionBank[]
  selectedNotebook: Notebook | null
  setSelectedNotebook: (notebook: Notebook | null) => void
  addNotebook: () => void
  deleteNotebook: (id: string) => void
  setShowSettings: (show: boolean) => void
  isPremium: boolean
  setIsPremium: (isPremium: boolean) => void
  gradientEffect: boolean
  userRole: UserRole
  shareAccess: "admin" | "editor" | "view-only"
  setShareAccess: (access: "admin" | "editor" | "view-only") => void
  generateShareLink: () => void
  shareLink: string
  setShowShareModal: (show: boolean) => void
}) => {
  return (
    <div className="w-full md:w-64 bg-white shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-navy-900">Smartify</h1>
        {isPremium ? (
          <p className="mt-2 font-semibold text-navy-900">Premium</p>
        ) : (
          <Button
            className={`mt-2 w-full ${
              gradientEffect ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-blue-600'
            } hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300`}
            onClick={() => setIsPremium(true)}
          >
            Free User
          </Button>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4">
          <h2 className="font-semibold mb-2 text-navy-900">Smartify Question Banks</h2>
          {questionBanks.map((bank) => (
            <div key={bank._id} className="mb-1 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200">
              {bank.bankTitle}
            </div>
          ))}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-navy-900">Notebooks</h2>
            <Button variant="ghost" size="icon" onClick={addNotebook} className="text-navy-900 hover:text-navy-700 hover:bg-gray-100">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {notebooks.map((notebook) => (
            <div
              key={notebook._id}
              className={`mb-1 p-2 hover:bg-gray-100 rounded cursor-pointer flex justify-between items-center transition-colors duration-200 ${
                selectedNotebook?._id === notebook._id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedNotebook(notebook)}
            >
              <span>{notebook.title}</span>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowShareModal(true)
                  }}
                  className="text-navy-900 hover:text-navy-700 hover:bg-gray-200 mr-1"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-navy-900 hover:text-navy-700 hover:bg-gray-200">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => deleteNotebook(notebook._id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ChevronRight className="h-4 w-4 text-navy-900" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="absolute bottom-4 left-4">
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="text-navy-900 hover:text-navy-700 hover:bg-gray-100">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

const ChapterCreationComponent = ({ selectedNotebook, setSelectedNotebook, notebooks, setNotebooks, setShowAddChapter, setObjectives }: {
  selectedNotebook: Notebook | null
  setSelectedNotebook: (notebook: Notebook | null) => void
  notebooks: Notebook[]
  setNotebooks: (notebooks: Notebook[]) => void
  setShowAddChapter: (show: boolean) => void
  setObjectives: (objectives: Objective[]) => void
}) => {
  const [newChapterTitle, setNewChapterTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chapterObjectives, setChapterObjectives] = useState<Objective[]>([])
  const [showObjectives, setShowObjectives] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAddChapter(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setShowAddChapter])

  const handleAddChapter = async () => {
    if (selectedNotebook && newChapterTitle) {
      setIsLoading(true)
      // Simulating API request
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newObjectives: Objective[] = [
        { id: "1", text: "Understand basic concepts" },
        { id: "2", text: "Apply formulas correctly" },
        { id: "3", text: "Solve complex problems" },
      ]
      setChapterObjectives(newObjectives)
      setShowObjectives(true)
      setIsLoading(false)
    }
  }

  const handleDeleteObjective = (id: string) => {
    setChapterObjectives(chapterObjectives.filter(obj => obj.id !== id))
  }

  const handleNext = () => {
    if (selectedNotebook) {
      const newChapter = {
        _id: (selectedNotebook.chapters.length + 1).toString(),
        title: newChapterTitle,
        notebookId: selectedNotebook._id
      }
      const updatedNotebook = {
        ...selectedNotebook,
        chapters: [...selectedNotebook.chapters, newChapter]
      }
      setNotebooks(notebooks.map(n => n._id === selectedNotebook._id ? updatedNotebook : n))
      setSelectedNotebook(updatedNotebook)
      setObjectives(chapterObjectives)
      setShowAddChapter(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white relative" ref={modalRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAddChapter(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="text-navy-900">Add New Chapter</CardTitle>
        </CardHeader>
        <CardContent>
          {!showObjectives ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="chapterTitle" className="text-navy-900">Chapter Title</Label>
                <Input
                  id="chapterTitle"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label htmlFor="pdfUpload" className="text-navy-900">Upload PDF</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="pdfUpload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input id="pdfUpload" name="pdfUpload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleAddChapter} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Add Chapter"}
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-navy-900 mb-2">Chapter Objectives</h3>
              <ul className="space-y-2">
                {chapterObjectives.map(objective => (
                  <li key={objective.id} className="flex justify-between items-center">
                    <span>{objective.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteObjective(objective.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={handleNext} 
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function Smartify() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([])
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [showAddChapter, setShowAddChapter] = useState(false)
  const [gradientEffect, setGradientEffect] = useState(false)
  const [shareAccess, setShareAccess] = useState<"admin" | "editor" | "view-only">("view-only")
  const [shareLink, setShareLink] = useState("")
  const [userRole, setUserRole] = useState<UserRole>("admin")
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
      : process.env.NEXT_PUBLIC_API_URL_DEV ;
      const token = user?.accessToken;

      try {
        console.log('Token:', token); // Log the token to ensure it's set correctly
      
        const [planResponse, notebookResponse, bankResponse] = await Promise.all([
          fetch(`${apiUrl}/user/plan`, { 
            headers: { 
              Authorization: `Bearer ${token}` 
            } 
          }),
          fetch(`${apiUrl}/notebooks`, { 
            headers: { 
              Authorization: `Bearer ${token}` 
            } 
          }),
          fetch(`${apiUrl}/user/question-banks`, { 
            headers: { 
              Authorization: `Bearer ${token}` 
            } 
          }),
        ]);
      

        const planData = await planResponse.json()
        const notebookData = await notebookResponse.json()
        const bankData = await bankResponse.json()

        setIsPremium(planData.plan === 'premium')
        setNotebooks(notebookData)
        setQuestionBanks(bankData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }


    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientEffect(prev => !prev)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowSettings(false)
        setObjectives([])
        setShowShareModal(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const addNotebook = () => {
    const newNotebook: Notebook = {
      _id: (notebooks.length + 1).toString(),
      title: `New Notebook ${notebooks.length + 1}`,
      chapters: [],
    }
    setNotebooks([...notebooks, newNotebook])
  }

  const addChapter = () => {
    setShowAddChapter(true)
  }

  const deleteNotebook = (notebookId: string) => {
    setNotebooks(notebooks.filter((n) => n._id !== notebookId))
    if (selectedNotebook?._id === notebookId) {
      setSelectedNotebook(null)
    }
  }

  const deleteChapter = (notebookId: string, chapterId: string) => {
    setNotebooks(notebooks.map(n => {
      if (n._id === notebookId) {
        return {
          ...n,
          chapters: n.chapters.filter(ch => ch._id !== chapterId)
        }
      }
      return n
    }))
  }

  const generateShareLink = () => {
    const link = `https://smartify.app/share/${selectedNotebook?._id}?access=${shareAccess}`
    setShareLink(link)
    navigator.clipboard.writeText(link)
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-black">
      <SidebarComponent
        notebooks={notebooks}
        questionBanks={questionBanks}
        selectedNotebook={selectedNotebook}
        setSelectedNotebook={setSelectedNotebook}
        addNotebook={addNotebook}
        deleteNotebook={deleteNotebook}
        setShowSettings={setShowSettings}
        isPremium={isPremium}
        setIsPremium={setIsPremium}
        gradientEffect={gradientEffect}
        userRole={userRole}
        shareAccess={shareAccess}
        setShareAccess={setShareAccess}
        generateShareLink={generateShareLink}
        shareLink={shareLink}
        setShowShareModal={setShowShareModal}
      />
      {selectedNotebook && (
        <div className="w-full md:w-48 bg-white shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-navy-900">{selectedNotebook.title}</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-navy-900">Chapters</h3>
                <Button variant="ghost" size="icon" onClick={addChapter} className="text-navy-900 hover:text-navy-700 hover:bg-gray-100">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedNotebook.chapters.map((chapter) => (
                <div key={chapter._id} className="mb-1 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 flex justify-between items-center">
                  <span>{chapter.title}</span>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowShareModal(true)
                      }}
                      className="text-navy-900 hover:text-navy-700 hover:bg-gray-200 mr-1"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-navy-900 hover:text-navy-700 hover:bg-gray-200">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => deleteChapter(selectedNotebook._id, chapter._id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      {showAddChapter && (
        <ChapterCreationComponent
          selectedNotebook={selectedNotebook}
          setSelectedNotebook={setSelectedNotebook}
          notebooks={notebooks}
          setNotebooks={setNotebooks}
          setShowAddChapter={setShowAddChapter}
          setObjectives={setObjectives}
        />
      )}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-md bg-white relative" ref={modalRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="text-navy-900">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your settings will appear here.</p>
              <div className="mt-4">
                <Button
                  onClick={() => setIsPremium(!isPremium)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-colors duration-200"
                >
                  Toggle {isPremium ? "Free" : "Premium"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-md bg-white relative" ref={modalRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShareModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-lg">Share {selectedNotebook?.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <RadioGroup value={shareAccess} onValueChange={(value: "admin" | "editor" | "view-only") => setShareAccess(value)}>
                {userRole === "admin" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Admin access</Label>
                  </div>
                )}
                {(userRole === "admin" || userRole === "editor") && (
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="editor" id="editor" />
                    <Label htmlFor="editor">Editor access</Label>
                  </div>
                )}
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="view-only" id="view-only" />
                  <Label htmlFor="view-only">View-only access</Label>
                </div>
              </RadioGroup>
              <Button onClick={generateShareLink} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Generate Link
              </Button>
              {shareLink && (
                <div className="flex items-center space-x-2 mt-4">
                  <Input value={shareLink} readOnly className="flex-grow" />
                  <Button size="icon" onClick={() => navigator.clipboard.writeText(shareLink)} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
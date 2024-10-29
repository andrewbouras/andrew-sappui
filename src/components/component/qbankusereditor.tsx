import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NODE_ENV === 'production'
? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
: process.env.NEXT_PUBLIC_API_URL_DEV ;

interface AnswerChoice {
  id: string;
  value: string;
  correct: boolean;
}

interface Question {
  _id: string;
  question: string;
  answerChoices: AnswerChoice[];
  explanation: string;
}

interface GeneralSettings {
  title: string;
  description: string;
  creator: string;
  details: string;
  urls: string;
  id: string;
}

export function QBankEditor({ title }: { title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null); // Track current question ID
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    title: title || "",
    description: "",
    creator: "",
    details: "",
    urls: "",
    id: "",
  });
  const [bulkQuestionsJson, setBulkQuestionsJson] = useState<string>("");

  const pageId = pathname?.split("/").pop();

  useEffect(() => {
    if (pageId) {
      axios.get(`${apiUrl}/question-bank-info/${pageId}`).then((response) => {
        const data = response.data;
        if (data) {
          setQuestions(data.questions || []);
          setGeneralSettings({
            title: data.title || "",
            description: data.description || "",
            creator: data.creator || "",
            details: data.details || "",
            urls: data.urls || "",
            id: data.id || "",
          });
        } else {
          console.error('No data returned from the API');
        }
      }).catch((error) => {
        console.error('API error:', error);
      });
    }
  }, [pageId]);
  
  const addAnswerChoice = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const newChoice = { id: `answer-${updatedQuestions[questionIndex].answerChoices.length + 1}`, value: "", correct: false };
    updatedQuestions[questionIndex].answerChoices.push(newChoice);
    setQuestions(updatedQuestions);
  };

  const saveQuestionBank = () => {
    const dataToSave = {
      title: generalSettings.title,
      description: generalSettings.description,
      creator: generalSettings.creator,
      details: generalSettings.details,
      urls: generalSettings.urls,
      id: generalSettings.id,
      questions: questions.map((q) => ({
        _id: q._id,
        question: q.question,
        answerChoices: q.answerChoices.map((a) => ({ value: a.value, correct: a.correct })),
        explanation: q.explanation,
      })),
    };

    axios.post(`${apiUrl}/question-bank-info/${pageId}`, dataToSave)
      .then((response) => {
        console.log('Data saved successfully');
        router.push(`/bank/${pageId}`);  // Redirect to the question bank view after save
      })
      .catch((error) => {
        console.error('Error saving data:', error);
      });
  };

  const addNewQuestion = () => {
    const newQuestion: Question = {
      _id: `${new Date().getTime()}`, // Unique ID based on timestamp
      question: "",
      answerChoices: [
        { id: `answer-1`, value: "", correct: false },
        { id: `answer-2`, value: "", correct: false },
        { id: `answer-3`, value: "", correct: false },
        { id: `answer-4`, value: "", correct: false },
      ],
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion(newQuestion._id);
  };

  const updateAnswerChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answerChoices[choiceIndex].value = value;
    setQuestions(updatedQuestions);
  };

  const toggleAnswerChoice = (questionIndex: number, choiceIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answerChoices = updatedQuestions[questionIndex].answerChoices.map((choice, index) => ({
      ...choice,
      correct: index === choiceIndex,
    }));
    setQuestions(updatedQuestions);
  };

  const updateQuestionField = (questionIndex: number, field: keyof Question, value: string) => {
    const updatedQuestions = [...questions];
    if (field === 'question' || field === 'explanation') {
      updatedQuestions[questionIndex][field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const updateGeneralSettings = (field: keyof GeneralSettings, value: string) => {
    setGeneralSettings({ ...generalSettings, [field]: value });
  };

  const handleBulkQuestionsSubmit = () => {
    try {
      const json = JSON.parse(bulkQuestionsJson);
      const newQuestions: Question[] = json.questions.map((q: any, index: number) => ({
        _id: `${new Date().getTime() + index}`, // Assign unique IDs
        question: q.question,
        answerChoices: q.answerChoices.map((a: any, aIndex: number) => ({
          id: `answer-${aIndex + 1}`,
          value: a.value,
          correct: a.correct,
        })),
        explanation: q.explanation,
      }));
      setQuestions([...questions, ...newQuestions]);
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  const deleteQuestion = (questionIndex: number) => {
    const questionId = questions[questionIndex]._id;
    const updatedQuestions = questions.filter((_, index) => index !== questionIndex);
    setQuestions(updatedQuestions);
    setCurrentQuestion(updatedQuestions.length ? updatedQuestions[0]._id : null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex">
        <aside className="bg-background border-r w-64 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-semibold tracking-tight">Question Bank</h1>
          </div>
          <nav className="space-y-2">
            {questions.map((q, index) => (
              <Button
                key={q._id}
                variant="ghost"
                className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted w-full justify-start ${
                  currentQuestion === q._id ? "bg-muted" : ""
                }`}
                onClick={() => { setCurrentQuestion(q._id); setShowGeneralSettings(false); }}
              >
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <span>{`Question ${index + 1}`}</span>
              </Button>
            ))}
            <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted w-full justify-start" onClick={addNewQuestion}>
              <PlusIcon className="h-5 w-5 text-muted-foreground" />
              <span>Add New Question</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted w-full justify-start"
              onClick={() => { setShowGeneralSettings(true); setCurrentQuestion(null); }}
            >
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
              <span>General Settings</span>
            </Button>
            <div>
              <Label htmlFor="bulk-questions">Paste JSON Here</Label>
              <Textarea
                id="bulk-questions"
                rows={10}
                placeholder="Paste JSON format questions here..."
                value={bulkQuestionsJson}
                onChange={(e) => setBulkQuestionsJson(e.target.value)}
              />
              <Button variant="ghost" onClick={handleBulkQuestionsSubmit}>
                Submit Bulk Questions
              </Button>
            </div>
          </nav>
        </aside>
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {showGeneralSettings ? (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general settings for the question bank.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-6" onSubmit={(e) => { e.preventDefault(); saveQuestionBank(); }}>
                  <div className="grid gap-3">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" type="text" placeholder="Enter title" value={generalSettings.title} onChange={(e) => updateGeneralSettings("title", e.target.value)} />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" rows={3} placeholder="Enter description" value={generalSettings.description} onChange={(e) => updateGeneralSettings("description", e.target.value)} />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="creator">Creator</Label>
                    <Input id="creator" type="text" placeholder="Enter creator's name" value={generalSettings.creator} onChange={(e) => updateGeneralSettings("creator", e.target.value)} />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="details">Details</Label>
                    <Textarea id="details" rows={3} placeholder="Enter details" value={generalSettings.details} onChange={(e) => updateGeneralSettings("details", e.target.value)} />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="urls">URLs</Label>
                    <Input id="urls" type="text" placeholder="Enter URLs" value={generalSettings.urls} onChange={(e) => updateGeneralSettings("urls", e.target.value)} />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="id">ID</Label>
                    <Input id="id" type="text" placeholder="Enter ID" value={generalSettings.id} onChange={(e) => updateGeneralSettings("id", e.target.value)} />
                  </div>
                  <Button type="submit" className="justify-self-end">Save</Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            questions.map((question, index) => (
              currentQuestion === question._id && (
                <Card key={question._id}>
                  <CardHeader>
                    <CardTitle>{`Question ${index + 1}`}</CardTitle> {/* Display Question 1, Question 2, etc. */}
                    <CardDescription>Write your question, answer choices, and explanation.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-6" onSubmit={(e) => { e.preventDefault(); saveQuestionBank(); }}>
                      <div className="grid gap-3">
                        <Label htmlFor={`question-${question._id}`}>Question</Label>
                        <Textarea
                          id={`question-${question._id}`}
                          rows={3}
                          placeholder="Enter your question"
                          value={question.question}
                          onChange={(e) => updateQuestionField(index, "question", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label>Answer Choices</Label>
                        <div className="grid gap-3">
                          {question.answerChoices.map((choice, choiceIndex) => (
                            <div key={choice.id} className="flex items-center gap-3">
                              <RadioGroup>
                                <RadioGroupItem
                                  id={choice.id}
                                  value={choice.id}
                                  checked={choice.correct}
                                  onClick={() => toggleAnswerChoice(index, choiceIndex)}
                                  className={choice.correct ? "peer-aria-checked:bg-primary" : ""}
                                />
                              </RadioGroup>
                              <Input
                                type="text"
                                placeholder={`Answer ${choiceIndex + 1}`}
                                value={choice.value}
                                onChange={(e) => updateAnswerChoice(index, choiceIndex, e.target.value)}
                              />
                            </div>
                          ))}
                          <Button variant="ghost" onClick={() => addAnswerChoice(index)}>
                            Add More Choices
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor={`explanation-${question._id}`}>Explanation</Label>
                        <Textarea
                          id={`explanation-${question._id}`}
                          rows={3}
                          placeholder="Enter the explanation"
                          value={question.explanation}
                          onChange={(e) => updateQuestionField(index, "explanation", e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between">
                        <Button variant="destructive" onClick={() => deleteQuestion(index)}>
                          Delete Question
                        </Button>
                        <Button type="submit" className="justify-self-end">
                          Save
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )
            ))
          )}
        </div>
      </div>
      <Button type="submit" className="justify-self-end" onClick={saveQuestionBank}>
        Save and View Question Bank
      </Button>
    </div>
  );
}

function FileIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

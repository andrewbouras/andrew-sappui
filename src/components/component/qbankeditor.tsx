import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

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
  urls: string;
  id: string;
}

interface UserResponse {
  userId: string;
  questionId: string;
  selectedAnswer: string;
  flagged: boolean;
}

export function QBankEditor() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    title: "",
    description: "",
    urls: "",
    id: "",
  });
  const [bulkQuestionsJson, setBulkQuestionsJson] = useState("");
  const [saveStatus, setSaveStatus] = useState<"success" | "failure" | null>(
    null
  );
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  const pageId = pathname?.split("/").slice(-2, -1)[0];
  const { user } = useAuth();
  const token = user?.accessToken;

  useEffect(() => {
    if (pageId) {
      axios
        .get(`${apiUrl}/question-bank-info/${pageId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          const data = response.data;
          setQuestions(data.questions || []);
          setGeneralSettings({
            title: data.title || "",
            description: data.description || "",
            urls: data.urls || "",
            id: data.id || "",
          });
        })
        .catch((error) => {
          if (error.response?.status === 403) {
            alert("You do not have permission to edit this question bank.");
            router.push("/error");
          } else {
            console.error("API error:", error.response?.data || error.message);
          }
        });
    }
  }, [pageId, token, router]);

  useEffect(() => {
    let shiftPressed = false;
    let sPressed = false;
    let dPressed = false;
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftPressed = true;
      if (e.key === 's' || e.key === 'S') sPressed = true;
      if (e.key === 'd' || e.key === 'D') dPressed = true;
  
      if (shiftPressed && sPressed && dPressed) {
        setShowBulkUploadModal(true);
      }
    };
  
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftPressed = false;
      if (e.key === 's' || e.key === 'S') sPressed = false;
      if (e.key === 'd' || e.key === 'D') dPressed = false;
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const addNewQuestion = useCallback(() => {
    const newQuestion: Question = {
      _id: `${new Date().getTime()}`,
      question: "",
      answerChoices: [
        { id: `answer-1`, value: "", correct: false },
      ],
      explanation: "",
    };
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    setCurrentQuestion(newQuestion._id);
  }, []);

  const addAnswerChoice = useCallback((questionIndex: number) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const newChoice: AnswerChoice = {
        id: `answer-${updatedQuestions[questionIndex].answerChoices.length + 1}`,
        value: "",
        correct: false,
      };
      updatedQuestions[questionIndex].answerChoices.push(newChoice);
      return updatedQuestions;
    });
  }, []);

  const updateAnswerChoice = useCallback(
    (questionIndex: number, choiceIndex: number, value: string) => {
      setQuestions((prevQuestions) => {
        const updatedQuestions = [...prevQuestions];
        updatedQuestions[questionIndex].answerChoices[choiceIndex].value =
          value;
        return updatedQuestions;
      });
    },
    []
  );

  const toggleAnswerChoice = useCallback((questionIndex: number, choiceIndex: number) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex].answerChoices = updatedQuestions[
        questionIndex
      ].answerChoices.map((choice, index) => ({
        ...choice,
        correct: index === choiceIndex,
      }));
      return updatedQuestions;
    });
  }, []);

  const updateQuestionField = useCallback(
    (questionIndex: number, field: keyof Question, value: string) => {
      setQuestions((prevQuestions) => {
        const updatedQuestions = [...prevQuestions];
        if (field === "question" || field === "explanation") {
          updatedQuestions[questionIndex][field] = value;
        }
        return updatedQuestions;
      });
    },
    []
  );

  const updateGeneralSettings = useCallback(
    (field: keyof GeneralSettings, value: string) => {
      setGeneralSettings((prevSettings) => ({
        ...prevSettings,
        [field]: value,
      }));
    },
    []
  );

  const saveQuestion = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const dataToSave = {
        title: generalSettings.title,
        description: generalSettings.description,
        urls: generalSettings.urls,
        id: generalSettings.id,
        questions: questions
          .filter((q) => q.question.trim() !== "")
          .map((q) => ({
            _id: q._id,
            question: q.question,
            answerChoices: q.answerChoices.filter((a) => a.value.trim() !== ""),
            explanation: q.explanation,
          })),
      };

      try {
        await axios.post(`${apiUrl}/question-bank-info/${pageId}`, dataToSave, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setSaveStatus("success");
      } catch (error) {
        setSaveStatus("failure");
        console.error("Error saving data:", error);
      } finally {
        setTimeout(() => setSaveStatus(null), 2000);
      }
    },
    [generalSettings, questions, token, pageId]
  );

  const handleBulkQuestionsSubmit = useCallback(() => {
    try {
      const json = JSON.parse(bulkQuestionsJson);
      const newQuestions: Question[] = json.questions.map((q: any, index: number) => ({
        _id: `${new Date().getTime() + index}`,
        question: q.question,
        answerChoices: q.answerChoices.map((a: any, aIndex: number) => ({
          id: `answer-${aIndex + 1}`,
          value: a.value,
          correct: a.correct,
        })),
        explanation: q.explanation,
      }));
      setQuestions((prevQuestions) => [...prevQuestions, ...newQuestions]);
      setShowBulkUploadModal(false); // Close the modal after submission
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }, [bulkQuestionsJson]);

  const deleteQuestion = useCallback((questionIndex: number) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = prevQuestions.filter(
        (_, index) => index !== questionIndex
      );
      setCurrentQuestion(updatedQuestions.length ? updatedQuestions[0]._id : null);

      setUserResponses((prevResponses) =>
        prevResponses.filter(
          (response) => response.questionId !== prevQuestions[questionIndex]._id
        )
      );

      return updatedQuestions;
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex">
        <aside className="bg-background border-r w-64 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-semibold tracking-tight">
              {generalSettings.title || "Question Bank"}
            </h1>
          </div>
          <nav className="space-y-2 max-h-[calc(100vh-160px)] overflow-y-auto">
            {questions.map((q, index) => (
              <Button
                key={q._id}
                variant="ghost"
                className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted w-full justify-start ${
                  currentQuestion === q._id ? "bg-muted" : ""
                }`}
                onClick={() => {
                  setCurrentQuestion(q._id);
                  setShowGeneralSettings(false);
                }}
              >
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <span>{`Question ${index + 1}`}</span>
              </Button>
            ))}
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted w-full justify-start"
              onClick={addNewQuestion}
            >
              <PlusIcon className="h-5 w-5 text-muted-foreground" />
              <span>Add New Question</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted w-full justify-start"
              onClick={() => {
                setShowGeneralSettings(true);
                setCurrentQuestion(null);
              }}
            >
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
              <span>General Settings</span>
            </Button>
          </nav>
          <div className="fixed bottom-4 w-full flex justify-between">
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted w-full justify-start"
              onClick={() => router.push(`/bank/${pageId}`)}
            >
              <FileIcon className="h-5 w-5 text-muted-foreground" />
              <span>View Question Bank</span>
            </Button>
          </div>
        </aside>
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {showGeneralSettings ? (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general settings for the question bank.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-6" onSubmit={saveQuestion}>
                  <div className="grid gap-3">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter title"
                      value={generalSettings.title}
                      onChange={(e) => updateGeneralSettings("title", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder="Enter description"
                      value={generalSettings.description}
                      onChange={(e) => updateGeneralSettings("description", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="urls">URLs</Label>
                    <Input
                      id="urls"
                      type="text"
                      placeholder="Enter URLs"
                      value={generalSettings.urls}
                      onChange={(e) => updateGeneralSettings("urls", e.target.value)}
                      disabled
                    />
                  </div>
                  <Button type="submit" className="justify-self-end">
                    Save
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            questions.map(
              (question, index) =>
                currentQuestion === question._id && (
                  <Card key={question._id}>
                    <CardHeader>
                      <CardTitle>{`Question ${index + 1}`}</CardTitle>
                      <CardDescription>
                        Write your question, answer choices, and explanation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="grid gap-6" onSubmit={saveQuestion}>
                        <div className="grid gap-3">
                          <Label htmlFor={`question-${question._id}`}>
                            Question
                          </Label>
                          <Textarea
                            id={`question-${question._id}`}
                            rows={3}
                            placeholder="Enter your question"
                            value={question.question}
                            onChange={(e) =>
                              updateQuestionField(index, "question", e.target.value)
                            }
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label>Answer Choices</Label>
                          <div className="grid gap-3">
                            {question.answerChoices.map((choice, choiceIndex) => (
                              <div
                                key={choice.id}
                                className="flex items-center gap-3"
                              >
                                <RadioGroup>
                                  <RadioGroupItem
                                    id={choice.id}
                                    value={choice.id}
                                    checked={choice.correct}
                                    onClick={() =>
                                      toggleAnswerChoice(index, choiceIndex)
                                    }
                                    className={
                                      choice.correct
                                        ? "peer-aria-checked:bg-primary"
                                        : ""
                                    }
                                  />
                                </RadioGroup>
                                <Input
                                  type="text"
                                  placeholder={`Answer ${choiceIndex + 1}`}
                                  value={choice.value}
                                  onChange={(e) =>
                                    updateAnswerChoice(index, choiceIndex, e.target.value)
                                  }
                                />
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              onClick={() => addAnswerChoice(index)}
                            >
                              Add More Choices
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor={`explanation-${question._id}`}>
                            Explanation
                          </Label>
                          <Textarea
                            id={`explanation-${question._id}`}
                            rows={3}
                            placeholder="Enter the explanation"
                            value={question.explanation}
                            onChange={(e) =>
                              updateQuestionField(index, "explanation", e.target.value)
                            }
                          />
                        </div>
                        <div className="flex justify-between">
                          <Button
                            variant="destructive"
                            onClick={() => deleteQuestion(index)}
                          >
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
            )
          )}
          {saveStatus && (
            <div
              className={`fixed inset-0 flex items-center justify-center ${
                saveStatus === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              <div
                className={`result-circle ${
                  saveStatus === "success" ? "success" : "failure"
                }`}
              >
                {saveStatus === "success" ? "✔" : "✖"}
              </div>
            </div>
          )}
        </div>
      </div>
      {showBulkUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-1/3">
            <h2 className="text-xl font-semibold mb-4">Upload JSON</h2>
            <Textarea
              rows={10}
              placeholder="Paste JSON format questions here..."
              value={bulkQuestionsJson}
              onChange={(e) => setBulkQuestionsJson(e.target.value)}
            />
            <div className="flex justify-end gap-4 mt-4">
              <Button
                variant="ghost"
                onClick={() => setShowBulkUploadModal(false)}
              >
                Cancel
              </Button>
              <Button variant="ghost" onClick={handleBulkQuestionsSubmit}>
                Submit Bulk Questions
              </Button>
            </div>
          </div>
        </div>
      )}
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

export default QBankEditor;

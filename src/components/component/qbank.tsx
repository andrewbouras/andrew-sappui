'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface QuestionBank {
  id: string;
  title: string;
  description: string;
  creator: string;
  details: string;
  urls: string;
}

export function QBank() {
  const [searchTerm, setSearchTerm] = useState("");
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchQuestionBanks = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
      try {
        const response = await fetch(`${apiUrl}/question-bank-info`);
        if (!response.ok) throw new Error('Failed to fetch question banks');
        const data = await response.json();
        setQuestionBanks(data);
      } catch (error) {
        toast.error('Error fetching question banks: ' + (error as Error).message);
      }
    };

    fetchQuestionBanks();
  }, []);

  const filteredBanks = questionBanks.filter((bank) =>
    bank.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enrollUserInQuestionBank = async (bank: QuestionBank) => {
    if (!isAuthenticated) {
      toast.error("You need to be logged in to enroll in a question bank.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
    const token = user?.accessToken;

    try {
      const response = await fetch(`${apiUrl}/user/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bankId: bank.id, bankTitle: bank.title, bankUrl: bank.urls })
      });

      if (!response.ok) throw new Error('Failed to enroll in question bank');
      toast.success("Successfully enrolled in question bank.");
    } catch (error) {
      toast.error('Error enrolling in question bank: ' + (error as Error).message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-white text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Question Bank Catalog</h1>
      <p className="text-lg mb-8">Discover and search for question banks across various categories.</p>
      <div className="w-full max-w-2xl mb-8">
        <Input
          type="search"
          placeholder="Search question banks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <Tabs defaultValue="top-picks" className="w-full max-w-4xl">
        <TabsList className="flex justify-center mb-4">
          <TabsTrigger value="top-picks">Top Picks</TabsTrigger>
          <TabsTrigger value="mcat">MCAT</TabsTrigger>
          <TabsTrigger value="sat">SATs</TabsTrigger>
          <TabsTrigger value="act">ACTs</TabsTrigger>
          <TabsTrigger value="medical-school">Medical School</TabsTrigger>
          <TabsTrigger value="law-school">Law School</TabsTrigger>
        </TabsList>
        <TabsContent value="top-picks">
          {filteredBanks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-2xl font-bold mb-4">No question banks found</h2>
              <p className="text-gray-500">Try searching for something else.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBanks.map((bank) => (
                <Card key={bank.id} className="bg-white border border-gray-200 rounded-lg shadow-md">
                  <CardHeader className="flex items-center p-4">
                    <Avatar className="mr-4">
                      <AvatarImage src="https://generated.vusercontent.net/placeholder-user.jpg" />
                      <AvatarFallback>{bank.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-semibold">{bank.title}</CardTitle>
                      <CardDescription className="text-gray-500" dangerouslySetInnerHTML={{ __html: bank.description }} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          More Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white text-gray-800 rounded-lg shadow-md max-w-md">
                        <DialogHeader className="p-4 border-b border-gray-200">
                          <DialogTitle className="text-xl font-semibold">{bank.title}</DialogTitle>
                          <DialogDescription className="text-gray-500">{bank.creator}</DialogDescription>
                        </DialogHeader>
                        <div className="p-4" dangerouslySetInnerHTML={{ __html: bank.details }} />
                        <DialogFooter className="p-4 border-t border-gray-200">
                          {bank.urls ? (
                            <Link href={`/bank/${bank.urls}`} passHref>
                              <Button className="w-full" onClick={() => enrollUserInQuestionBank(bank)}>
                                Try Now
                              </Button>
                            </Link>
                          ) : (
                            <Button className="w-full" onClick={() => enrollUserInQuestionBank(bank)}>
                              Try Now
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="mcat">
          {filteredBanks.filter((bank) => bank.title.toLowerCase().includes("mcat")).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-2xl font-bold mb-4">No MCAT question banks found</h2>
              <p className="text-gray-500">Try searching for something else.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBanks
                .filter((bank) => bank.title.toLowerCase().includes("mcat"))
                .map((bank) => (
                  <Card key={bank.id} className="bg-white border border-gray-200 rounded-lg shadow-md">
                    <CardHeader className="flex items-center p-4">
                      <Avatar className="mr-4">
                        <AvatarImage src="https://generated.vusercontent.net/placeholder-user.jpg" />
                        <AvatarFallback>{bank.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl font-semibold">{bank.title}</CardTitle>
                        <CardDescription className="text-gray-500" dangerouslySetInnerHTML={{ __html: bank.description }} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            More Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-gray-800 rounded-lg shadow-md max-w-md">
                          <DialogHeader className="p-4 border-b border-gray-200">
                            <DialogTitle className="text-xl font-semibold">{bank.title}</DialogTitle>
                            <DialogDescription className="text-gray-500">{bank.creator}</DialogDescription>
                          </DialogHeader>
                          <div className="p-4" dangerouslySetInnerHTML={{ __html: bank.details }} />
                          <DialogFooter className="p-4 border-t border-gray-200 flex justify-center">
                            <Link href={`/bank/${bank.urls}`} passHref>
                              <Button className="w-full" onClick={() => enrollUserInQuestionBank(bank)}>
                                Try Now
                              </Button>
                            </Link>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="sat">
          {filteredBanks.filter((bank) => bank.title.toLowerCase().includes("sat")).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-2xl font-bold mb-4">No SAT question banks found</h2>
              <p className="text-gray-500">Try searching for something else.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBanks
                .filter((bank) => bank.title.toLowerCase().includes("sat"))
                .map((bank) => (
                  <Card key={bank.id} className="bg-white border border-gray-200 rounded-lg shadow-md">
                    <CardHeader className="flex items-center p-4">
                      <Avatar className="mr-4">
                        <AvatarImage src="https://generated.vusercontent.net/placeholder-user.jpg" />
                        <AvatarFallback>{bank.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl font-semibold">{bank.title}</CardTitle>
                        <CardDescription className="text-gray-500" dangerouslySetInnerHTML={{ __html: bank.description }} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            More Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-gray-800 rounded-lg shadow-md max-w-md">
                          <DialogHeader className="p-4 border-b border-gray-200">
                            <DialogTitle className="text-xl font-semibold">{bank.title}</DialogTitle>
                            <DialogDescription className="text-gray-500">{bank.creator}</DialogDescription>
                          </DialogHeader>
                          <div className="p-4" dangerouslySetInnerHTML={{ __html: bank.details }} />
                          <DialogFooter className="p-4 border-t border-gray-200 flex justify-center">
                            <Link href={`/bank/${bank.urls}`} passHref>
                              <Button className="w-full" onClick={() => enrollUserInQuestionBank(bank)}>
                                Try Now
                              </Button>
                            </Link>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="act">
          {filteredBanks.filter((bank) => bank.title.toLowerCase().includes("act")).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-2xl font-bold mb-4">No ACT question banks found</h2>
              <p className="text-gray-500">Try searching for something else.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBanks
                .filter((bank) => bank.title.toLowerCase().includes("act"))
                .map((bank) => (
                  <Card key={bank.id} className="bg-white border border-gray-200 rounded-lg shadow-md">
                    <CardHeader className="flex items-center p-4">
                      <Avatar className="mr-4">
                        <AvatarImage src="https://generated.vusercontent.net/placeholder-user.jpg" />
                        <AvatarFallback>{bank.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl font-semibold">{bank.title}</CardTitle>
                        <CardDescription className="text-gray-500" dangerouslySetInnerHTML={{ __html: bank.description }} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            More Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-gray-800 rounded-lg shadow-md max-w-md">
                          <DialogHeader className="p-4 border-b border-gray-200">
                            <DialogTitle className="text-xl font-semibold">{bank.title}</DialogTitle>
                            <DialogDescription className="text-gray-500">{bank.creator}</DialogDescription>
                          </DialogHeader>
                          <div className="p-4" dangerouslySetInnerHTML={{ __html: bank.details }} />
                          <DialogFooter className="p-4 border-t border-gray-200 flex justify-center">
                            <Link href={`/bank/${bank.urls}`} passHref>
                              <Button className="w-full" onClick={() => enrollUserInQuestionBank(bank)}>
                                Try Now
                              </Button>
                            </Link>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="medical-school">
          {filteredBanks.filter((bank) => bank.title.toLowerCase().includes("medical school")).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-2xl font-bold mb-4">No Medical School question banks found</h2>
              <p className="text-gray-500">Try searching for something else.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBanks
                .filter((bank) => bank.title.toLowerCase().includes("medical school"))
                .map((bank) => (
                  <Card key={bank.id} className="bg-white border border-gray-200 rounded-lg shadow-md">
                    <CardHeader className="flex items-center p-4">
                      <Avatar className="mr-4">
                        <AvatarImage src="https://generated.vusercontent.net/placeholder-user.jpg" />
                        <AvatarFallback>{bank.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl font-semibold">{bank.title}</CardTitle>
                        <CardDescription className="text-gray-500" dangerouslySetInnerHTML={{ __html: bank.description }} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            More Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-gray-800 rounded-lg shadow-md max-w-md">
                          <DialogHeader className="p-4 border-b border-gray-200">
                            <DialogTitle className="text-xl font-semibold">{bank.title}</DialogTitle>
                            <DialogDescription className="text-gray-500">{bank.creator}</DialogDescription>
                          </DialogHeader>
                          <div className="p-4" dangerouslySetInnerHTML={{ __html: bank.details }} />
                          <DialogFooter className="p-4 border-t border-gray-200 flex justify-center">
                            <Link href={`/bank/${bank.urls}`} passHref>
                              <Button className="w-full" onClick={() => enrollUserInQuestionBank(bank)}>
                                Try Now
                              </Button>
                            </Link>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="law-school">
          {filteredBanks.filter((bank) => bank.title.toLowerCase().includes("law school")).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-2xl font-bold mb-4">No Law School question banks found</h2>
              <p className="text-gray-500">Try searching for something else.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBanks
                .filter((bank) => bank.title.toLowerCase().includes("law school"))
                .map((bank) => (
                  <Card key={bank.id} className="bg-white border border-gray-200 rounded-lg shadow-md">
                    <CardHeader className="flex items-center p-4">
                      <Avatar className="mr-4">
                        <AvatarImage src="https://generated.vusercontent.net/placeholder-user.jpg" />
                        <AvatarFallback>{bank.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl font-semibold">{bank.title}</CardTitle>
                        <CardDescription className="text-gray-500" dangerouslySetInnerHTML={{ __html: bank.description }} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            More Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-gray-800 rounded-lg shadow-md max-w-md">
                          <DialogHeader className="p-4 border-b border-gray-200">
                            <DialogTitle className="text-xl font-semibold">{bank.title}</DialogTitle>
                            <DialogDescription className="text-gray-500">{bank.creator}</DialogDescription>
                          </DialogHeader>
                          <div className="p-4" dangerouslySetInnerHTML={{ __html: bank.details }} />
                          <DialogFooter className="p-4 border-t border-gray-200 flex justify-center">
                            <Link href={`/bank/${bank.urls}`} passHref>
                              <Button className="w-full" onClick={() => enrollUserInQuestionBank(bank)}>
                                Try Now
                              </Button>
                            </Link>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

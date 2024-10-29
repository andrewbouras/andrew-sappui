import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckIcon, ChevronLeftIcon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function Component() {
  const [showStripe, setShowStripe] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFailure, setShowFailure] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleJoinPremium = () => {
    setShowStripe(true)
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate payment processing
    const success = Math.random() > 0.5
    setShowStripe(false)
    if (success) {
      setShowSuccess(true)
    } else {
      setShowFailure(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Choose Your MCQ Generation Plan</h1>
          <p className="text-xl text-gray-300">Unlock the power of unlimited question generation</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Free Plan</CardTitle>
              <CardDescription className="text-gray-400">Get started with basic features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-white">$0<span className="text-xl font-normal text-gray-400">/month</span></p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  Limited notes and chapters
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  Basic MCQ generation
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  Limited repeats
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gray-700 text-white hover:bg-gray-600" disabled>Current Plan</Button>
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Premium Plan</CardTitle>
              <CardDescription className="text-purple-200">Unlock unlimited potential</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-white">$30<span className="text-xl font-normal text-purple-200">/month</span></p>
              <ul className="space-y-2">
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Unlimited notes and chapters
                </li>
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Unlimited MCQ generation
                </li>
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Unlimited repeats
                </li>
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Advanced features and priority support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-white text-purple-600 hover:bg-purple-100" onClick={handleJoinPremium}>
                Join Premium for $30/month
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Simulated Stripe Payment Dialog */}
      <Dialog open={showStripe} onOpenChange={setShowStripe}>
        <DialogContent className="sm:max-w-[500px] bg-white p-0 gap-0">
          <div className="flex items-center p-4 border-b">
            <ChevronLeftIcon className="h-5 w-5 text-gray-500 cursor-pointer" onClick={() => setShowStripe(false)} />
            <DialogTitle className="flex-grow text-center">MCQ Premium Subscription</DialogTitle>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-lg">MCQ Premium Subscription</h3>
                <p className="text-sm text-gray-500">Billed monthly</p>
              </div>
              <div className="text-2xl font-bold">$30.00</div>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
              </div>
              <div>
                <Label htmlFor="card">Card information</Label>
                <Input id="card" placeholder="1234 1234 1234 1234" required className="mb-2" />
                <div className="flex gap-2">
                  <Input placeholder="MM / YY" required className="flex-grow" />
                  <Input placeholder="CVC" required className="w-20" />
                </div>
              </div>
              <div>
                <Label htmlFor="name">Name on card</Label>
                <Input id="name" placeholder="Full name on card" required />
              </div>
              <div>
                <Label htmlFor="address">Billing Address</Label>
                <Input id="address" placeholder="Street address" required className="mb-2" />
                <Input placeholder="Apt, suite, etc. (optional)" className="mb-2" />
                <div className="flex gap-2">
                  <Input placeholder="City" required className="flex-grow" />
                  <Input placeholder="State" required className="w-20" />
                  <Input placeholder="ZIP" required className="w-24" />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country or region</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked: boolean) => setTermsAccepted(checked === true)} />
              <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the terms and conditions
                </label>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={!termsAccepted}>
                  Subscribe
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-4 text-center">
              By confirming your subscription, you allow MCQ Premium to charge your card for this payment and future payments in accordance with their terms. You can always cancel your subscription.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>
              You are now a premium member!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => alert("Navigating to dashboard")}>Go to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failure Dialog */}
      <Dialog open={showFailure} onOpenChange={setShowFailure}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment Failed</DialogTitle>
            <DialogDescription>
              Something went wrong or wrong credit card number. Please try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowFailure(false)}>Back</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
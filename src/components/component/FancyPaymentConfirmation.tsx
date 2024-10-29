'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/noclosedialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import confetti from 'canvas-confetti';
import { useRouter, usePathname } from "next/navigation";

interface FancyPaymentConfirmationProps {
  status: 'loading' | 'success' | 'failure';
}

const FancyPaymentConfirmation: React.FC<FancyPaymentConfirmationProps> = ({ status }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (status === 'success') {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            if (pathname) {
              router.push(pathname.replace('/enroll', ''));
            }
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, router, pathname]);

  useEffect(() => {
    if (status === 'success') {
      triggerConfetti();
    }
  }, [status]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogOverlay className="fixed inset-0 bg-black opacity-50" />
      <DialogContent className="sm:max-w-[425px]" style={{ backgroundColor: 'white' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          {status === 'loading' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <h2 className="text-lg font-semibold">Processing Payment</h2>
              <p className="text-center text-sm text-muted-foreground">
                Please wait while we process your payment...
              </p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-xl font-semibold">Payment succeeded!</h2>
              <p className="text-center text-sm text-muted-foreground">
                Thank you for your payment. You will be redirected in {countdown} seconds.
              </p>
              <Button className="mt-4" onClick={() => setIsOpen(false)}>
                Go to Dashboard
              </Button>
            </>
          )}
          {status === 'failure' && (
            <>
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold">Payment failed!</h2>
              <p className="text-center text-sm text-muted-foreground">
                An error occurred while processing your payment. Please try again.
              </p>
              <Button className="mt-4" onClick={handleRetry}>
                Retry
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FancyPaymentConfirmation;

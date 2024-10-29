'use client';

import React, { useState } from 'react';
import UpgradePlanStripe from '@/components/component/UpgradePlanStripe';
import FancyPaymentConfirmation from '@/components/component/FancyPaymentConfirmation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe("pk_test_51PpzybIT9ulrYerfjEaaJ5CUT8e61jwPjoqYfUF084y7snggVNgWBZacLdRT0zhTpTzEWJJ9ynJ0l7Uva5OdFtVZ00WDr77Ch4");

const UpgradePage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'failure' | null>(null);

  const handleSuccess = (paymentIntentId: string | null) => {
    if (paymentIntentId) {
      setStatus('success');
    } else {
      setStatus('failure');
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Upgrade to Premium Plan</h1>

        {status ? (
          <FancyPaymentConfirmation status={status} />
        ) : (
          <UpgradePlanStripe onSuccess={handleSuccess} />
        )}
      </div>
    </Elements>
  );
};

export default UpgradePage;

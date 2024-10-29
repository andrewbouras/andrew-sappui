'use client';

import React from 'react';
import UserStatusButtonForest from '@/components/component/UserStatusButtonForest';

export default function ButtonDemo() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <UserStatusButtonForest plan="free" />
    </div>
  );
}

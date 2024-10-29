import React, { useState, useEffect } from 'react';

function CircleCheckIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CircleIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function LoadingNotes(props: any) {
  const { progress, errorMessage } = props;
  const [showError, setShowError] = useState(false);


  const toggleErrorDisplay = () => {
    setShowError(!showError);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-2 text-lg font-semibold">Processing...</div>
        <div className="flex items-center gap-2">
          <div className="flex h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
            <div
              className={`h-2 rounded-l-full ${progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'} animate-progress-bar`}
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
          <div className="text-sm font-medium">{progress}%</div>
        </div>
        <div className="mt-2 grid grid-cols-4 text-xs font-medium">
          <div className="flex items-center gap-1">
            <CircleCheckIcon className={`h-4 w-4 ${progress >= 25 ? 'text-green-500' : 'text-gray-500'}`} />
            PDF
          </div>
          <div className="flex items-center gap-1">
            <CircleCheckIcon className={`h-4 w-4 ${progress >= 50 ? 'text-green-500' : 'text-gray-500'}`} />
            MP3
          </div>
          <div className="flex items-center gap-1">
            <CircleCheckIcon className={`h-4 w-4 ${progress >= 75 ? 'text-green-500' : 'text-gray-500'}`} />
            MP4
          </div>
          <div className="flex items-center gap-1">
            <CircleIcon className={`h-4 w-4 ${progress === 100 ? 'text-green-500' : 'text-gray-500'}`} />
            Finalize
          </div>
        </div>
        {errorMessage && (
          <div className="mt-2 text-sm text-red-500">
            <button onClick={toggleErrorDisplay} className="underline">
              {showError ? 'Hide Errors' : 'Show Errors'}
            </button>
            {showError && <div>{errorMessage}</div>}
          </div>
        )}
        <style jsx>{`
          @keyframes progress-bar-move {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .animate-progress-bar {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            animation: progress-bar-move 2s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

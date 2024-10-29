import React from 'react';
// import { useRouter } from 'next/navigation';

interface UserStatusButtonProps {
  plan: 'free' | 'premium';
}

const UserStatusButton: React.FC<UserStatusButtonProps> = ({ plan }) => {
  // const router = useRouter();

  return (
    <div 
      // onClick={() => router.push('/upgrade')}
      className="relative overflow-hidden cursor-pointer rounded-lg p-4 mt-2 shadow-lg bg-gradient-to-br from-indigo-900 via-night-sky to-purple-900"
    >
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-px h-px bg-star animate-star-blink"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`
            }}
          />
        ))}
      </div>
      
      {/* Rotating sun */}
      <div className="absolute inset-0 animate-rotate-sun">
        <div className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-500 opacity-70 animate-pulse-slow"
             style={{top: '0', left: '50%', transform: 'translateX(-50%)'}}
        />
      </div>

      {/* Nebula */}
      <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 opacity-20 blur-md animate-nebula-loop"
           style={{top: '30%', right: '15%'}}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        <span className="text-sm font-bold text-white drop-shadow-glow">
          {plan === 'premium' ? 'Premium User' : 'Free User'}
        </span>
        {/* {plan === 'free' && (
          <span className="text-xs text-white ml-2 opacity-90 drop-shadow-glow">
            Click to Upgrade
          </span>
        )} */}
      </div>
    </div>
  );
};

export default UserStatusButton;
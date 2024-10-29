import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Cloud, Wind, Bird } from 'lucide-react';

interface UserStatusButtonForestProps {
  plan: 'free' | 'premium';
}

export default function UserStatusButtonForest({ plan }: UserStatusButtonForestProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw detailed trees
        const drawTree = (x: number, y: number, height: number) => {
          const trunkWidth = height / 10;
          // Draw trunk
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(x - trunkWidth / 2, y - height, trunkWidth, height);
          
          // Draw foliage
          ctx.fillStyle = '#228B22';
          ctx.beginPath();
          ctx.moveTo(x, y - height);
          ctx.lineTo(x - height / 3, y - height * 0.7);
          ctx.lineTo(x + height / 3, y - height * 0.7);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(x, y - height * 1.2);
          ctx.lineTo(x - height / 4, y - height * 0.9);
          ctx.lineTo(x + height / 4, y - height * 0.9);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(x, y - height * 1.4);
          ctx.lineTo(x - height / 5, y - height * 1.1);
          ctx.lineTo(x + height / 5, y - height * 1.1);
          ctx.closePath();
          ctx.fill();
        };

        // Draw multiple trees
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * canvas.width;
          const y = canvas.height;
          const height = 50 + Math.random() * 30;
          drawTree(x, y, height);
        }

        // Draw grass
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        for (let i = 0; i < 200; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, canvas.height);
          ctx.lineTo(Math.random() * canvas.width, canvas.height - 5 - Math.random() * 15);
          ctx.strokeStyle = '#228B22';
          ctx.stroke();
        }
      }
    }
  }, []);

  return (
    <div 
      onClick={() => router.push('/upgrade')}
      className="relative overflow-hidden cursor-pointer rounded-lg p-4 mt-2 shadow-lg bg-gradient-to-b from-sky-400 to-emerald-600 h-64 w-96 group"
    >
      {/* Sky background */}
      <div className="absolute inset-0 bg-gradient-to-t from-sky-300 to-sky-100 opacity-70" />

      {/* Sun with rays */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-yellow-300 rounded-full animate-pulse">
        <Sun className="w-full h-full text-yellow-500" />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 w-full h-full animate-spin-slow"
            style={{
              borderLeft: '2px solid rgba(250, 204, 21, 0.4)',
              borderTop: '2px solid transparent',
              borderRight: '2px solid rgba(250, 204, 21, 0.4)',
              borderBottom: '2px solid transparent',
              borderRadius: '50%',
              transform: `rotate(${i * 45}deg)`,
            }}
          />
        ))}
      </div>

      {/* Animated clouds */}
      <Cloud className="absolute top-6 left-8 w-20 h-8 text-white opacity-80 animate-float" />
      <Cloud className="absolute top-12 right-16 w-24 h-10 text-white opacity-80 animate-float-delay" />
      <Cloud className="absolute top-20 left-24 w-16 h-6 text-white opacity-70 animate-float-slow" />

      {/* Forest canvas */}
      <canvas
        ref={canvasRef}
        width={384}
        height={256}
        className="absolute inset-0 w-full h-full"
      />

      {/* Animated birds */}
      <Bird className="absolute top-10 left-1/4 w-6 h-6 text-gray-800 animate-bird-flight" />
      <Bird className="absolute top-16 right-1/3 w-4 h-4 text-gray-800 animate-bird-flight-delay" />

      {/* Wind effect */}
      <Wind className="absolute inset-y-0 -left-8 w-16 h-full text-white opacity-10 animate-wind group-hover:opacity-20" />

      {/* Deer */}
      <div className="absolute bottom-16 right-8 w-24 h-20 animate-deer-walk group-hover:pause">
        <div className="absolute bottom-0 right-0 w-14 h-12 bg-amber-800 rounded-full transform -skew-x-6" />
        <div className="absolute bottom-10 right-12 w-7 h-9 bg-amber-800 rounded-full transform -rotate-15" />
        <div className="absolute bottom-16 right-14 w-8 h-8 bg-amber-800 rounded-full" />
        <div className="absolute bottom-18 right-16 w-2 h-4 bg-amber-900 rounded-full transform -rotate-15" />
        <div className="absolute bottom-18 right-13 w-1 h-2 bg-white rounded-full" />
        <div className="absolute bottom-0 right-1 w-2 h-7 bg-amber-900 rounded-full transform skew-x-6" />
        <div className="absolute bottom-0 right-11 w-2 h-7 bg-amber-900 rounded-full transform -skew-x-6" />
        <div className="absolute top-1 right-13 w-5 h-5 bg-amber-900">
          <div className="absolute top-0 left-0 w-2 h-2 bg-amber-900 transform rotate-45" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-amber-900 transform rotate-45" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center mt-2">
        <span className="text-2xl font-bold text-white drop-shadow-glow">
          {plan === 'premium' ? 'Premium Forest' : 'Free Forest'}
        </span>
        {plan === 'free' && (
          <span className="block text-lg text-white mt-1 opacity-90 drop-shadow-glow">
            Upgrade to Premium
          </span>
        )}
      </div>
    </div>
  );
}
// tailwind.config.js
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enable dark mode using class strategy
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'light-bg': '#f9fafb',
        'dark-bg': '#1e293b',
      },
      textColor: {
        'light-text': '#111827',
        'dark-text': '#e2e8f0',
      },
      colors: {
        'light-primary': '#3b82f6',
        'light-secondary': '#6b7280',
        'light-accent': '#10b981',
        'dark-primary': '#60a5fa',
        'dark-secondary': '#94a3b8',
        'dark-accent': '#34d399',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'success': '#10b981',
      },
      animation: {
        'star-blink': 'star-blink 4s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'nebula-loop': 'nebula-loop 15s linear infinite',
        'rotate-sun': 'rotate-sun 30s linear infinite',
        'wind': 'wind 10s ease-in-out infinite',
        'deer-walk': 'deer-walk 10s linear infinite',
        'sway': 'sway 3s ease-in-out infinite',
      },
      keyframes: {
        'star-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.95)' },
        },
        'nebula-loop': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.2' },
          '50%': { transform: 'translate(10px, -10px) scale(1.1)', opacity: '0.3' },
        },
        'rotate-sun': {
          '0%': { transform: 'rotate(0deg) translateX(120%) translateY(-50%) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120%) translateY(-50%) rotate(-360deg)' },
        },
        'wind': {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        'deer-walk': {
          '0%': { transform: 'translateX(100%)' },
          '50%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'sway': {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
      },
      dropShadow: {
        'glow': [
          '0 0 1px rgba(255, 255, 255, 0.5)',
          '0 0 2px rgba(255, 255, 255, 0.5)'
        ],
      },
    },
  },
  plugins: [],
};

export default config;

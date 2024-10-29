// src/app/signIn/page.tsx
"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => signIn("google", { callbackUrl: "/new" })}>
        Sign in with Google
      </button>
    </div>
  );
}

// src/app/logout/page.tsx
// "use client"; // Add this at the top to mark this as a client component

// import { signOut } from "next-auth/react";

// export default function LogoutPage() {
//   return (
//     <div>
//       <h1>Sign Out</h1>
//       <button onClick={() => signOut()}>Sign out</button>
//     </div>
//   );
// }


// src/app/logout/page.tsx
"use client"; // Add this at the top to mark this as a client component

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: '/new' });
  }, []);

  return null;
}
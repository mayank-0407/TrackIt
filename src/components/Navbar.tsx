"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 shadow bg-white">
      <h1 className="text-2xl font-bold text-blue-600">💰 TrackIt</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">{session?.user?.name}</span>
        <Button variant="outline" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
    </nav>
  );
}

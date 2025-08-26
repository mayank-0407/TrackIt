"use client";
import React, { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const page = () => {
  const { data: session } = useSession();
  useEffect(() => {
    signOut();
    redirect("/login");
  },[]);
  return <div>signing out</div>;
};

export default page;

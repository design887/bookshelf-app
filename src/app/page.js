"use client";
import dynamic from "next/dynamic";

const Bookshelf = dynamic(() => import("./Bookshelf"), { ssr: false });

export default function Page() {
  return <Bookshelf />;
}

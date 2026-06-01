import { ReactNode } from "react";
import Nav from "./Nav";
import Footer from "./Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

import { Outlet } from "react-router";
import { Sidebar } from "@/components/sidebar";

export function AppLayout() {
  return (
    <div className="flex h-full">
      <div className="fixed h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto ml-[200px] overscroll-contain scroll-smooth">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Outlet } from "react-router-dom";
import OwnerSidebar from "../components/OwnerSidebar";
import Topbar from "../components/Topbar";

export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <OwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          role="owner"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { BottomNav } from './BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-[100vh]" style={{ backgroundColor: 'var(--bg-offset)' }}>
      {/* 1. Header Navigation */}
      <TopBar />

      {/* 2. Main Page Content Structure */}
      <div className="flex flex-1 container" style={{ padding: 0, maxWidth: '1280px' }}>
        {/* Left Sidebar (Desktop) */}
        <Sidebar />

        {/* Center Main Route Content */}
        <main
          style={{
            flex: 1,
            padding: '1.5rem',
            paddingBottom: '80px', // margin for mobile bottom nav
            minWidth: 0, // prevents grid flex issues
          }}
        >
          <Outlet />
        </main>

        {/* Right Sidebar (Desktop) */}
        <RightSidebar />
      </div>

      {/* 3. Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
};

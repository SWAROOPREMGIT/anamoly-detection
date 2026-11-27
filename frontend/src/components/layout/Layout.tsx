import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-200 relative selection:bg-cyan-500/30 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-right subtle cyan ambient light */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-600/10 blur-[140px]" />
        {/* Bottom-left subtle purple ambient light */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-[140px]" />
        {/* Center blue wash */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-blue-900/[0.04] blur-[180px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main Structural Components */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <Header sidebarCollapsed={sidebarCollapsed} />

      {/* Dynamic Content Area */}
      <main
        className={`relative z-10 pt-16 min-h-screen transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>

        {/* Global Footer */}
        <footer className="border-t border-white/[0.04] py-4 px-8 text-center text-xs font-mono text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ANOMALY DETECTION & VIOLENCE RECOGNITION // POWERED BY CONVLSTM
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            STATION ID: SEC-TERMINAL-01
          </span>
        </footer>
      </main>
    </div>
  );
}

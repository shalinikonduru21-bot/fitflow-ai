
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-slate-950 italic">
            F
          </div>
          <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Fit Flow AI
          </h1>
        </div>
        {title && <span className="text-slate-400 font-medium">{title}</span>}
      </header>
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;

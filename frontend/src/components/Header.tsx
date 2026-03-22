'use client';
import Link from 'next/link';
import { BookOpen, LayoutList, PlusCircle, Settings } from 'lucide-react';
import clsx from 'clsx';

interface HeaderProps {
  activeView: string;
  onViewChange: (view: 'create' | 'list' | 'settings') => void;
  hideViewToggle?: boolean;
}

export default function Header({ activeView, onViewChange, hideViewToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-muted/50 bg-ink/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron to-indigo-veda flex items-center justify-center shadow-lg shadow-saffron/20">
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-paper text-lg leading-none">Veda</span>
            <span className="font-display font-bold text-saffron text-lg leading-none">AI</span>
          </div>
        </Link>

        {/* Nav */}
        {!hideViewToggle && (
          <nav className="flex items-center gap-1 bg-ink-soft border border-ink-muted rounded-lg p-1">
            <NavBtn label="Create" icon={<PlusCircle size={14} />} active={activeView === 'create'} onClick={() => onViewChange('create')} />
            <NavBtn label="History" icon={<LayoutList size={14} />} active={activeView === 'list'} onClick={() => onViewChange('list')} />
            <NavBtn label="Settings" icon={<Settings size={14} />} active={activeView === 'settings'} onClick={() => onViewChange('settings')} />
          </nav>
        )}

        <div className="w-28" />
      </div>
    </header>
  );
}

function NavBtn({ label, icon, active, onClick }: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
        active ? 'bg-saffron text-white shadow-sm' : 'text-paper/50 hover:text-paper'
      )}
    >
      {icon}{label}
    </button>
  );
}

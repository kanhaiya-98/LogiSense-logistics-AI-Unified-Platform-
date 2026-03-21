import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { ChatWidget } from '../chat/ChatWidget';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-surface">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
        <ChatWidget />
      </div>
    </div>
  );
}

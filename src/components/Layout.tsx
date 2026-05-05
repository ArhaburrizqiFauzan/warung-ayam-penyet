import { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

function LayoutContent({ children }: { children: ReactNode }) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main
        className="flex-1 bg-background overflow-auto transition-all duration-300 ease-in-out"
        style={{
          marginLeft: collapsed ? '4.5rem' : '12rem',
        }}
      >
        {children}
      </main>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
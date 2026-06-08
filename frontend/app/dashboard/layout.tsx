import { DashboardSidebar } from '@/widgets/sidebar/ui/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="w-60 shrink-0 flex flex-col"
        style={{ backgroundColor: '#16172A' }}
      >
        <DashboardSidebar />
      </aside>
      <main className="flex-1 overflow-y-auto p-8 bg-background">
        {children}
      </main>
    </div>
  );
}

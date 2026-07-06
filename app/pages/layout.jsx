import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

export default function DashboardLayout({
  children
}) {
  return (
    <div className="flex h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
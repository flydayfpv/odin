import '../globals.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'ODIN · Operation Data & Information',
  description: 'Personnel allocation system',
};

export default function RootLayout({ children }) {
  return (
      <div className="flex min-h-screen bg-slate-50 text-lg text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
  );
}

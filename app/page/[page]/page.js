'use client';
import DailyReport from '@/app/components/DailyReport';
import DashboardContent from '@/app/components/DashboardContent';
import ManpowerPlansPage from '@/app/components/ManpowerPlan';
import ManpowerPlanDetail from '@/app/components/ManpowerPlanDetail';
import ManpowerReport from '@/app/components/ManpowerReport';
import Usermanagement from '@/app/components/Usermanagement';
import MonthlyReport from '@/app/components/MonthlyReport'
import { useParams } from 'next/navigation';
import ReporterDashboard from '@/app/components/ReporterDashboard';

export default function DynamicPage() {
  const { page } = useParams();

  // ✅ mapping component ตามชื่อ path
  const renderContent = () => {
    switch (page) {
      case 'usermanagement':
        return <Usermanagement />

      case 'Dashboard':
        return <DashboardContent />;

      case 'manpower':
        return <ManpowerReport />

      case 'ManpowerPlan':
        return <ManpowerPlansPage />

      case 'manpowerplandetail':
        return <ManpowerPlanDetail />

      case 'reports':
        return <DailyReport />;

      case 'monthly':
        return <MonthlyReport />;

        case 'ReporterDashboard':
        return <ReporterDashboard />;




      default:
        return (
          <div className="p-5 text-center text-slate-500">
            <h2 className="text-2xl font-semibold mb-2">404 - Page Not Found</h2>
            <p>There is no module named "{page}".</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen p-5">
      {renderContent()}
    </div>
  );
}

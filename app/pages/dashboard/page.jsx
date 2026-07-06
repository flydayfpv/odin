import DashboardCard
from '@/app/components/DashboardCard';

export default function DashboardPage() {

  return (

    <div>

      <h1
        className="
        text-3xl
        font-bold
        mb-6
        "
      >
        Dashboard
      </h1>

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
        "
      >

        <DashboardCard
          title="Branches"
          value="5"
        />

        <DashboardCard
          title="Departments"
          value="18"
        />

        <DashboardCard
          title="Employees"
          value="4,562"
        />

        <DashboardCard
          title="Today's Reports"
          value="4"
        />

      </div>

    </div>

  );

}
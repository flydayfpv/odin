function SummaryDaily({ plans, summary, reportDate, divisionId }) {
  return (
    <div>
      <div>วันที่รายงาน: {reportDate}</div>
      <div>Division: {divisionId}</div>
      <div>จำนวน Job: {summary.totalJobs}</div>
      <div>In Roster รวม: {summary.totalInRoster}</div>
    </div>
  );
}

export default SummaryDaily;

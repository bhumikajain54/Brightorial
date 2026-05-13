import React, { useState, useEffect } from "react";
import {
  LuFileText,
  LuFileSpreadsheet,
  LuUsers,
  LuUserCheck,
  LuPercent,
  LuDollarSign,
} from "react-icons/lu";
import BarChart from "../../../shared/components/charts/BarChart";
import TradePieChart from "../../../shared/components/charts/TradePieChart";
import { getChartColors } from "../../../shared/utils/chartColors";
import { Horizontal4Cards, MatrixCard } from "../../../shared/components/metricCard";
import DynamicButton from "../../../shared/components/DynamicButton";
import { TAILWIND_COLORS } from "../../../shared/WebConstant";
import { getMethod } from "../../../service/api";
import apiService from "../services/serviceUrl";

const AnalyticsReports = () => {
  const [timeFilter, setTimeFilter] = useState("Last 30 days");
  const [departmentFilter, setDepartmentFilter] = useState("All Department");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  const chartColors = getChartColors();

  // ==========================
  // 📊 Fetch Analytics Data
  // ==========================
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await getMethod({
          apiUrl: apiService.recruiterAnalyticsReports, // ✅ your endpoint
        });

        if (res?.status && res?.data) {
          setAnalyticsData(res.data);
        } else {
          console.warn("⚠️ Invalid analytics response:", res);
        }
      } catch (err) {
        console.error("❌ Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // ==========================
  // 📊 Map Backend → Charts
  // ==========================
  const applicationsData = analyticsData
    ? {
        labels: analyticsData.applications_by_department.map((d) => d.department),
        datasets: [
          {
            label: "Total Applications",
            data: analyticsData.applications_by_department.map((d) => d.total_applications),
            backgroundColor: chartColors.info,
            borderRadius: 4,
          },
          {
            label: "Shortlisted",
            data: analyticsData.applications_by_department.map((d) => d.shortlisted),
            backgroundColor: chartColors.success,
            borderRadius: 4,
          },
          {
            label: "Hired",
            data: analyticsData.applications_by_department.map((d) => d.hired),
            backgroundColor: chartColors.warning,
            borderRadius: 4,
          },
        ],
      }
    : null;

  const sourceOfHireData = analyticsData
    ? {
        labels: analyticsData.source_of_hire.map((s) => s.source),
        datasets: [
          {
            data: analyticsData.source_of_hire.map((s) => s.count),
            backgroundColor: [
              chartColors.info,
              chartColors.success,
              chartColors.warning,
              chartColors.error,
              chartColors.primary,
            ],
            borderWidth: 0,
          },
        ],
      }
    : null;

  const keyMetricsData = analyticsData
    ? [
        {
          title: "Total Jobs",
          value: analyticsData.key_metrics.total_jobs,
          icon: <LuUsers />,
        },
        {
          title: "Total Applications",
          value: analyticsData.key_metrics.total_applications,
          icon: <LuUsers />,
        },
        {
          title: "Total Interviews",
          value: analyticsData.key_metrics.total_interviews,
          icon: <LuUserCheck />,
        },
        {
          title: "Total Hires",
          value: analyticsData.key_metrics.total_hires,
          icon: <LuUserCheck />,
        },
        {
          title: "Interview-to-Hire",
          value: analyticsData.key_metrics.interview_to_hire_ratio,
          icon: <LuPercent />,
        },
        {
          title: "Avg Cost per Hire",
          value: analyticsData.key_metrics.avg_cost_per_hire,
          icon: <LuDollarSign />,
        },
      ]
    : [];

  // ==========================
  // 📂 Export Handlers
  // ==========================
  const handleCSVDownload = () => {
    if (!analyticsData) return;

    const csvData = [
      ["Department", "Total Applications", "Shortlisted", "Hired"],
      ...analyticsData.applications_by_department.map((d) => [
        d.department,
        d.total_applications,
        d.shortlisted,
        d.hired,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "analytics_data.csv");
    link.click();
  };

  const handlePDFDownload = () => {
    if (!analyticsData) return;

    const reportContent = `
Recruiter Analytics Report
Generated on: ${new Date().toLocaleDateString()}

APPLICATIONS BY DEPARTMENT:
${analyticsData.applications_by_department
  .map(
    (d) =>
      `${d.department}: ${d.total_applications} applications, ${d.shortlisted} shortlisted, ${d.hired} hired`
  )
  .join("\n")}

SOURCE OF HIRE:
${analyticsData.source_of_hire
  .map((s) => `${s.source}: ${s.count}`)
  .join("\n")}

KEY METRICS:
${Object.entries(analyticsData.key_metrics)
  .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
  .join("\n")}
    `.trim();

    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "analytics_report.txt");
    link.click();
  };

  // ==========================
  // 🧩 Render
  // ==========================
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading analytics data...
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 text-center text-red-500">
        No analytics data available.
      </div>
    );
  }

  return (
    <div className={`p-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
      {/* Header */}
      <div className="mb-8">
        <MatrixCard
          title="Analytics & Reports"
          subtitle="Track recruitment metrics, generate insights, and create custom reports."
        />
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Filters:
          </span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className={`px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500`}
          >
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last 90 days">Last 90 days</option>
            <option value="Last year">Last year</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <DynamicButton
            onClick={handleCSVDownload}
            backgroundColor="transparent"
            textColor="var(--color-text-primary)"
            border="2px solid var(--color-secondary)"
            hoverBackgroundColor="var(--color-secondary)"
            icon={<LuFileSpreadsheet className="w-4 h-4" />}
          >
            CSV
          </DynamicButton>
          <DynamicButton
            onClick={handlePDFDownload}
            backgroundColor="transparent"
            textColor="var(--color-text-primary)"
            border="2px solid var(--color-secondary)"
            hoverBackgroundColor="var(--color-secondary)"
            icon={<LuFileText className="w-4 h-4" />}
          >
            PDF
          </DynamicButton>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <BarChart
            title="Applications by Department"
            data={applicationsData}
          />
        </div>
        <div className="xl:col-span-1">
          <TradePieChart
            title="Source of Hire"
            data={sourceOfHireData}
          />
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className={`text-lg font-semibold mb-6`}>
            Key Metrics Summary
          </h3>
          <Horizontal4Cards data={keyMetricsData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;

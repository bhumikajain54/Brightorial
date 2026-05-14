import React, { useState, useEffect } from "react";
import {
  LuUsers,
  LuUserCheck,
  LuPercent,
  LuDollarSign,
} from "react-icons/lu";
import BarChart from "../../../shared/components/charts/BarChart";
import TradePieChart from "../../../shared/components/charts/TradePieChart";
import { getChartColors } from "../../../shared/utils/chartColors";
import { Horizontal4Cards, MatrixCard } from "../../../shared/components/metricCard";
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
  // Default empty data structures for charts
  const defaultApplicationsData = {
    labels: [],
    datasets: [
      {
        label: "Total Applications",
        data: [],
        backgroundColor: chartColors.info,
        borderRadius: 4,
      },
      {
        label: "Shortlisted",
        data: [],
        backgroundColor: chartColors.success,
        borderRadius: 4,
      },
      {
        label: "Hired",
        data: [],
        backgroundColor: chartColors.warning,
        borderRadius: 4,
      },
    ],
  };

  const defaultSourceOfHireData = {
    labels: [],
    datasets: [
      {
        data: [],
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
  };

  const defaultKeyMetricsData = [
    {
      title: "Total Jobs",
      value: 0,
      icon: <LuUsers />,
    },
    {
      title: "Total Applications",
      value: 0,
      icon: <LuUsers />,
    },
    {
      title: "Total Interviews",
      value: 0,
      icon: <LuUserCheck />,
    },
    {
      title: "Total Hires",
      value: 0,
      icon: <LuUserCheck />,
    },
    {
      title: "Interview-to-Hire",
      value: "0%",
      icon: <LuPercent />,
    },
    {
      title: "Avg Cost per Hire",
      value: "$0",
      icon: <LuDollarSign />,
    },
  ];

  const applicationsData = analyticsData?.applications_by_department?.length > 0
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
    : defaultApplicationsData;

  const sourceOfHireData = analyticsData?.source_of_hire?.length > 0
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
    : defaultSourceOfHireData;

  const keyMetricsData = analyticsData?.key_metrics
    ? [
        {
          title: "Total Jobs",
          value: analyticsData.key_metrics.total_jobs || 0,
          icon: <LuUsers />,
        },
        {
          title: "Total Applications",
          value: analyticsData.key_metrics.total_applications || 0,
          icon: <LuUsers />,
        },
        {
          title: "Total Interviews",
          value: analyticsData.key_metrics.total_interviews || 0,
          icon: <LuUserCheck />,
        },
        {
          title: "Total Hires",
          value: analyticsData.key_metrics.total_hires || 0,
          icon: <LuUserCheck />,
        },
        {
          title: "Interview-to-Hire",
          value: analyticsData.key_metrics.interview_to_hire_ratio || "0%",
          icon: <LuPercent />,
        },
        {
          title: "Avg Cost per Hire",
          value: analyticsData.key_metrics.avg_cost_per_hire || "$0",
          icon: <LuDollarSign />,
        },
      ]
    : defaultKeyMetricsData;

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

  // Always render charts, even if no data (show blank graphs)
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
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <BarChart
            title="Applications by Department"
            data={applicationsData}
            showExport={false}
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

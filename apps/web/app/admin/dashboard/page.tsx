"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Overview {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    totalFees: number;
    collectedFees: number;
    pendingFees: number;
    scholarships: number;
    defaulters: number;
  };
  defaulters: Array<{
    studentId: string;
    rollNo: string;
    name: string;
    dueAmount: number;
    semester: number;
  }>;
  dropoutRisk: Array<{
    studentId: string;
    rollNo: string;
    attendancePercent: number;
    averageMarks: number;
    riskScore: number;
  }>;
}

export default function AdminDashboard(): JSX.Element {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/admin-login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOverview(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || "Failed to load dashboard");
        if (err.response?.status === 401) {
          router.push("/admin-login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const collectionRate = overview?.stats.totalFees
    ? Math.round((overview.stats.collectedFees / overview.stats.totalFees) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-gray-600">Institutional Control Dashboard</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                router.push("/admin-login");
              }}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Students</div>
            <div className="text-3xl font-bold text-gray-900">{overview?.stats.totalStudents || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Teachers</div>
            <div className="text-3xl font-bold text-gray-900">{overview?.stats.totalTeachers || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Fee Collection Rate</div>
            <div className="text-3xl font-bold text-green-600">{collectionRate}%</div>
            <div className="text-sm text-gray-500 mt-1">
              ₹{(overview?.stats.collectedFees || 0).toLocaleString()} / ₹{(overview?.stats.totalFees || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Defaulters</div>
            <div className="text-3xl font-bold text-red-600">{overview?.stats.defaulters || 0}</div>
            <div className="text-sm text-gray-500 mt-1">
              ₹{(overview?.stats.pendingFees || 0).toLocaleString()} pending
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-gray-600 text-sm font-medium mb-1">Total Fees</div>
              <div className="text-2xl font-bold text-gray-900">₹{(overview?.stats.totalFees || 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600 text-sm font-medium mb-1">Collected</div>
              <div className="text-2xl font-bold text-green-600">₹{(overview?.stats.collectedFees || 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600 text-sm font-medium mb-1">Pending</div>
              <div className="text-2xl font-bold text-red-600">₹{(overview?.stats.pendingFees || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Defaulters */}
        {overview && overview.defaulters.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fee Defaulters</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overview.defaulters.map((defaulter) => (
                    <tr key={defaulter.studentId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{defaulter.rollNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{defaulter.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sem {defaulter.semester}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">₹{defaulter.dueAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dropout Risk */}
        {overview && overview.dropoutRisk.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Students at Risk</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overview.dropoutRisk.map((student) => (
                    <tr key={student.studentId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rollNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.attendancePercent}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.averageMarks}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          student.riskScore > 70 ? "bg-red-100 text-red-800" :
                          student.riskScore > 50 ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {student.riskScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <a
            href="/admin/students"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Students</h3>
            <p className="text-gray-600 text-sm">Manage student lifecycle</p>
          </a>
          <a
            href="/admin/fees"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 Fees</h3>
            <p className="text-gray-600 text-sm">Manage fee structures</p>
          </a>
          <a
            href="/admin/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Analytics</h3>
            <p className="text-gray-600 text-sm">View insights and reports</p>
          </a>
          <a
            href="/admin/documents"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📄 Documents</h3>
            <p className="text-gray-600 text-sm">Generate certificates</p>
          </a>
        </div>
      </div>
    </div>
  );
}


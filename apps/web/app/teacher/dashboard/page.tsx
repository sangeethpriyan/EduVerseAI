"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Overview {
  teacher: {
    id: string;
    empId: string;
    name: string;
    department: string;
    designation: string;
  };
  stats: {
    assignedCourses: number;
    todaysClasses: number;
    pendingGrading: number;
    totalStudents: number;
  };
  riskAlerts: Array<{
    courseId: string;
    courseName: string;
    studentId: string;
    studentRollNo: string;
    issue: string;
    percentage: number;
  }>;
}

export default function TeacherDashboard(): JSX.Element {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/teacher-login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/teacher/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOverview(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || "Failed to load dashboard");
        if (err.response?.status === 401) {
          router.push("/teacher-login");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Portal</h1>
              <p className="text-gray-600">
                Welcome back, {overview?.teacher.name} ({overview?.teacher.empId})
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                router.push("/teacher-login");
              }}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Assigned Courses</div>
            <div className="text-3xl font-bold text-gray-900">{overview?.stats.assignedCourses || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Today's Classes</div>
            <div className="text-3xl font-bold text-gray-900">{overview?.stats.todaysClasses || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Pending Grading</div>
            <div className="text-3xl font-bold text-orange-600">{overview?.stats.pendingGrading || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Students</div>
            <div className="text-3xl font-bold text-gray-900">{overview?.stats.totalStudents || 0}</div>
          </div>
        </div>

        {/* Risk Alerts */}
        {overview && overview.riskAlerts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-yellow-900 mb-4">⚠️ Risk Alerts</h2>
            <div className="space-y-2">
              {overview.riskAlerts.map((alert, idx) => (
                <div key={idx} className="text-sm text-yellow-800">
                  <strong>{alert.courseName}</strong>: Student {alert.studentRollNo} has low attendance ({alert.percentage}%)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/teacher/courses"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 My Courses</h3>
            <p className="text-gray-600 text-sm">Manage courses and materials</p>
          </Link>
          <Link
            href="/teacher/assignments"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Assignments</h3>
            <p className="text-gray-600 text-sm">Create and grade assignments</p>
          </Link>
          <Link
            href="/teacher/attendance"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ Attendance</h3>
            <p className="text-gray-600 text-sm">Mark student attendance</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity to display</p>
        </div>
      </div>
    </div>
  );
}


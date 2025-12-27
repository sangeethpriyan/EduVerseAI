"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Course {
  courseId: string;
  code: string;
  name: string;
  credits: number;
  progress: number;
  status: string;
}

export default function StudentDashboard(): JSX.Element {
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          router.push("/");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const overviewRes = await axios.get(`${API_URL}/api/student/overview`, { headers });

        const overview = overviewRes.data.data;
        setCourses(overview.courses || []);
        setAttendance(overview.attendance || []);
        setFees(overview.fees || null);
      } catch (err) {
        setError("Failed to load dashboard data");
        // console.error(err);

        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push("/");
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your overview.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Enrolled Courses</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{courses.length}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Average Attendance</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {attendance.length > 0
                ? Math.round(
                  attendance.reduce((sum, a) => sum + a.percentage, 0) /
                  attendance.length
                )
                : 0}
              %
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Fees Due</div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              ₹{fees?.totalOwed || 0}
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Courses</h2>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.courseId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-600">Code: {course.code}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No courses enrolled yet</p>
          )}
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Attendance Status</h2>
          {attendance.length > 0 ? (
            <div className="space-y-3">
              {attendance.map((a) => (
                <div key={a.courseId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{a.courseName}</h3>
                      <p className="text-sm text-gray-600">
                        {a.attendedClasses} of {a.totalClasses} classes attended
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {a.percentage}%
                      </div>
                      <div
                        className={`text-sm font-medium ${a.riskLevel === "high"
                            ? "text-red-600"
                            : a.riskLevel === "medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                      >
                        {a.riskLevel.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  {a.riskPrediction && (
                    <p className="text-sm text-orange-600 mt-2">{a.riskPrediction}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No attendance records</p>
          )}
        </div>
      </div>
    </div>
  );
}

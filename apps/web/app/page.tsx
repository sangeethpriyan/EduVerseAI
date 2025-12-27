"use client";

import Link from "next/link";

export default function HomePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">EduVerse AI</h1>
          <p className="text-xl text-blue-100 mb-2">
            Unified ERP + LMS + AI Operating System
          </p>
          <p className="text-lg text-blue-200">
            For Modern Educational Institutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Student Portal */}
          <Link href="/student-login">
            <div className="bg-white rounded-2xl shadow-2xl p-8 hover:transform hover:scale-105 transition-transform cursor-pointer">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h2>
                <p className="text-gray-600 mb-4">
                  Access courses, submit assignments, track attendance, and interact with AI assistant
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In →
                </button>
              </div>
            </div>
          </Link>

          {/* Teacher Portal */}
          <Link href="/teacher-login">
            <div className="bg-white rounded-2xl shadow-2xl p-8 hover:transform hover:scale-105 transition-transform cursor-pointer">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Portal</h2>
                <p className="text-gray-600 mb-4">
                  Manage courses, create assignments, grade submissions, and generate reports
                </p>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Sign In →
                </button>
              </div>
            </div>
          </Link>

          {/* Admin Portal */}
          <Link href="/admin-login">
            <div className="bg-white rounded-2xl shadow-2xl p-8 hover:transform hover:scale-105 transition-transform cursor-pointer">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h2>
                <p className="text-gray-600 mb-4">
                  Manage students, fees, analytics, and institutional operations
                </p>
                <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Sign In →
                </button>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-16 text-white">
          <p className="text-lg mb-4">One Platform. One Institution. Infinite Learning.</p>
          <p className="text-blue-200">Ready for Production Deployment in Q2 2026</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Application status matching the image: Applied (12), Under Review (8), Shortlisted (5), Interview (3), Final Decision (8)
  const applicationStatus = [
    { label: "Applied", value: 12, color: "#22C55E" }, // Green
    { label: "Under Review", value: 8, color: "#FACC15" }, // Yellow
    { label: "Shortlisted", value: 5, color: "#EC4899" }, // Pink
    { label: "Interview", value: 3, color: "#6366F1" }, // Purple
    { label: "Final Decision", value: 8, color: "#0EA5E9" }, // Blue
  ];

  const totalApplications = applicationStatus.reduce((sum, item) => sum + item.value, 0);

  const applicationSegments = (() => {
    const segments: {
      label: string;
      value: number;
      color: string;
      dashArray: string;
      offset: number;
    }[] = [];
    const gapSize = 0.8; // White gap size between segments - increased for better visibility
    const totalGaps = applicationStatus.length * gapSize; // Include gap after last segment (wrap-around)
    const availablePercentage = 100 - totalGaps;
    let accum = 0;

    applicationStatus.forEach((item, index) => {
      const basePercentage = (item.value / totalApplications) * 100;
      const adjustedPercentage = (basePercentage / 100) * availablePercentage;

      segments.push({
        ...item,
        dashArray: `${adjustedPercentage} ${100 - adjustedPercentage}`,
        offset: -accum,
      });

      accum += adjustedPercentage + gapSize; // Always add gap after each segment
    });

    return segments;
  })();

  // Create white gap segments for separation (including wrap-around gap between last and first)
  const whiteGaps = (() => {
    const gaps: { dashArray: string; offset: number }[] = [];
    const gapSize = 0.8; // Match the gap size used in segments - increased for better visibility
    const totalGaps = applicationStatus.length * gapSize; // Include wrap-around gap
    const availablePercentage = 100 - totalGaps;
    let accum = 0;

    // Calculate all segment end positions first (matching applicationSegments calculation)
    const segmentEnds: number[] = [];
    applicationStatus.forEach((item) => {
      const basePercentage = (item.value / totalApplications) * 100;
      const adjustedPercentage = (basePercentage / 100) * availablePercentage;
      accum += adjustedPercentage;
      segmentEnds.push(accum);
      accum += gapSize; // Add gap after segment
    });

    // Create gaps after each segment
    segmentEnds.forEach((segmentEnd, index) => {
      if (index < segmentEnds.length - 1) {
        // Regular gaps between segments - positioned right after each segment ends
        gaps.push({
          dashArray: `${gapSize} ${100 - gapSize}`,
          offset: -segmentEnd,
        });
      } else {
        // Last gap (wrap-around between yellow and green) - must be visible at 12 o'clock
        // Yellow (last segment) ends at segmentEnd
        // Green (first segment) starts at offset 0 (12 o'clock after -90° rotation)
        // Gap should be positioned to end exactly at 0, so it appears between yellow's end and green's start
        // Using offset = -(100 - gapSize) positions the gap to end at 0
        const wrapAroundOffset = -(100 - gapSize);

        gaps.push({
          dashArray: `${gapSize} ${100 - gapSize}`,
          offset: wrapAroundOffset,
        });
      }
    });

    return gaps;
  })();

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#E5E7EA",
      }}
    >
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/SAASA%20Logo.png"
              alt="SAASA B2E"
              width={110}
              height={32}
              className="h-8 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            <button className="relative text-slate-900">
              Dashboard
              <span className="absolute -bottom-1 left-0 right-0 mx-auto h-1 w-10 rounded-full bg-sky-500" />
            </button>
            <button className="text-slate-600 hover:text-slate-900">Jobs</button>
            <button className="text-slate-600 hover:text-slate-900">Courses</button>
            <button className="text-slate-600 hover:text-slate-900">Applications</button>
            <button className="text-slate-600 hover:text-slate-900">Profile</button>
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-4">
            <button className="relative rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0l-4.243 4.243m8.485 0l-4.243-4.243m-4.242 0l-4.243 4.243"></path>
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setIsNotificationsModalOpen(!isNotificationsModalOpen)}
                className="relative rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsModalOpen && (
                <div
                  className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-2xl overflow-hidden z-[10001] transition-all duration-300 ease-out"
                  style={{
                    width: "270px",
                    fontFamily: "Inter, sans-serif",
                    animation: "slideDown 0.3s ease-out",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-3.5 pt-3 pb-2 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        Notifications
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-gray-700 hover:text-gray-900"
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                          }}
                        >
                          Mark all as read
                        </button>
                        <button
                          onClick={() => setIsNotificationsModalOpen(false)}
                          className="text-gray-700 hover:text-gray-900"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "10px",
                        fontWeight: 400,
                        color: "#6B7280",
                      }}
                    >
                      Recent updates related to your jobs and profile
                    </p>
                  </div>

                  {/* Notifications Content - Only Top 3 */}
                  <div>
                    {/* Today Section */}
                    <div className="px-3.5 pt-3 pb-2.5">
                      <h4
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#6B7280",
                          marginBottom: "7px",
                        }}
                      >
                        Today
                      </h4>
                      <div className="space-y-3">
                        {/* Notification 1 - Blue */}
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ color: "#28A8DF" }}
                              >
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#111827",
                                marginBottom: "2px",
                              }}
                            >
                              3 new jobs match your profile
                            </p>
                            <p
                              style={{
                                fontSize: "10px",
                                fontWeight: 400,
                                color: "#6B7280",
                              }}
                            >
                              Jobs based on your profile
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 400,
                                color: "#6B7280",
                              }}
                            >
                              2h ago
                            </span>
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: "#28A8DF" }}
                            ></div>
                          </div>
                        </div>

                        {/* Notification 2 - Green */}
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ color: "#22C55E" }}
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#111827",
                                marginBottom: "2px",
                              }}
                            >
                              Your application for Data Analyst is under
                            </p>
                            <p
                              style={{
                                fontSize: "10px",
                                fontWeight: 400,
                                color: "#6B7280",
                              }}
                            >
                              Application updated
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 400,
                                color: "#6B7280",
                              }}
                            >
                              8h ago
                            </span>
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: "#22C55E" }}
                            ></div>
                          </div>
                        </div>

                        {/* Notification 3 - Red */}
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ color: "#EF4444" }}
                              >
                                <path d="M9 11l3 3L22 4"></path>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#111827",
                                marginBottom: "2px",
                              }}
                            >
                              You've been shortlisted for Frontend Deve
                            </p>
                            <p
                              style={{
                                fontSize: "10px",
                                fontWeight: 400,
                                color: "#6B7280",
                              }}
                            >
                              Interview invitation
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 400,
                                color: "#6B7280",
                              }}
                            >
                              1d ago
                            </span>
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: "#EF4444" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-3.5 py-2.5 border-t border-gray-200">
                    <button
                      className="w-full text-center text-blue-600 hover:text-blue-700"
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                      }}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-300">
                  <Image src="/cv_main.jpg" alt="User avatar" width={32} height={32} className="h-8 w-8 object-cover" />
                </div>
                <div className="hidden text-right text-xs leading-tight sm:block">
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    Sachin Dubey
                  </p>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      color: "#6B7280",
                    }}
                  >
                    View Profile
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileModalOpen && (
                <div
                  className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-2xl overflow-hidden z-[10001] transition-all duration-300 ease-out"
                  style={{
                    width: "280px",
                    fontFamily: "Inter, sans-serif",
                    animation: "slideDown 0.3s ease-out",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* User Information Section */}
                  <div className="px-3 pt-3 pb-2">
                    <div className="flex items-start gap-2.5">
                      {/* Profile Picture */}
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: "#9CA3AF" }}
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      {/* User Details */}
                      <div className="flex-1">
                        <h3
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: "2px",
                          }}
                        >
                          Vedant Sharma
                        </h3>
                        <p
                          style={{
                            fontSize: "11px",
                            fontWeight: 400,
                            color: "#6B7280",
                            marginBottom: "4px",
                          }}
                        >
                          vedant.sharma@example.com
                        </p>
                        <span
                          className="inline-block px-1.5 py-0.5 rounded-full"
                          style={{
                            fontSize: "10px",
                            fontWeight: 500,
                            color: "#111827",
                            backgroundColor: "#F3F4F6",
                          }}
                        >
                          Job Seeker
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mx-3"></div>

                  {/* Primary Navigation Options */}
                  <div className="px-3 py-2">
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => {
                        router.push("/personal-details");
                        setIsProfileModalOpen(false);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#6B7280" }}
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#111827",
                        }}
                      >
                        View Profile
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => {
                        router.push("/uploadcv");
                        setIsProfileModalOpen(false);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#6B7280" }}
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#111827",
                        }}
                      >
                        Edit CV
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => {
                        router.push("/applications");
                        setIsProfileModalOpen(false);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#6B7280" }}
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#111827",
                        }}
                      >
                        My Applications
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => {
                        router.push("/assessments");
                        setIsProfileModalOpen(false);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#6B7280" }}
                      >
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#111827",
                        }}
                      >
                        Assessments
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => {
                        router.push("/saved-jobs");
                        setIsProfileModalOpen(false);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#6B7280" }}
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#111827",
                        }}
                      >
                        Saved Jobs
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => {
                        router.push("/courses");
                        setIsProfileModalOpen(false);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#6B7280" }}
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#111827",
                        }}
                      >
                        Courses & Learning
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mx-3"></div>

                  {/* Preferences Section */}
                  <div className="px-3 py-2">
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => {
                        router.push("/notification-preferences");
                        setIsProfileModalOpen(false);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#6B7280" }}
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#111827",
                        }}
                      >
                        Notification Preferences
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => {
                        router.push("/settings");
                        setIsProfileModalOpen(false);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#6B7280" }}
                      >
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0l-4.243 4.243m8.485 0l-4.243-4.243m-4.242 0l-4.243 4.243"></path>
                      </svg>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#111827",
                        }}
                      >
                        Settings
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mx-3"></div>

                  {/* Support Section */}
                  <div className="px-3 py-2 pb-3">
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => {
                        router.push("/help");
                        setIsProfileModalOpen(false);
                      }}
                    >
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor: "#6B7280",
                        }}
                      >
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#111827",
                        }}
                      >
                        Help & Support
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay - closes sidebar when clicked outside */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            zIndex: 9998,
          }}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: "Inter, sans-serif",
          zIndex: 9999,
        }}
      >
        <div className="flex flex-col h-full pt-8">
          {/* Navigation Items */}
          <div className="flex flex-col px-4 space-y-2">
            {/* Dashboard - Active */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer relative"
              style={{
                backgroundColor: "#F0F9FF",
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  backgroundColor: "#0EA5E9",
                }}
              ></div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#0EA5E9" }}
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#0EA5E9",
                }}
              >
                Dashboard
              </span>
            </div>

            {/* Jobs */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/jobs")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#6B7280" }}
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Jobs
              </span>
            </div>

            {/* Applications */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/applications")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#6B7280" }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Applications
              </span>
            </div>

            {/* Edit CV */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/uploadcv")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#6B7280" }}
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Edit CV
              </span>
            </div>

            {/* Recommended Courses */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/courses")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#6B7280" }}
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Recommended Courses
              </span>
            </div>

            {/* Profile */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/personal-details")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#6B7280" }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Profile
              </span>
            </div>

            {/* Settings */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/settings")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#6B7280" }}
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0l-4.243 4.243m8.485 0l-4.243-4.243m-4.242 0l-4.243 4.243"></path>
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Settings
              </span>
            </div>
          </div>

          {/* Bottom Section - Help & Support and Logout */}
          <div className="mt-auto mb-8 flex flex-col px-4 space-y-2" style={{ paddingTop: "32px" }}>
            {/* Help & Support */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/help")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#6B7280" }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Help & Support
              </span>
            </div>

            {/* Logout */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => router.push("/logout")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#6B7280" }}
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Logout
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handler for dropdowns */}
      {(isProfileModalOpen || isNotificationsModalOpen) && (
        <div
          className="fixed inset-0 z-[10000]"
          onClick={() => {
            setIsProfileModalOpen(false);
            setIsNotificationsModalOpen(false);
          }}
        ></div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-width[1200px] px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Welcome & quick actions */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              {/* Hamburger Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors"
                style={{
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "#111827" }}
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <div>
                <h1
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Welcome, Sachin Dubey!
                </h1>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    color: "#6B7280",
                    marginTop: "4px",
                  }}
                >
                  Your AI-powered job search dashboard. Last updated today.
                </p>
              </div>
            </div>
          </div>

          {/* First Row: Quick Actions and Application Status */}
          <div className="flex items-start justify-center mb-6" style={{ gap: "56px" }}>
            {/* Quick Actions */}
            <div
              className="bg-white flex-shrink-0"
              style={{
                width: "599px",
                height: "396px",
                borderRadius: "10px",
                padding: "24px",
                boxShadow:
                  "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 2px rgba(23, 26, 31, 0.3), 0px 0px 0px rgba(0, 0, 0, 0)",
              }}
            >
              <h2
                className="mb-3"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Explore Jobs", image: "/Explore%20Jobs%20Image'.png", route: "/explore-jobs" },
                  { title: "AI CV Editor", image: "/AI%20CV%20Editor%20Image.png", route: "/uploadcv" },
                  { title: "Application Management", image: "/Application%20Management%20Image.png", route: "/applications" },
                  { title: "Skill Enhancement", image: "/Skill%20Enhancements.png", route: "/skills" },
                ].map((item) => (
                  <button
                    key={item.title}
                    onClick={() => item.route && router.push(item.route)}
                    className="flex h-[128px] items-center justify-between text-left transition-all duration-300 ease-out"
                    style={{
                      width: "267px",
                      borderRadius: "6px",
                      backgroundColor: "#FFFFFF",
                      boxShadow:
                        "0px 0px 2px rgba(23, 26, 31, 0.4), 0px 0px 0px rgba(0, 0, 0, 0.5)",
                      // top/right/bottom/left – slightly smaller left padding to pull text left
                      padding: "24px 0px 24px 18px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0px 8px 16px rgba(23, 26, 31, 0.3), 0px 4px 8px rgba(0, 0, 0, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow = "0px 0px 2px rgba(23, 26, 31, 0.4), 0px 0px 0px rgba(0, 0, 0, 0.5)";
                    }}
                  >
                    <span
                      style={{
                        alignSelf: "flex-start",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "15px",
                        lineHeight: "22.2px",
                        fontWeight: 500,
                        letterSpacing: "0px",
                        color: "#77787A",
                      }}
                    >
                      {item.title}
                    </span>
                    <div
                      className="flex h-32 w-44 items-center justify-center overflow-hidden rounded-md bg-white"
                      style={{ marginRight: "-2px" }}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={220}
                        height={150}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Application Status */}
            <div
              className="bg-white flex-shrink-0"
              style={{
                width: "604.21px",
                height: "396px",
                borderRadius: "14.29px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 2px rgba(23, 26, 31, 0.3), 0px 0px 0px rgba(0, 0, 0, 0)",
                padding: "20px",
                position: "relative",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Application Status
                </h2>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                  <span className="text-xs font-semibold text-green-600" style={{ fontFamily: "Inter, sans-serif" }}>+12%</span>
                </div>
              </div>
              <div className="flex items-start gap-6" style={{ marginLeft: "10px", marginTop: "37.68px" }}>
                <div
                  className="relative flex-shrink-0"
                  style={{
                    width: "280px",
                    height: "280px",
                  }}
                >
                  <svg
                    viewBox="0 0 36 36"
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    className="pie-chart-svg"
                  >
                    {/* background circle */}
                    <circle cx="18" cy="18" r="16" fill="#F9FAFB" />
                    {/* White separator strokes (Color: #FFFFFF, Weight: 4.5, Opacity: 100%, Position: Center) */}
                    {/* Render regular gaps first */}
                    {whiteGaps.slice(0, -1).map((gap, index) => (
                      <g key={`gap-${index}`} transform="rotate(-90 18 18)">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="4.5"
                          strokeDasharray={gap.dashArray}
                          strokeDashoffset={gap.offset}
                          strokeLinecap="butt"
                          strokeOpacity="1"
                          strokeLinejoin="miter"
                        />
                      </g>
                    ))}
                    {/* Colored segments - each color has separate stroke properties */}
                    {applicationSegments.map((seg, index) => {
                      const isHovered = hoveredSegment === seg.label;

                      return (
                        <g
                          key={seg.label}
                          transform="rotate(-90 18 18)"
                          onMouseEnter={() => setHoveredSegment(seg.label)}
                          onMouseLeave={() => setHoveredSegment(null)}
                          style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto'
                          }}
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={isHovered ? "5" : "4.5"}
                            strokeDasharray={seg.dashArray}
                            strokeDashoffset="0"
                            strokeLinecap="butt"
                            strokeOpacity="0"
                            strokeLinejoin="miter"
                            style={{
                              transition: 'stroke-width 0.3s ease-out, filter 0.3s ease-out, transform 0.3s ease-out',
                              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                              transformOrigin: '18px 18px',
                              filter: isHovered ? 'drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.2))' : 'none'
                            }}
                          >
                            {/* First, make segment appear at 12 o'clock (fade in) */}
                            <animate
                              attributeName="stroke-opacity"
                              from="0"
                              to="1"
                              dur="0.3s"
                              begin={`${index * 0.25}s`}
                              fill="freeze"
                            />
                            {/* Then animate from 12 o'clock to final position sequentially */}
                            <animate
                              attributeName="stroke-dashoffset"
                              from="0"
                              to={seg.offset}
                              dur="1.8s"
                              begin={`${index * 0.25 + 0.3}s`}
                              fill="freeze"
                              calcMode="spline"
                              keyTimes="0; 0.2; 0.5; 0.8; 1"
                              keySplines="0.25 0.46 0.45 0.94; 0.25 0.46 0.45 0.94; 0.25 0.46 0.45 0.94; 0.25 0.46 0.45 0.94"
                            />
                          </circle>
                        </g>
                      );
                    })}
                    {/* White segment gap between yellow and green at 12 o'clock - rendered last to appear on top */}
                    {(() => {
                      // White segment is 3% wide and positioned exactly at 12 o'clock (top)
                      // Offset = -(100 - width) positions it to end at 0, which is where green starts
                      const whiteGapWidth = 3;
                      const whiteGapOffset = -(100 - whiteGapWidth);

                      return (
                        <g key="white-gap-segment-yellow-green" transform="rotate(-90 18 18)">
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="7"
                            strokeDasharray={`${whiteGapWidth} ${100 - whiteGapWidth}`}
                            strokeDashoffset={whiteGapOffset}
                            strokeLinecap="round"
                            strokeOpacity="1"
                            strokeLinejoin="miter"
                          />
                        </g>
                      );
                    })()}
                  </svg>
                  <div
                    className="absolute flex flex-col items-center justify-center"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      zIndex: 1
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Arimo, sans-serif",
                        fontSize: "44.33px",
                        fontWeight: 400,
                        lineHeight: "44.3px",
                        letterSpacing: "0px",
                        color: "#1A1A1A",
                      }}
                    >
                      {totalApplications}
                    </span>
                    <span
                      className="mt-1 text-xs"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        color: "#6B7280",
                      }}
                    >
                      Total Applications
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-sm" style={{ marginTop: "40px" }}>
                  {applicationStatus.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "13px",
                            color: "#4B5563",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "13px",
                          color: "#111827",
                        }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3"></div>

                  {/* Additional Metrics */}
                  <div className="space-y-2.5">
                    {/* Success Rate */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span className="text-xs text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>Success Rate</span>
                      </div>
                      <span className="text-xs font-semibold text-green-600" style={{ fontFamily: "Inter, sans-serif" }}>22%</span>
                    </div>

                    {/* Response Rate */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="text-xs text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>Response Rate</span>
                      </div>
                      <span className="text-xs font-semibold text-blue-600" style={{ fontFamily: "Inter, sans-serif" }}>78%</span>
                    </div>

                    {/* Avg Response Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span className="text-xs text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>Avg Response</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-600" style={{ fontFamily: "Inter, sans-serif" }}>5 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Profile Completion, CV Score, and Notifications */}
        <div className="flex items-start justify-center mb-6">
          {/* Left Column: Profile Completion and Your Skill Insights */}
          <div className="space-y-6 flex-shrink-0" style={{ marginRight: "30px" }}>
            {/* Profile Completion */}
            <div
              className="bg-white p-4 border border-slate-200 flex flex-col"
              style={{
                width: "350px",
                height: "230px",
                borderRadius: "10.78px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 2px rgba(23, 26, 31, 0.3), 0px 0px 0px rgba(0, 0, 0, 0)",
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "12px",
                }}
              >
                Profile Completion
              </p>
              <div className="flex items-start gap-4 flex-1">
                {/* Left Side: Circle and Complete Profile Button */}
                <div className="flex flex-col items-start">
                  {/* Circular Progress Bar - Liquid Fill Effect */}
                  <div className="relative flex-shrink-0" style={{ width: "120px", height: "120px" }}>
                    {(() => {
                      const percentage = 88;
                      const radius = 50;
                      const centerX = 50;
                      const centerY = 50;
                      // Calculate fill level from bottom (0% = bottom, 100% = top)
                      // 88% filled means water level is at 12% from bottom
                      const waterLevel = 100 - percentage; // 12% from bottom

                      return (
                        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: "hidden" }}>
                          <defs>
                            {/* Unique clipPath ID for this component */}
                            <clipPath id={`circleClip-${percentage}`}>
                              <circle cx={centerX} cy={centerY} r={radius} />
                            </clipPath>
                            {/* Liquid gradient */}
                            <linearGradient id={`liquidGradient-${percentage}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#1E88E5" stopOpacity="1" />
                              <stop offset="50%" stopColor="#1976D2" stopOpacity="1" />
                              <stop offset="100%" stopColor="#1565C0" stopOpacity="1" />
                            </linearGradient>
                          </defs>

                          {/* Full circle background (gray) */}
                          <circle
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            fill="#E5E7EB"
                          />

                          {/* Liquid fill from bottom to top - clipped to circle */}
                          <g clipPath={`url(#circleClip-${percentage})`}>
                            {/* Liquid body filling from bottom */}
                            <rect
                              x="0"
                              y={waterLevel}
                              width="100"
                              height={100 - waterLevel}
                              fill={`url(#liquidGradient-${percentage})`}
                            />

                            {/* Primary animated wave surface - more visible */}
                            <path
                              id={`wave1-${percentage}`}
                              d={`M -40 ${waterLevel} Q -20 ${waterLevel - 6} 0 ${waterLevel} Q 20 ${waterLevel - 6} 40 ${waterLevel} Q 60 ${waterLevel - 6} 80 ${waterLevel} Q 100 ${waterLevel - 6} 120 ${waterLevel} Q 140 ${waterLevel - 6} 160 ${waterLevel} L 160 100 L -40 100 Z`}
                              fill={`url(#liquidGradient-${percentage})`}
                            >
                              <animateTransform
                                attributeName="transform"
                                type="translate"
                                values="0 0; 40 0; 0 0"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="d"
                                values={`M -40 ${waterLevel} Q -20 ${waterLevel - 6} 0 ${waterLevel} Q 20 ${waterLevel - 6} 40 ${waterLevel} Q 60 ${waterLevel - 6} 80 ${waterLevel} Q 100 ${waterLevel - 6} 120 ${waterLevel} Q 140 ${waterLevel - 6} 160 ${waterLevel} L 160 100 L -40 100 Z;M -40 ${waterLevel} Q -20 ${waterLevel + 4} 0 ${waterLevel} Q 20 ${waterLevel + 4} 40 ${waterLevel} Q 60 ${waterLevel + 4} 80 ${waterLevel} Q 100 ${waterLevel + 4} 120 ${waterLevel} Q 140 ${waterLevel + 4} 160 ${waterLevel} L 160 100 L -40 100 Z;M -40 ${waterLevel} Q -20 ${waterLevel - 6} 0 ${waterLevel} Q 20 ${waterLevel - 6} 40 ${waterLevel} Q 60 ${waterLevel - 6} 80 ${waterLevel} Q 100 ${waterLevel - 6} 120 ${waterLevel} Q 140 ${waterLevel - 6} 160 ${waterLevel} L 160 100 L -40 100 Z`}
                                dur="1.8s"
                                repeatCount="indefinite"
                              />
                            </path>

                            {/* Secondary wave for depth - more pronounced */}
                            <path
                              id={`wave2-${percentage}`}
                              d={`M -40 ${waterLevel + 1} Q -20 ${waterLevel + 7} 0 ${waterLevel + 1} Q 20 ${waterLevel + 7} 40 ${waterLevel + 1} Q 60 ${waterLevel + 7} 80 ${waterLevel + 1} Q 100 ${waterLevel + 7} 120 ${waterLevel + 1} Q 140 ${waterLevel + 7} 160 ${waterLevel + 1} L 160 100 L -40 100 Z`}
                              fill={`url(#liquidGradient-${percentage})`}
                              opacity="0.85"
                            >
                              <animateTransform
                                attributeName="transform"
                                type="translate"
                                values="0 0; -40 0; 0 0"
                                dur="2.2s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="d"
                                values={`M -40 ${waterLevel + 1} Q -20 ${waterLevel + 7} 0 ${waterLevel + 1} Q 20 ${waterLevel + 7} 40 ${waterLevel + 1} Q 60 ${waterLevel + 7} 80 ${waterLevel + 1} Q 100 ${waterLevel + 7} 120 ${waterLevel + 1} Q 140 ${waterLevel + 7} 160 ${waterLevel + 1} L 160 100 L -40 100 Z;M -40 ${waterLevel + 1} Q -20 ${waterLevel - 3} 0 ${waterLevel + 1} Q 20 ${waterLevel - 3} 40 ${waterLevel + 1} Q 60 ${waterLevel - 3} 80 ${waterLevel + 1} Q 100 ${waterLevel - 3} 120 ${waterLevel + 1} Q 140 ${waterLevel - 3} 160 ${waterLevel + 1} L 160 100 L -40 100 Z;M -40 ${waterLevel + 1} Q -20 ${waterLevel + 7} 0 ${waterLevel + 1} Q 20 ${waterLevel + 7} 40 ${waterLevel + 1} Q 60 ${waterLevel + 7} 80 ${waterLevel + 1} Q 100 ${waterLevel + 7} 120 ${waterLevel + 1} Q 140 ${waterLevel + 7} 160 ${waterLevel + 1} L 160 100 L -40 100 Z`}
                                dur="2s"
                                repeatCount="indefinite"
                              />
                            </path>

                            {/* Third wave layer for more movement visibility */}
                            <path
                              id={`wave3-${percentage}`}
                              d={`M -40 ${waterLevel - 2} Q -20 ${waterLevel + 2} 0 ${waterLevel - 2} Q 20 ${waterLevel + 2} 40 ${waterLevel - 2} Q 60 ${waterLevel + 2} 80 ${waterLevel - 2} Q 100 ${waterLevel + 2} 120 ${waterLevel - 2} Q 140 ${waterLevel + 2} 160 ${waterLevel - 2} L 160 100 L -40 100 Z`}
                              fill={`url(#liquidGradient-${percentage})`}
                              opacity="0.7"
                            >
                              <animateTransform
                                attributeName="transform"
                                type="translate"
                                values="0 0; 30 0; 0 0"
                                dur="2.5s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="d"
                                values={`M -40 ${waterLevel - 2} Q -20 ${waterLevel + 2} 0 ${waterLevel - 2} Q 20 ${waterLevel + 2} 40 ${waterLevel - 2} Q 60 ${waterLevel + 2} 80 ${waterLevel - 2} Q 100 ${waterLevel + 2} 120 ${waterLevel - 2} Q 140 ${waterLevel + 2} 160 ${waterLevel - 2} L 160 100 L -40 100 Z;M -40 ${waterLevel - 2} Q -20 ${waterLevel - 5} 0 ${waterLevel - 2} Q 20 ${waterLevel - 5} 40 ${waterLevel - 2} Q 60 ${waterLevel - 5} 80 ${waterLevel - 2} Q 100 ${waterLevel - 5} 120 ${waterLevel - 2} Q 140 ${waterLevel - 5} 160 ${waterLevel - 2} L 160 100 L -40 100 Z;M -40 ${waterLevel - 2} Q -20 ${waterLevel + 2} 0 ${waterLevel - 2} Q 20 ${waterLevel + 2} 40 ${waterLevel - 2} Q 60 ${waterLevel + 2} 80 ${waterLevel - 2} Q 100 ${waterLevel + 2} 120 ${waterLevel - 2} Q 140 ${waterLevel + 2} 160 ${waterLevel - 2} L 160 100 L -40 100 Z`}
                                dur="2.2s"
                                repeatCount="indefinite"
                              />
                            </path>
                          </g>
                        </svg>
                      );
                    })()}
                    {/* Percentage text - white, centered */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "24px",
                          fontWeight: 700,
                          color: "#FFFFFF",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
                        }}
                      >
                        88%
                      </span>
                    </div>
                  </div>
                  {/* Complete Profile Button */}
                  <button
                    type="button"
                    onClick={() => router.push("/completion-profile")}
                    className="mt-3 text-left"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#1E88E5",
                      padding: 0,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#1565C0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#1E88E5";
                    }}
                  >
                    Complete Profile
                  </button>
                </div>
                {/* Right Side: Action Items in a row */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-row flex-wrap gap-3" style={{ marginTop: "16px" }}>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "#111827",
                        fontWeight: 400,
                      }}
                    >
                      → Add Resume
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "#111827",
                        fontWeight: 400,
                      }}
                    >
                      → Complete Skills
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "#111827",
                        fontWeight: 400,
                      }}
                    >
                      → Set Job Preferences
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Skill Insights */}
            <div
              className="bg-white p-4 border border-slate-200"
              style={{
                width: "350px",
                borderRadius: "10.78px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 2px rgba(23, 26, 31, 0.3), 0px 0px 0px rgba(0, 0, 0, 0)",
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "12px",
                }}
              >
                Your Skill Insights
              </p>
              <div className="space-y-4">
                {/* Strengths */}
                <div>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "8px",
                    }}
                  >
                    Strengths
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Project Management", "Data Analysis", "Communication", "Team Leadership"].map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-md text-xs"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          backgroundColor: "#D1FAE5",
                          color: "#065F46",
                          border: "1px solid #A7F3D0",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Gaps */}
                <div>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "8px",
                    }}
                  >
                    Gaps
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Machine Learning", "Cloud Computing", "DevOps"].map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-md text-xs"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          backgroundColor: "#FED7AA",
                          color: "#92400E",
                          border: "1px solid #FCD34D",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: CV Score */}
          <div className="flex justify-center flex-shrink-0">
            <div
              className="flex flex-col"
              style={{
                width: "400px",
                height: "480px",
                borderRadius: "19.88px",
                backgroundColor: "#FFFFFF",
                padding: "24px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 2px rgba(23, 26, 31, 0.3), 0px 0px 0px rgba(0, 0, 0, 0)",
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#111827",
                  alignSelf: "flex-start",
                }}
              >
                CV Score
              </p>
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="relative flex items-center justify-center" style={{ width: "220px", height: "220px" }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      {/* Gradient for filled portion: #63968f → #a39c5e → #d49e30 */}
                      <linearGradient id="cvScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#63968f" stopOpacity="1" />
                        <stop offset="50%" stopColor="#a39c5e" stopOpacity="1" />
                        <stop offset="100%" stopColor="#d49e30" stopOpacity="1" />
                      </linearGradient>
                    </defs>

                    {/* Background circle (unfilled portion - 28%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#dde7f5"
                      strokeWidth="5"
                    />

                    {/* Progress arc - 72% filled with gradient */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#cvScoreGradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${72 * 2.827} 283`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>

                  {/* Centered number "72" with gradient */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "80px",
                        fontWeight: 700,
                        background: "linear-gradient(to right, #63968f, #a39c5e, #d49e30)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      72
                    </span>
                  </div>
                </div>
                {/* "Based on AI-ATS analysis" text centered below circle */}
                <p
                  className="mt-4 text-center"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "17.39px",
                    lineHeight: "24.8px",
                    letterSpacing: "0px",
                    fontWeight: 400,
                    background: "linear-gradient(to right, #F59E0B, #FCD34D)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Based on AI-ATS analysis
                </p>
              </div>
              {/* Bottom section with text items */}
              <div className="mt-auto">
                <div className="flex w-full items-center justify-between" style={{
                  fontFamily: "Arimo, sans-serif",
                  fontSize: "20.89px",
                  lineHeight: "29.8px",
                  letterSpacing: "0px",
                  color: "#111827",
                  fontWeight: 400,
                }}>
                  <div className="flex items-center gap-2" style={{ justifyContent: "flex-start" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28A8DF" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span>Content</span>
                  </div>
                  <span style={{ fontSize: "20.89px", fontWeight: 400, textAlign: "right" }}>90</span>
                </div>
                <div className="mt-3 flex w-full items-center justify-between" style={{
                  fontFamily: "Arimo, sans-serif",
                  fontSize: "20.89px",
                  lineHeight: "29.8px",
                  letterSpacing: "0px",
                  color: "#111827",
                  fontWeight: 400,
                }}>
                  <div className="flex items-center gap-2" style={{ justifyContent: "flex-start" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Keywords</span>
                  </div>
                  <span style={{ fontSize: "20.89px", fontWeight: 400, textAlign: "right" }}>82</span>
                </div>
                <div className="mt-3 flex w-full items-center justify-between" style={{
                  fontFamily: "Arimo, sans-serif",
                  fontSize: "20.89px",
                  lineHeight: "29.8px",
                  letterSpacing: "0px",
                  color: "#111827",
                  fontWeight: 400,
                }}>
                  <div className="flex items-center gap-2" style={{ justifyContent: "flex-start" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span>Format</span>
                  </div>
                  <span style={{ fontSize: "20.89px", fontWeight: 400, textAlign: "right" }}>83</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Notifications */}
          <div className="space-y-6 flex-shrink-0" style={{ marginLeft: "30px" }}>
            <div className="rounded-2xl bg-white p-5 border border-slate-200" style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 2px rgba(23, 26, 31, 0.3), 0px 0px 0px rgba(0, 0, 0, 0)", minHeight: "380px" }}>
              <div className="mb-3 flex items-center justify-between">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Notifications
                </h2>
                <button
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  View All
                </button>
              </div>
              <div className="mt-2 space-y-3">
                {[
                  {
                    title: "New Job Alert: Senior UX Designer at Google",
                    time: "2 min ago",
                    iconColor: "#28A8DF",
                    bgColor: "#DBEAFE",
                    icon: (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#28A8DF" }}
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    ),
                  },
                  {
                    title: "Application Status Update: Data Scientist at Meta is under review",
                    time: "1 hr ago",
                    iconColor: "#22C55E",
                    bgColor: "#D1FAE5",
                    icon: (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#22C55E" }}
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                    ),
                  },
                  {
                    title: "Interview Scheduled: Product Manager at Amazon on Oct 26",
                    time: "3 hrs ago",
                    iconColor: "#EF4444",
                    bgColor: "#FEE2E2",
                    icon: (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#EF4444" }}
                      >
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                    ),
                  },
                  {
                    title: "New course recommended: Advanced React Hooks",
                    time: "1 day ago",
                    iconColor: "#F59E0B",
                    bgColor: "#FEF3C7",
                    icon: (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "#F59E0B" }}
                      >
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                      </svg>
                    ),
                  },
                ].map((item, idx) => (
                  <div
                    key={item.title}
                    className={`flex items-start gap-3 ${idx !== 0 ? "pt-3 border-t border-slate-200" : ""
                      }`}
                  >
                    <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: item.bgColor }}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "13px",
                          color: "#111827",
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="mt-1 text-xs"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          color: "#6B7280",
                        }}
                      >
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Courses */}
            <div
              className="bg-white border border-slate-200 rounded-2xl"
              style={{
                height: "651px",
                borderRadius: "18px",
                padding: "16px",
                backgroundColor: "#FFFFFF",
                opacity: 1,
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 2px rgba(23, 26, 31, 0.3), 0px 0px 0px rgba(0, 0, 0, 0)",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Recommended Courses
                </h2>
              </div>
              <div className="space-y-4">
                {[
                  {
                    title: "Mastering React Hooks",
                    duration: "4h 30m",
                    image: "/cv_1.jpg",
                  },
                  {
                    title: "Effective Communication in Tech",
                    duration: "2h 15m",
                    image: "/cv_2.jpg",
                  },
                ].map((course) => (
                  <div
                    key={course.title}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden mx-auto"
                    style={{ height: "260px", width: "90%", maxWidth: "320px" }}
                  >
                    {/* Image Header - Top 60% */}
                    <div
                      className="relative overflow-hidden"
                      style={{ height: "60%", minHeight: "156px" }}
                    >
                      <div style={{ filter: "blur(1px)", transform: "scale(1.05)", width: "100%", height: "100%" }}>
                        <Image
                          src={course.image}
                          alt={course.title}
                          width={400}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {/* Content Section - Bottom 40% */}
                    <div
                      className="flex flex-col justify-between p-3"
                      style={{ height: "40%", minHeight: "104px" }}
                    >
                      <div>
                        <p
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#111827",
                            marginBottom: "3px",
                          }}
                        >
                          {course.title}
                        </p>
                        <p
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "13px",
                            color: "#6B7280",
                          }}
                        >
                          {course.duration}
                        </p>
                      </div>
                      <button
                        className="mt-3 w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        View Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Third Row: Job Matches */}
        <div className="mb-6 flex items-start justify-center" style={{ marginTop: "-515px" }}>
          <div
            className="bg-white p-5 border border-slate-200"
            style={{
              width: "795px",
              height: "488px",
              borderRadius: "14px",
              backgroundColor: "#FFFFFF",
              opacity: 1,
              marginLeft: "-475px",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 2px rgba(23, 26, 31, 0.3), 0px 0px 0px rgba(0, 0, 0, 0)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Job Matches
              </h2>
              <button
                className="rounded-lg border border-sky-500 px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                View All Jobs
              </button>
            </div>
            <div className="space-y-4">
              {/* Job 1: Frontend Developer */}
              <div
                className="flex items-start gap-4 p-4"
                style={{
                  width: "731px",
                  height: "112px",
                  borderRadius: "14px",
                  backgroundColor: "#F6F5F5",
                  border: "1px solid #CECECE",
                  boxSizing: "border-box",
                  opacity: 1,
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.07)",
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: "#E0F2FE", border: "1px solid #BAE6FD" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Left wing - curved rectangle */}
                    <rect x="2" y="9" width="3.5" height="9" rx="1.5" fill="#0EA5E9" />
                    {/* Central structure - taller with arched entrance */}
                    <path d="M6.5 18V13C6.5 12.4477 6.94772 12 7.5 12H12.5C13.0523 12 13.5 12.4477 13.5 13V18H6.5Z" fill="#0EA5E9" />
                    <rect x="7.5" y="5" width="5" height="7" rx="0.5" fill="#0EA5E9" />
                    {/* Arched entrance base */}
                    <path d="M7.5 13C7.5 12.4477 7.94772 12 8.5 12H11.5C12.0523 12 12.5 12.4477 12.5 13V13.5C12.5 13.7761 12.2761 14 12 14H8C7.72386 14 7.5 13.7761 7.5 13.5V13Z" fill="#0EA5E9" />
                    {/* Windows - three horizontal lines */}
                    <line x1="8.5" y1="7.5" x2="11.5" y2="7.5" stroke="#0EA5E9" strokeWidth="0.8" />
                    <line x1="8.5" y1="9" x2="11.5" y2="9" stroke="#0EA5E9" strokeWidth="0.8" />
                    <line x1="8.5" y1="10.5" x2="11.5" y2="10.5" stroke="#0EA5E9" strokeWidth="0.8" />
                    {/* Right wing - curved rectangle */}
                    <rect x="14.5" y="9" width="3.5" height="9" rx="1.5" fill="#0EA5E9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    Frontend Developer
                  </h3>
                  <div className="mb-2 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                      <span>Tech Solutions Inc.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>New York, USA</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["React", "TypeScript", "UI/UX"].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      color: "#F59E0B",
                    }}
                  >
                    92% Match
                  </span>
                  <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Job 2: Backend Engineer */}
              <div
                className="flex items-start gap-4 p-4"
                style={{
                  width: "731px",
                  height: "112px",
                  borderRadius: "14px",
                  backgroundColor: "#F6F5F5",
                  border: "1px solid #CECECE",
                  boxSizing: "border-box",
                  opacity: 1,
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.07)",
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: "#D1FAE5", border: "1px solid #A7F3D0" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Left wing - curved rectangle */}
                    <rect x="2" y="9" width="3.5" height="9" rx="1.5" fill="#10B981" />
                    {/* Central structure - taller with arched entrance */}
                    <path d="M6.5 18V13C6.5 12.4477 6.94772 12 7.5 12H12.5C13.0523 12 13.5 12.4477 13.5 13V18H6.5Z" fill="#10B981" />
                    <rect x="7.5" y="5" width="5" height="7" rx="0.5" fill="#10B981" />
                    {/* Arched entrance base */}
                    <path d="M7.5 13C7.5 12.4477 7.94772 12 8.5 12H11.5C12.0523 12 12.5 12.4477 12.5 13V13.5C12.5 13.7761 12.2761 14 12 14H8C7.72386 14 7.5 13.7761 7.5 13.5V13Z" fill="#10B981" />
                    {/* Windows - three horizontal lines */}
                    <line x1="8.5" y1="7.5" x2="11.5" y2="7.5" stroke="#10B981" strokeWidth="0.8" />
                    <line x1="8.5" y1="9" x2="11.5" y2="9" stroke="#10B981" strokeWidth="0.8" />
                    <line x1="8.5" y1="10.5" x2="11.5" y2="10.5" stroke="#10B981" strokeWidth="0.8" />
                    {/* Right wing - curved rectangle */}
                    <rect x="14.5" y="9" width="3.5" height="9" rx="1.5" fill="#10B981" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    Backend Engineer
                  </h3>
                  <div className="mb-2 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                      <span>Global Innovations</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>San Francisco, USA</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Node.js", "Python", "AWS"].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      color: "#F59E0B",
                    }}
                  >
                    88% Match
                  </span>
                  <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Job 3: Data Analyst */}
              <div
                className="flex items-start gap-4 p-4"
                style={{
                  width: "731px",
                  height: "112px",
                  borderRadius: "14px",
                  backgroundColor: "#F6F5F5",
                  border: "1px solid #CECECE",
                  boxSizing: "border-box",
                  opacity: 1,
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.07)",
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Left wing - curved rectangle */}
                    <rect x="2" y="9" width="3.5" height="9" rx="1.5" fill="#F59E0B" />
                    {/* Central structure - taller with arched entrance */}
                    <path d="M6.5 18V13C6.5 12.4477 6.94772 12 7.5 12H12.5C13.0523 12 13.5 12.4477 13.5 13V18H6.5Z" fill="#F59E0B" />
                    <rect x="7.5" y="5" width="5" height="7" rx="0.5" fill="#F59E0B" />
                    {/* Arched entrance base */}
                    <path d="M7.5 13C7.5 12.4477 7.94772 12 8.5 12H11.5C12.0523 12 12.5 12.4477 12.5 13V13.5C12.5 13.7761 12.2761 14 12 14H8C7.72386 14 7.5 13.7761 7.5 13.5V13Z" fill="#F59E0B" />
                    {/* Windows - three horizontal lines */}
                    <line x1="8.5" y1="7.5" x2="11.5" y2="7.5" stroke="#F59E0B" strokeWidth="0.8" />
                    <line x1="8.5" y1="9" x2="11.5" y2="9" stroke="#F59E0B" strokeWidth="0.8" />
                    <line x1="8.5" y1="10.5" x2="11.5" y2="10.5" stroke="#F59E0B" strokeWidth="0.8" />
                    {/* Right wing - curved rectangle */}
                    <rect x="14.5" y="9" width="3.5" height="9" rx="1.5" fill="#F59E0B" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    Data Analyst
                  </h3>
                  <div className="mb-2 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                      <span>Data Insights Co.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>London, UK</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["SQL", "Python", "Tableau"].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      color: "#F59E0B",
                    }}
                  >
                    85% Match
                  </span>
                  <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px 6 py-4 text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 py-4 text-center md:flex-row md:text-left">
          <p>Terms of Use</p>
          <p>Privacy Policy</p>
          <p>Contact Support</p>
        </div>
      </footer>
    </div>
  );
}



"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Header from "../../components/common/Header";

const API_BASE_URL = "http://localhost:5000/api";

interface DashboardData {
  profile: {
    fullName: string;
    email: string;
    profilePhotoUrl: string | null;
    profileCompleteness: number;
  };
  stats: {
    totalApplications: number;
    activeApplications: number;
    interviews: number;
    savedJobs: number;
    profileCompleteness: number;
    cvScore: number;
    marketFit: number;
  };
  applicationStatus: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  notifications: Array<{
    id: string;
    text: string;
    time: string;
    type: string;
  }>;
  recentApplications: Array<{
    id: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedAt: string;
    matchScore: number | null;
  }>;
  topSkills: Array<{
    name: string;
    proficiency: string;
  }>;
  savedJobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string | null;
    savedAt: string;
  }>;
}

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    text: string;
    time: string;
    type: string;
  }>>([]);
  const [jobs, setJobs] = useState<Array<{
    id: string;
    title: string;
    company: string;
    location: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string | null;
    employmentType?: string;
    workMode?: string;
    postedAt: string;
    matchScore?: number | null;
  }>>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [recommendedCourses, setRecommendedCourses] = useState<Array<{
    id: string;
    title: string;
    provider: string;
    duration: string;
    level: string;
    rating?: number;
    imageUrl?: string;
  }>>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  
  // Dynamic Hiring Signals State
  const [hiringSignals, setHiringSignals] = useState({
    roles: ["Frontend Developer", "React Engineer", "UI Engineer"],
    locations: ["Remote", "Bangalore", "Berlin"],
    skills: ["React Hooks", "System Design", "AWS Basics"],
    marketFit: 78,
    bgColor: "#333333",
  });
  const [showHiringSignals, setShowHiringSignals] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cvAnalysis, setCvAnalysis] = useState<{
    cv_score: number;
    skills_level: string;
    experience_level: string;
    education_level: string;
  } | null>(null);
  const [profileCompleteness, setProfileCompleteness] = useState<{
    percentage: number;
    completedSections: string[];
    missingSections: string[];
  }>({
    percentage: 0,
    completedSections: [],
    missingSections: [],
  });

  // Fetch CV Analysis
  useEffect(() => {
    const fetchCvAnalysis = async () => {
      const candidateId = sessionStorage.getItem("candidateId");
      if (!candidateId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/cv-analysis/${candidateId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setCvAnalysis(result.data);
            // Update dashboard stats with CV score
            setDashboardData(prev => {
              if (prev) {
                return {
                  ...prev,
                  stats: {
                    ...prev.stats,
                    cvScore: result.data.cv_score,
                  },
                };
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error("Error fetching CV analysis:", error);
      }
    };

    fetchCvAnalysis();
  }, []);

  // Calculate profile completeness based on mandatory fields
  const calculateProfileCompleteness = async () => {
    const candidateId = sessionStorage.getItem("candidateId");
    if (!candidateId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/profile/${candidateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch profile data for completeness calculation');
        return;
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        return;
      }

      const profileData = result.data;

      // Check mandatory sections
      const mandatorySections = [
        { key: 'basicInformation', name: 'Basic Information', check: () => profileData.personalInfo && profileData.personalInfo.firstName && profileData.personalInfo.lastName && profileData.personalInfo.email },
        { key: 'summary', name: 'Summary', check: () => profileData.summaryText && profileData.summaryText.trim().length > 0 },
        { key: 'education', name: 'Education', check: () => profileData.education && Array.isArray(profileData.education) && profileData.education.length > 0 },
        { key: 'skills', name: 'Skills', check: () => profileData.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0 },
        { key: 'languages', name: 'Languages', check: () => profileData.languages && Array.isArray(profileData.languages) && profileData.languages.length > 0 },
        { key: 'projects', name: 'Projects', check: () => profileData.project && profileData.project.projects && Array.isArray(profileData.project.projects) && profileData.project.projects.length > 0 },
        { key: 'portfolioLinks', name: 'Portfolio Links', check: () => profileData.portfolioLinks && profileData.portfolioLinks.links && Array.isArray(profileData.portfolioLinks.links) && profileData.portfolioLinks.links.length > 0 },
        { key: 'careerPreferences', name: 'Career Preferences', check: () => profileData.careerPreferences !== undefined && profileData.careerPreferences !== null },
        { key: 'visaAuthorization', name: 'Visa & Work Authorization', check: () => profileData.visaWorkAuthorization !== undefined && profileData.visaWorkAuthorization !== null },
        { key: 'vaccination', name: 'Vaccination', check: () => profileData.vaccination !== undefined && profileData.vaccination !== null },
        { key: 'resume', name: 'Resume', check: () => profileData.resume && profileData.resume.fileUrl },
      ];

      const completedSections: string[] = [];
      const missingSections: string[] = [];

      mandatorySections.forEach(section => {
        if (section.check()) {
          completedSections.push(section.name);
        } else {
          missingSections.push(section.name);
        }
      });

      const completionPercentage = Math.round((completedSections.length / mandatorySections.length) * 100);

      setProfileCompleteness({
        percentage: completionPercentage,
        completedSections,
        missingSections,
      });
    } catch (error) {
      console.error('Error calculating profile completeness:', error);
    }
  };

  // Fetch profile completeness
  useEffect(() => {
    calculateProfileCompleteness();
  }, []);

  // Recalculate when dashboard data changes (e.g., after photo upload)
  useEffect(() => {
    if (dashboardData) {
      calculateProfileCompleteness();
    }
  }, [dashboardData]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const candidateId = sessionStorage.getItem("candidateId");
      if (!candidateId) {
        console.error("No candidate ID found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/cv/dashboard/${candidateId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setDashboardData(result.data);
            // Initialize notifications from dashboard data
            if (result.data.notifications && result.data.notifications.length > 0) {
              setNotifications(result.data.notifications);
            }
          }
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchApplicationStatus();
  }, []);

  // Fetch application status counts
  const fetchApplicationStatus = async () => {
    const candidateId = sessionStorage.getItem("candidateId");
    if (!candidateId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/applications/${candidateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const applications = result.data;
          
          // Count applications by status
          const statusCounts: { [key: string]: number } = {
            'Submitted': 0,
            'Under Review': 0,
            'Shortlisted': 0,
            'Assessment': 0,
            'Interview': 0,
            'Final Decision': 0,
            'Selected': 0,
            'Rejected': 0,
          };

          applications.forEach((app: any) => {
            const status = app.status;
            if (statusCounts.hasOwnProperty(status)) {
              statusCounts[status]++;
            }
          });

          // Map statuses to our display labels
          // "Submitted" maps to "Applied"
          const appliedCount = statusCounts['Submitted'] || 0;

          setApplicationStatus([
            { label: "Applied", value: appliedCount, color: "#FACC15" }, // Yellow
            { label: "Under Review", value: statusCounts['Under Review'] || 0, color: "#3B82F6" },
            { label: "Shortlisted", value: statusCounts['Shortlisted'] || 0, color: "#EC4899" },
            { label: "Assessment", value: statusCounts['Assessment'] || 0, color: "#8B5CF6" },
            { label: "Interview", value: statusCounts['Interview'] || 0, color: "#10B981" },
            { label: "Final Decision", value: statusCounts['Final Decision'] || 0, color: "#F59E0B" },
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (file: File) => {
    const candidateId = sessionStorage.getItem("candidateId");
    if (!candidateId) {
      console.error("No candidate ID found");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${API_BASE_URL}/profile/photo/${candidateId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.profilePhotoUrl) {
          // Refresh dashboard data to show new photo
          const dashboardResponse = await fetch(`${API_BASE_URL}/cv/dashboard/${candidateId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (dashboardResponse.ok) {
            const dashboardResult = await dashboardResponse.json();
            if (dashboardResult.success && dashboardResult.data) {
              setDashboardData(dashboardResult.data);
            }
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Failed to upload profile photo');
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      alert('Failed to upload profile photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Fetch jobs and seed if needed
  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        // Fetch jobs
        console.log("Fetching jobs from:", `${API_BASE_URL}/jobs?limit=5`);
        const response = await fetch(`${API_BASE_URL}/jobs?limit=5`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log("Jobs API response status:", response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log("Jobs API response data:", result);
          
          if (result.success && result.data) {
            // Handle both response formats: { data: { jobs: [...] } } or { data: { jobs: [...], count: ... } }
            const jobsArray = result.data.jobs || [];
            
            if (jobsArray.length > 0) {
              // Format jobs to match expected structure
              const formattedJobs = jobsArray.map((job: any) => ({
                id: job.id,
                title: job.title,
                company: job.company?.name || job.company || 'Unknown Company',
                location: job.location,
                salaryMin: job.salaryMin,
                salaryMax: job.salaryMax,
                salaryCurrency: job.salaryCurrency,
                employmentType: job.employmentType,
                workMode: job.workMode,
                postedAt: job.postedAt,
                matchScore: job.matchScore || null,
              }));
              
              console.log("Setting jobs:", formattedJobs);
              setJobs(formattedJobs);
            } else {
              console.warn("No jobs in response, attempting to seed...");
              // If no jobs found, try to seed
              try {
                const seedResponse = await fetch(`${API_BASE_URL}/jobs/seed`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                if (seedResponse.ok) {
                  const seedResult = await seedResponse.json();
                  console.log("Seed result:", seedResult);
                  // Retry fetching jobs after seeding
                  const retryResponse = await fetch(`${API_BASE_URL}/jobs?limit=5`);
                  if (retryResponse.ok) {
                    const retryResult = await retryResponse.json();
                    if (retryResult.success && retryResult.data?.jobs) {
                      const formattedJobs = retryResult.data.jobs.map((job: any) => ({
                        id: job.id,
                        title: job.title,
                        company: job.company?.name || job.company || 'Unknown Company',
                        location: job.location,
                        salaryMin: job.salaryMin,
                        salaryMax: job.salaryMax,
                        salaryCurrency: job.salaryCurrency,
                        employmentType: job.employmentType,
                        workMode: job.workMode,
                        postedAt: job.postedAt,
                        matchScore: job.matchScore || null,
                      }));
                      setJobs(formattedJobs);
                    }
                  }
                }
              } catch (seedError) {
                console.log("Seed endpoint not available:", seedError);
                setJobs([]);
              }
            }
          } else {
            console.warn("No jobs in response:", result);
            setJobs([]);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to fetch jobs:", response.status, errorData);
          setJobs([]);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch recommended courses
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      setCoursesLoading(true);
      try {
        // For now, use mock data. Later, replace with actual API call
        // const response = await fetch(`${API_BASE_URL}/courses/recommended?candidateId=${candidateId}`);
        
        // Mock recommended courses data
        const mockCourses = [
          {
            id: "1",
            title: "Advanced React Development",
            provider: "Udemy",
            duration: "12 hours",
            level: "Intermediate",
            rating: 4.8,
          },
          {
            id: "2",
            title: "Node.js Backend Mastery",
            provider: "Coursera",
            duration: "8 weeks",
            level: "Advanced",
            rating: 4.6,
          },
          {
            id: "3",
            title: "AWS Cloud Practitioner",
            provider: "AWS Training",
            duration: "20 hours",
            level: "Beginner",
            rating: 4.9,
          },
          {
            id: "4",
            title: "Docker & Kubernetes",
            provider: "Pluralsight",
            duration: "15 hours",
            level: "Intermediate",
            rating: 4.7,
          },
          {
            id: "5",
            title: "TypeScript Fundamentals",
            provider: "FreeCodeCamp",
            duration: "10 hours",
            level: "Beginner",
            rating: 4.5,
          },
        ];

        // Simulate API delay
        setTimeout(() => {
          setRecommendedCourses(mockCourses);
          setCoursesLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching recommended courses:", error);
        setCoursesLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, []);

  // Dynamic Hiring Signals and Courses - Alternate every 5 seconds with slide animation
  useEffect(() => {
    // Data sets for rotation
    const rolesSets = [
      ["Frontend Developer", "React Engineer", "UI Engineer"],
      ["Full Stack Developer", "Node.js Developer", "Vue.js Engineer"],
      ["Backend Engineer", "Python Developer", "DevOps Engineer"],
      ["Mobile Developer", "iOS Developer", "Android Developer"],
      ["Data Scientist", "ML Engineer", "AI Specialist"],
      ["Product Manager", "Technical Lead", "Architecture Engineer"],
    ];

    const locationsSets = [
      ["Remote", "Bangalore", "Berlin"],
      ["San Francisco", "New York", "London"],
      ["Toronto", "Sydney", "Singapore"],
      ["Dubai", "Mumbai", "Tokyo"],
      ["Amsterdam", "Paris", "Stockholm"],
      ["Austin", "Seattle", "Boston"],
    ];

    const skillsSets = [
      ["React Hooks", "System Design", "AWS Basics"],
      ["TypeScript", "GraphQL", "Docker"],
      ["Kubernetes", "Microservices", "CI/CD"],
      ["Machine Learning", "Data Analytics", "Python"],
      ["Agile", "Scrum", "Product Management"],
      ["Cloud Architecture", "Security", "Performance"],
    ];

    const marketFitValues = [78, 82, 85, 79, 88, 75, 83, 87, 80, 86];

    const bgColors = [
      "#333333", // Dark gray
      "#1E3A5F", // Dark blue
      "#2D1B3D", // Dark purple
      "#1A2E1A", // Dark green
      "#3D1F1F", // Dark red
      "#2D2D1A", // Dark yellow-green
      "#1F3D3D", // Dark teal
      "#3D2D1F", // Dark brown
      "#2D1F3D", // Dark indigo
      "#1F2D3D", // Dark navy
    ];

    let toggleInterval: NodeJS.Timeout;
    let dataUpdateInterval: NodeJS.Timeout;

    // Toggle between Hiring Signals and Courses every 5 seconds
    toggleInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setShowHiringSignals((prev) => !prev);
        setIsAnimating(false);
      }, 300); // Half of animation duration
    }, 5000); // Switch every 5 seconds

    // Update data and background color every second
    dataUpdateInterval = setInterval(() => {
      const rolesIndex = Math.floor(Math.random() * rolesSets.length);
      const locationsIndex = Math.floor(Math.random() * locationsSets.length);
      const skillsIndex = Math.floor(Math.random() * skillsSets.length);
      const marketFitIndex = Math.floor(Math.random() * marketFitValues.length);
      const bgColorIndex = Math.floor(Math.random() * bgColors.length);

      setHiringSignals({
        roles: rolesSets[rolesIndex],
        locations: locationsSets[locationsIndex],
        skills: skillsSets[skillsIndex],
        marketFit: marketFitValues[marketFitIndex],
        bgColor: bgColors[bgColorIndex],
      });
    }, 1000); // Change data every second

    return () => {
      clearInterval(toggleInterval);
      clearInterval(dataUpdateInterval);
    };
  }, [showHiringSignals]);

  // Rotate notifications only if there are notifications
  useEffect(() => {
    if (notifications.length === 0) return;

    const interval = setInterval(() => {
      setIsRotating(true);
      setTimeout(() => {
        setNotifications((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          const first = next.shift();
          if (first) next.push(first);
          return next;
        });
        setIsRotating(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  // Application status state
  const [applicationStatus, setApplicationStatus] = useState([
    { label: "Applied", value: 0, color: "#FACC15" }, // Yellow
    { label: "Under Review", value: 0, color: "#3B82F6" }, // Blue
    { label: "Shortlisted", value: 0, color: "#EC4899" }, // Pink
    { label: "Assessment", value: 0, color: "#8B5CF6" }, // Purple
    { label: "Interview", value: 0, color: "#10B981" }, // Green
    { label: "Final Decision", value: 0, color: "#F59E0B" }, // Orange
  ]);

  const totalApplications = applicationStatus.reduce((sum, item) => sum + item.value, 0);

  const applicationSegments = (() => {
    const segments: {
      label: string;
      value: number;
      color: string;
      dashArray: string;
      offset: number;
    }[] = [];
    
    // If no applications, return empty segments array to avoid division by zero
    if (totalApplications === 0) {
      return segments;
    }
    
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
    
    // If no applications, return empty gaps array to avoid division by zero
    if (totalApplications === 0) {
      return gaps;
    }
    
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

  // Show loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #fde9d4, #fafbfb, #bddffb)",
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#6B7280" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #fde9d4, #fafbfb, #bddffb)",
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .job-listings-scroll::-webkit-scrollbar {
            display: none;
          }
          .job-listings-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .recommended-courses-scroll::-webkit-scrollbar {
            display: none;
          }
          .recommended-courses-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `
      }} />
      {/* Header */}
      <Header />

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
        className={`fixed left-0 top-0 h-full w-64 backdrop-blur-xl bg-white/90 shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: "Inter, sans-serif",
          zIndex: 9999,
          borderRight: "1px solid rgba(255, 255, 255, 0.2)",
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
              onClick={() => router.push("/explore-jobs")}
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


      {/* Main Content */}
      <main className="mx-auto max-w-[1414px] px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            {/* Welcome Message and Icons - Same Row */}
            <div className="flex items-center justify-between mb-8">
              {/* Welcome Text - Left Side */}
              <div style={{ position: "relative", left: "-24px" }}>
                <h1
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "36px",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: "8px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Welcome {dashboardData?.profile?.fullName?.split(' ')[0] || 'User'} !
                </h1>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    color: "#6B7280",
                    fontWeight: 400,
                  }}
                >
                  Your AI-powered job search dashboard. Last updated today.
                </p>
              </div>

              {/* Quick Action Icons - Right Side */}
              <div className="flex items-center gap-4">
                {/* Search Icon - Expands to Input */}
                <div
                  className="group relative h-12 rounded-full flex items-center transition-all duration-700 ease-in-out cursor-pointer shadow-md overflow-hidden"
                  style={{
                    backgroundColor: "#1F2937", // Default Slate-800
                    width: "48px", // Default width (w-12)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.width = "300px";
                    e.currentTarget.style.backgroundColor = "#FCCD2A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.width = "48px";
                    e.currentTarget.style.backgroundColor = "#1F2937";
                  }}
                >
                  <div className="flex items-center justify-center w-12 h-12 shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white group-hover:text-black transition-colors duration-300"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Explore Jobs"
                    className="bg-transparent border-none outline-none text-black placeholder-gray-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75"
                    style={{
                      width: "200px",
                      marginLeft: "4px",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        router.push("/explore-jobs");
                      }
                    }}
                  />
                </div>

                {/* Edit Icon - AI CV Editor */}
                <div
                  className="group relative h-12 rounded-full flex items-center transition-all duration-700 ease-in-out cursor-pointer shadow-md overflow-hidden"
                  style={{
                    backgroundColor: "#1F2937",
                    width: "48px",
                  }}
                  onClick={() => router.push("/aicveditor")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.width = "180px"; // Adjust width as needed for text
                    e.currentTarget.style.backgroundColor = "#FCCD2A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.width = "48px";
                    e.currentTarget.style.backgroundColor = "#1F2937";
                  }}
                >
                  <div className="flex items-center justify-center w-12 h-12 shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white group-hover:text-black transition-colors duration-300"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </div>
                  <span className="text-black text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 ml-2">
                    AI CV Editor
                  </span>
                </div>

                {/* Grid Icon - Application Management */}
                <div
                  className="group relative h-12 rounded-full flex items-center transition-all duration-700 ease-in-out cursor-pointer shadow-md overflow-hidden"
                  style={{
                    backgroundColor: "#1F2937",
                    width: "48px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.width = "240px";
                    e.currentTarget.style.backgroundColor = "#FCCD2A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.width = "48px";
                    e.currentTarget.style.backgroundColor = "#1F2937";
                  }}
                  onClick={() => router.push("/applications")}
                >
                  <div className="flex items-center justify-center w-12 h-12 shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white group-hover:text-black transition-colors duration-300"
                    >
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </div>
                  <span className="text-black text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 ml-2">
                    Application Management
                  </span>
                </div>

                {/* Graduation Cap Icon - Skill Enhancement */}
                <div
                  className="group relative h-12 rounded-full flex items-center transition-all duration-700 ease-in-out cursor-pointer shadow-md overflow-hidden"
                  style={{
                    backgroundColor: "#1F2937",
                    width: "48px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.width = "200px";
                    e.currentTarget.style.backgroundColor = "#FCCD2A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.width = "48px";
                    e.currentTarget.style.backgroundColor = "#1F2937";
                  }}
                  onClick={() => router.push("/courses")}
                >
                  <div className="flex items-center justify-center w-12 h-12 shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white group-hover:text-black transition-colors duration-300"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                  </div>
                  <span className="text-black text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 ml-2">
                    Skill Enhancement
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* First Row: Three Columns - Profile, Application Status, Notifications */}
          <div className="flex items-start justify-center mb-6" style={{ gap: "24px" }}>
            {/* Left Column: Profile Card */}
            <div className="shrink-0">
              <div
                className="bg-white rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{
                  width: "356px",
                  height: "377px",
                  borderRadius: "6px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  padding: "24px",
                }}
              >
                {/* Section 1: Profile Completion (Top Row) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  {/* Profile Icon at Top */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to upload profile photo"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePhotoUpload(file);
                        }
                      }}
                      className="hidden"
                    />
                    {dashboardData?.profile?.profilePhotoUrl ? (() => {
                      const photoUrl = dashboardData.profile.profilePhotoUrl;
                      
                      if (!photoUrl || photoUrl.trim() === '') {
                        return (
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#6B7280"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        );
                      }
                      
                      let imageSrc: string;
                      
                      // Handle data URLs (base64 images)
                      if (photoUrl.startsWith('data:')) {
                        imageSrc = photoUrl;
                      } else if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                        imageSrc = photoUrl;
                      } else {
                        // Construct full URL for relative paths
                        const baseUrl = API_BASE_URL.replace('/api', '');
                        const cleanPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
                        imageSrc = `${baseUrl}${cleanPath}`;
                      }
                      
                      return (
                        <Image
                          src={imageSrc}
                          alt={dashboardData?.profile?.fullName || "Profile"}
                          fill
                          style={{
                            objectFit: "contain",
                            borderRadius: "50%",
                          }}
                          unoptimized
                          onError={(e) => {
                            console.error('Image failed to load:', imageSrc);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      );
                    })() : (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                    {/* Edit Icon Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#0EA5E9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white",
                        cursor: "pointer",
                        zIndex: 10,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </div>
                    {isUploadingPhoto && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0",
                          left: "0",
                          right: "0",
                          bottom: "0",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          zIndex: 20,
                        }}
                      >
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  {/* Profile Completion Text and Percentage in One Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#111827",
                        margin: 0,
                      }}
                    >
                      Profile Completion
                    </h3>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#111827",
                        lineHeight: "1",
                      }}
                    >
                      {profileCompleteness.percentage}%
                    </span>
                  </div>

                  {/* View Details with Info Icon */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                    onClick={() => router.push("/profile")}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#6B7280",
                        }}
                      >
                        i
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "16px",
                        color: "#6B7280",
                        fontWeight: 500,
                      }}
                    >
                      View Details
                    </span>
                  </div>
                </div>

                {/* Horizontal Divider Line */}
                <div
                  style={{
                    width: "100%",
                    minHeight: "2px",
                    height: "2px",
                    backgroundColor: "#000000",
                    marginTop: "10px",
                    marginBottom: "20px",
                    flexShrink: 0,
                    display: "block",
                  }}
                />

                {/* Section 2: CV Score (Bottom Row) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginTop: "0px",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <h2
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "18px",
                        fontWeight: 300,
                        color: "#111827",
                        margin: 0,
                      }}
                    >
                      CV Score
                    </h2>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "32px",
                        fontWeight: 300,
                        color: "#111827",
                      }}
                    >
                      {cvAnalysis?.cv_score || dashboardData?.stats?.cvScore || 82}%
                    </span>
                  </div>

                  {/* Segmented Capsule Graph */}
                  <div className="relative">
                    {/* Labels row */}
                    <div className="flex w-full mb-2" style={{ paddingLeft: "8px" }}>
                      <div style={{ width: "40%" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9CA3AF", fontWeight: 400 }}>Skills</span>
                      </div>
                      <div style={{ width: "35%", paddingLeft: "6px" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9CA3AF", fontWeight: 400 }}>Exp</span>
                      </div>
                      <div style={{ width: "25%", paddingLeft: "6px" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9CA3AF", fontWeight: 400 }}>Edu</span>
                      </div>
                    </div>
                    {/* Capsule row */}
                    <div className="flex w-full h-[40px] rounded-full overflow-hidden shadow-inner">
                      {/* Skills Segment */}
                      <div
                        className="h-full flex items-center justify-center bg-[#FFD65C]"
                        style={{ width: "40%" }}
                      >
                        <span className="text-[12px] text-[#111827] font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                          {cvAnalysis?.skills_level || "High"}
                        </span>
                      </div>
                      {/* Exp Segment */}
                      <div
                        className="h-full flex items-center justify-center bg-[#232931]"
                        style={{ width: "35%", borderLeft: "2px solid #FFFFFF", borderRight: "2px solid #FFFFFF" }}
                      >
                        <span className="text-[12px] text-white font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                          {cvAnalysis?.experience_level || "Good"}
                        </span>
                      </div>
                      {/* Edu Segment */}
                      <div
                        className="h-full flex items-center justify-center bg-[#A4ADB8]"
                        style={{ width: "25%" }}
                      >
                        <span className="text-[12px] text-white font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                          {cvAnalysis?.education_level || "Avg"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Application Status */}
            <div className="shrink-0">
              <div
                className="shrink-0 bg-white transition-all duration-300 hover:scale-[1.01]"
                style={{
                  width: "580px",
                  height: "378px",
                  borderRadius: "6px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
                  padding: "24px",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/applications")}
              >
                <h2
                  className="mb-4"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Application Status
                </h2>
                <div className="flex items-start gap-6" style={{ marginLeft: "10px", marginTop: "37.68px" }}>
                  <div
                    className="relative shrink-0"
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
                      {/* Default blue circle when no applications */}
                      {totalApplications === 0 && (
                        <g transform="rotate(-90 18 18)">
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="4.5"
                            strokeDasharray="100 0"
                            strokeDashoffset="0"
                            strokeLinecap="butt"
                            strokeOpacity="1"
                            strokeLinejoin="miter"
                          />
                        </g>
                      )}
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
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Job Listings */}
            <div className="shrink-0">
              <div
                className="bg-white transition-all duration-300 hover:scale-[1.01] w-full max-w-full mx-auto h-full"
                style={{
                  width: "430px",
                  height: "378px",
                  borderRadius: "6px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <h2
                  className="mb-4"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Job Listings
                </h2>
                <div 
                  className="flex flex-col overflow-y-auto overflow-x-hidden job-listings-scroll" 
                  style={{ 
                    gap: "12px", 
                    height: "300px",
                    paddingRight: "0px",
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none", // IE and Edge
                  }}
                >
                  {jobsLoading ? (
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        height: "200px",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                    >
                      Loading jobs...
                    </div>
                  ) : jobs && jobs.length > 0 ? (
                    jobs.map((job) => {
                      // Format work mode for display
                      const formatWorkMode = (mode: string | undefined) => {
                        if (!mode) return '';
                        return mode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      };

                      // Format salary for display
                      const formatSalary = (): string | null => {
                        if ((!job.salaryMin || job.salaryMin === 0) && (!job.salaryMax || job.salaryMax === 0)) return null;
                        const currency = job.salaryCurrency || 'USD';
                        const min = job.salaryMin && job.salaryMin > 0 ? Math.round(job.salaryMin / 1000) + 'k' : '';
                        const max = job.salaryMax && job.salaryMax > 0 ? Math.round(job.salaryMax / 1000) + 'k' : '';
                        if (min && max) return `${currency} ${min}-${max}`;
                        return `${currency} ${min || max}`;
                      };

                      // Calculate or get match score (default to a random score between 75-95 for demo)
                      const matchScore = job.matchScore || Math.floor(Math.random() * 21) + 75;
                      
                      // Determine match score color based on value
                      const getMatchScoreColor = (score: number) => {
                        if (score >= 90) return "#10B981"; // Green for high match
                        if (score >= 80) return "#3B82F6"; // Blue for good match
                        if (score >= 70) return "#F59E0B"; // Orange for moderate match
                        return "#EF4444"; // Red for low match
                      };

                      return (
                        <div
                          key={job.id}
                          className="flex flex-col shrink-0 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer bg-white"
                          style={{
                            padding: "16px",
                            margin: "0",
                            marginBottom: "0px",
                            minHeight: "120px",
                            maxHeight: "none",
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                            flexShrink: 0,
                            position: "relative",
                          }}
                          onClick={() => router.push(`/explore-jobs`)}
                        >
                          {/* Match Score Badge - Top Right Corner */}
                          {matchScore && (
                            <div
                              style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                backgroundColor: getMatchScoreColor(matchScore),
                                color: "#FFFFFF",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontFamily: "Inter, sans-serif",
                                fontSize: "11px",
                                fontWeight: 600,
                                zIndex: 10,
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              {matchScore}% Match
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-3" style={{ width: "100%" }}>
                            <div className="flex-1 min-w-0">
                              <h3
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "15px",
                                  fontWeight: 600,
                                  color: "#111827",
                                  marginBottom: "6px",
                                  lineHeight: "1.3",
                                }}
                              >
                                {job.title}
                              </h3>
                              <p
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "13px",
                                  color: "#4B5563",
                                  fontWeight: 500,
                                  marginBottom: "8px",
                                }}
                              >
                                {job.company}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                {job.location && (
                                  <div className="flex items-center gap-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                      <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    <span
                                      style={{
                                        fontFamily: "Inter, sans-serif",
                                        fontSize: "13px",
                                        color: "#6B7280",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {job.location}
                                    </span>
                                  </div>
                                )}
                                {job.workMode && (
                                  <span
                                    className="px-2 py-1 rounded-md text-xs font-medium"
                                    style={{
                                      backgroundColor: job.workMode === 'REMOTE' ? "#EFF6FF" : job.workMode === 'HYBRID' ? "#F0FDF4" : "#FEF3C7",
                                      color: job.workMode === 'REMOTE' ? "#1E40AF" : job.workMode === 'HYBRID' ? "#166534" : "#92400E",
                                      fontFamily: "Inter, sans-serif",
                                    }}
                                  >
                                    {formatWorkMode(job.workMode)}
                                  </span>
                                )}
                                {job.employmentType && (
                                  <span
                                    className="px-2 py-1 rounded-md text-xs"
                                    style={{
                                      backgroundColor: "#F3F4F6",
                                      color: "#6B7280",
                                      fontFamily: "Inter, sans-serif",
                                    }}
                                  >
                                    {job.employmentType.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                              {formatSalary() && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                  </svg>
                                  <p
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: "14px",
                                      color: "#10B981",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {formatSalary()} /year
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="shrink-0">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      className="flex items-center justify-center"
                      style={{
                        height: "200px",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#9CA3AF",
                      }}
                    >
                      {loading ? "Loading jobs..." : "No jobs available"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Second Row: Application Tasks and CV Score Tracker */}
          <div className="flex items-start justify-center mb-6" style={{ gap: "24px" }}>
            {/* Left: Hiring Signals Card */}
            <div className="shrink-0">
              <div
                className="shrink-0 transition-all duration-500 hover:scale-[1.01]"
                style={{
                  width: "960px",
                  height: "229px",
                  borderRadius: "6px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                  padding: "24px",
                  position: "relative",
                  color: "#FFFFFF",
                  backgroundColor: hiringSignals.bgColor,
                }}
              >
                {/* Content Container with Slide Animation */}
                <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
                  {/* Hiring Signals View */}
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      transform: showHiringSignals ? "translateY(0)" : "translateY(-100%)",
                      opacity: showHiringSignals ? 1 : 0,
                      transition: "transform 0.6s ease-in-out, opacity 0.6s ease-in-out",
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "20px",
                            fontWeight: 400,
                            marginBottom: "4px",
                          }}
                        >
                          Hiring Signals for You
                        </h2>
                        <p
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "13px",
                            color: "#9CA3AF",
                          }}
                        >
                          AI insights based on current job market & your profile
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#FFFFFF",
                        }}
                      >
                        View Job Trends
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>

                    {/* Grid Content */}
                    <div className="grid grid-cols-[1.2fr_1fr_1.5fr_1fr] gap-4">
                  {/* Roles in Demand */}
                  <div>
                    <h3 style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", marginBottom: "12px", letterSpacing: "0.05em" }}>ROLES IN DEMAND</h3>
                    <div className="space-y-3">
                      {hiringSignals.roles.map((role, index) => (
                        <div key={`${role}-${index}`} className="group flex items-center gap-2 text-[13px] font-medium cursor-pointer transition-all duration-300 hover:translate-x-1">
                          <span className="group-hover:text-orange-400 transition-colors duration-300">{role}</span>
                          {index < 2 ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110">
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                              <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Locations */}
                  <div>
                    <h3 style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", marginBottom: "12px", letterSpacing: "0.05em" }}>TOP LOCATIONS</h3>
                    <div className="space-y-3">
                      {hiringSignals.locations.map((location, index) => (
                        <div key={`${location}-${index}`} className="group flex items-center gap-2 text-[13px] text-gray-300 cursor-pointer transition-all duration-300 group-hover:text-orange-400">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }} className="transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {location}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", marginBottom: "12px", letterSpacing: "0.05em" }}>SKILLS INCREASING INTERVIEW CHANCES</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {hiringSignals.skills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="px-2 py-1 rounded-full bg-[#4B4B4B] text-[11px] font-medium text-gray-200 text-center cursor-pointer transition-all duration-300 hover:bg-[#F97316] hover:scale-105 hover:text-black active:scale-95 shadow-sm"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Market Fit */}
                  <div className="group cursor-pointer">
                    <h3 style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", marginBottom: "10px", letterSpacing: "0.05em" }}>YOUR MARKET FIT</h3>
                    <div className="flex flex-col">
                      <span className="transition-all duration-500 group-hover:scale-110 origin-left" style={{ fontSize: "32px", fontWeight: 400, color: "#F97316", lineHeight: "1" }}>{hiringSignals.marketFit}%</span>
                      <span style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "8px", marginBottom: "12px" }}>match with current openings</span>
                      <div className="relative w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#F97316] rounded-full transition-all duration-700 ease-out group-hover:shadow-[0_0_8px_rgba(249,115,22,0.6)]" style={{ width: `${hiringSignals.marketFit}%` }}></div>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                    </div>
                  </div>

                  {/* Courses View */}
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      transform: !showHiringSignals ? "translateY(0)" : "translateY(100%)",
                      opacity: !showHiringSignals ? 1 : 0,
                      transition: "transform 0.6s ease-in-out, opacity 0.6s ease-in-out",
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "20px",
                            fontWeight: 400,
                            marginBottom: "4px",
                          }}
                        >
                          Recommended Courses
                        </h2>
                        <p
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "13px",
                            color: "#9CA3AF",
                          }}
                        >
                          Enhance your skills with these trending courses
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#FFFFFF",
                        }}
                        onClick={() => router.push("/courses")}
                      >
                        View All Courses
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>

                    {/* Courses Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {recommendedCourses.slice(0, 3).map((course) => (
                        <div
                          key={course.id}
                          className="flex flex-col p-3 rounded-lg border border-gray-600 hover:border-orange-400 transition-all cursor-pointer"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                          }}
                          onClick={() => router.push(`/courses/${course.id}`)}
                        >
                          <h3
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "14px",
                              fontWeight: 600,
                              marginBottom: "8px",
                              lineHeight: "1.3",
                            }}
                          >
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "11px",
                                color: "#9CA3AF",
                              }}
                            >
                              {course.provider}
                            </span>
                            <span style={{ color: "#9CA3AF" }}>•</span>
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "11px",
                                color: "#9CA3AF",
                              }}
                            >
                              {course.duration}
                            </span>
                          </div>
                          {course.level && (
                            <span
                              className="inline-block px-2 py-1 rounded text-xs mt-auto"
                              style={{
                                backgroundColor: course.level === 'Beginner' ? "rgba(59, 130, 246, 0.2)" : course.level === 'Intermediate' ? "rgba(34, 197, 94, 0.2)" : "rgba(249, 115, 22, 0.2)",
                                color: course.level === 'Beginner' ? "#93C5FD" : course.level === 'Intermediate' ? "#86EFAC" : "#FCD34D",
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 500,
                                width: "fit-content",
                              }}
                            >
                              {course.level}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Recommended Courses Card */}
            <div className="shrink-0">
              <div
                className="shrink-0 bg-white transition-all duration-300 hover:scale-[1.01]"
                style={{
                  width: "430px",
                  height: "229px",
                  borderRadius: "6px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <h2
                  className="mb-4"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Recommended Courses
                </h2>
                
                {/* Courses List */}
                <div 
                  className="flex flex-col overflow-y-auto overflow-x-hidden recommended-courses-scroll" 
                  style={{ 
                    gap: "10px", 
                    height: "160px",
                    paddingRight: "0px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {coursesLoading ? (
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        height: "100px",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#6B7280",
                      }}
                    >
                      Loading courses...
                    </div>
                  ) : recommendedCourses && recommendedCourses.length > 0 ? (
                    recommendedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-start gap-3 shrink-0 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
                        style={{
                          margin: "0",
                          marginBottom: "0px",
                          minHeight: "70px",
                          width: "100%",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                          flexShrink: 0,
                          position: "relative",
                        }}
                        onClick={() => router.push(`/courses/${course.id}`)}
                      >
                        <div className="flex-1 min-w-0">
                          <h3
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#111827",
                              marginBottom: "4px",
                              lineHeight: "1.3",
                            }}
                          >
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "11px",
                                color: "#6B7280",
                              }}
                            >
                              {course.provider}
                            </span>
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "11px",
                                color: "#9CA3AF",
                              }}
                            >
                              •
                            </span>
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "11px",
                                color: "#6B7280",
                              }}
                            >
                              {course.duration}
                            </span>
                            {course.rating && (
                              <>
                                <span
                                  style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "11px",
                                    color: "#9CA3AF",
                                  }}
                                >
                                  •
                                </span>
                                <div className="flex items-center gap-1">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                  </svg>
                                  <span
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: "11px",
                                      color: "#6B7280",
                                    }}
                                  >
                                    {course.rating}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {course.level && (
                            <span
                              className="inline-block mt-2 px-2 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: course.level === 'Beginner' ? "#EFF6FF" : course.level === 'Intermediate' ? "#F0FDF4" : "#FEF3C7",
                                color: course.level === 'Beginner' ? "#1E40AF" : course.level === 'Intermediate' ? "#166534" : "#92400E",
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 500,
                              }}
                            >
                              {course.level}
                            </span>
                          )}
                        </div>
                        <div className="shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="flex items-center justify-center"
                      style={{
                        height: "100px",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#9CA3AF",
                      }}
                    >
                      No courses available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fourth Row: Other Cards */}
          <div className="flex items-start justify-center mb-6" style={{ gap: "24px" }}>
            {/* Left Column */}
            <div className="flex flex-col gap-6" style={{ width: "244px" }}>
              {/* Additional content can go here */}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 py-4 text-center md:flex-row md:text-left">
          <p>Terms of Use</p>
          <p>Privacy Policy</p>
          <p>Contact Support</p>
        </div>
      </footer>
    </div>
  );
}

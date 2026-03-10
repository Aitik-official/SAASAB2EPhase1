'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '../../components/common/Footer';
import SearchView from '../../components/ui/SearchView';
import EditText from '../../components/ui/EditText';
import Dropdown from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import Image from 'next/image';
import ApplicationSuccessModal from '../../components/modals/ApplicationSuccessModal';
import DashboardContainer from '../../components/layout/DashboardContainer';

const API_BASE_URL = "http://localhost:5000/api";

interface JobListing {
  id: number | string
  title: string
  company: string
  logo: string
  location: string
  salary: string
  type: string
  skills: string[]
  match: string
  timeAgo: string
  isHighlighted?: boolean
  description: string
  responsibilities: string[]
  requiredSkills: string[]
  niceToHaveSkills?: string[]
  companyOverview: string
  experienceLevel: string
  department?: string
  workMode: string
  industry: string
  visaAvailability: string
  applicantCount: string
  postedDate: string
  strengths?: string[]
  gaps?: string[]
}

const DashboardPage = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid')
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid')
  const [isScreeningModalOpen, setIsScreeningModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())

  // Screening form states
  const [experienceAnswer, setExperienceAnswer] = useState<string | null>('yes')
  const [nightShiftFocused, setNightShiftFocused] = useState(false)
  const [nightShiftValue, setNightShiftValue] = useState('')
  const [excelProficiency, setExcelProficiency] = useState(0) // 0 = Beginner, 100 = Expert
  const [joiningAvailability, setJoiningAvailability] = useState<string | null>(null)

  // Dropdown options
  const jobTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ]

  const workModeOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'on-site', label: 'On-site' }
  ]

  const experienceLevelOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' }
  ]

  const salaryRangeOptions = [
    { value: '0-50k', label: '$0 - $50k' },
    { value: '50k-100k', label: '$50k - $100k' },
    { value: '100k-150k', label: '$100k - $150k' },
    { value: '150k+', label: '$150k+' }
  ]

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' }
  ]

  useEffect(() => {
    loadJobListings()
  }, [])

  const formatTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const postedDate = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = now.getTime() - postedDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Just now';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null, type: string | null): string => {
    if (!min && !max) return 'Salary not specified';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency || '$';
    const typeLabel = type === 'ANNUAL' ? '/year' : type === 'MONTHLY' ? '/month' : type === 'HOURLY' ? '/hour' : '';
    
    if (min && max) {
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}${typeLabel}`;
    }
    if (min) {
      return `${currencySymbol}${min.toLocaleString()}+${typeLabel}`;
    }
    return `${currencySymbol}${max?.toLocaleString()}${typeLabel}`;
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const loadJobListings = async () => {
    try {
      setLoading(true);
      
      // First, try to seed jobs if database is empty
      try {
        const seedResponse = await fetch(`${API_BASE_URL}/jobs/seed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!seedResponse.ok) {
          console.log('Seed endpoint may not be available or jobs already exist');
        }
      } catch (seedError) {
        console.log('Seed endpoint may not be available or jobs already exist:', seedError);
      }

      // Fetch jobs from database
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/jobs?limit=50`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (fetchError: any) {
        console.error('Network error fetching jobs:', fetchError);
        throw new Error(`Failed to connect to server. Please ensure the backend server is running on ${API_BASE_URL}. Error: ${fetchError.message}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.jobs) {
        // Transform API response to JobListing format
        const transformedJobs: JobListing[] = result.data.jobs.map((job: any, index: number) => {
          const matchScore = job.matchScore || Math.floor(Math.random() * 21) + 75;
          
          // Use MongoDB ObjectId as string, or generate a numeric ID
          const jobId = job.id || `job-${index + 1}`;
          
          return {
            id: jobId,
            title: job.title || 'Job Title',
            company: job.company || 'Company Name',
            logo: job.companyLogo || '/perosn_icon.png',
            location: job.location || 'Location not specified',
            salary: formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryType),
            type: job.employmentType === 'FULL_TIME' ? 'Full-time' : 
                  job.employmentType === 'PART_TIME' ? 'Part-time' :
                  job.employmentType === 'CONTRACT' ? 'Contract' :
                  job.employmentType === 'INTERNSHIP' ? 'Internship' : 'Full-time',
            skills: job.skills || [],
            match: `${matchScore}% Match`,
            timeAgo: formatTimeAgo(job.postedAt || new Date()),
            isHighlighted: matchScore >= 85,
            description: job.aboutRole || 'No description available.',
            responsibilities: job.responsibilities ? 
              (typeof job.responsibilities === 'string' ? 
                job.responsibilities.split(/[.;]/).filter((r: string) => r.trim()).map((r: string) => r.trim() + (r.trim().endsWith('.') ? '' : '.')) : 
                Array.isArray(job.responsibilities) ? job.responsibilities : []) : 
              [],
            requiredSkills: job.skills || [],
            niceToHaveSkills: [],
            companyOverview: `We are a leading company in the ${job.industry || 'technology'} industry.`,
            experienceLevel: job.experienceLevel || 'Not specified',
            department: job.industry || undefined,
            workMode: job.workMode === 'REMOTE' ? 'Remote' :
                     job.workMode === 'HYBRID' ? 'Hybrid' :
                     job.workMode === 'ON_SITE' ? 'On-site' : 'On-site',
            industry: job.industry || 'Technology',
            visaAvailability: job.visaSponsorship ? 'Available' : 'Not Available',
            applicantCount: `${Math.floor(Math.random() * 200) + 20}+`,
            postedDate: formatDate(job.postedAt || new Date()),
            strengths: [],
            gaps: [],
          };
        });

        setJobListings(transformedJobs);
        if (transformedJobs.length > 0) {
          setSelectedJob(transformedJobs[0]);
        }
      } else {
        console.log('No jobs found in database');
        setJobListings([]);
      }
    } catch (error: any) {
      console.error('Failed to load job listings:', error);
      // Show user-friendly error message
      if (error.message) {
        console.error('Error details:', error.message);
        // Only show alert if it's a connection error
        if (error.message.includes('Failed to connect') || error.message.includes('Failed to fetch')) {
          console.warn(`Backend server may not be running. Please ensure the server is running on ${API_BASE_URL}`);
        }
      } else {
        console.error('Unknown error occurred');
      }
      setJobListings([]);
    } finally {
      setLoading(false);
    }
  }

  const checkAppliedJobs = async () => {
    const candidateId = sessionStorage.getItem('candidateId');
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
          const appliedIds = new Set<string>(result.data.map((app: any) => String(app.jobId)));
          setAppliedJobIds(appliedIds);
        }
      }
    } catch (error) {
      console.error('Error checking applied jobs:', error);
    }
  }

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setLocationQuery('')
  }

  const handleJobClick = (job: JobListing) => {
    setSelectedJob(job)
  }

  const handleApplyNow = () => {
    setIsScreeningModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsScreeningModalOpen(false)
    setExperienceAnswer('yes')
    setNightShiftValue('')
    setNightShiftFocused(false)
    setExcelProficiency(0)
    setJoiningAvailability(null)
  }

  const handleSubmitScreening = async () => {
    const candidateId = sessionStorage.getItem('candidateId');
    if (!candidateId) {
      alert('Please log in to apply for jobs');
      return;
    }

    if (!selectedJob) {
      alert('No job selected');
      return;
    }

    try {
      const screeningAnswers = {
        experience: experienceAnswer,
        nightShift: nightShiftValue,
        excelProficiency,
        joiningAvailability,
      };

      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          jobId: selectedJob.id.toString(),
          screeningAnswers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit application');
      }

      if (result.success) {
        handleCloseModal();
        setIsSuccessModalOpen(true);
        // Reload job listings and check applied status
        loadJobListings();
        checkAppliedJobs();
      } else {
        alert(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    }
  }

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false)
  }

  const getProficiencyLabel = (value: number) => {
    if (value === 0) return 'Beginner'
    if (value <= 25) return 'Basic'
    if (value <= 50) return 'Intermediate'
    if (value <= 75) return 'Advanced'
    return 'Expert'
  }

  const handleSaveJob = () => {
    // Implement save job logic
  }

  const handleBackToGrid = () => {
    setViewMode('grid')
    setSelectedJob(null)
  }

  const renderJobCard = (job: JobListing, isCompact = false) => {
    const isSelected = selectedJob?.id === job.id && isCompact;

    return (
      <div
        key={job.id}
        onClick={() => {
          handleJobClick(job);
          if (!isCompact) setViewMode('detail');
        }}
        className={`group ${isCompact
          ? `py-5 px-3.5 mb-4 rounded-2xl border border-gray-100 ${isSelected ? 'bg-[#111827] text-white border-transparent shadow-xl' : 'bg-white text-gray-900 shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:shadow-md'}`
          : 'p-3 md:p-4 lg:p-4 mb-3 sm:mb-4 rounded-2xl bg-white text-gray-900 border border-gray-100 hover:bg-[#111827] hover:text-white hover:shadow-2xl hover:border-transparent'
          } cursor-pointer transition-all duration-500 relative w-full max-w-full overflow-hidden ${isCompact ? 'h-auto' : 'h-full'} flex flex-col`}
      >
        {/* Header: Logo, Date, Bookmark */}
        <div className={`flex justify-between items-start ${isCompact ? 'mb-1.5' : 'mb-1.5 sm:mb-2'} min-w-0`}>
          <div className="rounded-full overflow-hidden bg-white border border-gray-100 flex items-center justify-center shrink-0" style={{ width: isCompact ? "40px" : "48px", height: isCompact ? "40px" : "48px", padding: "4px" }}>
            <Image src="/perosn_icon.png" alt={job.company} width={isCompact ? 40 : 48} height={isCompact ? 40 : 48} className="object-contain" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`font-medium whitespace-nowrap transition-colors duration-500 ${isCompact ? (isSelected ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500 group-hover:text-gray-400'}`} style={{ fontSize: isCompact ? "10px" : "12px" }}>{job.postedDate}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={`transition-colors duration-500 shrink-0 ${isCompact ? (isSelected ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900') : 'text-gray-400 group-hover:text-gray-400 group-hover:hover:text-white hover:text-gray-900'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: isCompact ? "18px" : "20px", height: isCompact ? "18px" : "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Company Name & Verified */}
        <div className={`flex items-center gap-2 ${isCompact ? 'mb-0.5' : 'mb-1'} min-w-0`}>
          <span className={`font-semibold wrap-break-word flex-1 min-w-0 transition-colors duration-500 ${isCompact ? (isSelected ? 'text-gray-200' : 'text-gray-900') : 'text-gray-900 group-hover:text-gray-200'}`} style={{ fontSize: isCompact ? "12px" : "13px" }}>{job.company}</span>
          <svg className="text-green-500 fill-current shrink-0" viewBox="0 0 20 20" style={{ width: "14px", height: "14px" }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Job Title */}
        <h3 className={`font-bold wrap-break-word line-clamp-2 transition-colors duration-500 ${isCompact ? 'mb-1' : 'mb-1.5'} ${isCompact ? (isSelected ? 'text-white' : 'text-gray-900') : 'text-gray-900 group-hover:text-white'}`} style={{ fontSize: isCompact ? "16px" : "18px" }}>{job.title}</h3>

        {/* Location - Show in sidebar cards */}
        {isCompact && (
          <div className="flex items-center gap-1 mb-1 min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" className={`transition-colors shrink-0 ${isSelected ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: "12px", height: "12px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`wrap-break-word transition-colors duration-500 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontSize: "11px" }}>{job.location}</span>
          </div>
        )}

        {/* Location and Employment Type - Show in grid cards */}
        {!isCompact && (
          <div className="flex items-center flex-wrap gap-1 mb-1.5 min-w-0">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full group-hover:bg-blue-100 group-hover:border-blue-200 transition-all duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="transition-colors text-blue-600 group-hover:text-blue-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: "12px", height: "12px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="wrap-break-word transition-colors duration-500 text-blue-700 font-semibold group-hover:text-blue-800" style={{ fontSize: "11px" }}>{job.location}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full font-medium transition-colors duration-500 shrink-0 whitespace-nowrap bg-gray-100 text-gray-600 group-hover:bg-gray-800 group-hover:text-gray-300" style={{ fontSize: "10px" }}>
              {job.type}
            </span>
          </div>
        )}

        {/* Skills Tags - Hide in Sidebar */}
        {!isCompact && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {job.skills.slice(0, 2).map((skill, index) => (
              <span key={index} className="px-2 py-0.5 rounded-full font-medium transition-colors duration-500 shrink-0 wrap-break-word bg-gray-100 text-gray-600 group-hover:bg-gray-800 group-hover:text-gray-300" style={{ fontSize: "10px" }}>
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Salary */}
        {!isCompact ? (
          <div className="mb-2">
            <div className="inline-flex items-center px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-all duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-emerald-600 group-hover:text-emerald-700 shrink-0 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: "12px", height: "12px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="wrap-break-word transition-colors duration-500 text-emerald-700 font-bold group-hover:text-emerald-800" style={{ fontSize: "12px" }}>{job.salary}</span>
            </div>
          </div>
        ) : (
          <p className={`wrap-break-word transition-colors duration-500 mb-0.5 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontSize: "11px" }}>{job.salary}</p>
        )}

        {/* Footer: Stats & Button */}
        <div className={`flex items-center justify-between ${isCompact ? 'mt-0.5' : 'mt-auto'} gap-2 min-w-0`}>
          {!isCompact ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold shadow-sm border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent transition-all duration-500" style={{ fontSize: "11px" }}>
                {job.match}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="transition-colors text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: "16px", height: "16px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium transition-colors duration-500 whitespace-nowrap text-gray-600 group-hover:text-gray-300" style={{ fontSize: "12px" }}>{job.applicantCount.replace('+', '')}</span>
              </div>
            </div>
          ) : (
            <div className="text-emerald-600 font-bold" style={{ fontSize: "11px" }}>{job.match}</div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleJobClick(job);
              if (!isCompact) setViewMode('detail');
            }}
            className={`rounded-full font-bold transition-all duration-500 active:scale-95 whitespace-nowrap shrink-0 ${isCompact
              ? (isSelected ? 'bg-white text-[#111827]' : 'bg-gray-900 text-white hover:bg-black')
              : 'bg-[#111827] text-white hover:bg-black group-hover:bg-white group-hover:text-[#111827] group-hover:px-8'
              }`} style={{
                fontSize: isCompact ? "12px" : "12px",
                padding: isCompact ? "8px 18px" : "8px 20px"
              }}>
            {isCompact ? "View" : "Details"}
          </button>
        </div>
      </div>
    );
  };

  const renderJobListItem = (job: JobListing) => {
    return (
      <div
        key={job.id}
        onClick={() => {
          handleJobClick(job);
          setViewMode('detail');
        }}
        className="group bg-white p-4 sm:p-5 rounded-2xl cursor-pointer hover:bg-[#111827] hover:text-white hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full shadow-sm"
      >
        {/* Company Logo */}
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-2 shadow-inner group-hover:border-transparent transition-all overflow-hidden">
          <Image src="/perosn_icon.png" alt={job.company} width={64} height={64} className="object-contain" />
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-white transition-colors duration-500" style={{ fontSize: "clamp(16px, 2vw, 22px)" }}>{job.title}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-gray-500 group-hover:text-gray-400 transition-colors duration-500" style={{ fontSize: "clamp(12px, 1.4vw, 15px)" }}>
              <span className="font-semibold text-gray-900 group-hover:text-gray-200">{job.company}</span>
              <span className="opacity-50">•</span>
              <span>{job.location}</span>
              <span className="opacity-50">•</span>
              <span className="font-semibold text-blue-600 transition-colors group-hover:text-blue-400">{job.salary}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all duration-500" style={{ fontSize: "clamp(10px, 1.1vw, 12px)" }}>
                {job.type}
              </span>
              {job.skills.slice(0, 4).map((skill, index) => (
                <span key={index} className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 font-medium border border-gray-100 group-hover:bg-gray-800 group-hover:text-gray-300 group-hover:border-transparent transition-all duration-500" style={{ fontSize: "clamp(10px, 1.1vw, 12px)" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 group-hover:border-gray-800 pt-4 md:pt-0 mt-2 md:mt-0 transition-colors">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 transition-colors duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 group-hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: "18px", height: "18px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-300 whitespace-nowrap">{job.timeAgo}</span>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-bold shadow-sm border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent transition-all duration-500" style={{ fontSize: "12px" }}>
                {job.match}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleJobClick(job);
                setViewMode('detail');
              }}
              className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 group-hover:bg-white group-hover:text-[#111827] group-hover:px-10"
              style={{ fontSize: "14px" }}
            >
              Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #fde9d4, #fafbfb, #bddffb)" }}>
      <Header />

      <main className="w-full grow overflow-x-hidden">
        <DashboardContainer className="py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
          {/* CSS for placeholder text wrapping prevention */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .filter-input::placeholder {
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
              }
              .filter-input button span {
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                display: block !important;
                max-width: 100%;
              }

              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e5e7eb;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
              }
              .group:hover .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #4b5563;
              }

              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `
          }} />

          {/* Search Filters Section */}
          <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 mb-4 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8 w-full max-w-full overflow-x-hidden overflow-y-visible">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 items-end min-w-0">
              {/* Job Title / Keywords */}
              <div className="space-y-1.5 sm:space-y-2 min-w-0">
                <label className="font-medium text-gray-700 wrap-break-word min-w-0 block" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>Job Title / Keywords</label>
                <div className="relative w-full min-w-0">
                  <EditText
                    placeholder="e.g. UI Designer, Backend Developer"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-w-0 filter-input"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5 sm:space-y-2 min-w-0">
                <label className="font-medium text-gray-700 wrap-break-word min-w-0 block" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>Location</label>
                <div className="relative w-full min-w-0">
                  <EditText
                    placeholder="e.g. Remote, New York, Berlin"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full min-w-0 filter-input"
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-1.5 sm:space-y-2 min-w-0 relative z-50">
                <label className="font-medium text-gray-700 wrap-break-word min-w-0 block" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>Experience Level</label>
                <div className="relative w-full min-w-0">
                  <Dropdown
                    options={experienceLevelOptions}
                    placeholder="Select Experience Level"
                    // @ts-ignore
                    onSelect={() => { }}
                    className="w-full min-w-0 filter-input"
                  />
                </div>
              </div>

              {/* Job Type + Search Button */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 min-w-0 sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0 w-full sm:w-auto">
                  <label className="font-medium text-gray-700 whitespace-nowrap block" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>Job Type</label>
                  <div className="relative w-full min-w-0">
                    <Dropdown
                      options={jobTypeOptions}
                      placeholder="Select Job Type"
                      // @ts-ignore
                      onSelect={() => { }}
                      className="w-full min-w-0 filter-input"
                    />
                  </div>
                </div>
                <div className="flex items-end min-w-0 w-full sm:w-auto">
                  <Button
                    text="Search"
                    // @ts-ignore
                    icon="/search-white.svg"
                    className="bg-black text-white px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 h-[42px] sm:h-[42px] md:h-[44px] lg:h-[46px] rounded-lg hover:bg-gray-800 transition-colors shrink-0 whitespace-nowrap w-full sm:w-auto"
                    style={{ fontSize: "clamp(12px, 1.3vw, 15px)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {viewMode === 'grid' ? (
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 lg:p-4 rounded-2xl shadow-sm mb-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 mb-0.5 wrap-break-word" style={{ fontSize: "clamp(16px, 2vw, 24px)" }}>Let AI find your ideal job</h2>
                  <p className="text-gray-500 wrap-break-word" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>Upload your CV and get matched instantly</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* View Switcher */}
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setDisplayMode('grid')}
                      className={`p-2 rounded-lg transition-all ${displayMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Grid View"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H18a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDisplayMode('list')}
                      className={`p-2 rounded-lg transition-all ${displayMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                      title="List View"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                      </svg>
                    </button>
                  </div>
                  <Button text="Get Matched" className="bg-black text-white px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg shrink-0 whitespace-nowrap flex-1 sm:flex-initial" />
                </div>
              </div>

              <div className="max-h-[520px] overflow-y-auto pr-2 custom-scrollbar transition-all duration-300">
                <div className={displayMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5" : "flex flex-col gap-4"}>
                  {loading ? (
                    // Loading skeletons
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 rounded-3xl h-auto min-h-[180px] sm:min-h-[220px] md:min-h-[240px] lg:min-h-[260px] animate-pulse w-full max-w-full overflow-hidden"></div>
                    ))
                  ) : (
                    jobListings.map(job => (
                      <div key={job.id} className="w-full min-w-0 h-full flex">
                        {displayMode === 'grid' ? renderJobCard(job) : renderJobListItem(job)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full min-w-0">
              {/* Back Button */}
              <button
                onClick={handleBackToGrid}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 font-medium mb-3 sm:mb-4 md:mb-5 lg:mb-6 transition-colors"
                style={{ fontSize: "clamp(11px, 1.3vw, 14px)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "clamp(14px, 1.8vw, 20px)", height: "clamp(14px, 1.8vw, 20px)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="wrap-break-word">Back </span>
              </button>

              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 min-w-0">
                {/* Left Sidebar - Job Listings */}
                <div className="w-full lg:w-auto lg:max-w-[420px] lg:min-w-[340px] xl:max-w-[460px] xl:min-w-[360px] shrink-0 min-w-0">
                  <div
                    className="border border-white/60 p-4 sm:p-5 sticky top-1 backdrop-blur-md flex flex-col w-full max-w-full overflow-hidden"
                    style={{
                      borderRadius: "16px",
                      backgroundColor: "rgba(255, 255, 255, 0.4)",
                      height: "calc(100vh - 20px)",
                      minHeight: "1000px",
                      maxHeight: "2500px"
                    }}
                  >
                    <div className="flex items-center justify-between mb-5 px-2 shrink-0 min-w-0">
                      <h2 className="font-semibold text-gray-900 wrap-break-word flex-1 min-w-0" style={{ fontSize: "clamp(16px, 2.2vw, 22px)" }}>Most Recent Jobs</h2>
                      <span className="font-medium text-gray-500 cursor-pointer hover:text-gray-900 shrink-0 whitespace-nowrap ml-2" style={{ fontSize: "clamp(12px, 1.3vw, 15px)" }}>View All</span>
                    </div>

                    <div className="space-y-3 overflow-y-auto flex-1 pr-0 scrollbar-hide">
                      {jobListings.map(job => renderJobCard(job, true))}
                    </div>
                  </div>
                </div>

                {/* Right Content - Job Details */}
                <div className="flex-1 min-w-0">
                  {selectedJob ? (
                    <div
                      className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 2xl:p-8 backdrop-blur-md w-full max-w-full overflow-hidden"
                      style={{
                        borderRadius: "24px",
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.8)",
                        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.02)"
                      }}
                    >
                      <div className="mb-0 min-w-0">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-7 gap-3 sm:gap-4 min-w-0">
                          <div className="mb-4 lg:mb-0 flex-1 min-w-0">
                            <h1 className="font-bold text-gray-900 mb-1.5 sm:mb-2 wrap-break-word" style={{ fontSize: "clamp(18px, 2.5vw, 32px)" }}>{selectedJob.title}</h1>
                            <p className="text-gray-500 mb-1 wrap-break-word" style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}>{selectedJob.company} - {selectedJob.location}</p>
                            <p className="text-gray-500 wrap-break-word" style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}>{selectedJob.salary} | {selectedJob.experienceLevel} Experience</p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
                            <button onClick={handleApplyNow} className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap" style={{ fontSize: "clamp(12px, 1.3vw, 15px)" }}>
                              Apply Now
                            </button>
                            <button onClick={handleSaveJob} className="bg-white hover:bg-blue-50 text-blue-600 font-medium px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap" style={{ fontSize: "clamp(12px, 1.3vw, 15px)" }}>
                              Save Job
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-gray-200 w-full mb-4 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8"></div>

                        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 min-w-0">
                          <div className="flex-1 min-w-0">
                            {/* About the Role */}
                            <section className="mb-4 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8">
                              <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 wrap-break-word" style={{ fontSize: "clamp(15px, 1.8vw, 20px)" }}>About the Role</h3>
                              <p className="text-gray-600 leading-relaxed wrap-break-word" style={{ fontSize: "clamp(12px, 1.4vw, 15px)", lineHeight: "1.6" }}>
                                {selectedJob.description}
                              </p>
                            </section>

                            {/* Responsibilities */}
                            <section className="mb-4 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8">
                              <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 wrap-break-word" style={{ fontSize: "clamp(15px, 1.8vw, 20px)" }}>Responsibilities</h3>
                              <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                                {selectedJob.responsibilities?.map((item, idx) => (
                                  <div key={idx} className="flex items-start gap-2 sm:gap-3 md:gap-4 min-w-0">
                                    <div className="mt-0.5 shrink-0 rounded-full border-2 border-[#28A8DF] flex items-center justify-center" style={{ width: "clamp(16px, 2vw, 20px)", height: "clamp(16px, 2vw, 20px)" }}>
                                      <svg className="text-[#28A8DF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4} style={{ width: "clamp(10px, 1.2vw, 12px)", height: "clamp(10px, 1.2vw, 12px)" }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed font-medium wrap-break-word flex-1 min-w-0" style={{ fontSize: "clamp(12px, 1.4vw, 15px)", lineHeight: "1.6" }}>{item}</p>
                                  </div>
                                ))}
                              </div>
                            </section>

                            {/* Required Skills */}
                            <section className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                              <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 wrap-break-word" style={{ fontSize: "clamp(15px, 1.8vw, 20px)" }}>Required Skills</h3>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-2.5">
                                {selectedJob.requiredSkills?.map((skill, idx) => (
                                  <span key={idx} className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-full shadow-sm wrap-break-word" style={{ fontSize: "clamp(10px, 1.1vw, 13px)" }}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </section>

                            {/* Nice-to-have Skills */}
                            {selectedJob.niceToHaveSkills && (
                              <section className="mb-4 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8">
                                <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 wrap-break-word" style={{ fontSize: "clamp(16px, 2vw, 22px)" }}>Nice-to-have Skills</h3>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-2.5">
                                  {selectedJob.niceToHaveSkills.map((skill, idx) => (
                                    <span key={idx} className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-gray-100 text-gray-700 font-medium rounded-full wrap-break-word" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </section>
                            )}

                            {/* Job Information Grid */}
                            <section className="mb-4 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8">
                              <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 wrap-break-word" style={{ fontSize: "clamp(15px, 1.8vw, 20px)" }}>Job Information</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 sm:gap-y-4 md:gap-y-5 lg:gap-y-6 gap-x-3 sm:gap-x-4">
                                <div className="min-w-0">
                                  <p className="text-gray-500 mb-1 wrap-break-word" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>Employment Type</p>
                                  <p className="font-medium text-gray-900 wrap-break-word" style={{ fontSize: "clamp(13px, 1.5vw, 16px)" }}>{selectedJob.type}</p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-gray-500 mb-1 wrap-break-word" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>Work Mode</p>
                                  <p className="font-medium text-gray-900 wrap-break-word" style={{ fontSize: "clamp(13px, 1.5vw, 16px)" }}>{selectedJob.workMode}</p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-gray-500 mb-1 wrap-break-word" style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}>Industry</p>
                                  <p className="font-medium text-gray-900 wrap-break-word" style={{ fontSize: "clamp(13px, 1.5vw, 16px)" }}>{selectedJob.industry}</p>
                                </div>
                              </div>
                            </section>

                            {/* AI Job Fit Score Card */}
                            <div className="flex flex-row justify-center items-center p-[48px] gap-[91px] w-full max-w-[632px] h-[353px] bg-[#F1F5F966] rounded-[10px] box-border font-sans mb-6 border border-gray-200 shadow-lg">
                              
                              {/* --- LEFT COLUMN --- */}
                              <div className="flex flex-col items-center gap-[37px] w-[187px] h-[252px]">
                                
                                {/* Header (Title & Badge) */}
                                <div className="flex flex-col items-center gap-[10px] w-full">
                                  <span className="text-[12px] leading-[16px] text-[#1D293D] font-normal text-center">
                                    AI Job Fit Score
                                  </span>
                                  <div className="flex flex-row justify-center items-center px-[10px] py-[2px] w-[145px] h-[20px] bg-[#3B82F6] rounded-full">
                                    <span className="text-[12px] leading-[16px] font-semibold text-[#F8FAFC]">
                                      Powered by SAASA AI
                                    </span>
                                  </div>
                                </div>

                                {/* Donut Chart (82%) */}
                                <div className="relative flex justify-center items-center w-[92px] h-[92px]">
                                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                    {/* Background Ring */}
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="42"
                                      fill="transparent"
                                      stroke="#E2E8F0"
                                      strokeWidth="8"
                                    />
                                    {/* Active Progress Ring */}
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="42"
                                      fill="transparent"
                                      stroke="#475569"
                                      strokeWidth="8"
                                      strokeLinecap="round"
                                      strokeDasharray={`${2 * Math.PI * 42}`}
                                      strokeDashoffset={`${2 * Math.PI * 42 - (82 / 100) * (2 * Math.PI * 42)}`}
                                    />
                                  </svg>
                                  <span className="absolute text-[24px] leading-[32px] font-normal tracking-[-0.6px] text-[#0F172B]">
                                    82%
                                  </span>
                                </div>

                                {/* Button */}
                                <button 
                                  onClick={() => router.push('/cveditor')}
                                  className="flex flex-row justify-center items-center px-[12px] py-[8px] w-[187px] h-[40px] bg-[#0F172A] rounded-[6px] hover:bg-[#1E293B] transition-colors"
                                >
                                  <span className="text-[14px] leading-[24px] font-medium text-[#F8FAFC]">
                                    Improve CV for this Job
                                  </span>
                                </button>
                              </div>

                              {/* --- RIGHT COLUMN --- */}
                              <div className="flex flex-col items-start gap-[33px] w-[258px]">
                                
                                {/* Strengths Section */}
                                <div className="flex flex-col items-start gap-[16px] w-full">
                                  <h3 className="text-[12px] leading-[16px] uppercase font-normal text-[#62748E] m-0">
                                    Strengths
                                  </h3>
                                  <ul className="flex flex-col items-start gap-[8px] w-full p-0 m-0 list-none">
                                    {[
                                      'Strong experience with React and Node.js',
                                      'Proficient in TypeScript development',
                                      'Experience with cloud platforms like AWS',
                                      'Solid understanding of SQL databases',
                                    ].map((text, i) => (
                                      <li key={i} className="flex flex-row items-center gap-[8px] w-full h-[20px]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-[12px] leading-[16px] font-normal text-[#314158] truncate">
                                          {text}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Gaps Section */}
                                <div className="flex flex-col items-start gap-[16px] w-full">
                                  <h3 className="text-[12px] leading-[16px] uppercase font-normal text-[#62748E] m-0">
                                    Gaps
                                  </h3>
                                  <ul className="flex flex-col items-start gap-[8px] w-full p-0 m-0 list-none">
                                    {[
                                      'Experience with cloud platforms like AWS',
                                      'Solid understanding of SQL databases',
                                    ].map((text, i) => (
                                      <li key={i} className="flex flex-row items-center gap-[8px] w-full h-[24px]">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <circle cx="12" cy="12" r="10"></circle>
                                          <line x1="15" y1="9" x2="9" y2="15"></line>
                                          <line x1="9" y1="9" x2="15" y2="15"></line>
                                        </svg>
                                        <span className="text-[12px] leading-[16px] font-normal text-[#314158] truncate">
                                          {text}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Company & Highlights */}
                          <div className="w-full xl:w-auto xl:max-w-[320px] xl:min-w-[260px] 2xl:max-w-[360px] 2xl:min-w-[280px] shrink-0 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7 min-w-0">
                            {/* Company Overview Card */}
                            <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 shadow-sm border border-gray-100 w-full max-w-full overflow-hidden">
                              <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 wrap-break-word" style={{ fontSize: "clamp(16px, 2vw, 20px)" }}>Company Overview</h3>
                              <p className="text-gray-600 leading-relaxed mb-3 sm:mb-4 wrap-break-word" style={{ fontSize: "clamp(12px, 1.4vw, 14px)", lineHeight: "1.6" }}>
                                {selectedJob.companyOverview}
                              </p>
                            </div>

                            {/* Quick Highlights Card */}
                            <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 shadow-sm border border-gray-100 w-full max-w-full overflow-hidden">
                              <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 lg:mb-6 wrap-break-word" style={{ fontSize: "clamp(16px, 2vw, 20px)" }}>Quick Highlights</h3>
                              <div className="grid grid-cols-2 gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-3 sm:gap-y-4 md:gap-y-5 lg:gap-y-6">
                                <div className="min-w-0">
                                  <p className="text-gray-500 mb-1 uppercase tracking-wide wrap-break-word" style={{ fontSize: "clamp(9px, 1vw, 12px)" }}>Experience</p>
                                  <p className="font-medium text-gray-900 wrap-break-word" style={{ fontSize: "clamp(12px, 1.4vw, 14px)" }}>{selectedJob.experienceLevel.includes('Year') ? 'Mid-Senior' : selectedJob.experienceLevel}</p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-gray-500 mb-1 uppercase tracking-wide wrap-break-word" style={{ fontSize: "clamp(9px, 1vw, 12px)" }}>Mode</p>
                                  <p className="font-medium text-gray-900 wrap-break-word" style={{ fontSize: "clamp(12px, 1.4vw, 14px)" }}>{selectedJob.workMode.split(' ')[0]}</p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-gray-500 mb-1 uppercase tracking-wide wrap-break-word" style={{ fontSize: "clamp(9px, 1vw, 12px)" }}>Visa</p>
                                  <p className="font-medium text-gray-900 wrap-break-word" style={{ fontSize: "clamp(12px, 1.4vw, 14px)" }}>{selectedJob.visaAvailability === 'Available' ? 'Available' : 'Unavailable'}</p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-gray-500 mb-1 uppercase tracking-wide wrap-break-word" style={{ fontSize: "clamp(9px, 1vw, 12px)" }}>Applicants</p>
                                  <p className="font-medium text-gray-900 wrap-break-word" style={{ fontSize: "clamp(12px, 1.4vw, 14px)" }}>{selectedJob.applicantCount}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-transparent p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex items-center justify-center min-h-[350px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] flex-col gap-3 sm:gap-4 text-center min-w-0">
                      <div className="bg-white/50 rounded-full flex items-center justify-center shrink-0" style={{ width: "clamp(48px, 6vw, 64px)", height: "clamp(48px, 6vw, 64px)" }}>
                        <svg className="text-[#9095A1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ width: "clamp(24px, 3vw, 32px)", height: "clamp(24px, 3vw, 32px)" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 wrap-break-word" style={{ fontSize: "clamp(14px, 1.8vw, 18px)" }}>Select a job to view details</h3>
                        <p className="text-gray-500 mt-1 wrap-break-word" style={{ fontSize: "clamp(11px, 1.3vw, 14px)" }}>Click on any job card from the list to see full requirements and apply.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DashboardContainer>
      </main>

      {
        isScreeningModalOpen && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseModal} />
            <div
              className="bg-white rounded-lg shadow-xl overflow-y-auto z-10"
              style={{
                width: "600px",
                maxHeight: "85vh",
                borderRadius: "10px",
                boxShadow: "0 0 2px 0 rgba(23, 26, 31, 0.20), 0 0 1px 0 rgba(23, 26, 31, 0.07)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Screening Questions</h2>
                <p className="text-base text-gray-700 mb-1">{selectedJob.title} — {selectedJob.company}</p>
                <p className="text-sm text-gray-600 mb-2">These quick questions help us understand if you are a good fit for the role</p>
              </div>

              {/* Questions */}
              <div className="px-6 pt-2 pb-6 space-y-8">
                {/* Question 1: Experience */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    Do you have at least 2 years of experience for this role?
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setExperienceAnswer('yes')}
                      className={`px-6 py-2.5 rounded-lg border-2 transition-colors ${experienceAnswer === 'yes'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                        : 'border-blue-200 bg-white text-gray-900 hover:border-blue-300'
                        }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setExperienceAnswer('no')}
                      className={`px-6 py-2.5 rounded-lg border-2 transition-colors ${experienceAnswer === 'no'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                        : 'border-blue-200 bg-white text-gray-900 hover:border-blue-300'
                        }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Question 2: Night Shift */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    Are you willing to work in Night Shift?
                  </label>
                  <div className="relative">
                    <select
                      value={nightShiftValue}
                      onChange={(e) => setNightShiftValue(e.target.value)}
                      onFocus={() => setNightShiftFocused(true)}
                      onBlur={() => setNightShiftFocused(false)}
                      className={`w-full px-4 py-2.5 rounded-lg border-2 appearance-none bg-white text-gray-900 ${nightShiftFocused ? 'border-blue-500' : 'border-blue-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                    >
                      <option value="">Select an option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="maybe">Maybe</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Question 3: Excel Proficiency */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    Rate your proficiency in Excel
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Beginner</span>
                      <span className="text-sm text-gray-600">Expert</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={excelProficiency}
                      onChange={(e) => setExcelProficiency(Number(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${excelProficiency}%, #e0e7ff ${excelProficiency}%, #e0e7ff 100%)`
                      }}
                    />
                    <p className="text-sm text-blue-600 font-medium">
                      Current selection: {excelProficiency < 50 ? 'Beginner' : 'Expert'}
                    </p>
                  </div>
                </div>

                {/* Question 4: Joining Availability */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    How soon can you join?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Immediate', '15 Days', '30 Days', '60 Days'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setJoiningAvailability(option)}
                        className={`px-4 py-2.5 rounded-lg border-2 transition-colors ${joiningAvailability === option
                          ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                          : 'border-blue-200 bg-white text-gray-900 hover:border-blue-300'
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitScreening}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  Submit & Continue
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Application Success Modal */}
      {
        selectedJob && (
          <ApplicationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleCloseSuccessModal}
            jobTitle={selectedJob.title}
            company={selectedJob.company}
            appliedDate={formatDate(new Date())}
            jobId={selectedJob.id}
          />
        )
      }

      <Footer />
    </div >
  )
}

export default DashboardPage

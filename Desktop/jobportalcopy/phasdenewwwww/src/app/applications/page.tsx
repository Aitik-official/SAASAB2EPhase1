'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Image from 'next/image';
import DashboardContainer from '../../components/layout/DashboardContainer';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'Under Review' | 'Submitted' | 'Shortlisted' | 'Selected' | 'Rejected';
  appliedDate: string;
  matchScore: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Under Review':
      return 'bg-blue-100 text-blue-700';
    case 'Submitted':
      return 'bg-gray-100 text-gray-700';
    case 'Shortlisted':
      return 'bg-purple-100 text-purple-700';
    case 'Selected':
      return 'bg-green-100 text-green-700';
    case 'Rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const STATUS_OPTIONS = ['All', 'Under Review', 'Submitted', 'Shortlisted', 'Selected', 'Rejected'];
const DATE_OPTIONS = ['All Time', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'Last Year'];

export default function ApplicationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [displayedApplicationsCount, setDisplayedApplicationsCount] = useState(6);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const candidateId = sessionStorage.getItem('candidateId');
    if (!candidateId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/applications/${candidateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setApplications(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const displayedApps = filteredApplications.slice(0, displayedApplicationsCount);

  const handleLoadMore = () => {
    setDisplayedApplicationsCount(prev => prev + 6);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderApplicationCard = (application: Application) => {
    return (
      <div
        key={application.id}
        className="p-6 mb-4 rounded-2xl bg-white border border-blue-200 relative w-full flex flex-col"
        style={{
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Job Title */}
        <h3 className="text-2xl font-medium text-gray-900 mb-2">{application.jobTitle}</h3>
        
        {/* Company Name */}
        <p className="text-sm text-gray-600 mb-3">{application.company}</p>
        
        {/* Application Status Badge */}
        <div className="mb-3">
          <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
        </div>
        
        {/* Application Date */}
        <p className="text-sm text-gray-600 mb-3">Applied: {formatDate(application.appliedDate)}</p>
        
        {/* Match Score Badge */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-900">
            Match Score: {application.matchScore}%
          </span>
        </div>
        
        {/* View Status Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/applications/${application.id}`);
          }}
          className="w-full py-3 rounded-lg text-white font-normal hover:opacity-90 transition-opacity duration-200 active:scale-98"
          style={{ backgroundColor: '#1C86C8' }}
        >
          View Status
        </button>
      </div>
    );
  };

  const renderApplicationListItem = (application: Application) => {
    return (
      <div
        key={application.id}
        onClick={() => router.push(`/applications/${application.id}`)}
        className="group bg-white p-4 sm:p-5 rounded-2xl cursor-pointer hover:bg-[#111827] hover:text-white hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full shadow-sm"
      >
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-2 shadow-inner group-hover:border-transparent transition-all overflow-hidden">
          <Image src="/perosn_icon.png" alt={application.company} width={64} height={64} className="object-contain" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-white transition-colors duration-500 text-xl">{application.jobTitle}</h3>
            <div className="flex items-center gap-3 mt-1 text-gray-500 group-hover:text-gray-400 transition-colors duration-500 text-sm">
              <span className="font-semibold text-gray-900 group-hover:text-gray-200">{application.company}</span>
              <span className="opacity-50">•</span>
              <span>Applied {formatDate(application.appliedDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 group-hover:border-gray-800 pt-4 md:pt-0 mt-2 md:mt-0 transition-colors">
            <div className="flex items-center gap-5">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-bold shadow-sm border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent transition-all duration-500 text-sm">
                {application.matchScore}% Match
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/applications/${application.id}`);
              }}
              className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 group-hover:bg-white group-hover:text-[#111827] group-hover:px-10 text-sm"
            >
              View Status
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
        <DashboardContainer className="py-6 sm:py-8 lg:py-10">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-1 tracking-tight">My Applications</h1>
              <p className="text-gray-500 font-medium">Track and manage your dream job opportunities</p>
            </div>

            {/* View Switcher */}
            <div className="flex p-1 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-white">
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
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-8 border border-white/50 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job title or company"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-gray-900"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-auto px-5 py-3 pr-10 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-gray-900 appearance-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      Status: {status}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full md:w-auto px-5 py-3 pr-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-gray-900 appearance-none cursor-pointer"
                >
                  {DATE_OPTIONS.map((date) => (
                    <option key={date} value={date}>
                      Date: {date}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center gap-1.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Applications Grid/List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-500">Loading applications...</div>
            </div>
          ) : displayedApps.length > 0 ? (
            <div className="space-y-8">
              <div className={displayMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
                {displayedApps.map((application) => (
                  displayMode === 'grid' ? renderApplicationCard(application) : renderApplicationListItem(application)
                ))}
              </div>

              {/* Load More Button */}
              {displayedApplicationsCount < filteredApplications.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    className="px-10 py-4 bg-white border border-gray-100 text-gray-900 font-bold rounded-2xl shadow-sm hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all duration-300"
                  >
                    Load More Applications
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white p-20 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="8" y1="13" x2="16" y2="13"></line>
                  <line x1="8" y1="17" x2="16" y2="17"></line>
                  <line x1="8" y1="9" x2="10" y2="9"></line>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No applications found</h2>
              <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any applications matching your search or filters.</p>
            </div>
          )}
        </DashboardContainer>
      </main>

      <Footer />
    </div>
  );
}

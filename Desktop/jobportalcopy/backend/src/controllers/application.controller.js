const { prisma } = require('../lib/prisma');

/**
 * Create a new job application
 * POST /api/applications
 */
async function createApplication(req, res) {
  try {
    const { candidateId, jobId, screeningAnswers } = req.body;

    if (!candidateId || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID and Job ID are required',
      });
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Create application
    // Note: screeningAnswers field will be available after Prisma client regeneration
    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId,
        status: 'SUBMITTED',
        // screeningAnswers will be added after running: npx prisma generate
        // For now, we'll store it in a separate collection or skip it
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    // Create timeline entry
    await prisma.applicationTimeline.create({
      data: {
        applicationId: application.id,
        status: 'SUBMITTED',
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted',
      },
    });

    console.log(`✅ Application created: ${application.id} for job ${jobId} by candidate ${candidateId}`);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application.id,
        status: application.status,
        appliedAt: application.appliedAt,
      },
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get all applications for a candidate
 * GET /api/applications/:candidateId
 */
async function getApplications(req, res) {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required',
      });
    }

    const applications = await prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          include: {
            company: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    // Transform applications to match frontend format
    const transformedApplications = applications.map((app) => {
      const job = app.job;
      const company = job.company;

      // Format salary
      let salary = 'Not specified';
      if (job.salaryMin && job.salaryMax) {
        const currency = job.salaryCurrency || 'USD';
        const salaryType = job.salaryType === 'ANNUAL' ? '/year' : job.salaryType === 'MONTHLY' ? '/month' : '';
        salary = `${currency === 'USD' ? '$' : currency}${job.salaryMin.toLocaleString()} - ${currency === 'USD' ? '$' : currency}${job.salaryMax.toLocaleString()}${salaryType}`;
      }

      // Format status
      const statusMap = {
        SUBMITTED: 'Submitted',
        UNDER_REVIEW: 'Under Review',
        SHORTLISTED: 'Shortlisted',
        ASSESSMENT: 'Assessment',
        INTERVIEW: 'Interview',
        FINAL_DECISION: 'Final Decision',
        SELECTED: 'Selected',
        REJECTED: 'Rejected',
      };

      return {
        id: app.id,
        jobId: job.id,
        jobTitle: job.title,
        company: company.name,
        status: statusMap[app.status] || app.status,
        appliedDate: app.appliedAt.toISOString().split('T')[0],
        matchScore: app.matchScore || 0,
        salary,
        location: job.location || 'Not specified',
        employmentType: job.employmentType || 'Full-time',
        workMode: job.workMode || 'On-site',
      };
    });

    res.json({
      success: true,
      data: transformedApplications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Check if candidate has applied to a job
 * GET /api/applications/check/:candidateId/:jobId
 */
async function checkApplication(req, res) {
  try {
    const { candidateId, jobId } = req.params;

    if (!candidateId || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID and Job ID are required',
      });
    }

    const application = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        hasApplied: !!application,
        status: application?.status || null,
      },
    });
  } catch (error) {
    console.error('Error checking application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check application status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

module.exports = {
  createApplication,
  getApplications,
  checkApplication,
};

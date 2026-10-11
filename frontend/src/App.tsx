import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.js';
import { CandidateLayout } from './layouts/CandidateLayout.js';
import { EmployerLayout } from './layouts/EmployerLayout.js';
import { AdminLayout } from './layouts/AdminLayout.js';

// Route Protection
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { GsapMotionController } from './components/common/GsapMotionController.js';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.js';
import { LoginPage } from './pages/public/LoginPage.js';
import { RegisterPage } from './pages/public/RegisterPage.js';
import { PublicJobsPage } from './pages/public/PublicJobsPage.js';
import { JobDetailPage } from './pages/public/JobDetailPage.js';
import { HowItWorksPage } from './pages/public/HowItWorksPage.js';
import { AboutPage } from './pages/public/AboutPage.js';
import { PrivacyPage } from './pages/public/PrivacyPage.js';
import { TermsPage } from './pages/public/TermsPage.js';
import { ResourcesPage } from './pages/public/ResourcesPage.js';
import { ResourceDetailPage } from './pages/public/ResourceDetailPage.js';
import { PlacedCandidatesPage } from './pages/public/PlacedCandidatesPage.js';

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard.js';
import { CandidateAssessmentPage } from './pages/candidate/CandidateAssessmentPage.js';
import { CandidateResultsPage } from './pages/candidate/CandidateResultsPage.js';
import { CandidateJobsPage } from './pages/candidate/CandidateJobsPage.js';
import { CandidateApplicationsPage } from './pages/candidate/CandidateApplicationsPage.js';
import { CandidateInterviewsPage } from './pages/candidate/CandidateInterviewsPage.js';
import { CandidateSavedJobsPage } from './pages/candidate/CandidateSavedJobsPage.js';
import { CandidateMessagesPage } from './pages/candidate/CandidateMessagesPage.js';
import { CandidateNotificationsPage } from './pages/candidate/CandidateNotificationsPage.js';
import { CandidateProfilePage } from './pages/candidate/CandidateProfilePage.js';
import { CandidateSettingsPage } from './pages/candidate/CandidateSettingsPage.js';

// Employer Pages
import { EmployerDashboard } from './pages/employer/EmployerDashboard.js';
import { EmployerJobsPage } from './pages/employer/EmployerJobsPage.js';
import { EmployerJobCreatePage } from './pages/employer/EmployerJobCreatePage.js';
import { EmployerJobEditPage } from './pages/employer/EmployerJobEditPage.js';
import { EmployerCandidatesPage } from './pages/employer/EmployerCandidatesPage.js';
import { EmployerApplicationsPage } from './pages/employer/EmployerApplicationsPage.js';
import { EmployerInterviewsPage } from './pages/employer/EmployerInterviewsPage.js';
import { EmployerMessagesPage } from './pages/employer/EmployerMessagesPage.js';
import { EmployerProfilePage } from './pages/employer/EmployerProfilePage.js';
import { EmployerSettingsPage } from './pages/employer/EmployerSettingsPage.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.js';
import { AdminJobsPage } from './pages/admin/AdminJobsPage.js';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage.js';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.js';
import { AdminResourcesPage } from './pages/admin/AdminResourcesPage.js';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.js';

export const App: React.FC = () => {
  return (
    <>
      <GsapMotionController />
      <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<PublicJobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/placed-candidates" element={<PlacedCandidatesPage />} />
        <Route path="/success-stories" element={<PlacedCandidatesPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:slug" element={<ResourceDetailPage />} />
        <Route path="/assessment" element={<CandidateAssessmentPage />} />
        <Route path="/results" element={<CandidateResultsPage />} />
        <Route path="/assessment/results" element={<CandidateResultsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Candidate Protected Portal */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <CandidateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CandidateDashboard />} />
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="assessment" element={<CandidateAssessmentPage />} />
        <Route path="results" element={<CandidateResultsPage />} />
        <Route path="assessment/results" element={<CandidateResultsPage />} />
        <Route path="jobs" element={<CandidateJobsPage />} />
        <Route path="saved" element={<CandidateSavedJobsPage />} />
        <Route path="saved-jobs" element={<CandidateSavedJobsPage />} />
        <Route path="applications" element={<CandidateApplicationsPage />} />
        <Route path="interviews" element={<CandidateInterviewsPage />} />
        <Route path="messages" element={<CandidateMessagesPage />} />
        <Route path="notifications" element={<CandidateNotificationsPage />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="settings" element={<CandidateSettingsPage />} />
      </Route>

      {/* Employer Protected Portal */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYER']}>
            <EmployerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployerDashboard />} />
        <Route path="dashboard" element={<EmployerDashboard />} />
        <Route path="jobs" element={<EmployerJobsPage />} />
        <Route path="jobs/create" element={<EmployerJobCreatePage />} />
        <Route path="jobs/new" element={<EmployerJobCreatePage />} />
        <Route path="jobs/:id/edit" element={<EmployerJobEditPage />} />
        <Route path="candidates" element={<EmployerCandidatesPage />} />
        <Route path="applications" element={<EmployerApplicationsPage />} />
        <Route path="interviews" element={<EmployerInterviewsPage />} />
        <Route path="messages" element={<EmployerMessagesPage />} />
        <Route path="profile" element={<EmployerProfilePage />} />
        <Route path="settings" element={<EmployerSettingsPage />} />
      </Route>

      {/* Admin Protected Operations */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="applications" element={<AdminApplicationsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="resources" element={<AdminResourcesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
};

export default App;

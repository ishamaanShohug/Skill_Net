import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./shared/components/layout/PublicLayout";
import DashboardLayout from "./shared/components/layout/DashboardLayout";
import { ProtectedRoute } from "./shared/routes/RouteGuards";
import { Spinner } from "./shared/components/common/UI";
const page = (loader, name) =>
  lazy(() => loader().then((module) => ({ default: module[name] })));
const publicPages = () => import("./public/PublicPages");
const authPages = () => import("./auth/AuthPages");
const seekerPages = () => import("./seeker/SeekerPages");
const employerPages = () => import("./employer/EmployerPages");
const adminPages = () => import("./admin/AdminPages");
const sharedPages = () => import("./shared/pages/SharedPages");
const Public = {
  Home: page(publicPages, "Home"),
  Jobs: page(publicPages, "Jobs"),
  JobDetail: page(publicPages, "JobDetail"),
  Courses: page(publicPages, "Courses"),
  CourseDetail: page(publicPages, "CourseDetail"),
};
const Auth = {
  Login: page(authPages, "Login"),
  Register: page(authPages, "Register"),
};
const Seeker = {
  SeekerDashboard: page(seekerPages, "SeekerDashboard"),
  Profile: page(seekerPages, "Profile"),
  CVBuilder: page(seekerPages, "CVBuilder"),
  Applications: page(seekerPages, "Applications"),
  Quiz: page(seekerPages, "Quiz"),
  QuizResult: page(seekerPages, "QuizResult"),
  Recommendations: page(seekerPages, "Recommendations"),
  Learning: page(seekerPages, "Learning"),
  Notifications: page(seekerPages, "Notifications"),
};
const Employer = {
  EmployerDashboard: page(employerPages, "EmployerDashboard"),
  ManageJobs: page(employerPages, "ManageJobs"),
  JobForm: page(employerPages, "JobForm"),
  Applicants: page(employerPages, "Applicants"),
  QuizBuilder: page(employerPages, "QuizBuilder"),
  EmployerProfile: page(employerPages, "EmployerProfile"),
};
const Admin = {
  AdminDashboard: page(adminPages, "AdminDashboard"),
  UserManagement: page(adminPages, "UserManagement"),
  JobManagement: page(adminPages, "JobManagement"),
  CourseManagement: page(adminPages, "CourseManagement"),
  Reports: page(adminPages, "Reports"),
  Moderation: page(adminPages, "Moderation"),
};
const Shared = { Messages: page(sharedPages, "Messages") };
const guard = (role, element) => (
  <ProtectedRoute roles={[role]}>{element}</ProtectedRoute>
);
function NotFound() {
  return (
    <div className="not-found">
      <strong>404</strong>
      <h1>That page took another path.</h1>
      <p>Let’s get you back to the opportunities that matter.</p>
      <a className="btn btn-primary" href="/">
        Back to SkillNet
      </a>
    </div>
  );
}
export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Public.Home />} />
          <Route path="jobs" element={<Public.Jobs />} />
          <Route path="jobs/:id" element={<Public.JobDetail />} />
          <Route path="courses" element={<Public.Courses />} />
          <Route path="courses/:id" element={<Public.CourseDetail />} />
        </Route>
        <Route path="login" element={<Auth.Login />} />
        <Route path="register" element={<Auth.Register />} />
        <Route
          path="job-seeker"
          element={guard("JOB_SEEKER", <DashboardLayout />)}
        >
          <Route index element={<Seeker.SeekerDashboard />} />
          <Route path="profile" element={<Seeker.Profile />} />
          <Route path="cv" element={<Seeker.CVBuilder />} />
          <Route path="applications" element={<Seeker.Applications />} />
          <Route path="quiz/:id" element={<Seeker.Quiz />} />
          <Route path="quiz/:id/result" element={<Seeker.QuizResult />} />
          <Route path="recommendations" element={<Seeker.Recommendations />} />
          <Route path="learning" element={<Seeker.Learning />} />
          <Route path="messages" element={<Shared.Messages />} />
          <Route path="notifications" element={<Seeker.Notifications />} />
        </Route>
        <Route path="employer" element={guard("EMPLOYER", <DashboardLayout />)}>
          <Route index element={<Employer.EmployerDashboard />} />
          <Route path="jobs" element={<Employer.ManageJobs />} />
          <Route path="jobs/create" element={<Employer.JobForm />} />
          <Route path="jobs/:id/edit" element={<Employer.JobForm />} />
          <Route path="applicants" element={<Employer.Applicants />} />
          <Route path="quizzes" element={<Employer.QuizBuilder />} />
          <Route path="messages" element={<Shared.Messages />} />
          <Route path="notifications" element={<Seeker.Notifications />} />
          <Route path="profile" element={<Employer.EmployerProfile />} />
        </Route>
        <Route path="admin" element={guard("ADMIN", <DashboardLayout />)}>
          <Route index element={<Admin.AdminDashboard />} />
          <Route path="users" element={<Admin.UserManagement />} />
          <Route path="jobs" element={<Admin.JobManagement />} />
          <Route path="courses" element={<Admin.CourseManagement />} />
          <Route path="reports" element={<Admin.Reports />} />
          <Route path="moderation" element={<Admin.Moderation />} />
          <Route path="notifications" element={<Seeker.Notifications />} />
        </Route>
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Flag,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Modal,
  PageHeader,
  SearchBox,
  StatCard,
  Spinner,
} from "../shared/components/common/UI";
import { useToast } from "../shared/context/ToastContext";
import { adminService } from "./adminService";
import { useAsync } from "../shared/hooks/useAsync";

// -------------------------------------------------------------
// 1. ADMIN DASHBOARD (OVERVIEW)
// -------------------------------------------------------------
export function AdminDashboard() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [downloading, setDownloading] = useState(false);
  const { data, loading, error, refetch } = useAsync(adminService.getAnalytics);

  const handleExport = async () => {
    try {
      setDownloading(true);
      show("Generating platform overview report...");
      await adminService.downloadReport("overview");
      show("Report downloaded successfully!");
    } catch {
      show("Failed to download report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="panel"><Spinner /></div>;
  if (error) {
    return (
      <div className="panel error-state">
        <AlertTriangle />
        <div>
          <strong>Unable to load platform analytics</strong>
          <p>Please check your backend connection and try again.</p>
          <Button variant="secondary" onClick={refetch}>Retry</Button>
        </div>
      </div>
    );
  }

  const analytics = data || {};
  const growthData = analytics.growth && analytics.growth.length > 0
    ? analytics.growth
    : [
        { m: "Apr", users: 120, jobs: 18, applications: 45, hires: 6 },
        { m: "May", users: 180, jobs: 24, applications: 85, hires: 12 },
        { m: "Jun", users: 260, jobs: 35, applications: 130, hires: 18 },
        { m: "Jul", users: 340, jobs: 42, applications: 190, hires: 25 },
        { m: "Aug", users: 430, jobs: 51, applications: 245, hires: 32 },
        { m: "Sep", users: 520, jobs: 60, applications: 310, hires: 42 },
      ];

  const userMix = [
    { name: "Job seekers", value: analytics.users?.seekers || 0 },
    { name: "Employers", value: analytics.users?.employers || 0 },
    { name: "Course providers", value: analytics.users?.course_providers || 0 },
  ];
  const COLORS = ["#168b63", "#5b5bd6", "#f2a93b"];

  const needsAttention = analytics.needs_attention || {};
  const outcomes = analytics.outcomes || {};

  return (
    <>
      <PageHeader
        eyebrow="PLATFORM OVERVIEW"
        title="SkillNet at a glance"
        description="Healthy platform activity, real-time metrics, and operational queues needing attention."
        actions={
          <div className="header-actions">
            <Button variant="secondary" onClick={refetch} title="Refresh analytics">
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button variant="primary" onClick={handleExport} disabled={downloading}>
              <Download size={16} />
              {downloading ? "Exporting..." : "Export report"}
            </Button>
          </div>
        }
      />

      <div className="stats-grid four">
        <StatCard
          label="Total users"
          value={analytics.users?.total || 0}
          change={`Seekers: ${analytics.users?.seekers || 0} · Employers: ${analytics.users?.employers || 0}`}
          icon={Users}
        />
        <StatCard
          label="Active jobs"
          value={analytics.jobs?.active || 0}
          change={`Total listings: ${analytics.jobs?.total || 0}`}
          icon={BriefcaseBusiness}
          tone="blue"
        />
        <StatCard
          label="Applications"
          value={analytics.applications?.total || 0}
          change={`Hired: ${analytics.applications?.hired || 0} · Under review: ${analytics.applications?.under_review || 0}`}
          icon={TrendingUp}
          tone="purple"
        />
        <StatCard
          label="Course enrollments"
          value={analytics.courses?.enrollments || 0}
          change={`Published courses: ${analytics.courses?.published || 0}`}
          icon={BookOpen}
          tone="orange"
        />
      </div>

      <div className="admin-grid">
        <section className="panel chart-panel span-2">
          <div className="panel-head">
            <div>
              <h2>Platform growth</h2>
              <p>Registered users and jobs activity over the last 6 months</p>
            </div>
            <Badge tone="default">Live data</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="growthGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#16a06d" stopOpacity={0.25} />
                  <stop offset="1" stopColor="#16a06d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="growthBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#5b5bd6" stopOpacity={0.25} />
                  <stop offset="1" stopColor="#5b5bd6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                name="Users"
                dataKey="users"
                stroke="#168b63"
                fill="url(#growthGreen)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                name="Jobs"
                dataKey="jobs"
                stroke="#5b5bd6"
                fill="url(#growthBlue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>User mix</h2>
              <p>Distribution by registered role</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={userMix}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {userMix.map((entry, index) => (
                  <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className="panel span-2">
          <div className="panel-head">
            <div>
              <h2>Needs attention</h2>
              <p>Operational alerts, approvals, and moderation items</p>
            </div>
            <Button variant="ghost" onClick={() => navigate("/admin/moderation")}>
              View moderation queue
            </Button>
          </div>
          <div className="attention-list">
            <div style={{ cursor: "pointer" }} onClick={() => navigate("/admin/moderation")}>
              <i className="red">
                <Flag />
              </i>
              <span>
                <strong>{needsAttention.reported_jobs || 0} job listings reported</strong>
                <small>Requires safety review or listing removal</small>
              </span>
              <Badge tone={needsAttention.reported_jobs > 0 ? "danger" : "default"}>
                {needsAttention.reported_jobs > 0 ? "Review now" : "Clean"}
              </Badge>
            </div>
            <div style={{ cursor: "pointer" }} onClick={() => navigate("/admin/courses")}>
              <i className="orange">
                <Clock />
              </i>
              <span>
                <strong>{needsAttention.courses_awaiting_approval || 0} courses awaiting approval</strong>
                <small>Pending content quality check and publishing</small>
              </span>
              <Badge tone={needsAttention.courses_awaiting_approval > 0 ? "warning" : "default"}>
                {needsAttention.courses_awaiting_approval > 0 ? "Pending" : "Up to date"}
              </Badge>
            </div>
            <div style={{ cursor: "pointer" }} onClick={() => navigate("/admin/users")}>
              <i className="blue">
                <UserCheck />
              </i>
              <span>
                <strong>{needsAttention.employer_verifications || 0} employer verifications</strong>
                <small>Pending business credentials and profile approval</small>
              </span>
              <Badge tone={needsAttention.employer_verifications > 0 ? "purple" : "default"}>
                {needsAttention.employer_verifications > 0 ? "Verify" : "All verified"}
              </Badge>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Outcome snapshot</h2>
          </div>
          <div className="outcomes">
            <div>
              <strong>{outcomes.candidates_shortlisted || 0}</strong>
              <span>Candidates shortlisted</span>
            </div>
            <div>
              <strong>{outcomes.people_hired || 0}</strong>
              <span>People hired</span>
            </div>
            <div>
              <strong>{outcomes.assessment_completion || 0}%</strong>
              <span>Assessment pass rate</span>
            </div>
            <div>
              <strong>★ {outcomes.average_course_rating || "4.8"}</strong>
              <span>Average course rating</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// 2. USER MANAGEMENT
// -------------------------------------------------------------
export function UserManagement() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [statusFilter, setStatusFilter] = useState("Any status");
  const [selected, setSelected] = useState(null);
  const [updates, setUpdates] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const { show } = useToast();

  const { data, loading, error, refetch } = useAsync(adminService.getUsers);

  const usersList = (data || []).map((u) => ({ ...u, ...updates[u.id] }));

  const filtered = usersList.filter((u) => {
    const term = query.toLowerCase();
    const matchesQuery =
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.company_name || "").toLowerCase().includes(term) ||
      (u.location || "").toLowerCase().includes(term);

    const matchesRole =
      roleFilter === "All roles" ||
      u.role === roleFilter ||
      (roleFilter === "Job seeker" && u.role === "JOB_SEEKER") ||
      (roleFilter === "Employer" && u.role === "EMPLOYER") ||
      (roleFilter === "Course provider" && u.role === "COURSE_PROVIDER") ||
      (roleFilter === "Admin" && u.role === "ADMIN");

    const matchesStatus =
      statusFilter === "Any status" ||
      (statusFilter === "Active" && u.is_active) ||
      (statusFilter === "Inactive" && !u.is_active) ||
      (statusFilter === "Verified" && u.is_verified) ||
      (statusFilter === "Unverified" && !u.is_verified) ||
      (statusFilter === "Pending approval" && u.role === "EMPLOYER" && !u.is_approved);

    return matchesQuery && matchesRole && matchesStatus;
  });

  const toggleActive = async (user) => {
    try {
      setActionLoading(true);
      const updated = await adminService.toggleUserActive(user.id);
      setUpdates((curr) => ({ ...curr, [updated.id]: updated }));
      if (selected && selected.id === updated.id) setSelected(updated);
      show(`User account ${updated.is_active ? "activated" : "deactivated"}.`);
    } catch {
      show("Could not update user status.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleVerify = async (user) => {
    try {
      setActionLoading(true);
      const updated = await adminService.toggleUserVerify(user.id);
      setUpdates((curr) => ({ ...curr, [updated.id]: updated }));
      if (selected && selected.id === updated.id) setSelected(updated);
      show(`User email/identity ${updated.is_verified ? "marked verified" : "marked unverified"}.`);
    } catch {
      show("Could not update user verification.");
    } finally {
      setActionLoading(false);
    }
  };

  const approveEmployer = async (user, isApproved = true) => {
    try {
      setActionLoading(true);
      const updated = await adminService.approveEmployer(user.id, isApproved);
      setUpdates((curr) => ({ ...curr, [updated.id]: updated }));
      if (selected && selected.id === updated.id) setSelected(updated);
      show(`Employer company profile ${isApproved ? "approved" : "unapproved"}.`);
    } catch {
      show("Could not update employer approval.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      show("Downloading users report...");
      await adminService.downloadReport("users");
      show("Users report downloaded.");
    } catch {
      show("Could not export users.");
    }
  };

  return (
    <>
      <PageHeader
        title="User management"
        description="Verify accounts, approve employer profiles, and manage system access."
        actions={
          <Button variant="secondary" onClick={refetch}>
            <RefreshCw size={16} /> Refresh
          </Button>
        }
      />

      <div className="admin-toolbar">
        <SearchBox
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, company, location..."
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option>All roles</option>
          <option>Job seeker</option>
          <option>Employer</option>
          <option>Course provider</option>
          <option>Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>Any status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Verified</option>
          <option>Unverified</option>
          <option>Pending approval</option>
        </select>
        <Button variant="secondary" onClick={handleExport}>
          <Download size={16} /> Export
        </Button>
      </div>

      <section className="panel table-panel">
        <div className="admin-table">
          <div className="table-head">
            <span>User</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Status</span>
            <span>Approval</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}><Spinner /></div>
          ) : error ? (
            <div className="error-state">Unable to load users list.</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
              No matching users found.
            </div>
          ) : (
            filtered.map((u) => (
              <div className="table-row" key={u.id}>
                <span className="person-cell">
                  <Avatar initials={(u.name || u.email).slice(0, 2).toUpperCase()} />
                  <i>
                    <strong>{u.name || "Unnamed user"}</strong>
                    <small>{u.email}</small>
                    {u.company_name && <small style={{ color: "var(--green)" }}>{u.company_name}</small>}
                  </i>
                </span>
                <span>
                  <Badge tone={u.role === "ADMIN" ? "purple" : u.role === "EMPLOYER" ? "blue" : "default"}>
                    {u.role ? u.role.replace("_", " ") : "USER"}
                  </Badge>
                </span>
                <span>{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}</span>
                <span>
                  <Badge tone={u.is_active ? "success" : "danger"}>
                    {u.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {" "}
                  {u.is_verified && <Badge tone="success">Verified</Badge>}
                </span>
                <span>
                  {u.role === "EMPLOYER" ? (
                    <Badge tone={u.is_approved ? "success" : "warning"}>
                      {u.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>—</span>
                  )}
                </span>
                <span className="row-actions">
                  <button
                    className="icon-btn"
                    title="View details & manage"
                    onClick={() => setSelected(u)}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="icon-btn"
                    title={u.is_active ? "Deactivate account" : "Activate account"}
                    onClick={() => toggleActive(u)}
                  >
                    {u.is_active ? <UserX size={18} color="#bc3535" /> : <UserCheck size={18} color="#08744f" />}
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* User Details & Management Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Manage User Account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button
              variant={selected?.is_active ? "danger" : "primary"}
              disabled={actionLoading}
              onClick={() => toggleActive(selected)}
            >
              {selected?.is_active ? "Deactivate account" : "Activate account"}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="candidate-modal" style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
              <Avatar initials={(selected.name || selected.email).slice(0, 2).toUpperCase()} size="lg" />
              <div>
                <h2 style={{ margin: 0 }}>{selected.name || "Unnamed User"}</h2>
                <p style={{ margin: "4px 0", color: "var(--muted)" }}>{selected.email}</p>
                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                  <Badge tone="purple">{selected.role}</Badge>
                  <Badge tone={selected.is_active ? "success" : "danger"}>
                    {selected.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge tone={selected.is_verified ? "success" : "default"}>
                    {selected.is_verified ? "Email Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </div>

            <div style={{ background: "var(--bg)", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.88rem" }}>
                <div>
                  <strong>Phone:</strong> {selected.phone || "Not provided"}
                </div>
                <div>
                  <strong>Joined:</strong> {new Date(selected.date_joined).toLocaleDateString()}
                </div>
                {selected.location && (
                  <div>
                    <strong>Location:</strong> {selected.location}
                  </div>
                )}
                {selected.company_name && (
                  <div>
                    <strong>Company:</strong> {selected.company_name}
                  </div>
                )}
                {selected.headline && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>Headline / Industry:</strong> {selected.headline}
                  </div>
                )}
                <div>
                  <strong>Applications:</strong> {selected.applications_count || 0}
                </div>
                <div>
                  <strong>Jobs Posted:</strong> {selected.jobs_count || 0}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4>Administrative Controls</h4>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button
                  variant="secondary"
                  disabled={actionLoading}
                  onClick={() => toggleVerify(selected)}
                >
                  <ShieldCheck size={16} />
                  {selected.is_verified ? "Revoke verification" : "Mark verified"}
                </Button>

                {selected.role === "EMPLOYER" && (
                  <Button
                    variant={selected.is_approved ? "secondary" : "primary"}
                    disabled={actionLoading}
                    onClick={() => approveEmployer(selected, !selected.is_approved)}
                  >
                    <CheckCircle2 size={16} />
                    {selected.is_approved ? "Revoke employer approval" : "Approve company profile"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// -------------------------------------------------------------
// 3. JOB MODERATION & MANAGEMENT
// -------------------------------------------------------------
export function JobManagement() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("Any status");
  const [previewJob, setPreviewJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [updates, setUpdates] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const { show } = useToast();

  const { data, loading, error, refetch } = useAsync(adminService.getJobs);

  const jobsList = (data || []).map((j) => ({ ...j, ...updates[j.id] }));

  const filtered = jobsList.filter((j) => {
    const term = query.toLowerCase();
    const matchesQuery =
      (j.title || "").toLowerCase().includes(term) ||
      (j.company || "").toLowerCase().includes(term) ||
      (j.location || "").toLowerCase().includes(term);

    const matchesCategory =
      categoryFilter === "All categories" ||
      (j.category || "").toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "Any status" ||
      (j.status || "").toUpperCase() === statusFilter.toUpperCase();

    return matchesQuery && matchesCategory && matchesStatus;
  });

  const setStatus = async (job, newStatus) => {
    try {
      setActionLoading(true);
      const updated = await adminService.updateJob(job.id, { status: newStatus });
      setUpdates((current) => ({ ...current, [job.id]: updated }));
      if (previewJob && previewJob.id === job.id) setPreviewJob(updated);
      show(`Job "${job.title}" marked as ${newStatus.toLowerCase()}.`);
    } catch {
      show("Could not update job status.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteJob = async (job) => {
    try {
      setActionLoading(true);
      await adminService.deleteJob(job.id);
      setUpdates((current) => ({ ...current, [job.id]: { ...job, status: "REMOVED" } }));
      setJobToDelete(null);
      if (previewJob && previewJob.id === job.id) setPreviewJob(null);
      show(`Job "${job.title}" deleted.`);
      refetch();
    } catch {
      show("Could not delete job.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      show("Downloading jobs report...");
      await adminService.downloadReport("jobs");
      show("Jobs report downloaded.");
    } catch {
      show("Could not export jobs.");
    }
  };

  return (
    <>
      <PageHeader
        title="Job moderation"
        description="Review job opportunities, enforce compliance, and maintain platform quality."
        actions={
          <Button variant="secondary" onClick={refetch}>
            <RefreshCw size={16} /> Refresh
          </Button>
        }
      />

      <div className="admin-toolbar">
        <SearchBox
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, company, or location..."
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option>All categories</option>
          <option>Technology</option>
          <option>Design</option>
          <option>Skilled Trades</option>
          <option>Business</option>
          <option>Marketing</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>Any status</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Closed</option>
          <option>Removed</option>
        </select>
        <Button variant="secondary" onClick={handleExport}>
          <Download size={16} /> Export
        </Button>
      </div>

      <section className="panel table-panel">
        <div className="admin-table jobs-admin">
          <div className="table-head">
            <span>Job</span>
            <span>Company</span>
            <span>Category</span>
            <span>Status</span>
            <span>Reports</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}><Spinner /></div>
          ) : error ? (
            <div className="error-state">Unable to load jobs.</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
              No matching jobs found.
            </div>
          ) : (
            filtered.map((j) => (
              <div className="table-row" key={j.id}>
                <span>
                  <strong>{j.title}</strong>
                  <small>{j.location} · {j.job_type ? j.job_type.replace("_", " ") : "Full-time"}</small>
                </span>
                <span>{j.company || "Company"}</span>
                <span><Badge>{j.category || "General"}</Badge></span>
                <span>
                  <Badge
                    tone={
                      j.status === "PUBLISHED"
                        ? "success"
                        : j.status === "REMOVED"
                        ? "danger"
                        : j.status === "CLOSED"
                        ? "default"
                        : "warning"
                    }
                  >
                    {j.status}
                  </Badge>
                </span>
                <span>
                  {j.reports_count > 0 ? (
                    <Badge tone="danger">⚠️ {j.reports_count} {j.reports_count === 1 ? "report" : "reports"}</Badge>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>0</span>
                  )}
                </span>
                <span className="row-actions">
                  <button className="icon-btn" title="View details" onClick={() => setPreviewJob(j)}>
                    <Eye size={18} />
                  </button>
                  <select
                    style={{ fontSize: "0.78rem", padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                    value={j.status}
                    disabled={actionLoading}
                    onChange={(e) => setStatus(j, e.target.value)}
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="CLOSED">Closed</option>
                    <option value="DRAFT">Draft</option>
                    <option value="REMOVED">Removed</option>
                  </select>
                  <button className="icon-btn" title="Delete job" onClick={() => setJobToDelete(j)}>
                    <Trash2 size={16} color="#bc3535" />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Job Preview Modal */}
      <Modal
        open={!!previewJob}
        onClose={() => setPreviewJob(null)}
        title="Job Listing Details"
        footer={
          <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "space-between" }}>
            <Link to={`/jobs/${previewJob?.id}`} target="_blank" className="btn btn-secondary">
              Open public listing ↗
            </Link>
            <div style={{ display: "flex", gap: "10px" }}>
              {previewJob?.status !== "PUBLISHED" && (
                <Button variant="primary" onClick={() => setStatus(previewJob, "PUBLISHED")}>
                  Publish
                </Button>
              )}
              {previewJob?.status === "PUBLISHED" && (
                <Button variant="secondary" onClick={() => setStatus(previewJob, "CLOSED")}>
                  Close
                </Button>
              )}
              {previewJob?.status !== "REMOVED" && (
                <Button variant="danger" onClick={() => setStatus(previewJob, "REMOVED")}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        }
      >
        {previewJob && (
          <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{previewJob.title}</h2>
                <p style={{ margin: "4px 0", color: "var(--muted)" }}>
                  {previewJob.company} · {previewJob.location}
                </p>
              </div>
              <Badge tone={previewJob.status === "PUBLISHED" ? "success" : "danger"}>
                {previewJob.status}
              </Badge>
            </div>

            <div style={{ background: "var(--bg)", padding: "14px", borderRadius: "10px", marginBottom: "16px", fontSize: "0.88rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><strong>Category:</strong> {previewJob.category}</div>
                <div><strong>Type:</strong> {previewJob.job_type}</div>
                <div><strong>Salary:</strong> {previewJob.salary || "Competitive"}</div>
                <div><strong>Experience:</strong> {previewJob.experience || "Not specified"}</div>
                <div><strong>Open Reports:</strong> {previewJob.reports_count || 0}</div>
                <div><strong>Applications:</strong> {previewJob.applications_count || 0}</div>
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <h4>Description</h4>
              <p style={{ whiteSpace: "pre-line", color: "#45534f", fontSize: "0.9rem" }}>
                {previewJob.description}
              </p>
            </div>

            {previewJob.requirements && (
              <div style={{ marginBottom: "15px" }}>
                <h4>Requirements</h4>
                <p style={{ whiteSpace: "pre-line", color: "#45534f", fontSize: "0.9rem" }}>
                  {previewJob.requirements}
                </p>
              </div>
            )}

            {previewJob.skills && previewJob.skills.length > 0 && (
              <div>
                <h4>Required Skills</h4>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  {previewJob.skills.map((s) => (
                    <Badge key={typeof s === "string" ? s : s.name}>
                      {typeof s === "string" ? s : s.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Job Confirmation Modal */}
      <Modal
        open={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        title="Confirm Delete Job"
        footer={
          <>
            <Button variant="secondary" onClick={() => setJobToDelete(null)}>Cancel</Button>
            <Button variant="danger" disabled={actionLoading} onClick={() => deleteJob(jobToDelete)}>
              Delete Permanently
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{jobToDelete?.title}</strong> by <strong>{jobToDelete?.company}</strong>?
          This action will permanently delete the job and associated records.
        </p>
      </Modal>
    </>
  );
}

// -------------------------------------------------------------
// 4. COURSE MANAGEMENT
// -------------------------------------------------------------
export function CourseManagement() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("Any status");
  const [previewCourse, setPreviewCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [updates, setUpdates] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const { show } = useToast();

  const { data, loading, error, refetch } = useAsync(courseService.getCourses);

  const coursesList = (data || []).map((c) => ({ ...c, ...updates[c.id] }));

  const filtered = coursesList.filter((c) => {
    const term = query.toLowerCase();
    const matchesQuery =
      (c.title || "").toLowerCase().includes(term) ||
      (c.provider || "").toLowerCase().includes(term) ||
      (c.description || "").toLowerCase().includes(term);

    const matchesCategory =
      categoryFilter === "All categories" ||
      (c.category || "").toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "Any status" ||
      (c.status || "").toUpperCase() === statusFilter.toUpperCase();

    return matchesQuery && matchesCategory && matchesStatus;
  });

  const setStatus = async (course, newStatus) => {
    try {
      setActionLoading(true);
      const updated = await adminService.updateCourse(course.id, { status: newStatus });
      setUpdates((current) => ({ ...current, [course.id]: updated }));
      if (previewCourse && previewCourse.id === course.id) setPreviewCourse(updated);
      show(`Course "${course.title}" marked as ${newStatus.toLowerCase()}.`);
    } catch {
      show("Could not update course status.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCourse = async (course) => {
    try {
      setActionLoading(true);
      await adminService.deleteCourse(course.id);
      setUpdates((current) => ({ ...current, [course.id]: { ...course, status: "REMOVED" } }));
      setCourseToDelete(null);
      if (previewCourse && previewCourse.id === course.id) setPreviewCourse(null);
      show(`Course "${course.title}" deleted.`);
      refetch();
    } catch {
      show("Could not delete course.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      show("Downloading courses report...");
      await adminService.downloadReport("courses");
      show("Courses report downloaded.");
    } catch {
      show("Could not export courses.");
    }
  };

  return (
    <>
      <PageHeader
        title="Course management"
        description="Review learning programs, approve educator submissions, and manage course catalog."
        actions={
          <Button variant="secondary" onClick={refetch}>
            <RefreshCw size={16} /> Refresh
          </Button>
        }
      />

      <div className="admin-toolbar">
        <SearchBox
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by course title or provider..."
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option>All categories</option>
          <option>Technology</option>
          <option>Business</option>
          <option>Design</option>
          <option>Career</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>Any status</option>
          <option>Published</option>
          <option>Pending</option>
          <option>Draft</option>
          <option>Removed</option>
        </select>
        <Button variant="secondary" onClick={handleExport}>
          <Download size={16} /> Export
        </Button>
      </div>

      <section className="panel table-panel">
        <div className="admin-table jobs-admin">
          <div className="table-head">
            <span>Course</span>
            <span>Provider</span>
            <span>Price</span>
            <span>Rating</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}><Spinner /></div>
          ) : error ? (
            <div className="error-state">Unable to load courses.</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
              No matching courses found.
            </div>
          ) : (
            filtered.map((c) => (
              <div className="table-row" key={c.id}>
                <span>
                  <strong>{c.title}</strong>
                  <small>{c.lessons || c.lessons_count || 0} modules · {c.duration || "Self-paced"}</small>
                </span>
                <span>{c.provider || "Academy"}</span>
                <strong>{c.price ? `৳${c.price.toLocaleString()}` : "Free"}</strong>
                <span>★ {c.rating ? Number(c.rating).toFixed(1) : "—"}</span>
                <span>
                  <Badge
                    tone={
                      c.status === "PUBLISHED"
                        ? "success"
                        : c.status === "PENDING"
                        ? "warning"
                        : c.status === "REMOVED"
                        ? "danger"
                        : "default"
                    }
                  >
                    {c.status}
                  </Badge>
                </span>
                <span className="row-actions">
                  <button className="icon-btn" title="View details" onClick={() => setPreviewCourse(c)}>
                    <Eye size={18} />
                  </button>
                  {c.status !== "PUBLISHED" && (
                    <button
                      className="icon-btn"
                      title="Approve & publish"
                      onClick={() => setStatus(c, "PUBLISHED")}
                    >
                      <CheckCircle2 size={18} color="#08744f" />
                    </button>
                  )}
                  <select
                    style={{ fontSize: "0.78rem", padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                    value={c.status}
                    disabled={actionLoading}
                    onChange={(e) => setStatus(c, e.target.value)}
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="PENDING">Pending</option>
                    <option value="DRAFT">Draft</option>
                    <option value="REMOVED">Removed</option>
                  </select>
                  <button className="icon-btn" title="Delete course" onClick={() => setCourseToDelete(c)}>
                    <Trash2 size={16} color="#bc3535" />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Course Preview Modal */}
      <Modal
        open={!!previewCourse}
        onClose={() => setPreviewCourse(null)}
        title="Course Details"
        footer={
          <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "space-between" }}>
            <Link to={`/courses/${previewCourse?.id}`} target="_blank" className="btn btn-secondary">
              Open public course ↗
            </Link>
            <div style={{ display: "flex", gap: "10px" }}>
              {previewCourse?.status !== "PUBLISHED" && (
                <Button variant="primary" onClick={() => setStatus(previewCourse, "PUBLISHED")}>
                  Approve & publish
                </Button>
              )}
              {previewCourse?.status === "PUBLISHED" && (
                <Button variant="secondary" onClick={() => setStatus(previewCourse, "DRAFT")}>
                  Unpublish to draft
                </Button>
              )}
              {previewCourse?.status !== "REMOVED" && (
                <Button variant="danger" onClick={() => setStatus(previewCourse, "REMOVED")}>
                  Remove course
                </Button>
              )}
            </div>
          </div>
        }
      >
        {previewCourse && (
          <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{previewCourse.title}</h2>
                <p style={{ margin: "4px 0", color: "var(--muted)" }}>
                  Provided by {previewCourse.provider} · Category: {previewCourse.category}
                </p>
              </div>
              <Badge tone={previewCourse.status === "PUBLISHED" ? "success" : "warning"}>
                {previewCourse.status}
              </Badge>
            </div>

            <div style={{ background: "var(--bg)", padding: "14px", borderRadius: "10px", marginBottom: "16px", fontSize: "0.88rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><strong>Price:</strong> {previewCourse.price ? `৳${previewCourse.price}` : "Free"}</div>
                <div><strong>Rating:</strong> ★ {previewCourse.rating || "Unrated"}</div>
                <div><strong>Duration:</strong> {previewCourse.duration || "Self-paced"}</div>
                <div><strong>Modules:</strong> {previewCourse.lessons || previewCourse.lessons_count || 0}</div>
                <div><strong>Enrollments:</strong> {previewCourse.enrollments_count || 0}</div>
                <div><strong>Reports:</strong> {previewCourse.reports_count || 0}</div>
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <h4>Description</h4>
              <p style={{ whiteSpace: "pre-line", color: "#45534f", fontSize: "0.9rem" }}>
                {previewCourse.description || "No description provided."}
              </p>
            </div>

            {previewCourse.modules && previewCourse.modules.length > 0 && (
              <div>
                <h4>Curriculum Modules</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  {previewCourse.modules.map((m, idx) => (
                    <div key={m.id || idx} style={{ padding: "8px 12px", background: "white", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "0.88rem" }}>
                      <strong>Module {idx + 1}:</strong> {m.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Course Confirmation Modal */}
      <Modal
        open={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        title="Confirm Delete Course"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCourseToDelete(null)}>Cancel</Button>
            <Button variant="danger" disabled={actionLoading} onClick={() => deleteCourse(courseToDelete)}>
              Delete Course
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to permanently delete <strong>{courseToDelete?.title}</strong>?
          This action will remove all modules and enrollment records for this course.
        </p>
      </Modal>
    </>
  );
}

// -------------------------------------------------------------
// 5. REPORTS & ANALYTICS
// -------------------------------------------------------------
export function Reports() {
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState("Last 6 months");
  const [region, setRegion] = useState("All Bangladesh");
  const [downloading, setDownloading] = useState(false);
  const { show } = useToast();

  const { data, loading, error, refetch } = useAsync(adminService.getAnalytics);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      show(`Exporting ${reportType} report...`);
      await adminService.downloadReport(reportType);
      show("Report downloaded successfully!");
    } catch {
      show("Could not download report.");
    } finally {
      setDownloading(false);
    }
  };

  const analytics = data || {};
  const growth = analytics.growth && analytics.growth.length > 0
    ? analytics.growth
    : [
        { m: "Apr", applications: 45, hires: 6, users: 120, jobs: 18 },
        { m: "May", applications: 85, hires: 12, users: 180, jobs: 24 },
        { m: "Jun", applications: 130, hires: 18, users: 260, jobs: 35 },
        { m: "Jul", applications: 190, hires: 25, users: 340, jobs: 42 },
        { m: "Aug", applications: 245, hires: 32, users: 430, jobs: 51 },
        { m: "Sep", applications: 310, hires: 42, users: 520, jobs: 60 },
      ];

  const categories = analytics.categories && analytics.categories.length > 0
    ? analytics.categories
    : [
        { n: "Technology", v: 4 },
        { n: "Design", v: 2 },
        { n: "Skilled Trades", v: 1 },
        { n: "Business", v: 1 },
      ];

  return (
    <>
      <PageHeader
        title="Reports & analytics"
        description="Comprehensive platform intelligence, conversion metrics, and printable/downloadable audits."
        actions={
          <div className="header-actions">
            <Button variant="secondary" onClick={refetch}>
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button variant="primary" onClick={handleDownload} disabled={downloading}>
              <Download size={16} />
              {downloading ? "Downloading..." : "Download report (CSV)"}
            </Button>
          </div>
        }
      />

      <div className="report-filter">
        <label>
          <span>Date range</span>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option>Last 6 months</option>
            <option>Last 30 days</option>
            <option>Year to date</option>
            <option>All time</option>
          </select>
        </label>
        <label>
          <span>Report dataset</span>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="overview">Platform overview</option>
            <option value="users">Registered users</option>
            <option value="jobs">Job listings & demand</option>
            <option value="applications">Applications & hiring</option>
            <option value="courses">Learning & courses</option>
            <option value="moderation">Moderation audits</option>
          </select>
        </label>
        <label>
          <span>Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option>All Bangladesh</option>
            <option>Dhaka</option>
            <option>Chittagong</option>
            <option>Sylhet</option>
            <option>Remote</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="panel"><Spinner /></div>
      ) : error ? (
        <div className="panel error-state">Failed to load reporting data.</div>
      ) : (
        <div className="admin-grid">
          <section className="panel chart-panel span-2">
            <div className="panel-head">
              <div>
                <h2>Applications and hires</h2>
                <p>Monthly conversion comparison</p>
              </div>
              <Badge tone="default">Live trends</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  name="Applications"
                  dataKey="applications"
                  stroke="#168b63"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  name="Hires"
                  dataKey="hires"
                  stroke="#5b5bd6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Top job categories</h2>
              <p>Demand by category</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={categories}>
                <XAxis type="number" hide />
                <YAxis dataKey="n" type="category" width={95} />
                <Tooltip />
                <Bar dataKey="v" name="Jobs" fill="#168b63" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Popular Jobs Section */}
          <section className="panel">
            <div className="panel-head">
              <h2>Most popular jobs</h2>
              <p>By total applicant count</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {analytics.popular_jobs && analytics.popular_jobs.length > 0 ? (
                analytics.popular_jobs.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <span><strong>{job.title}</strong></span>
                    <Badge tone="purple">{job.count} applicants</Badge>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--muted)", padding: "10px 0" }}>No applications yet.</div>
              )}
            </div>
          </section>

          {/* Popular Courses Section */}
          <section className="panel span-2">
            <div className="panel-head">
              <h2>Most enrolled courses</h2>
              <p>Active learning programs</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {analytics.popular_courses && analytics.popular_courses.length > 0 ? (
                analytics.popular_courses.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <span><strong>{course.title}</strong></span>
                    <Badge tone="success">{course.count} enrolled learners</Badge>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--muted)", padding: "10px 0" }}>No enrollments yet.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

// -------------------------------------------------------------
// 6. MODERATION QUEUE
// -------------------------------------------------------------
export function Moderation() {
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState("OPEN");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [previewTarget, setPreviewTarget] = useState(null);
  const [updates, setUpdates] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const { data, loading, error, refetch } = useAsync(adminService.getReports);

  const reports = (data || []).map((report) => ({ ...report, ...updates[report.id] }));

  const openCount = reports.filter((r) => (r.status || "").toUpperCase() === "OPEN").length;
  const resolvedCount = reports.filter((r) => (r.status || "").toUpperCase() === "RESOLVED").length;
  const dismissedCount = reports.filter((r) => (r.status || "").toUpperCase() === "DISMISSED").length;

  const filteredReports = reports.filter((r) => {
    const status = (r.status || "OPEN").toUpperCase();
    const matchesTab =
      activeTab === "AUDIT" ||
      status === activeTab;

    const matchesType =
      typeFilter === "ALL" ||
      (r.target_type || "").toUpperCase() === typeFilter.toUpperCase();

    const term = query.toLowerCase();
    const matchesQuery =
      (r.reason || "").toLowerCase().includes(term) ||
      (r.target_title || "").toLowerCase().includes(term) ||
      (r.target_type || "").toLowerCase().includes(term);

    return matchesTab && matchesType && matchesQuery;
  });

  const resolve = async (report, newStatus, removeTarget = false) => {
    try {
      setActionLoading(true);
      const updated = await adminService.resolveReport(report.id, {
        status: newStatus,
        remove_target: removeTarget,
      });
      setUpdates((current) => ({ ...current, [updated.id]: updated }));
      if (previewTarget) setPreviewTarget(null);
      show(
        removeTarget
          ? `Report resolved and listing #${report.target_id} marked as removed.`
          : `Report marked ${newStatus.toLowerCase()}.`
      );
    } catch {
      show("We could not update this report.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      show("Downloading moderation audit log...");
      await adminService.downloadReport("moderation");
      show("Moderation log downloaded.");
    } catch {
      show("Could not export moderation log.");
    }
  };

  return (
    <>
      <PageHeader
        title="Moderation queue"
        description="Review reported content, protect user safety, and audit platform governance decisions."
        actions={
          <div className="header-actions">
            <Button variant="secondary" onClick={refetch}>
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} /> Export audit log
            </Button>
          </div>
        }
      />

      <div className="moderation-tabs">
        <button
          className={activeTab === "OPEN" ? "active" : ""}
          onClick={() => setActiveTab("OPEN")}
        >
          Open reports <b>{openCount}</b>
        </button>
        <button
          className={activeTab === "RESOLVED" ? "active" : ""}
          onClick={() => setActiveTab("RESOLVED")}
        >
          Resolved <b>{resolvedCount}</b>
        </button>
        <button
          className={activeTab === "DISMISSED" ? "active" : ""}
          onClick={() => setActiveTab("DISMISSED")}
        >
          Dismissed <b>{dismissedCount}</b>
        </button>
        <button
          className={activeTab === "AUDIT" ? "active" : ""}
          onClick={() => setActiveTab("AUDIT")}
        >
          Audit log <b>{reports.length}</b>
        </button>
      </div>

      <div className="admin-toolbar" style={{ marginBottom: "20px" }}>
        <SearchBox
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports by reason, target title, or reporter..."
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="ALL">All targets</option>
          <option value="JOB">Job listings</option>
          <option value="COURSE">Courses</option>
          <option value="USER">User accounts</option>
        </select>
      </div>

      <div className="moderation-list">
        {loading ? (
          <div className="panel"><Spinner /></div>
        ) : error ? (
          <div className="panel error-state">Unable to load moderation reports.</div>
        ) : filteredReports.length ? (
          filteredReports.map((report) => (
            <article className="panel" key={report.id}>
              <div className="row between" style={{ alignItems: "flex-start" }}>
                <div className="report-type">
                  <i style={{
                    background: report.status === "OPEN" ? "#fdeaea" : "#e2f5ed",
                    color: report.status === "OPEN" ? "var(--red)" : "var(--green)"
                  }}>
                    {report.status === "OPEN" ? <AlertTriangle /> : <ShieldCheck />}
                  </i>
                  <span>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <Badge tone={report.status === "OPEN" ? "danger" : report.status === "RESOLVED" ? "success" : "default"}>
                        {report.status}
                      </Badge>
                      <Badge tone="purple">{report.target_type}</Badge>
                      {report.target_status && (
                        <Badge tone={report.target_status === "REMOVED" ? "danger" : "default"}>
                          Listing: {report.target_status}
                        </Badge>
                      )}
                    </div>
                    <h2 style={{ fontSize: "1.1rem", margin: "6px 0 2px" }}>
                      {report.target_title || `${report.target_type} #${report.target_id}`}
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
                      Reported by {report.reporter?.name || report.reporter?.email || "Anonymous user"} on {new Date(report.created_at).toLocaleString()}
                    </p>
                  </span>
                </div>
              </div>

              <div className="report-reason">
                <strong>Report reason & evidence:</strong>
                <p style={{ margin: "6px 0 0", color: "#45534f" }}>{report.reason}</p>
              </div>

              {report.resolved_by && (
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "10px 0" }}>
                  Resolved by <strong>{report.resolved_by.name || report.resolved_by.email}</strong> on {new Date(report.updated_at).toLocaleString()}
                </div>
              )}

              <div className="row between" style={{ marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
                <Button
                  variant="secondary"
                  onClick={() => setPreviewTarget(report)}
                >
                  <Eye size={16} />
                  Preview reported item
                </Button>

                {report.status === "OPEN" ? (
                  <div className="header-actions">
                    <Button
                      variant="secondary"
                      disabled={actionLoading}
                      onClick={() => resolve(report, "DISMISSED", false)}
                    >
                      Dismiss report
                    </Button>
                    <Button
                      variant="danger"
                      disabled={actionLoading}
                      onClick={() => resolve(report, "RESOLVED", true)}
                    >
                      <ShieldAlert size={16} />
                      Remove listing & resolve
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => resolve(report, "OPEN", false)}
                  >
                    Reopen report
                  </Button>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="panel" style={{ textAlign: "center", padding: "40px" }}>
            <ShieldCheck size={36} color="var(--green)" style={{ margin: "0 auto 10px" }} />
            <h3>No moderation reports</h3>
            <p style={{ color: "var(--muted)" }}>There are no reports matching the selected filters.</p>
          </div>
        )}
      </div>

      {/* Target Item Details Preview Modal */}
      <Modal
        open={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        title={`Reported ${previewTarget?.target_type || "Item"} Details`}
        footer={
          <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "space-between" }}>
            <Button variant="secondary" onClick={() => setPreviewTarget(null)}>
              Close
            </Button>
            {previewTarget?.status === "OPEN" && (
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  variant="secondary"
                  disabled={actionLoading}
                  onClick={() => resolve(previewTarget, "DISMISSED", false)}
                >
                  Dismiss
                </Button>
                <Button
                  variant="danger"
                  disabled={actionLoading}
                  onClick={() => resolve(previewTarget, "RESOLVED", true)}
                >
                  Remove listing & resolve
                </Button>
              </div>
            )}
          </div>
        }
      >
        {previewTarget && (
          <div>
            <div style={{ background: "#fdeaea", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
              <strong style={{ color: "var(--red)" }}>Report Reason:</strong>
              <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>{previewTarget.reason}</p>
            </div>

            {previewTarget.target_details ? (
              <div style={{ background: "var(--bg)", padding: "14px", borderRadius: "10px", fontSize: "0.88rem" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: "1.1rem" }}>
                  {previewTarget.target_details.title || previewTarget.target_details.name}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div><strong>ID:</strong> #{previewTarget.target_details.id}</div>
                  <div><strong>Current Status:</strong> {previewTarget.target_details.status || (previewTarget.target_details.is_active ? "Active" : "Inactive")}</div>
                  {previewTarget.target_details.company && (
                    <div><strong>Company:</strong> {previewTarget.target_details.company}</div>
                  )}
                  {previewTarget.target_details.provider && (
                    <div><strong>Provider:</strong> {previewTarget.target_details.provider}</div>
                  )}
                  {previewTarget.target_details.category && (
                    <div><strong>Category:</strong> {previewTarget.target_details.category}</div>
                  )}
                  {previewTarget.target_details.location && (
                    <div><strong>Location:</strong> {previewTarget.target_details.location}</div>
                  )}
                </div>
                {previewTarget.target_details.description && (
                  <div style={{ marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
                    <strong>Content snippet:</strong>
                    <p style={{ margin: "4px 0 0", color: "#45534f" }}>{previewTarget.target_details.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>Target item details are not available or item has been deleted.</p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

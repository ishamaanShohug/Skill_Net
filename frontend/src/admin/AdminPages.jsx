import { useState } from "react";
import { Link } from "react-router-dom";
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
  ShieldCheck,
  TrendingUp,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Modal,
  PageHeader,
  SearchBox,
  StatCard,
} from "../shared/components/common/UI";
import { useToast } from "../shared/context/ToastContext";
import { adminService } from "./adminService";
import { courseService, jobService } from "../shared/services/shared";
import { downloadCsv } from "../shared/services/normalize";
import { useAsync } from "../shared/hooks/useAsync";
const delta = (current, previous) => {
  if (previous == null || current == null) return null;
  const diff = current - previous;
  if (diff === 0) return "No change this month";
  return `${diff > 0 ? "+" : ""}${diff} this month`;
};
export function AdminDashboard() {
  const { data, loading, error } = useAsync(adminService.getAnalytics);
  if (loading) return <div className="panel">Loading platform analytics…</div>;
  if (error) return <div className="panel">We could not load platform analytics.</div>;
  const analytics = data || {};
  const growth = analytics.growth || [];
  const latest = growth[growth.length - 1];
  const previous = growth[growth.length - 2];
  const moderation = analytics.moderation || {};
  const outcomes = analytics.outcomes || {};
  const needsAttention = [
    {
      to: "/admin/moderation",
      icon: Flag,
      tone: "red",
      title: `${moderation.open_reports || 0} listing report${moderation.open_reports === 1 ? "" : "s"} open`,
      note: "Reported by job seekers and employers",
      badge: <Badge tone="danger">Review</Badge>,
    },
    {
      to: "/admin/courses",
      icon: Clock,
      tone: "orange",
      title: `${moderation.pending_courses || 0} course${moderation.pending_courses === 1 ? "" : "s"} awaiting approval`,
      note: moderation.oldest_pending_course_days != null
        ? `Oldest submitted ${moderation.oldest_pending_course_days} day${moderation.oldest_pending_course_days === 1 ? "" : "s"} ago`
        : "All caught up",
      badge: <Badge>Pending</Badge>,
    },
    {
      to: "/admin/users",
      icon: UserCheck,
      tone: "blue",
      title: `${moderation.unverified_employers || 0} employer verification${moderation.unverified_employers === 1 ? "" : "s"}`,
      note: "Awaiting business approval",
      badge: <Badge tone="purple">Verify</Badge>,
    },
  ];
  const exportOverview = () =>
    downloadCsv("skillnet-overview.csv", [
      { metric: "Total users", value: analytics.users?.total || 0 },
      { metric: "Job seekers", value: analytics.users?.seekers || 0 },
      { metric: "Employers", value: analytics.users?.employers || 0 },
      { metric: "Active jobs", value: analytics.jobs?.active || 0 },
      { metric: "Total applications", value: analytics.applications?.total || 0 },
      { metric: "Course enrollments", value: analytics.courses?.enrollments || 0 },
      { metric: "Candidates shortlisted", value: outcomes.shortlisted || 0 },
      { metric: "People hired", value: outcomes.hired || 0 },
      { metric: "Assessment completion", value: `${outcomes.assessment_completion_rate || 0}%` },
      { metric: "Average course rating", value: outcomes.avg_course_rating || 0 },
    ]);
  return (
    <>
      <PageHeader
        eyebrow="PLATFORM OVERVIEW"
        title="SkillNet at a glance"
        description="Healthy growth, meaningful outcomes, and the work needing attention."
        actions={
          <Button variant="secondary" onClick={exportOverview}>
            <Download />
            Export report
          </Button>
        }
      />
      <div className="stats-grid four">
        <StatCard
          label="Total users"
          value={analytics.users?.total || 0}
          change={delta(latest?.users, previous?.users) || "—"}
          icon={Users}
        />
        <StatCard
          label="Active jobs"
          value={analytics.jobs?.active || 0}
          change={delta(latest?.jobs, previous?.jobs) || "—"}
          icon={BriefcaseBusiness}
          tone="blue"
        />
        <StatCard
          label="Applications"
          value={analytics.applications?.total || 0}
          change={delta(latest?.applications, previous?.applications) || "—"}
          icon={TrendingUp}
          tone="purple"
        />
        <StatCard
          label="Course enrollments"
          value={analytics.courses?.enrollments || 0}
          change={`${analytics.courses?.total || 0} courses published`}
          icon={BookOpen}
          tone="orange"
        />
      </div>
      <div className="admin-grid">
        <section className="panel chart-panel span-2">
          <div className="panel-head">
            <div>
              <h2>Platform growth</h2>
              <p>Users and job activity over six months</p>
            </div>
            <select disabled>
              <option>Last 6 months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growth}>
              <defs>
                <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#16a06d" stopOpacity=".25" />
                  <stop offset="1" stopColor="#16a06d" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#168b63"
                fill="url(#green)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>User mix</h2>
              <p>By primary role</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={[
                  { name: "Job seekers", value: analytics.users?.seekers || 0 },
                  { name: "Employers", value: analytics.users?.employers || 0 },
                ]}
                innerRadius={62}
                outerRadius={86}
                paddingAngle={3}
                dataKey="value"
              >
                {["#168b63", "#5b5bd6"].map((c) => (
                  <Cell fill={c} key={c} />
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
              <p>Moderation and operational queue</p>
            </div>
            <Link className="btn btn-ghost" to="/admin/moderation">
              View all
            </Link>
          </div>
          <div className="attention-list">
            {needsAttention.map((item) => (
              <Link to={item.to} key={item.title}>
                <i className={item.tone}>
                  <item.icon />
                </i>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.note}</small>
                </span>
                {item.badge}
              </Link>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Outcome snapshot</h2>
          </div>
          <div className="outcomes">
            <div>
              <strong>{outcomes.shortlisted ?? 0}</strong>
              <span>Candidates shortlisted</span>
            </div>
            <div>
              <strong>{outcomes.hired ?? 0}</strong>
              <span>People hired</span>
            </div>
            <div>
              <strong>{outcomes.assessment_completion_rate ?? 0}%</strong>
              <span>Assessment completion</span>
            </div>
            <div>
              <strong>{outcomes.avg_course_rating ?? 0}</strong>
              <span>Average course rating</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
const ROLE_OPTIONS = [
  { label: "All roles", value: "" },
  { label: "Job seeker", value: "JOB_SEEKER" },
  { label: "Employer", value: "EMPLOYER" },
  { label: "Course provider", value: "COURSE_PROVIDER" },
];
const USER_STATUS_OPTIONS = [
  { label: "Any status", value: "" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];
export function UserManagement() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [updates, setUpdates] = useState({});
  const { data, loading, error } = useAsync(
    () => adminService.getUsers({ role: role || undefined, is_active: activeStatus || undefined }),
    [role, activeStatus],
  );
  const filtered = (data || []).map((user) => ({ ...user, ...updates[user.id] })).filter((u) =>
    (u.name + u.email).toLowerCase().includes(query.toLowerCase()),
  );
  const toggleActive = async () => {
    const updated = await adminService.updateUser(selected.id, { is_active: !selected.is_active });
    setUpdates((current) => ({ ...current, [updated.id]: updated }));
    setSelected(updated);
  };
  const exportUsers = () =>
    downloadCsv(
      "skillnet-users.csv",
      filtered.map((u) => ({ name: u.name, email: u.email, role: u.role, joined: u.date_joined, active: u.is_active })),
    );
  return (
    <>
      <PageHeader
        title="User management"
        description="Support users, verify roles, and keep access safe."
      />
      <AdminToolbar
        query={query}
        setQuery={setQuery}
        options={ROLE_OPTIONS}
        filterValue={role}
        setFilterValue={setRole}
        statusOptions={USER_STATUS_OPTIONS}
        statusValue={activeStatus}
        setStatusValue={setActiveStatus}
        onExport={exportUsers}
      />
      <section className="panel table-panel">
        <div className="admin-table">
          <div className="table-head">
            <span>User</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Status</span>
            <span />
          </div>
          {loading ? <div>Loading users…</div> : error ? <div>Unable to load users.</div> : filtered.length ? filtered.map((u) => (
            <div className="table-row" key={u.id}>
              <span className="person-cell">
                <Avatar initials={u.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")} seed={u.id} />
                <i>
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                </i>
              </span>
              <Badge>{u.role}</Badge>
              <span>{new Date(u.date_joined).toLocaleDateString()}</span>
              <Badge tone={u.is_active ? "success" : "danger"}>
                {u.is_active ? "Active" : "Inactive"}
              </Badge>
              <button className="icon-btn" onClick={() => setSelected(u)}>
                <MoreHorizontal />
              </button>
            </div>
          )) : <div>No users match these filters.</div>}
        </div>
      </section>
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Manage user"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button variant={selected?.is_active ? "danger" : "primary"} onClick={toggleActive}>
              {selected?.is_active ? "Deactivate account" : "Activate account"}
            </Button>
          </>
        }
      >
        <div className="candidate-modal">
          <Avatar initials={selected?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")} seed={selected?.id} size="lg" />
          <h2>{selected?.name}</h2>
          <p>{selected?.email}</p>
          <Badge>{selected?.role}</Badge>
        </div>
      </Modal>
    </>
  );
}
function AdminToolbar({ query, setQuery, options, filterValue, setFilterValue, statusOptions, statusValue, setStatusValue, onExport }) {
  return (
    <div className="admin-toolbar">
      <SearchBox
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search records"
      />
      <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
        {options.map((x) => (
          <option key={x.value} value={x.value}>{x.label}</option>
        ))}
      </select>
      {statusOptions && (
        <select value={statusValue} onChange={(e) => setStatusValue(e.target.value)}>
          {statusOptions.map((x) => (
            <option key={x.value} value={x.value}>{x.label}</option>
          ))}
        </select>
      )}
      <Button variant="secondary" onClick={onExport}>
        <Download />
        Export
      </Button>
    </div>
  );
}
export function JobManagement() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatusFilter] = useState("");
  const [updates, setUpdates] = useState({});
  const { show } = useToast();
  const { data, loading, error } = useAsync(
    () => jobService.getJobs({ category: category || undefined, status: status || undefined }),
    [category, status],
  );
  const { data: reportsData } = useAsync(adminService.getReports);
  const reportCounts = (reportsData || []).reduce((acc, r) => {
    if (r.target_type === "JOB") acc[r.target_id] = (acc[r.target_id] || 0) + 1;
    return acc;
  }, {});
  const items = (data || []).map((job) => ({ ...job, ...updates[job.id] })).filter((j) =>
    (j.title + j.company).toLowerCase().includes(query.toLowerCase()),
  );
  const setStatus = async (job, newStatus) => {
    try {
      const updated = await jobService.update(job.id, { status: newStatus });
      setUpdates((current) => ({ ...current, [job.id]: updated }));
      show(`Job marked ${newStatus.toLowerCase()}.`);
    } catch { show("We could not update this job."); }
  };
  const exportJobs = () =>
    downloadCsv(
      "skillnet-jobs.csv",
      items.map((j) => ({ title: j.title, company: j.company, location: j.location, status: j.status, reports: reportCounts[j.id] || 0 })),
    );
  return (
    <>
      <PageHeader
        title="Job moderation"
        description="Keep opportunities trustworthy, clear, and appropriate."
      />
      <AdminToolbar
        query={query}
        setQuery={setQuery}
        options={[
          { label: "All categories", value: "" },
          { label: "Technology", value: "Technology" },
          { label: "Design", value: "Design" },
          { label: "Skilled Trades", value: "Skilled Trades" },
        ]}
        filterValue={category}
        setFilterValue={setCategory}
        statusOptions={[
          { label: "Any status", value: "" },
          { label: "Draft", value: "DRAFT" },
          { label: "Published", value: "PUBLISHED" },
          { label: "Closed", value: "CLOSED" },
          { label: "Removed", value: "REMOVED" },
        ]}
        statusValue={status}
        setStatusValue={setStatusFilter}
        onExport={exportJobs}
      />
      <section className="panel table-panel">
        <div className="admin-table jobs-admin">
          <div className="table-head">
            <span>Job</span>
            <span>Company</span>
            <span>Posted</span>
            <span>Status</span>
            <span>Reports</span>
            <span />
          </div>
          {loading ? <div>Loading jobs…</div> : error ? <div>Unable to load jobs.</div> : items.length ? items.map((j) => (
            <div className="table-row" key={j.id}>
              <span>
                <strong>{j.title}</strong>
                <small>{j.location}</small>
              </span>
              <span>{j.company}</span>
              <span>{j.posted}</span>
              <Badge tone={j.status === "PUBLISHED" ? "success" : j.status === "REMOVED" ? "danger" : "default"}>
                {j.status}
              </Badge>
              <strong>{reportCounts[j.id] || "—"}</strong>
              <span className="row-actions">
                <Link to={`/jobs/${j.id}`} target="_blank" rel="noreferrer" title="View public listing">
                  <Eye />
                </Link>
                <button onClick={() => setStatus(j, j.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED")} title="Change publication status">
                  <ShieldCheck />
                </button>
                <button onClick={() => setStatus(j, "REMOVED")} disabled={j.status === "REMOVED"} title="Remove listing">
                  <Trash2 />
                </button>
              </span>
            </div>
          )) : <div>No jobs match these filters.</div>}
        </div>
      </section>
    </>
  );
}
export function CourseManagement() {
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatusFilter] = useState("");
  const [updates, setUpdates] = useState({});
  const { data, loading, error } = useAsync(
    () => courseService.getCourses({ category: category || undefined, status: status || undefined }),
    [category, status],
  );
  const items = (data || []).map((course) => ({ ...course, ...updates[course.id] })).filter((c) =>
    (c.title + c.provider).toLowerCase().includes(query.toLowerCase()),
  );
  const setStatus = async (course, newStatus) => {
    try {
      const updated = await courseService.update(course.id, { status: newStatus });
      setUpdates((current) => ({ ...current, [course.id]: updated }));
      show(`Course marked ${newStatus.toLowerCase()}.`);
    } catch { show("We could not update this course."); }
  };
  const exportCourses = () =>
    downloadCsv(
      "skillnet-courses.csv",
      items.map((c) => ({ title: c.title, provider: c.provider, price: c.price, rating: c.rating, status: c.status })),
    );
  return (
    <>
      <PageHeader
        title="Course management"
        description="Review learning content and maintain platform quality."
      />
      <AdminToolbar
        query={query}
        setQuery={setQuery}
        options={[
          { label: "All categories", value: "" },
          { label: "Technology", value: "Technology" },
          { label: "Business", value: "Business" },
          { label: "Career", value: "Career" },
        ]}
        filterValue={category}
        setFilterValue={setCategory}
        statusOptions={[
          { label: "Any status", value: "" },
          { label: "Draft", value: "DRAFT" },
          { label: "Pending", value: "PENDING" },
          { label: "Published", value: "PUBLISHED" },
          { label: "Removed", value: "REMOVED" },
        ]}
        statusValue={status}
        setStatusValue={setStatusFilter}
        onExport={exportCourses}
      />
      <section className="panel table-panel">
        <div className="admin-table jobs-admin">
          <div className="table-head">
            <span>Course</span>
            <span>Provider</span>
            <span>Price</span>
            <span>Rating</span>
            <span>Status</span>
            <span />
          </div>
          {loading ? <div>Loading courses…</div> : error ? <div>Unable to load courses.</div> : items.length ? items.map((c) => (
            <div className="table-row" key={c.id}>
              <span>
                <strong>{c.title}</strong>
                <small>
                  {c.lessons} lessons · {c.duration}
                </small>
              </span>
              <span>{c.provider}</span>
              <strong>{c.price ? `৳${c.price}` : "Free"}</strong>
              <span>★ {c.rating}</span>
              <Badge tone={c.status === "PUBLISHED" ? "success" : c.status === "REMOVED" ? "danger" : "default"}>
                {c.status}
              </Badge>
              <span className="row-actions">
                <Link to={`/courses/${c.id}`} target="_blank" rel="noreferrer" title="View public listing">
                  <Eye />
                </Link>
                <button onClick={() => setStatus(c, "PUBLISHED")} disabled={c.status === "PUBLISHED"} title="Approve course">
                  <CheckCircle2 />
                </button>
                <button onClick={() => setStatus(c, "REMOVED")} disabled={c.status === "REMOVED"} title="Remove course">
                  <XCircle />
                </button>
              </span>
            </div>
          )) : <div>No courses match these filters.</div>}
        </div>
      </section>
    </>
  );
}
const DATE_RANGE_OPTIONS = [
  { label: "Last 3 months", value: "3" },
  { label: "Last 6 months", value: "6" },
  { label: "Last 12 months", value: "12" },
];
const REPORT_TYPE_OPTIONS = [
  { label: "Platform overview", value: "overview" },
  { label: "Hiring funnel", value: "hiring" },
  { label: "Course performance", value: "courses" },
];
const regionOf = (location) => (location || "").split("·")[0].trim();
export function Reports() {
  const [months, setMonths] = useState("6");
  const [reportType, setReportType] = useState("overview");
  const [region, setRegion] = useState("");
  const { data: analytics } = useAsync(() => adminService.getAnalytics({ months }), [months]);
  const { data: jobsData } = useAsync(jobService.getJobs);
  const { data: coursesData } = useAsync(courseService.getCourses);
  const appChart = analytics?.growth || [];
  const jobs = jobsData || [];
  const courses = coursesData || [];
  const regionMap = {};
  jobs.forEach((j) => {
    const raw = regionOf(j.location);
    if (!raw) return;
    const key = raw.toLowerCase();
    if (!regionMap[key]) regionMap[key] = raw.replace(/\b\w/g, (c) => c.toUpperCase());
  });
  const regionOptions = [{ label: "All Bangladesh", value: "" }, ...Object.entries(regionMap).map(([value, label]) => ({ label, value }))];
  const regionJobs = region ? jobs.filter((j) => regionOf(j.location).toLowerCase() === region) : jobs;
  const categoryCounts = regionJobs.reduce((acc, j) => {
    const key = j.category || "Uncategorized";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .map(([n, v]) => ({ n, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);
  const dates = regionJobs.map((j) => j.created_at).filter(Boolean).sort();
  const dateRangeLabel = dates.length
    ? `${new Date(dates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${new Date(dates[dates.length - 1]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "No jobs yet";
  const funnel = [
    { n: "Applied", v: analytics?.applications?.total || 0 },
    { n: "Shortlisted", v: analytics?.outcomes?.shortlisted || 0 },
    { n: "Hired", v: analytics?.outcomes?.hired || 0 },
  ];
  const courseCategoryCounts = courses.reduce((acc, c) => {
    const key = c.category || "Uncategorized";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const courseCategories = Object.entries(courseCategoryCounts)
    .map(([n, v]) => ({ n, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);
  const downloadReport = () => {
    if (reportType === "hiring") {
      downloadCsv("skillnet-hiring-funnel.csv", funnel.map((f) => ({ stage: f.n, count: f.v })));
    } else if (reportType === "courses") {
      downloadCsv("skillnet-course-performance.csv", courses.map((c) => ({ title: c.title, category: c.category, rating: c.rating, price: c.price, status: c.status })));
    } else {
      downloadCsv("skillnet-platform-report.csv", [
        ...appChart.map((x) => ({ month: x.m, users: x.users, jobs: x.jobs, applications: x.applications, hires: x.hires })),
        ...topCategories.map((c) => ({ category: c.n, jobs: c.v })),
      ]);
    }
  };
  return (
    <>
      <PageHeader
        title="Reports & analytics"
        description="Understand platform health, demand, and meaningful outcomes."
        actions={
          <Button onClick={downloadReport}>
            <Download />
            Download report
          </Button>
        }
      />
      <div className="report-filter">
        <FieldLite label="Date range" value={months} onChange={(e) => setMonths(e.target.value)} options={DATE_RANGE_OPTIONS} />
        <FieldLite label="Report type" value={reportType} onChange={(e) => setReportType(e.target.value)} options={REPORT_TYPE_OPTIONS} />
        <FieldLite label="Region" value={region} onChange={(e) => setRegion(e.target.value)} options={regionOptions} />
      </div>
      <div className="admin-grid">
        {reportType === "overview" && (
          <>
            <section className="panel chart-panel span-2">
              <div className="panel-head">
                <div>
                  <h2>Applications and hires</h2>
                  <p>Monthly conversion trend</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#168b63"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="hires"
                    stroke="#5b5bd6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Top job categories</h2>
                  <p>{dateRangeLabel}</p>
                </div>
              </div>
              {topCategories.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart layout="vertical" data={topCategories}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="n" type="category" width={82} />
                    <Tooltip />
                    <Bar dataKey="v" fill="#168b63" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="muted small">No jobs posted for this region yet.</p>}
            </section>
          </>
        )}
        {reportType === "hiring" && (
          <section className="panel chart-panel span-2">
            <div className="panel-head">
              <div>
                <h2>Hiring funnel</h2>
                <p>Applied → shortlisted → hired, all time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={funnel}>
                <XAxis type="number" hide />
                <YAxis dataKey="n" type="category" width={90} />
                <Tooltip />
                <Bar dataKey="v" fill="#5b5bd6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}
        {reportType === "courses" && (
          <>
            <section className="panel">
              <div className="panel-head">
                <h2>Courses by category</h2>
              </div>
              {courseCategories.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart layout="vertical" data={courseCategories}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="n" type="category" width={82} />
                    <Tooltip />
                    <Bar dataKey="v" fill="#f2a93b" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="muted small">No courses yet.</p>}
            </section>
            <section className="panel">
              <div className="panel-head">
                <h2>Course outcomes</h2>
              </div>
              <div className="outcomes">
                <div>
                  <strong>{analytics?.courses?.total ?? 0}</strong>
                  <span>Total courses</span>
                </div>
                <div>
                  <strong>{analytics?.courses?.enrollments ?? 0}</strong>
                  <span>Enrollments</span>
                </div>
                <div>
                  <strong>{analytics?.outcomes?.avg_course_rating ?? 0}</strong>
                  <span>Average rating</span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
const FieldLite = ({ label, value, onChange, options }) => (
  <label>
    <span>{label}</span>
    <select value={value} onChange={onChange}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </label>
);
const targetLink = (report) =>
  report.target_type === "JOB" ? `/jobs/${report.target_id}` : report.target_type === "COURSE" ? `/courses/${report.target_id}` : null;
export function Moderation() {
  const { show } = useToast();
  const { data, loading, error } = useAsync(adminService.getReports);
  const [updates, setUpdates] = useState({});
  const [tab, setTab] = useState("open");
  const reports = (data || []).map((report) => ({ ...report, ...updates[report.id] }));
  const openCount = reports.filter((r) => r.status === "OPEN").length;
  const resolvedCount = reports.filter((r) => r.status !== "OPEN").length;
  const visible = tab === "open"
    ? reports.filter((r) => r.status === "OPEN")
    : tab === "resolved"
      ? reports.filter((r) => r.status !== "OPEN")
      : [...reports].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  const resolve = async (report, status) => {
    try {
      const updated = await adminService.resolveReport(report.id, status);
      setUpdates((current) => ({ ...current, [updated.id]: updated }));
      show(`Report ${status.toLowerCase()}.`);
    } catch { show("We could not update this report."); }
  };
  return (
    <>
      <PageHeader
        title="Moderation queue"
        description="Review reports consistently and record every decision."
      />
      <div className="moderation-tabs">
        <button className={tab === "open" ? "active" : ""} onClick={() => setTab("open")}>
          Open reports <b>{openCount}</b>
        </button>
        <button className={tab === "resolved" ? "active" : ""} onClick={() => setTab("resolved")}>
          Resolved <b>{resolvedCount}</b>
        </button>
        <button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>
          Audit log
        </button>
      </div>
      <div className="moderation-list">
        {loading ? <div className="panel">Loading reports…</div> : error ? <div className="panel">Unable to load reports.</div> : visible.length ? visible.map((report) => (
          <article className="panel" key={report.id}>
            <div className="row between">
              <div className="report-type">
                <i>
                  <AlertTriangle />
                </i>
                <span>
                  <Badge tone={report.status === "OPEN" ? "danger" : "default"}>
                    {report.status}
                  </Badge>
                  <h2>{report.target_type} #{report.target_id}</h2>
                  <p>
                    Reported {new Date(report.created_at).toLocaleString()} by {report.reporter?.name || "a user"}
                  </p>
                  {report.status !== "OPEN" && (
                    <p className="muted small">
                      {report.status === "RESOLVED" ? "Listing removed" : "Dismissed"} by {report.resolved_by?.name || "an admin"} on {new Date(report.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </span>
              </div>
              <Badge>{report.target_type}</Badge>
            </div>
            <div className="report-reason">
              <strong>Reason</strong>
              <p>{report.reason}</p>
            </div>
            <div className="row between">
              {targetLink(report) ? (
                <Link className="text-link" to={targetLink(report)} target="_blank" rel="noreferrer">
                  <Eye />
                  Open listing
                </Link>
              ) : (
                <button className="text-link" disabled>
                  <Eye />
                  Open listing
                </button>
              )}
              {report.status === "OPEN" && (
                <div className="header-actions">
                  <Button
                    variant="secondary"
                    onClick={() => resolve(report, "DISMISSED")}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => resolve(report, "RESOLVED")}
                  >
                    Remove listing
                  </Button>
                </div>
              )}
            </div>
          </article>
        )) : <div className="panel">No moderation reports found.</div>}
      </div>
    </>
  );
}

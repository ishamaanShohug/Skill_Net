import { useState } from "react";
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
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { applicants, courses, jobs } from "../../data/mockData";
import {
  Avatar,
  Badge,
  Button,
  Modal,
  PageHeader,
  SearchBox,
  StatCard,
  StatusBadge,
  TableActions,
} from "../../components/common/UI";
import { useToast } from "../../context/ToastContext";
import { adminService, courseService, jobService } from "../../services";
import { useAsync } from "../../hooks/useAsync";
const growth = [
  { m: "Mar", users: 1800, jobs: 210 },
  { m: "Apr", users: 2240, jobs: 265 },
  { m: "May", users: 2780, jobs: 310 },
  { m: "Jun", users: 3460, jobs: 402 },
  { m: "Jul", users: 4150, jobs: 488 },
  { m: "Aug", users: 4820, jobs: 560 },
];
export function AdminDashboard() {
  const { data, loading, error } = useAsync(adminService.getAnalytics);
  if (loading) return <div className="panel">Loading platform analytics…</div>;
  if (error) return <div className="panel">We could not load platform analytics.</div>;
  const analytics = data || {};
  return (
    <>
      <PageHeader
        eyebrow="PLATFORM OVERVIEW"
        title="SkillNet at a glance"
        description="Healthy growth, meaningful outcomes, and the work needing attention."
        actions={
          <Button variant="secondary">
            <Download />
            Export report
          </Button>
        }
      />
      <div className="stats-grid four">
        <StatCard
          label="Total users"
          value={analytics.users?.total || 0}
          change="↑ 14.2% this month"
          icon={Users}
        />
        <StatCard
          label="Active jobs"
          value={analytics.jobs?.active || 0}
          change="96 added this week"
          icon={BriefcaseBusiness}
          tone="blue"
        />
        <StatCard
          label="Applications"
          value={analytics.applications?.total || 0}
          change="↑ 18.7% this month"
          icon={TrendingUp}
          tone="purple"
        />
        <StatCard
          label="Course enrollments"
          value={analytics.courses?.enrollments || 0}
          change="71% active learners"
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
            <select>
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
                {["#168b63", "#5b5bd6", "#f2a93b"].map((c) => (
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
            <Button variant="ghost">View all</Button>
          </div>
          <div className="attention-list">
            <div>
              <i className="red">
                <Flag />
              </i>
              <span>
                <strong>7 job listings reported</strong>
                <small>3 are high priority</small>
              </span>
              <Badge tone="danger">Review</Badge>
            </div>
            <div>
              <i className="orange">
                <Clock />
              </i>
              <span>
                <strong>12 courses awaiting approval</strong>
                <small>Oldest submitted 2 days ago</small>
              </span>
              <Badge>Pending</Badge>
            </div>
            <div>
              <i className="blue">
                <UserCheck />
              </i>
              <span>
                <strong>18 employer verifications</strong>
                <small>Business documents received</small>
              </span>
              <Badge tone="purple">Verify</Badge>
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Outcome snapshot</h2>
          </div>
          <div className="outcomes">
            <div>
              <strong>2,418</strong>
              <span>Candidates shortlisted</span>
            </div>
            <div>
              <strong>684</strong>
              <span>People hired</span>
            </div>
            <div>
              <strong>79%</strong>
              <span>Assessment completion</span>
            </div>
            <div>
              <strong>4.8</strong>
              <span>Average course rating</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
const demoUsers = [
  ...applicants.map((a, i) => ({
    ...a,
    email: `${a.name.toLowerCase().replace(" ", ".")}@example.com`,
    role: "Job seeker",
    joined: `Aug ${8 + i}`,
    active: i !== 3,
  })),
  {
    id: 7,
    name: "Tasnim Ahmed",
    initials: "TA",
    email: "talent@orbit.example",
    role: "Employer",
    joined: "Aug 3",
    active: true,
  },
];
export function UserManagement() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [updates, setUpdates] = useState({});
  const { data, loading, error } = useAsync(adminService.getUsers);
  const filtered = (data || []).map((user) => ({ ...user, ...updates[user.id] })).filter((u) =>
    (u.name + u.email).toLowerCase().includes(query.toLowerCase()),
  );
  const toggleActive = async () => {
    const updated = await adminService.updateUser(selected.id, { is_active: !selected.is_active });
    setUpdates((current) => ({ ...current, [updated.id]: updated }));
    setSelected(updated);
  };
  return (
    <>
      <PageHeader
        title="User management"
        description="Support users, verify roles, and keep access safe."
      />
      <AdminToolbar
        query={query}
        setQuery={setQuery}
        options={["All roles", "Job seeker", "Employer", "Course provider"]}
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
          {loading ? <div>Loading users…</div> : error ? <div>Unable to load users.</div> : filtered.map((u) => (
            <div className="table-row" key={u.id}>
              <span className="person-cell">
                <Avatar initials={u.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")} />
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
          ))}
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
          <Avatar initials={selected?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")} size="lg" />
          <h2>{selected?.name}</h2>
          <p>{selected?.email}</p>
          <Badge>{selected?.role}</Badge>
        </div>
      </Modal>
    </>
  );
}
function AdminToolbar({ query, setQuery, options }) {
  return (
    <div className="admin-toolbar">
      <SearchBox
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search records"
      />
      <select>
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <select>
        <option>Any status</option>
        <option>Active</option>
        <option>Pending</option>
      </select>
      <Button variant="secondary">
        <Download />
        Export
      </Button>
    </div>
  );
}
export function JobManagement() {
  const [query, setQuery] = useState("");
  const [updates, setUpdates] = useState({});
  const { show } = useToast();
  const { data, loading, error } = useAsync(jobService.getJobs);
  const items = (data || []).map((job) => ({ ...job, ...updates[job.id] })).filter((j) =>
    (j.title + j.company).toLowerCase().includes(query.toLowerCase()),
  );
  const setStatus = async (job, status) => {
    try {
      const updated = await jobService.update(job.id, { status });
      setUpdates((current) => ({ ...current, [job.id]: updated }));
      show(`Job marked ${status.toLowerCase()}.`);
    } catch { show("We could not update this job."); }
  };
  return (
    <>
      <PageHeader
        title="Job moderation"
        description="Keep opportunities trustworthy, clear, and appropriate."
      />
      <AdminToolbar
        query={query}
        setQuery={setQuery}
        options={["All categories", "Technology", "Design", "Skilled Trades"]}
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
          {loading ? <div>Loading jobs…</div> : error ? <div>Unable to load jobs.</div> : items.map((j) => (
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
              <strong>—</strong>
              <span className="row-actions">
                <button>
                  <Eye />
                </button>
                <button onClick={() => setStatus(j, j.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED")} title="Change publication status">
                  <ShieldCheck />
                </button>
                <button>
                  <MoreHorizontal />
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
export function CourseManagement() {
  const { show } = useToast();
  const [updates, setUpdates] = useState({});
  const { data, loading, error } = useAsync(courseService.getCourses);
  const items = (data || []).map((course) => ({ ...course, ...updates[course.id] }));
  const setStatus = async (course, status) => {
    try {
      const updated = await courseService.update(course.id, { status });
      setUpdates((current) => ({ ...current, [course.id]: updated }));
      show(`Course marked ${status.toLowerCase()}.`);
    } catch { show("We could not update this course."); }
  };
  return (
    <>
      <PageHeader
        title="Course management"
        description="Review learning content and maintain platform quality."
      />
      <AdminToolbar
        query=""
        setQuery={() => {}}
        options={["All categories", "Technology", "Business", "Career"]}
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
          {loading ? <div>Loading courses…</div> : error ? <div>Unable to load courses.</div> : items.map((c) => (
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
                <button>
                  <Eye />
                </button>
                <button onClick={() => setStatus(c, "PUBLISHED")} title="Approve course">
                  <CheckCircle2 />
                </button>
                <button>
                  <MoreHorizontal />
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
export function Reports() {
  const appChart = growth.map((x, i) => ({
    ...x,
    applications: 3100 + i * 620,
    hires: 60 + i * 18,
  }));
  return (
    <>
      <PageHeader
        title="Reports & analytics"
        description="Understand platform health, demand, and meaningful outcomes."
        actions={
          <Button>
            <Download />
            Download report
          </Button>
        }
      />
      <div className="report-filter">
        <FieldLite label="Date range" value="Mar 1 – Aug 13, 2026" />
        <FieldLite label="Report type" value="Platform overview" />
        <FieldLite label="Region" value="All Bangladesh" />
      </div>
      <div className="admin-grid">
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
            <h2>Top job categories</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              layout="vertical"
              data={[
                { n: "Technology", v: 480 },
                { n: "Sales", v: 360 },
                { n: "Service", v: 300 },
                { n: "Trades", v: 260 },
                { n: "Finance", v: 180 },
              ]}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="n" type="category" width={82} />
              <Tooltip />
              <Bar dataKey="v" fill="#168b63" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </>
  );
}
const FieldLite = ({ label, value }) => (
  <label>
    <span>{label}</span>
    <select>
      <option>{value}</option>
    </select>
  </label>
);
export function Moderation() {
  const { show } = useToast();
  const { data, loading, error } = useAsync(adminService.getReports);
  const [updates, setUpdates] = useState({});
  const reports = (data || []).map((report) => ({ ...report, ...updates[report.id] }));
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
        <button className="active">
          Open reports <b>{reports.filter((report) => report.status === "OPEN").length}</b>
        </button>
        <button>Resolved</button>
        <button>Audit log</button>
      </div>
      <div className="moderation-list">
        {loading ? <div className="panel">Loading reports…</div> : error ? <div className="panel">Unable to load reports.</div> : reports.length ? reports.map((report) => (
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
                    Reported {new Date(report.created_at).toLocaleString()}
                  </p>
                </span>
              </div>
              <Badge>{report.target_type}</Badge>
            </div>
            <div className="report-reason">
              <strong>Reason</strong>
              <p>{report.reason}</p>
            </div>
            <div className="row between">
              <button className="text-link" disabled>
                <Eye />
                Open listing
              </button>
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
            </div>
          </article>
        )) : <div className="panel">No moderation reports found.</div>}
      </div>
    </>
  );
}

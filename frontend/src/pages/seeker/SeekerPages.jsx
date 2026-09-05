import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import {
  applicationService,
  enrollmentService,
  jobService,
  notificationService,
  quizService,
  recommendationService,
} from "../../services";
import { useAsync } from "../../hooks/useAsync";
import {
  Avatar,
  Badge,
  Button,
  CourseCard,
  EmptyState,
  ErrorState,
  Field,
  JobCard,
  PageHeader,
  Spinner,
  StatCard,
  StatusBadge,
  Stepper,
  ViewAll,
} from "../../components/common/UI";
import { applications as appData } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
export function SeekerDashboard() {
  const { user } = useAuth();
  const { data: jobs } = useAsync(jobService.getJobs);
  const displayName = user?.name || user?.first_name || user?.email?.split("@")[0] || "there";
  return (
    <>
      <section className="welcome-panel">
        <div>
          <span className="eyebrow">THURSDAY, AUGUST 13</span>
          <h1>Good afternoon, {displayName} 👋</h1>
          <p>
            You’re building momentum. Here’s what needs your attention today.
          </p>
        </div>
        <div className="profile-ring">
          <div>
            <strong>78%</strong>
            <small>Profile</small>
          </div>
          <span>
            <b>Almost there!</b>
            <small>Add a certificate to stand out</small>
            <Link to="/job-seeker/profile">
              Complete profile <ChevronRight />
            </Link>
          </span>
        </div>
      </section>
      <div className="stats-grid four">
        <StatCard
          label="Active applications"
          value="4"
          change="2 updated this week"
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Profile views"
          value="28"
          change="↑ 12% this week"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Assessments"
          value="3"
          change="Average score 76%"
          icon={Target}
          tone="purple"
        />
        <StatCard
          label="Courses in progress"
          value="2"
          change="1 lesson due today"
          icon={GraduationCap}
          tone="orange"
        />
      </div>
      <section className="dashboard-grid">
        <div className="panel span-2">
          <div className="panel-head">
            <div>
              <h2>Recommended for you</h2>
              <p>Based on your skills and preferences</p>
            </div>
            <ViewAll to="/jobs" />
          </div>
          <div className="dash-job-list">
            {jobs?.slice(0, 3).map((j) => (
              <div key={j.id}>
                <span className="company-logo" style={{ background: j.color }}>
                  {j.logo}
                </span>
                <div>
                  <Link to={`/jobs/${j.id}`}>
                    <strong>{j.title}</strong>
                  </Link>
                  <small>
                    {j.company} · {j.location}
                  </small>
                  <div className="skills">
                    {j.skills.slice(0, 2).map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                </div>
                <span className="match">{94 - j.id * 3}% match</span>
                <Link to={`/jobs/${j.id}`} className="icon-btn">
                  <ChevronRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent activity</h2>
              <p>Your latest updates</p>
            </div>
          </div>
          <div className="activity-list">
            <div>
              <i className="green">
                <Check />
              </i>
              <span>
                <strong>Interview invitation</strong>
                <small>Pathao Labs · 12 min ago</small>
              </span>
            </div>
            <div>
              <i className="purple">
                <Target />
              </i>
              <span>
                <strong>Assessment passed</strong>
                <small>Score 86% · Yesterday</small>
              </span>
            </div>
            <div>
              <i className="orange">
                <BookOpen />
              </i>
              <span>
                <strong>Lesson completed</strong>
                <small>Excel Essentials · 2d ago</small>
              </span>
            </div>
          </div>
          <ViewAll to="/job-seeker/notifications" />
        </div>
        <div className="panel span-2">
          <div className="panel-head">
            <div>
              <h2>Application progress</h2>
              <p>Keep an eye on your active opportunities</p>
            </div>
            <ViewAll to="/job-seeker/applications" />
          </div>
          {appData.slice(0, 2).map((a) => (
            <div className="application-row" key={a.id}>
              <div>
                <strong>{a.job}</strong>
                <small>
                  {a.company} · Applied {a.date}
                </small>
              </div>
              <Stepper status={a.status} />
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
        <div className="panel course-progress-card">
          <div className="panel-head">
            <h2>Keep learning</h2>
            <Badge tone="success">IN PROGRESS</Badge>
          </div>
          <div className="course-icon">X</div>
          <h3>Excel for the Modern Workplace</h3>
          <p>Module 7 · Pivot tables that make sense</p>
          <div className="progress">
            <i style={{ width: "64%" }} />
          </div>
          <div className="row between">
            <small>64% complete</small>
            <small>7 of 11 modules</small>
          </div>
          <Button variant="secondary" className="full">
            Continue learning <ChevronRight />
          </Button>
        </div>
      </section>
    </>
  );
}
export function Applications() {
  const { data, loading, error } = useAsync(applicationService.getAll);
  const [filter, setFilter] = useState("All");
  const items =
    data?.filter((a) => filter === "All" || a.status === filter) || [];
  return (
    <>
      <PageHeader
        title="My applications"
        description="Follow every opportunity from applied to hired."
        actions={
          <Link className="btn btn-primary" to="/jobs">
            <Search />
            Find more jobs
          </Link>
        }
      />
      <div className="tab-bar">
        {["All", "Applied", "Shortlisted", "Interview", "Rejected"].map((x) => (
          <button
            className={filter === x ? "active" : ""}
            onClick={() => setFilter(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState />
      ) : items.length ? (
        <div className="application-cards">
          {items.map((a) => (
            <article key={a.id}>
              <div className="row between">
                <div>
                  <Badge>{a.company}</Badge>
                  <h2>{a.job}</h2>
                  <p>
                    Applied {a.date} · Last update {a.updated}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <Stepper status={a.status} />
              <div className="row between card-bottom">
                {a.score ? (
                  <span>
                    <Target />
                    Assessment score <strong>{a.score}%</strong>
                  </span>
                ) : (
                  <span>No assessment required</span>
                )}
                <button className="text-link">
                  View application <ChevronRight />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No applications found"
          description="Start applying for jobs to see them here."
        />
      )}
    </>
  );
}
export function Profile() {
  const { show } = useToast();
  const [section, setSection] = useState("Personal");
  const [skills, setSkills] = useState([
    "Figma",
    "User research",
    "Prototyping",
    "Design systems",
  ]);
  const tabs = [
    "Personal",
    "Education",
    "Experience",
    "Skills",
    "Certificates",
  ];
  return (
    <>
      <PageHeader
        title="My profile"
        description="Keep your story complete so better opportunities can find you."
        actions={
          <Button onClick={() => show("Profile changes saved.")}>
            Save changes
          </Button>
        }
      />
      <div className="profile-layout">
        <aside className="profile-card">
          <div className="avatar avatar-xl">IS</div>
          <button className="edit-avatar">
            <Edit3 />
          </button>
          <h2>Shohug</h2>
          <p>Product Designer</p>
          <span>
            <MapPin />
            Dhaka, Bangladesh
          </span>
          <div className="completion">
            <div className="row between">
              <strong>Profile strength</strong>
              <b>78%</b>
            </div>
            <div className="progress">
              <i style={{ width: "78%" }} />
            </div>
            <small>Add one certificate to reach 85%</small>
          </div>
          {tabs.map((t) => (
            <button
              className={section === t ? "active" : ""}
              onClick={() => setSection(t)}
              key={t}
            >
              {t}
              <ChevronRight />
            </button>
          ))}
        </aside>
        <section className="panel profile-editor">
          {section === "Personal" && (
            <>
              <div className="panel-head">
                <div>
                  <h2>Personal information</h2>
                  <p>The essentials employers see first.</p>
                </div>
              </div>
              <div className="form-grid">
                <Field label="Full name">
                  <input defaultValue="Shohug" />
                </Field>
                <Field label="Professional title">
                  <input defaultValue="Product Designer" />
                </Field>
                <Field label="Email">
                  <input defaultValue="shohug@skillnet.demo" />
                </Field>
                <Field label="Phone">
                  <input defaultValue="+880 1712 345678" />
                </Field>
                <Field label="Location">
                  <input defaultValue="Dhaka, Bangladesh" />
                </Field>
                <Field label="Portfolio URL">
                  <input defaultValue="shohug.design" />
                </Field>
              </div>
              <Field label="Professional summary">
                <textarea
                  rows="5"
                  defaultValue="Curious product designer focused on turning complex services into clear, inclusive digital experiences."
                />
                <small>182 / 400 characters</small>
              </Field>
            </>
          )}
          {section === "Education" && (
            <EntrySection
              title="Education"
              entries={[
                [
                  "BSc in Computer Science",
                  "North South University · 2018–2022",
                ],
              ]}
            />
          )}
          {section === "Experience" && (
            <EntrySection
              title="Experience"
              entries={[
                ["Junior Product Designer", "PixelCraft Studio · 2023–Present"],
                ["UX Design Intern", "Loop Labs · 2022–2023"],
              ]}
            />
          )}
          {section === "Skills" && (
            <>
              <div className="panel-head">
                <div>
                  <h2>Skills</h2>
                  <p>Add the strengths you want employers to find.</p>
                </div>
              </div>
              <div className="skill-editor">
                {skills.map((s) => (
                  <span key={s}>
                    {s}
                    <button
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button onClick={() => setSkills([...skills, "Communication"])}>
                  <Plus />
                  Add skill
                </button>
              </div>
            </>
          )}
          {section === "Certificates" && (
            <EntrySection
              title="Certificates"
              entries={[
                ["Google UX Design Certificate", "Google · Issued 2023"],
              ]}
              upload
            />
          )}
        </section>
      </div>
    </>
  );
}
function EntrySection({ title, entries, upload }) {
  return (
    <>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <p>Add multiple entries and keep them current.</p>
        </div>
        <Button variant="secondary">
          <Plus />
          Add {title.toLowerCase().replace(/s$/, "")}
        </Button>
      </div>
      <div className="entry-list">
        {entries.map(([a, b]) => (
          <div key={a}>
            <span className="entry-icon">
              {upload ? <Award /> : <GraduationCap />}
            </span>
            <div>
              <strong>{a}</strong>
              <small>{b}</small>
            </div>
            <button className="icon-btn">
              <Edit3 />
            </button>
          </div>
        ))}
      </div>
      {upload && (
        <label className="upload-box">
          <FileText />
          <strong>Drop a certificate here or browse</strong>
          <small>PDF, JPG, or PNG up to 5 MB</small>
          <input type="file" hidden />
        </label>
      )}
    </>
  );
}
export function CVBuilder() {
  const { show } = useToast();
  return (
    <>
      <PageHeader
        title="CV builder"
        description="Turn your SkillNet profile into a polished, ready-to-share CV."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                show("CV generation endpoint is ready to connect.")
              }
            >
              <Sparkles />
              Generate CV
            </Button>
            <Button
              onClick={() =>
                show("PDF download will be enabled by the Django endpoint.")
              }
            >
              <Download />
              Download PDF
            </Button>
          </>
        }
      />
      <div className="cv-layout">
        <section className="panel cv-controls">
          <h2>CV content</h2>
          {[
            "Professional summary",
            "Work experience",
            "Education",
            "Skills",
            "Certificates",
          ].map((x, i) => (
            <label key={x}>
              <input type="checkbox" defaultChecked />
              <span>
                {x}
                <small>
                  {i === 0
                    ? "Edit your introduction"
                    : `${i + 1} profile entries`}
                </small>
              </span>
            </label>
          ))}
          <h3>Accent colour</h3>
          <div className="color-picker">
            <button className="active" />
            <button />
            <button />
            <button />
          </div>
          <h3>Template</h3>
          <select>
            <option>Modern — clean and focused</option>
            <option>Classic — formal and timeless</option>
          </select>
        </section>
        <section className="cv-preview">
          <div className="cv-page">
            <header>
              <div>
                <h1>Shohug</h1>
                <p>PRODUCT DESIGNER</p>
              </div>
              <div>
                <span>shohug@skillnet.demo</span>
                <span>+880 1712 345678</span>
                <span>Dhaka, Bangladesh</span>
              </div>
            </header>
            <CVSection title="Profile">
              <p>
                Curious product designer focused on turning complex services
                into clear, inclusive digital experiences.
              </p>
            </CVSection>
            <CVSection title="Experience">
              <h4>
                Junior Product Designer <span>2023 — PRESENT</span>
              </h4>
              <b>PixelCraft Studio</b>
              <p>
                Designed and shipped customer-facing flows in partnership with
                product and engineering.
              </p>
            </CVSection>
            <CVSection title="Education">
              <h4>
                BSc in Computer Science <span>2018 — 2022</span>
              </h4>
              <b>North South University</b>
            </CVSection>
            <CVSection title="Skills">
              <div className="cv-skills">
                <span>Figma</span>
                <span>User research</span>
                <span>Prototyping</span>
                <span>Design systems</span>
              </div>
            </CVSection>
          </div>
        </section>
      </div>
    </>
  );
}
const CVSection = ({ title, children }) => (
  <section>
    <h3>{title}</h3>
    {children}
  </section>
);
const questions = [
  {
    q: "A customer says they cannot find a feature after an update. What is the best first response?",
    options: [
      "Send the help article",
      "Acknowledge the issue and ask what they are trying to do",
      "Tell them the feature moved",
      "Escalate immediately",
    ],
  },
  {
    q: "Which metric best reflects successful task completion?",
    options: [
      "Page views",
      "Impressions",
      "Task success rate",
      "Session length",
    ],
  },
  {
    q: "What is the clearest way to validate a design assumption?",
    options: [
      "Test it with representative users",
      "Ask the design team",
      "Add more features",
      "Follow the first idea",
    ],
  },
  {
    q: "A spreadsheet contains duplicates. What should you do first?",
    options: [
      "Delete random rows",
      "Sort alphabetically",
      "Change the formatting",
      "Identify a reliable unique key",
    ],
  },
  {
    q: "What makes feedback most actionable?",
    options: [
      "Making it broad",
      "Connecting it to an observed behavior",
      "Giving it anonymously",
      "Waiting until the end",
    ],
  },
];
export function Quiz() {
  const { id } = useParams();
  const nav = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const applicationId = new URLSearchParams(window.location.search).get("application");
  const { data: quiz, loading, error } = useAsync(() => quizService.get(id), [id]);
  const submit = async () => {
    if (!applicationId) return;
    setSubmitting(true);
    try {
      const result = await quizService.submit(id, { application_id: Number(applicationId), answers });
      sessionStorage.setItem("quiz_result", JSON.stringify(result));
      nav(`/job-seeker/quiz/${id}/result`);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <div className="container page"><Spinner /></div>;
  if (error || !quiz || !applicationId) return <div className="container page"><ErrorState message="This assessment needs a valid job application." /></div>;
  const item = quiz.questions[index];
  if (!item) return <div className="container page"><EmptyState title="No questions are available" description="This assessment has not been configured yet." /></div>;
  return (
    <div className="quiz-page">
      <div className="quiz-head">
        <div>
          <Badge tone="purple">SKILL ASSESSMENT</Badge>
          <h1>{quiz.title}</h1>
          <p>For {quiz.job_title}</p>
        </div>
        <div className="quiz-timer">
          <Clock />
          <span>
            <small>Time remaining</small>
            <strong>06:42</strong>
          </span>
        </div>
      </div>
      <div className="quiz-progress">
        <div style={{ width: `${((index + 1) / quiz.questions.length) * 100}%` }} />
        <span>
          Question {index + 1} of {quiz.questions.length}
        </span>
      </div>
      <section className="quiz-card">
        <span className="eyebrow">
          QUESTION {String(index + 1).padStart(2, "0")}
        </span>
        <h2>{item.text}</h2>
        <div className="options">
          {item.options.map((option, i) => {
            const selected = answers[item.id] === option.id;
            return (
              <button
                className={selected ? "selected" : ""}
                onClick={() => setAnswers({ ...answers, [item.id]: option.id })}
                key={option.id}
              >
                <i>{String.fromCharCode(65 + i)}</i>
                <span>{option.text}</span>
                {selected && <CheckCircle2 />}
              </button>
            );
          })}
        </div>
      </section>
      <div className="quiz-actions">
        <Button
          variant="secondary"
          disabled={!index}
          onClick={() => setIndex(index - 1)}
        >
          Previous
        </Button>
        {index < quiz.questions.length - 1 ? (
          <Button
            disabled={!answers[item.id]}
            onClick={() => setIndex(index + 1)}
          >
            Next question <ChevronRight />
          </Button>
        ) : (
          <Button disabled={!answers[item.id] || submitting} onClick={submit}>
            {submitting ? "Submitting…" : "Submit assessment"}
          </Button>
        )}
      </div>
    </div>
  );
}
export function QuizResult() {
  let r = { score: 4, total: 5, gaps: ["Data Analysis", "Communication"] };
  try {
    r = JSON.parse(sessionStorage.getItem("quiz_result")) || r;
  } catch {}
  const pct = Math.round(r.percentage ?? ((r.score / r.total) * 100));
  const passed = pct >= 70;
  const gaps = r.skill_gaps || r.gaps || [];
  return (
    <div className="result-page">
      <div className={`result-mark ${passed ? "pass" : "fail"}`}>
        {passed ? <CheckCircle2 /> : <Target />}
      </div>
      <Badge tone={passed ? "success" : "danger"}>
        {passed ? "ASSESSMENT PASSED" : "KEEP BUILDING"}
      </Badge>
      <h1>
        {passed ? "Strong work — you passed!" : "You’re closer than you think."}
      </h1>
      <p>
        {passed
          ? "Your application is now complete and ready for employer review."
          : "We found a few skills worth strengthening before your next attempt."}
      </p>
      <div className="score-card">
        <div>
          <strong>
            {r.score}
            <small>/{r.total}</small>
          </strong>
          <span>Correct answers</span>
        </div>
        <div>
          <strong>{pct}%</strong>
          <span>Final score</span>
        </div>
        <div>
          <strong>70%</strong>
          <span>Pass mark</span>
        </div>
      </div>
      {!passed && (
        <div className="gap-box">
          <h3>Skill gaps detected</h3>
          <div>
          {gaps.map((x) => (
              <Badge key={x}>{x}</Badge>
            ))}
          </div>
        </div>
      )}
      <div className="result-actions">
        <Link
          className="btn btn-primary"
          to={
            passed ? "/job-seeker/applications" : "/job-seeker/recommendations"
          }
        >
          {passed ? "Continue application" : "View recommended courses"}
          <ArrowIcon />
        </Link>
        <Link className="btn btn-secondary" to="/job-seeker">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
const ArrowIcon = () => <ChevronRight />;
export function Recommendations() {
  const { data: courses, loading, error } = useAsync(recommendationService.getAll);
  return (
    <>
      <PageHeader
        eyebrow="YOUR PERSONAL LEARNING PATH"
        title="Turn skill gaps into strengths"
        description="These courses were selected from your latest assessment results."
      />
      <div className="recommend-flow">
        <span>
          <Target />
          Assessment results
        </span>
        <i>→</i>
        <span>
          <TrendingUp />Recommended skills
        </span>
        <i>→</i>
        <span>
          <BookOpen />
          Courses selected
        </span>
      </div>
      {loading ? <Spinner /> : error ? <ErrorState /> : courses?.length ? <div className="card-grid three">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <EmptyState icon={BookOpen} title="No recommendations yet" description="Complete an assessment to receive courses matched to your skill gaps." />}
    </>
  );
}
export function Learning() {
  const { data: enrollments, loading, error } = useAsync(enrollmentService.getAll);
  const active = enrollments?.find((enrollment) => !enrollment.is_completed) || enrollments?.[0];
  return (
    <>
      <PageHeader
        title="My learning"
        description="Keep moving, one useful lesson at a time."
        actions={
          <Link to="/courses" className="btn btn-primary">
            Browse courses
          </Link>
        }
      />
      {loading ? <Spinner /> : error ? <ErrorState /> : active ? <><div className="learning-hero"><div className="course-icon">{active.course.title.charAt(0)}</div><div><Badge tone="success">{active.is_completed ? "COMPLETED" : "CONTINUE LEARNING"}</Badge><h2>{active.course.title}</h2><p>{active.course.modules?.length || 0} modules available</p><div className="progress"><i style={{ width: `${active.progress}%` }} /></div><span>{active.progress}% complete · {active.completed_modules?.length || 0} modules completed</span></div><Link to={`/courses/${active.course.id}`} className="btn btn-primary">Open course <ChevronRight /></Link></div><h2 className="subheading">Your courses</h2><div className="card-grid three">{enrollments.map((enrollment) => <CourseCard course={enrollment.course} key={enrollment.id} />)}</div></> : <EmptyState icon={GraduationCap} title="No courses yet" description="Enroll in a course to start your learning path." action={<Link to="/courses" className="btn btn-primary">Browse courses</Link>} />}
    </>
  );
}
export function Notifications() {
  const { data, loading, error } = useAsync(notificationService.getAll);
  const [readIds, setReadIds] = useState([]);
  const items = (data || []).map((item) => ({ ...item, is_read: item.is_read || readIds.includes(item.id) }));
  const markAll = async () => {
    await notificationService.markAllRead();
    setReadIds(items.map((item) => item.id));
  };
  const markRead = async (id) => {
    if (!readIds.includes(id)) await notificationService.markRead(id);
    setReadIds((ids) => [...ids, id]);
  };
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates from applications, learning, and conversations."
        actions={
          <Button variant="secondary" onClick={markAll}>
            Mark all as read
          </Button>
        }
      />
      <div className="notification-list panel">
        {loading ? <Spinner /> : error ? <ErrorState /> : null}
        {!loading && !error && items.length ? (
          items.map((n) => (
            <button
              onClick={() => markRead(n.id)}
              className={!n.is_read ? "unread" : ""}
              key={n.id}
            >
              <span className="notification-icon">
                <Bell />
              </span>
              <div>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <small>{new Date(n.created_at).toLocaleString()}</small>
              </div>
              {!n.is_read && <i />}
            </button>
          ))
        ) : !loading && !error ? (
          <EmptyState icon={Bell} title="You’re all caught up" />
        ) : null}
      </div>
    </>
  );
}

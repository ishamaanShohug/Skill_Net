import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Filter,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { courseService, jobService } from "../shared/services/shared";
import { useAsync } from "../shared/hooks/useAsync";
import {
  Badge,
  Button,
  CourseCard,
  EmptyState,
  ErrorState,
  JobCard,
  PageHeader,
  SearchBox,
  Spinner,
} from "../shared/components/common/UI";
import { useAuth } from "../shared/context/AuthContext";
import { useToast } from "../shared/context/ToastContext";
export function Home() {
  const nav = useNavigate();
  const [term, setTerm] = useState("");
  const { data: jobs } = useAsync(jobService.getJobs);
  const { data: courses } = useAsync(courseService.getCourses);
  const search = (e) => {
    e.preventDefault();
    nav(`/jobs?q=${encodeURIComponent(term)}`);
  };
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <Badge tone="success">
              <Sparkles size={14} /> Skills first. Potential forward.
            </Badge>
            <h1>
              Find work that sees what <em>you can do.</em>
            </h1>
            <p>
              Get matched by verified skills, prove your strengths, and build
              the ones that open your next door.
            </p>
            <form className="hero-search" onSubmit={search}>
              <Search />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Job title, skill, or company"
              />
              <span />
              <MapPin />
              <input placeholder="Dhaka or remote" />
              <Button>Search jobs</Button>
            </form>
            <div className="hero-proof">
              <div className="avatar-stack">
                <i>NR</i>
                <i>FA</i>
                <i>MJ</i>
              </div>
              <span>
                <strong>4,800+ people</strong> found their next step
              </span>
              <span className="stars">★★★★★</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="portrait-card">
              <div className="portrait-person">
                <span>✓</span>
              </div>
              <div className="match-card">
                <span className="match-icon">
                  <Target />
                </span>
                <div>
                  <small>Skill match</small>
                  <strong>94%</strong>
                </div>
              </div>
              <div className="hired-chip">
                <CheckCircle2 />
                <span>
                  <small>Application update</small>
                  <strong>You’re shortlisted!</strong>
                </span>
              </div>
              <div className="skill-float">
                <small>Verified skills</small>
                <div>
                  <Badge>Customer care</Badge>
                  <Badge>CRM</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="brand-strip">
        <div className="container">
          <span>Trusted opportunities from teams across Bangladesh</span>
          <div>
            <b>pathao</b>
            <b>BRAC</b>
            <b>daraz</b>
            <b>sheba.xyz</b>
            <b>Walton</b>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-title">
            <div>
              <span className="eyebrow">CURATED FOR YOU</span>
              <h2>Opportunity, matched to your skills</h2>
              <p>
                Fresh roles from teams that care about what you can actually do.
              </p>
            </div>
            <Link to="/jobs" className="text-link">
              Explore all jobs <ArrowRight />
            </Link>
          </div>
          <div className="card-grid three">
            {jobs?.slice(0, 3).map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </div>
      </section>
      <section id="how" className="section soft">
        <div className="container">
          <div className="center-title">
            <span className="eyebrow">A BETTER WAY FORWARD</span>
            <h2>One journey. Every next step.</h2>
            <p>
              From discovering a role to building the skills for it, SkillNet
              keeps everything connected.
            </p>
          </div>
          <div className="journey">
            <div>
              <i>
                <Compass />
              </i>
              <b>01</b>
              <h3>Discover your fit</h3>
              <p>
                Find roles matched to your goals, location, and real skills.
              </p>
            </div>
            <span>
              <ChevronRight />
            </span>
            <div>
              <i>
                <Target />
              </i>
              <b>02</b>
              <h3>Prove your strengths</h3>
              <p>Take fair, focused assessments created for the role.</p>
            </div>
            <span>
              <ChevronRight />
            </span>
            <div>
              <i>
                <GraduationCap />
              </i>
              <b>03</b>
              <h3>Build what’s missing</h3>
              <p>Get a clear learning path whenever a skill needs work.</p>
            </div>
            <span>
              <ChevronRight />
            </span>
            <div>
              <i>
                <BriefcaseBusiness />
              </i>
              <b>04</b>
              <h3>Move forward</h3>
              <p>Track your progress from application to offer in one place.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split-feature">
          <div className="assessment-visual">
            <div className="quiz-mini">
              <span className="row between">
                <small>SKILL CHECK · 4 OF 5</small>
                <strong>02:18</strong>
              </span>
              <div className="mini-progress">
                <i />
              </div>
              <h3>Which approach creates the clearest customer response?</h3>
              <label>
                <i>A</i> Add more technical detail
              </label>
              <label className="selected">
                <i>B</i> Acknowledge, clarify, then solve <CheckCircle2 />
              </label>
              <label>
                <i>C</i> Forward without context
              </label>
            </div>
            <div className="score-bubble">
              <strong>86</strong>
              <span>Great score!</span>
            </div>
          </div>
          <div>
            <span className="eyebrow">VERIFIED, NOT JUST CLAIMED</span>
            <h2>Let your skills speak for you.</h2>
            <p>
              Short, job-relevant assessments help employers see your strengths
              fairly. No guesswork, no keyword games.
            </p>
            <ul className="check-list">
              <li>
                <CheckCircle2 />
                Focused assessments tied to real job skills
              </li>
              <li>
                <CheckCircle2 />
                Instant results with clear feedback
              </li>
              <li>
                <CheckCircle2 />
                Verified strengths added to your SkillNet profile
              </li>
            </ul>
            <Link className="btn btn-primary" to="/register">
              Create your free profile <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
      <section className="section course-section">
        <div className="container">
          <div className="section-title">
            <div>
              <span className="eyebrow">LEARN WITH PURPOSE</span>
              <h2>Close the gap. Come back stronger.</h2>
              <p>
                Short courses recommended from your actual assessment results.
              </p>
            </div>
            <Link to="/courses" className="text-link">
              Browse all courses <ArrowRight />
            </Link>
          </div>
          <div className="card-grid three">
            {courses?.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>
      <section id="for-employers" className="section">
        <div className="container employer-cta">
          <div>
            <span className="eyebrow">FOR EMPLOYERS</span>
            <h2>
              Hire for capability,
              <br />
              not just credentials.
            </h2>
            <p>
              Create focused assessments, surface qualified people faster, and
              keep every hiring conversation together.
            </p>
            <Link to="/register" className="btn btn-light">
              Start hiring smarter <ArrowRight />
            </Link>
          </div>
          <div className="candidate-stack">
            <div>
              <span className="avatar">NR</span>
              <div>
                <strong>Ishamaan Shohug</strong>
                <small>Product Designer</small>
              </div>
              <b>92% match</b>
            </div>
            <div>
              <span className="avatar">FA</span>
              <div>
                <strong>Farhan Ahmed</strong>
                <small>UX Designer</small>
              </div>
              <b>86% match</b>
            </div>
            <div>
              <span className="avatar">MN</span>
              <div>
                <strong>Maliha Noor</strong>
                <small>Junior Designer</small>
              </div>
              <b>81% match</b>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
const JOB_TYPE_OPTIONS = [
  { value: "All", label: "All types" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];
const JOBS_PER_PAGE = 6;
const SALARY_BUCKETS = [
  { value: "lt50", label: "Under ৳50,000", test: (v) => v < 50000 },
  { value: "50-100", label: "৳50,000 – ৳100,000", test: (v) => v >= 50000 && v < 100000 },
  { value: "100-150", label: "৳100,000 – ৳150,000", test: (v) => v >= 100000 && v < 150000 },
  { value: "150+", label: "৳150,000+", test: (v) => v >= 150000 },
];
const DATE_BUCKETS = [
  { value: "24h", label: "Last 24 hours", ms: 24 * 60 * 60 * 1000 },
  { value: "7d", label: "Last 7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  { value: "30d", label: "Last 30 days", ms: 30 * 24 * 60 * 60 * 1000 },
];
const WORKPLACE_TYPES = ["Remote", "Hybrid", "On-site"];
const classifyWorkplace = (jobLocation = "") => {
  const lower = jobLocation.toLowerCase();
  if (lower.includes("remote")) return "Remote";
  if (lower.includes("hybrid")) return "Hybrid";
  return "On-site";
};
function FilterGroup({ title, options, selected, onToggle, empty }) {
  return (
    <details open>
      <summary>
        {title}
        <span>⌄</span>
      </summary>
      {options.length ? (
        options.map((opt) => (
          <label key={opt.value}>
            <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => onToggle(opt.value)} /> {opt.label}
          </label>
        ))
      ) : (
        <small className="muted">{empty}</small>
      )}
    </details>
  );
}
export function Jobs() {
  const { data, loading, error } = useAsync(jobService.getJobs);
  const [query, setQuery] = useState(
    new URLSearchParams(location.search).get("q") || "",
  );
  const [jobType, setJobType] = useState("All");
  const [locationQuery, setLocationQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [salaryBuckets, setSalaryBuckets] = useState([]);
  const [dateBuckets, setDateBuckets] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [sort, setSort] = useState("Most relevant");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => setNow(Date.now()), [data]);
  const categoryOptions = useMemo(
    () => Array.from(new Set((data || []).map((j) => j.category).filter(Boolean))).sort(),
    [data],
  );
  const experienceOptions = useMemo(
    () => Array.from(new Set((data || []).map((j) => j.experience).filter(Boolean))).sort(),
    [data],
  );
  const toggle = (setter) => (value) => setter((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));
  const resetFilters = () => {
    setQuery("");
    setJobType("All");
    setLocationQuery("");
    setCategories([]);
    setExperiences([]);
    setSalaryBuckets([]);
    setDateBuckets([]);
    setWorkplaces([]);
    setSort("Most relevant");
  };
  const filtered = useMemo(() => {
    const results = (data || []).filter((j) => {
      const salary = j.salary_min ?? j.salary_max ?? 0;
      const age = now - new Date(j.created_at).getTime();
      return (
        (j.title + j.company + j.skills.join(" "))
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (jobType === "All" || j.job_type === jobType) &&
        (!locationQuery.trim() || (j.location || "").toLowerCase().includes(locationQuery.toLowerCase())) &&
        (categories.length === 0 || categories.includes(j.category)) &&
        (experiences.length === 0 || experiences.includes(j.experience)) &&
        (salaryBuckets.length === 0 || SALARY_BUCKETS.filter((b) => salaryBuckets.includes(b.value)).some((b) => b.test(salary))) &&
        (dateBuckets.length === 0 || DATE_BUCKETS.filter((b) => dateBuckets.includes(b.value)).some((b) => age <= b.ms)) &&
        (workplaces.length === 0 || workplaces.includes(classifyWorkplace(j.location)))
      );
    });
    if (sort === "Newest first") results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sort === "Salary: high to low") results.sort((a, b) => (b.salary_max ?? b.salary_min ?? 0) - (a.salary_max ?? a.salary_min ?? 0));
    return results;
  }, [data, query, jobType, locationQuery, categories, experiences, salaryBuckets, dateBuckets, workplaces, sort, now]);
  useEffect(() => setPage(1), [query, jobType, locationQuery, categories, experiences, salaryBuckets, dateBuckets, workplaces, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / JOBS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);
  return (
    <div className="container page">
      <PageHeader
        eyebrow="FIND YOUR NEXT STEP"
        title="Jobs matched to real skills"
        description="Explore roles from employers who look beyond the CV."
      />
      <form className="search-panel" onSubmit={(e) => e.preventDefault()}>
        <SearchBox
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, skill, or company"
        />
        <label>
          <MapPin />
          <input
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="Location"
          />
        </label>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
          {JOB_TYPE_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button type="submit">
          <Search />
          Search
        </Button>
      </form>
      <div className="listing-layout">
        <aside className="filters">
          <div className="row between">
            <h3>Filters</h3>
            <button onClick={resetFilters}>Reset</button>
          </div>
          <FilterGroup
            title="Category"
            options={categoryOptions.map((v) => ({ value: v, label: v }))}
            selected={categories}
            onToggle={toggle(setCategories)}
            empty="Categories will appear once jobs are published."
          />
          <FilterGroup
            title="Experience level"
            options={experienceOptions.map((v) => ({ value: v, label: v }))}
            selected={experiences}
            onToggle={toggle(setExperiences)}
            empty="Experience levels will appear once jobs are published."
          />
          <FilterGroup
            title="Salary range"
            options={SALARY_BUCKETS}
            selected={salaryBuckets}
            onToggle={toggle(setSalaryBuckets)}
            empty=""
          />
          <FilterGroup
            title="Workplace"
            options={WORKPLACE_TYPES.map((v) => ({ value: v, label: v }))}
            selected={workplaces}
            onToggle={toggle(setWorkplaces)}
            empty=""
          />
          <FilterGroup
            title="Posted date"
            options={DATE_BUCKETS}
            selected={dateBuckets}
            onToggle={toggle(setDateBuckets)}
            empty=""
          />
        </aside>
        <div className="results">
          <div className="row between result-head">
            <span>
              <strong>{filtered.length}</strong> opportunities
            </span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Most relevant</option>
              <option>Newest first</option>
              <option>Salary: high to low</option>
            </select>
          </div>
          {loading ? (
            <Spinner />
          ) : error ? (
            <ErrorState />
          ) : filtered.length ? (
            <div className="card-grid two">
              {visible.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No matching jobs"
              description="Try a broader keyword or clear some filters."
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          )}
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button className={n === currentPage ? "active" : ""} onClick={() => setPage(n)} key={n}>
                  {n}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export function JobDetail() {
  const { id } = useParams();
  const {
    data: job,
    loading,
    error,
  } = useAsync(() => jobService.getById(id), [id]);
  const { user } = useAuth();
  const nav = useNavigate();
  const { show } = useToast();
  const apply = async () => {
    if (!user) {
      nav("/login", { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    try {
      const application = await jobService.apply(id);
      if (job.quiz_id) {
        show("Application saved — complete the assessment to continue.");
        nav(`/job-seeker/quiz/${job.quiz_id}?application=${application.id}`);
      } else {
        show("Application submitted successfully.");
        nav("/job-seeker/applications");
      }
    } catch (requestError) {
      const message = requestError.response?.data?.detail || "We could not submit your application. Please try again.";
      show(message);
    }
  };
  if (loading)
    return (
      <div className="container page">
        <Spinner />
      </div>
    );
  if (error || !job)
    return (
      <div className="container page">
        <ErrorState message="That job may no longer be available." />
      </div>
    );
  return (
    <div className="job-detail-page">
      <div className="container">
        <Link to="/jobs" className="back-link">
          ← Back to jobs
        </Link>
        <section className="job-detail-hero">
          <div className="company-logo large" style={{ background: job.color }}>
            {job.logo}
          </div>
          <div>
            <p>{job.company}</p>
            <h1>{job.title}</h1>
            <div className="job-meta">
              <span>
                <MapPin />
                {job.location}
              </span>
              <span>
                <BriefcaseBusiness />
                {job.type}
              </span>
              <span>
                <Clock />
                {job.posted}
              </span>
            </div>
          </div>
          <div className="job-apply">
            <strong>{job.salary}</strong>
            <Button onClick={apply}>
              Apply now <ArrowRight />
            </Button>
            <small>Takes about 5 minutes</small>
          </div>
        </section>
        <div className="detail-grid">
          <article className="content-card">
            <h2>About the role</h2>
            <p>
              {job.description} You’ll work with a collaborative team, own
              meaningful outcomes, and keep learning as you go.
            </p>
            <h2>What you’ll bring</h2>
            <ul>
              {job.requirements.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <h2>Skills we’re looking for</h2>
            <div className="skills">
              {job.skills.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
            <h2>About {job.company}</h2>
            <p>
              We are a growing team building useful services for people and
              businesses across Bangladesh.
            </p>
          </article>
          <aside>
            <div className="content-card">
              <h3>Role overview</h3>
              <dl>
                <div>
                  <dt>Experience</dt>
                  <dd>{job.experience}</dd>
                </div>
                <div>
                  <dt>Job type</dt>
                  <dd>{job.type}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{job.location}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{job.category}</dd>
                </div>
              </dl>
            </div>
            {job.quiz && (
              <div className="assessment-note">
                <Target />
                <div>
                  <strong>Skills assessment</strong>
                  <p>
                    This role includes a short 5-question assessment after you
                    apply.
                  </p>
                  <span>About 7 minutes</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
export function Courses() {
  const { data, loading, error } = useAsync(courseService.getCourses);
  const [query, setQuery] = useState("");
  const filtered =
    data?.filter((c) =>
      (c.title + c.skill + c.provider)
        .toLowerCase()
        .includes(query.toLowerCase()),
    ) || [];
  return (
    <div className="container page">
      <PageHeader
        eyebrow="LEARN WITH DIRECTION"
        title="Skills for where you’re going"
        description="Practical courses connected to real opportunities."
      />
      <div className="search-panel course-search">
        <SearchBox
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses or skills"
        />
        <select>
          <option>All categories</option>
          <option>Technology</option>
          <option>Business</option>
        </select>
        <select>
          <option>Free & paid</option>
          <option>Free</option>
          <option>Paid</option>
        </select>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState />
      ) : (
        <div className="card-grid three">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
export function CourseDetail() {
  const { id } = useParams();
  const {
    data: course,
    loading,
    error,
  } = useAsync(() => courseService.getById(id), [id]);
  const { show } = useToast();
  const nav = useNavigate();
  if (loading)
    return (
      <div className="container page">
        <Spinner />
      </div>
    );
  if (error || !course)
    return (
      <div className="container page">
        <ErrorState />
      </div>
    );
  const enroll = async () => {
    await courseService.enroll(id);
    show("You’re enrolled — your learning path is ready.");
    nav("/job-seeker/learning");
  };
  return (
    <div className="course-detail-page">
      <section className="course-detail-hero">
        <div className="container detail-grid">
          <div>
            <Badge tone="success">
              {course.category} · {course.level}
            </Badge>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <div className="course-facts">
              <span>
                <Star fill="currentColor" />
                {course.rating} ({course.reviews} reviews)
              </span>
              <span>
                <Clock />
                {course.duration}
              </span>
              <span>
                <BookOpen />
                {course.lessons} lessons
              </span>
            </div>
            <small>
              Created by <strong>{course.provider}</strong>
            </small>
          </div>
          <div className="enroll-card">
            <div className={`course-art art-${course.image}`}>
              <span>{course.skill}</span>
            </div>
            <div>
              <strong className="course-price">
                {course.price ? `৳${course.price.toLocaleString()}` : "Free"}
              </strong>
              <Button onClick={enroll}>Enroll now</Button>
              <small>Full lifetime access · Learn at your pace</small>
            </div>
          </div>
        </div>
      </section>
      <section className="container course-content">
        <article className="content-card">
          <h2>What you’ll learn</h2>
          <div className="learning-grid">
            {[
              "Use practical techniques with confidence",
              "Apply your skills in real workplace scenarios",
              "Build a portfolio-ready outcome",
              "Track progress lesson by lesson",
            ].map((x) => (
              <span key={x}>
                <CheckCircle2 />
                {x}
              </span>
            ))}
          </div>
          <h2>Course content</h2>
          {course.modules.map((m, i) => (
            <div className="module-row" key={m}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{m}</strong>
              <small>{20 + i * 7} min</small>
              <ChevronRight />
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}

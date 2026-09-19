import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Edit3,
  Eye,
  FileQuestion,
  GripVertical,
  Plus,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { applicants as people, jobs } from "../../data/mockData";
import {
  Avatar,
  Badge,
  Button,
  Field,
  Modal,
  PageHeader,
  SearchBox,
  StatCard,
  StatusBadge,
  TableActions,
  EmptyState,
  ErrorState,
  Spinner,
} from "../../components/common/UI";
import { useToast } from "../../context/ToastContext";
import { jobService, skillService } from "../../services";
import { useAsync } from "../../hooks/useAsync";

function ApplicantTable({ items }) {
  return (
    <div className="data-table">
      <div className="table-head">
        <span>Candidate</span>
        <span>Skills</span>
        <span>Score</span>
        <span>Status</span>
        <span />
      </div>
      {items.map((a) => (
        <div className="table-row" key={a.id}>
          <span className="person-cell">
            <Avatar initials={a.initials} />
            <i>
              <strong>{a.name}</strong>
              <small>{a.role}</small>
            </i>
          </span>
          <span className="skills">
            {a.skills.slice(0, 2).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </span>
          <strong>{a.score}%</strong>
          <StatusBadge status={a.status} />
          <TableActions />
        </div>
      ))}
    </div>
  );
}

export function EmployerDashboard() {
  return (
    <>
      <section className="welcome-panel">
        <div>
          <span className="eyebrow">HIRING OVERVIEW</span>
          <h1>Good afternoon, Tasnim</h1>
          <p>Three candidates need your review today.</p>
        </div>
        <Link to="/employer/jobs/create" className="btn btn-primary">
          <Plus />
          Create a job
        </Link>
      </section>
      <div className="stats-grid three">
        <StatCard
          label="Active jobs"
          value="8"
          change="2 closing this week"
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Applications"
          value="146"
          change="↑ 18% this month"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Shortlisted"
          value="24"
          change="7 awaiting interview"
          icon={UserCheck}
          tone="purple"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent applicants</h2>
              <p>Newest candidates across active roles</p>
            </div>
            <Link className="text-link" to="/employer/applicants">
              View all
            </Link>
          </div>
          <ApplicantTable items={people.slice(0, 3)} />
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Hiring pipeline</h2>
          </div>
          <div className="funnel">
            {[
              ["Applications", 146, "100%"],
              ["Passed assessment", 82, "68%"],
              ["Shortlisted", 24, "42%"],
              ["Hired", 6, "20%"],
            ].map((x) => (
              <div key={x[0]}>
                <span>{x[0]}</span>
                <b>{x[1]}</b>
                <i style={{ width: x[2] }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function ManageJobs() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [remove, setRemove] = useState(null);
  const [removedIds, setRemovedIds] = useState([]);
  const { show } = useToast();
  const { data, loading, error } = useAsync(jobService.getJobs);
  const jobs = (data || []).filter((job) => !removedIds.includes(job.id));
  const visibleJobs = jobs.filter((job) => job.title.toLowerCase().includes(q.toLowerCase()) && (status === "All" || job.status === status));
  const deleteJob = async () => {
    try {
      await jobService.remove(remove.id);
      setRemovedIds((ids) => [...ids, remove.id]);
      show("Job deleted.");
    } catch {
      show("We could not delete this job.");
    } finally {
      setRemove(null);
    }
  };
  return (
    <>
      <PageHeader
        title="Manage jobs"
        description="Create, publish, and improve your open roles."
        actions={
          <Link className="btn btn-primary" to="/employer/jobs/create">
            <Plus />
            Create job
          </Link>
        }
      />
      <div className="panel table-panel">
        <div className="table-toolbar">
          <SearchBox
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs"
          />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="All">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div className="jobs-table">
          <div className="table-head">
            <span>Role</span>
            <span>Status</span>
            <span>Applications</span>
            <span>Assessment</span>
            <span>Posted</span>
            <span />
          </div>
          {loading ? <Spinner /> : error ? <ErrorState /> : visibleJobs.length ? visibleJobs.map((j) => (
              <div className="table-row" key={j.id}>
                <span>
                  <strong>{j.title}</strong>
                  <small>{j.location}</small>
                </span>
                <Badge tone={j.status === "PUBLISHED" ? "success" : "default"}>{j.status}</Badge>
                <strong>{j.applications_count || 0}</strong>
                <span>{j.quiz ? "Attached" : "None"}</span>
                <small>{j.posted}</small>
                <span className="row-actions">
                  <Link to={`/jobs/${j.id}`}>
                    <Eye />
                  </Link>
                  <Link to={`/employer/jobs/${j.id}/edit`}>
                    <Edit3 />
                  </Link>
                  <button onClick={() => setRemove(j)}>
                    <Trash2 />
                  </button>
                </span>
              </div>
            )) : <EmptyState title="No jobs found" description="Create a new job or change your filters." />}
        </div>
      </div>
      <Modal
        open={!!remove}
        onClose={() => setRemove(null)}
        title="Delete this job?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={deleteJob}
            >
              Delete job
            </Button>
          </>
        }
      >
        <p>
          Remove <strong>{remove?.title}</strong> from public search?
        </p>
      </Modal>
    </>
  );
}

export function JobForm() {
  const { show } = useToast();
  const nav = useNavigate();
  const { id } = useParams();
  const { data: skills, loading: skillsLoading } = useAsync(skillService.getAll);
  const { data: existing, loading: jobLoading, error: jobError } = useAsync(() => id ? jobService.getById(id) : Promise.resolve(null), [id]);
  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const skillIds = form.getAll("skill_ids").map(Number);
    const payload = {
      title: form.get("title"), category: form.get("category"), job_type: form.get("job_type"), location: form.get("location"),
      salary_min: form.get("salary_min") || null, experience: form.get("experience"), description: form.get("description"),
      requirements: form.get("requirements"), skill_ids: skillIds, status: e.nativeEvent.submitter?.value || "PUBLISHED",
    };
    if (!skillIds.length) {
      show("Select at least one required skill.");
      return;
    }
    try {
      if (id) await jobService.update(id, payload);
      else await jobService.create(payload);
      show(payload.status === "DRAFT" ? "Draft saved." : "Job published successfully.");
      nav("/employer/jobs");
    } catch (requestError) {
      const detail = requestError.response?.data;
      show(typeof detail === "string" ? detail : "We could not save this job. Check the form and try again.");
    }
  };
  if (jobLoading || skillsLoading) return <Spinner />;
  if (jobError) return <ErrorState message="We could not load this job." />;
  return (
    <>
      <PageHeader
        title={id ? "Edit job" : "Create a job"}
        description="Give candidates a clear, honest view of the opportunity."
      />
      <form className="form-layout" onSubmit={submit}>
        <section className="panel form-section">
          <div className="section-number">01</div>
          <div>
            <h2>Role details</h2>
            <div className="form-grid">
              <Field label="Job title">
                <input name="title" required placeholder="Frontend Developer" defaultValue={existing?.title} />
              </Field>
              <Field label="Category">
                <select name="category" required defaultValue={existing?.category || "Technology"}>
                  <option>Technology</option>
                  <option>Design</option>
                  <option>Business</option>
                  <option>Customer Service</option>
                </select>
              </Field>
              <Field label="Job type">
                <select name="job_type" defaultValue={existing?.job_type || "FULL_TIME"}>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </Field>
              <Field label="Location">
                <input name="location" required placeholder="Dhaka or Remote" defaultValue={existing?.location} />
              </Field>
              <Field label="Minimum salary">
                <input name="salary_min" type="number" min="0" defaultValue={existing?.salary_min || ""} />
              </Field>
              <Field label="Experience">
                <select name="experience" defaultValue={existing?.experience || "Entry level"}>
                  <option>Entry level</option>
                  <option>1–2 years</option>
                </select>
              </Field>
            </div>
          </div>
        </section>
        <section className="panel form-section">
          <div className="section-number">02</div>
          <div>
            <h2>About the work</h2>
            <Field label="Description">
              <textarea name="description" required rows="6" defaultValue={existing?.description} />
            </Field>
            <Field label="Requirements">
              <textarea name="requirements" required rows="4" defaultValue={existing?.requirements} />
            </Field>
          </div>
        </section>
        <section className="panel form-section">
          <div className="section-number">03</div>
          <div>
            <h2>Skills & assessment</h2>
            <Field label="Required skills">
                <select name="skill_ids" required multiple defaultValue={existing?.skills?.map((name) => String(skills?.find((skill) => skill.name === name)?.id)).filter(Boolean) || []}>
                  {(skills || []).map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                </select>
            </Field>
            <label className="attach-quiz">
              <input type="checkbox" />
              <FileQuestion />
              <span>
                <strong>Attach a skills assessment</strong>
                <small>Create or select a quiz after saving.</small>
              </span>
            </label>
          </div>
        </section>
        <div className="form-actions">
          <Button
            type="submit"
            variant="secondary"
            value="DRAFT"
          >
            Save draft
          </Button>
          <Button type="submit" value="PUBLISHED">Publish job</Button>
        </div>
      </form>
    </>
  );
}

export function Applicants() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = people.filter((a) =>
    a.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Applicants"
        description="Review evidence, compare fairly, and move people forward."
      />
      <div className="panel table-panel">
        <div className="table-toolbar">
          <SearchBox
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search candidates"
          />
          <select>
            <option>All roles</option>
          </select>
        </div>
        <ApplicantTable items={filtered} />
        <div className="row-actions">
          {filtered.map((a) => (
            <Button variant="ghost" key={a.id} onClick={() => setSelected(a)}>
              View {a.name.split(" ")[0]}
            </Button>
          ))}
        </div>
      </div>
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Candidate profile"
        footer={
          <>
            <Button variant="secondary">Send message</Button>
            <Button>Move to interview</Button>
          </>
        }
      >
        <div className="candidate-modal">
          <Avatar initials={selected?.initials} size="lg" />
          <h2>{selected?.name}</h2>
          <p>{selected?.role}</p>
          <strong>{selected?.score}% assessment score</strong>
          <div className="skills">
            {selected?.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}

export function QuizBuilder() {
  const { show } = useToast();
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "Which option best describes semantic HTML?",
      skill: "HTML",
      marks: 2,
    },
    {
      id: 2,
      text: "When should you use React state?",
      skill: "React",
      marks: 2,
    },
  ]);
  return (
    <>
      <PageHeader
        title="Quiz builder"
        description="Create a short, job-relevant assessment."
        actions={
          <Button onClick={() => show("Quiz saved and ready to attach.")}>
            <CheckCircle2 />
            Save quiz
          </Button>
        }
      />
      <div className="quiz-builder-layout">
        <section className="panel">
          <div className="form-grid">
            <Field label="Quiz title">
              <input defaultValue="Frontend Fundamentals" />
            </Field>
            <Field label="Attach to job">
              <select>
                <option>Frontend Developer</option>
              </select>
            </Field>
          </div>
          <div className="builder-summary">
            <span>
              <strong>{questions.length}</strong> questions
            </span>
            <span>
              <strong>70%</strong> pass mark
            </span>
          </div>
        </section>
        {questions.map((q, i) => (
          <section className="panel question-editor" key={q.id}>
            <GripVertical />
            <div>{i + 1}</div>
            <div>
              <Field label="Question">
                <input
                  value={q.text}
                  onChange={(e) =>
                    setQuestions(
                      questions.map((x) =>
                        x.id === q.id ? { ...x, text: e.target.value } : x,
                      ),
                    )
                  }
                />
              </Field>
              {[
                "Semantic elements describe meaning and structure",
                "They only change styling",
                "They replace CSS",
                "They prevent every issue",
              ].map((x, j) => (
                <label key={x}>
                  <input type="radio" name={`q${q.id}`} defaultChecked={!j} />{" "}
                  {x}
                </label>
              ))}
            </div>
            <button
              className="icon-btn"
              onClick={() =>
                setQuestions(questions.filter((x) => x.id !== q.id))
              }
            >
              <Trash2 />
            </button>
          </section>
        ))}
        <Button
          variant="secondary"
          className="add-question"
          onClick={() =>
            setQuestions([
              ...questions,
              {
                id: Date.now(),
                text: "New question",
                skill: "General",
                marks: 1,
              },
            ])
          }
        >
          <Plus />
          Add question
        </Button>
      </div>
    </>
  );
}

export function EmployerProfile() {
  const { show } = useToast();
  return (
    <>
      <PageHeader
        title="Company profile"
        description="Help candidates understand your team."
        actions={
          <Button onClick={() => show("Company profile saved.")}>
            Save changes
          </Button>
        }
      />
      <section className="panel profile-editor">
        <div className="company-profile-head">
          <span className="company-logo large">OS</span>
          <div>
            <h2>Orbit Systems</h2>
            <p>Technology · 51–200 employees</p>
          </div>
        </div>
        <div className="form-grid">
          <Field label="Company name">
            <input defaultValue="Orbit Systems" />
          </Field>
          <Field label="Website">
            <input defaultValue="https://orbit.example" />
          </Field>
          <Field label="Industry">
            <input defaultValue="Technology" />
          </Field>
          <Field label="Headquarters">
            <input defaultValue="Dhaka, Bangladesh" />
          </Field>
        </div>
        <Field label="About">
          <textarea
            rows="6"
            defaultValue="We build simple, reliable software for growing businesses."
          />
        </Field>
      </section>
    </>
  );
}

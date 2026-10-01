import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  MapPin,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  applicationService,
  certificateService,
  cvService,
  educationService,
  enrollmentService,
  experienceService,
  quizService,
  recommendationService,
} from "./seekerService";
import { jobService, notificationService, profileService, skillService } from "../shared/services/shared";
import { formatMonth, formatRange } from "../shared/services/normalize";
import { useAsync } from "../shared/hooks/useAsync";
import {
  Badge,
  Button,
  CourseCard,
  EmptyState,
  ErrorState,
  Field,
  Modal,
  PageHeader,
  Spinner,
  StatCard,
  StatusBadge,
  Stepper,
  ViewAll,
} from "../shared/components/common/UI";
import { useToast } from "../shared/context/ToastContext";
import { useAuth } from "../shared/context/AuthContext";
const profileCompleteness = (profile) => {
  if (!profile) return 0;
  const checks = [
    !!profile.headline,
    !!profile.summary,
    !!profile.location,
    (profile.skills?.length || 0) > 0,
    (profile.education?.length || 0) > 0,
    (profile.experience?.length || 0) > 0,
    (profile.certificates?.length || 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};
const activityIcon = (kind) => (kind === "APPLICATION" ? { icon: BriefcaseBusiness, tone: "green" } : kind === "COURSE" ? { icon: BookOpen, tone: "orange" } : { icon: Bell, tone: "purple" });
const timeAgo = (value) => {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
};
export function SeekerDashboard() {
  const { user } = useAuth();
  const { data: jobs } = useAsync(jobService.getJobs);
  const { data: profile } = useAsync(profileService.get);
  const { data: applications } = useAsync(applicationService.getAll);
  const { data: enrollments } = useAsync(enrollmentService.getAll);
  const { data: notifications } = useAsync(notificationService.getAll);
  const displayName = user?.name || user?.first_name || user?.email?.split("@")[0] || "there";
  const completeness = profileCompleteness(profile);
  const activeApplications = applications?.filter((a) => !["Hired", "Rejected", "Withdrawn"].includes(a.status)) || [];
  const scoredApplications = applications?.filter((a) => a.score != null) || [];
  const avgScore = scoredApplications.length ? Math.round(scoredApplications.reduce((sum, a) => sum + a.score, 0) / scoredApplications.length) : null;
  const coursesInProgress = enrollments?.filter((e) => !e.is_completed) || [];
  const activeCourse = coursesInProgress[0] || enrollments?.[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  return (
    <>
      <section className="welcome-panel">
        <div>
          <span className="eyebrow">{today}</span>
          <h1>Good to see you, {displayName} 👋</h1>
          <p>
            You’re building momentum. Here’s what needs your attention today.
          </p>
        </div>
        <div className="profile-ring">
          <div>
            <strong>{completeness}%</strong>
            <small>Profile</small>
          </div>
          <span>
            <b>{completeness >= 85 ? "Looking great!" : completeness >= 50 ? "Almost there!" : "Let’s build it up"}</b>
            <small>{completeness >= 85 ? "Your profile stands out" : "Add education or a certificate to stand out"}</small>
            <Link to="/job-seeker/profile">
              Complete profile <ChevronRight />
            </Link>
          </span>
        </div>
      </section>
      <div className="stats-grid four">
        <StatCard
          label="Active applications"
          value={applications ? String(activeApplications.length) : "—"}
          change={applications ? `${applications.length} total applied` : ""}
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Profile strength"
          value={`${completeness}%`}
          change={completeness >= 85 ? "Profile complete" : "Keep building your profile"}
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Assessments"
          value={scoredApplications ? String(scoredApplications.length) : "—"}
          change={avgScore != null ? `Average score ${avgScore}%` : "No assessments yet"}
          icon={Target}
          tone="purple"
        />
        <StatCard
          label="Courses in progress"
          value={enrollments ? String(coursesInProgress.length) : "—"}
          change={enrollments ? `${enrollments.length} enrolled total` : ""}
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
            {notifications?.length ? (
              notifications.slice(0, 3).map((n) => {
                const { icon: Icon, tone } = activityIcon(n.kind);
                return (
                  <div key={n.id}>
                    <i className={tone}>
                      <Icon />
                    </i>
                    <span>
                      <strong>{n.title}</strong>
                      <small>{timeAgo(n.created_at)}</small>
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="muted small">No activity yet — apply to a job or start a course to see updates here.</p>
            )}
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
          {applications?.length ? (
            applications.slice(0, 2).map((a) => (
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
            ))
          ) : (
            <p className="muted small">You haven’t applied to any jobs yet.</p>
          )}
        </div>
        <div className="panel course-progress-card">
          <div className="panel-head">
            <h2>Keep learning</h2>
            {activeCourse && <Badge tone="success">{activeCourse.is_completed ? "COMPLETED" : "IN PROGRESS"}</Badge>}
          </div>
          {activeCourse ? (
            <>
              <div className="course-icon">{activeCourse.course.title.charAt(0)}</div>
              <h3>{activeCourse.course.title}</h3>
              <p>{activeCourse.completed_modules?.length || 0} of {activeCourse.course.modules?.length || 0} modules complete</p>
              <div className="progress">
                <i style={{ width: `${activeCourse.progress}%` }} />
              </div>
              <div className="row between">
                <small>{activeCourse.progress}% complete</small>
                <small>{activeCourse.course.modules?.length || 0} modules</small>
              </div>
              <Link to="/job-seeker/learning" className="btn btn-secondary full">
                Continue learning <ChevronRight />
              </Link>
            </>
          ) : (
            <>
              <p className="muted small">You’re not enrolled in a course yet.</p>
              <Link to="/courses" className="btn btn-secondary full">
                Browse courses <ChevronRight />
              </Link>
            </>
          )}
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
const ENTRY_META = {
  education: { label: "education", icon: GraduationCap, service: () => educationService, key: "education" },
  experience: { label: "experience", icon: BriefcaseBusiness, service: () => experienceService, key: "experience" },
  certificate: { label: "certificate", icon: Award, service: () => certificateService, key: "certificates" },
};
export function Profile() {
  const { show } = useToast();
  const [section, setSection] = useState("Personal");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [personal, setPersonal] = useState({ first_name: "", last_name: "", phone: "", headline: "", location: "", portfolio_url: "", summary: "" });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const { data: allSkills } = useAsync(skillService.getAll);
  const [entryModal, setEntryModal] = useState(null);
  const [removeEntry, setRemoveEntry] = useState(null);
  const tabs = ["Personal", "Education", "Experience", "Skills", "Certificates"];

  useEffect(() => {
    profileService.get().then((data) => {
      setProfile(data);
      setPersonal({
        first_name: data.user?.first_name || "",
        last_name: data.user?.last_name || "",
        phone: data.user?.phone || "",
        headline: data.headline || "",
        location: data.location || "",
        portfolio_url: data.portfolio_url || "",
        summary: data.summary || "",
      });
      setLoadingProfile(false);
    });
  }, []);

  const savePersonal = async () => {
    setSavingPersonal(true);
    try {
      const updated = await profileService.update(personal);
      setProfile((p) => ({ ...p, ...updated }));
      show("Profile changes saved.");
    } catch {
      show("We could not save your changes.");
    } finally {
      setSavingPersonal(false);
    }
  };
  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const updated = await profileService.update(formData);
      setProfile((p) => ({ ...p, photo: updated.photo }));
      show("Profile photo updated.");
    } catch {
      show("We could not update your photo. Try a smaller image.");
    }
  };
  const toggleSkill = async (skill, add) => {
    const nextIds = add
      ? [...profile.skills.map((s) => s.id), skill.id]
      : profile.skills.filter((s) => s.id !== skill.id).map((s) => s.id);
    const updated = await profileService.update({ skill_ids: nextIds });
    setProfile((p) => ({ ...p, skills: updated.skills }));
  };
  const saveEntry = async (kind, values, existingId) => {
    const { service, key } = ENTRY_META[kind];
    const saved = existingId ? await service().update(existingId, values) : await service().create(values);
    setProfile((p) => ({
      ...p,
      [key]: existingId ? p[key].map((item) => (item.id === existingId ? saved : item)) : [saved, ...p[key]],
    }));
    setEntryModal(null);
    show(`${kind === "certificate" ? "Certificate" : kind.charAt(0).toUpperCase() + kind.slice(1)} saved.`);
  };
  const deleteEntry = async () => {
    const { kind, entry } = removeEntry;
    const { service, key } = ENTRY_META[kind];
    await service().remove(entry.id);
    setProfile((p) => ({ ...p, [key]: p[key].filter((item) => item.id !== entry.id) }));
    setRemoveEntry(null);
    show("Removed from your profile.");
  };

  const completeness = profileCompleteness(profile);
  const displayName = `${personal.first_name} ${personal.last_name}`.trim() || "Your name";
  const initials = displayName.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "SN";

  if (loadingProfile) return <Spinner />;

  return (
    <>
      <PageHeader
        title="My profile"
        description="Keep your story complete so better opportunities can find you."
        actions={
          <Button onClick={savePersonal} disabled={savingPersonal}>
            {savingPersonal ? "Saving…" : "Save changes"}
          </Button>
        }
      />
      <div className="profile-layout">
        <aside className="profile-card">
          <div className="avatar-upload">
            {profile.photo ? (
              <img src={profile.photo} alt="" className="avatar avatar-xl" style={{ objectFit: "cover" }} />
            ) : (
              <div className="avatar avatar-xl">{initials}</div>
            )}
            <label className="edit-avatar">
              <Edit3 />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto(file);
                }}
              />
            </label>
          </div>
          <h2>{displayName}</h2>
          <p>{personal.headline || "Add a professional title"}</p>
          <span>
            <MapPin />
            {personal.location || "Add your location"}
          </span>
          <div className="completion">
            <div className="row between">
              <strong>Profile strength</strong>
              <b>{completeness}%</b>
            </div>
            <div className="progress">
              <i style={{ width: `${completeness}%` }} />
            </div>
            <small>{completeness >= 100 ? "Your profile is complete" : "Fill in every section to strengthen your profile"}</small>
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
                <Field label="First name">
                  <input value={personal.first_name} onChange={(e) => setPersonal({ ...personal, first_name: e.target.value })} />
                </Field>
                <Field label="Last name">
                  <input value={personal.last_name} onChange={(e) => setPersonal({ ...personal, last_name: e.target.value })} />
                </Field>
                <Field label="Professional title">
                  <input value={personal.headline} onChange={(e) => setPersonal({ ...personal, headline: e.target.value })} placeholder="e.g. Product Designer" />
                </Field>
                <Field label="Email">
                  <input value={profile?.user?.email || ""} disabled />
                </Field>
                <Field label="Phone">
                  <input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
                </Field>
                <Field label="Location">
                  <input value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} />
                </Field>
                <Field label="Portfolio URL">
                  <input value={personal.portfolio_url} onChange={(e) => setPersonal({ ...personal, portfolio_url: e.target.value })} placeholder="https://" />
                </Field>
              </div>
              <Field label="Professional summary">
                <textarea
                  rows="5"
                  maxLength={400}
                  value={personal.summary}
                  onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
                />
                <small>{personal.summary.length} / 400 characters</small>
              </Field>
            </>
          )}
          {section === "Education" && (
            <EntrySection
              kind="education"
              items={(profile.education || []).map((e) => ({ id: e.id, primary: `${e.degree}${e.field ? ` in ${e.field}` : ""}`, secondary: `${e.institution} · ${formatRange(e.start_date, e.end_date)}`, raw: e }))}
              onAdd={() => setEntryModal({ kind: "education", entry: null })}
              onEdit={(raw) => setEntryModal({ kind: "education", entry: raw })}
              onDelete={(raw) => setRemoveEntry({ kind: "education", entry: raw })}
            />
          )}
          {section === "Experience" && (
            <EntrySection
              kind="experience"
              items={(profile.experience || []).map((x) => ({ id: x.id, primary: x.title, secondary: `${x.company} · ${formatRange(x.start_date, x.end_date, x.current)}`, raw: x }))}
              onAdd={() => setEntryModal({ kind: "experience", entry: null })}
              onEdit={(raw) => setEntryModal({ kind: "experience", entry: raw })}
              onDelete={(raw) => setRemoveEntry({ kind: "experience", entry: raw })}
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
                {(profile.skills || []).map((s) => (
                  <span key={s.id}>
                    {s.name}
                    <button onClick={() => toggleSkill(s, false)}>×</button>
                  </span>
                ))}
                <select
                  value=""
                  onChange={(e) => {
                    const skill = allSkills?.find((s) => String(s.id) === e.target.value);
                    if (skill) toggleSkill(skill, true);
                  }}
                >
                  <option value="" disabled>
                    + Add skill
                  </option>
                  {(allSkills || [])
                    .filter((s) => !(profile.skills || []).some((p) => p.id === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}
          {section === "Certificates" && (
            <EntrySection
              kind="certificate"
              upload
              items={(profile.certificates || []).map((c) => ({ id: c.id, primary: c.name, secondary: `${c.issuer} · Issued ${formatMonth(c.issued_date)}`, raw: c }))}
              onAdd={() => setEntryModal({ kind: "certificate", entry: null })}
              onEdit={(raw) => setEntryModal({ kind: "certificate", entry: raw })}
              onDelete={(raw) => setRemoveEntry({ kind: "certificate", entry: raw })}
            />
          )}
        </section>
      </div>
      {entryModal && (
        <EntryModal
          kind={entryModal.kind}
          entry={entryModal.entry}
          onClose={() => setEntryModal(null)}
          onSave={(values) => saveEntry(entryModal.kind, values, entryModal.entry?.id)}
        />
      )}
      <Modal
        open={!!removeEntry}
        onClose={() => setRemoveEntry(null)}
        title="Remove this entry?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoveEntry(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteEntry}>
              Remove
            </Button>
          </>
        }
      >
        <p>This will remove it from your profile.</p>
      </Modal>
    </>
  );
}
function EntrySection({ kind, items, upload, onAdd, onEdit, onDelete }) {
  const { icon: Icon, label } = ENTRY_META[kind];
  return (
    <>
      <div className="panel-head">
        <div>
          <h2>{label.charAt(0).toUpperCase() + label.slice(1)}</h2>
          <p>Add multiple entries and keep them current.</p>
        </div>
        <Button variant="secondary" onClick={onAdd}>
          <Plus />
          Add {label}
        </Button>
      </div>
      {items.length ? (
        <div className="entry-list">
          {items.map((item) => (
            <div key={item.id}>
              <span className="entry-icon">
                {upload ? <Award /> : <Icon />}
              </span>
              <div>
                <strong>{item.primary}</strong>
                <small>{item.secondary}</small>
              </div>
              <button className="icon-btn" onClick={() => onEdit(item.raw)}>
                <Edit3 />
              </button>
              <button className="icon-btn" onClick={() => onDelete(item.raw)}>
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Icon} title={`No ${label} added yet`} description={`Add your ${label} so employers see the full picture.`} />
      )}
    </>
  );
}
function EntryModal({ kind, entry, onClose, onSave }) {
  const { show } = useToast();
  const defaults = {
    education: { institution: "", degree: "", field: "", start_date: "", end_date: "" },
    experience: { company: "", title: "", description: "", start_date: "", end_date: "", current: false },
    certificate: { name: "", issuer: "", issued_date: "", credential_url: "" },
  }[kind];
  const [values, setValues] = useState({ ...defaults, ...entry });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => setValues({ ...values, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Empty strings aren't valid dates for the API — send null instead, and drop a
      // still-open role's end date entirely so "currently working here" sticks.
      const cleaned = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
      );
      if (kind === "experience" && cleaned.current) cleaned.end_date = null;
      let payload = cleaned;
      if (kind === "certificate" && file) {
        payload = new FormData();
        Object.entries(cleaned).forEach(([k, v]) => {
          if (v !== null && v !== undefined) payload.append(k, v);
        });
        payload.append("document", file);
      }
      await onSave(payload);
    } catch {
      show("We could not save this entry.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={`${entry ? "Edit" : "Add"} ${ENTRY_META[kind].label}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={submit}>
        {kind === "education" && (
          <>
            <Field label="Institution">
              <input required value={values.institution} onChange={set("institution")} />
            </Field>
            <Field label="Degree">
              <input required value={values.degree} onChange={set("degree")} />
            </Field>
            <Field label="Field of study">
              <input value={values.field} onChange={set("field")} />
            </Field>
            <Field label="Start date">
              <input type="date" required value={values.start_date || ""} onChange={set("start_date")} />
            </Field>
            <Field label="End date" hint="Leave blank if ongoing">
              <input type="date" value={values.end_date || ""} onChange={set("end_date")} />
            </Field>
          </>
        )}
        {kind === "experience" && (
          <>
            <Field label="Job title">
              <input required value={values.title} onChange={set("title")} />
            </Field>
            <Field label="Company">
              <input required value={values.company} onChange={set("company")} />
            </Field>
            <Field label="Start date">
              <input type="date" required value={values.start_date || ""} onChange={set("start_date")} />
            </Field>
            <Field label="End date">
              <input type="date" disabled={values.current} value={values.end_date || ""} onChange={set("end_date")} />
            </Field>
            <label>
              <input type="checkbox" checked={!!values.current} onChange={set("current")} /> I currently work here
            </label>
            <Field label="Description">
              <textarea rows="4" value={values.description} onChange={set("description")} />
            </Field>
          </>
        )}
        {kind === "certificate" && (
          <>
            <Field label="Certificate name">
              <input required value={values.name} onChange={set("name")} />
            </Field>
            <Field label="Issuer">
              <input required value={values.issuer} onChange={set("issuer")} />
            </Field>
            <Field label="Issued date">
              <input type="date" required value={values.issued_date || ""} onChange={set("issued_date")} />
            </Field>
            <Field label="Credential URL">
              <input value={values.credential_url} onChange={set("credential_url")} />
            </Field>
            <label className="upload-box">
              <FileText />
              <strong>{file ? file.name : "Drop a certificate here or browse"}</strong>
              <small>PDF, JPG, or PNG up to 5 MB</small>
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </>
        )}
      </form>
    </Modal>
  );
}
const CV_SECTIONS = [
  { key: "summary", label: "Professional summary" },
  { key: "experience", label: "Work experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "certificates", label: "Certificates" },
];
const ACCENT_COLORS = ["#137b59", "#6363cf", "#e99b2c", "#d84d4d"];
export function CVBuilder() {
  const { show } = useToast();
  const { data: profile, loading, error } = useAsync(profileService.get);
  const [include, setInclude] = useState({ summary: true, experience: true, education: true, skills: true, certificates: true });
  const [accent, setAccent] = useState(ACCENT_COLORS[0]);
  const [template, setTemplate] = useState("modern");
  const [downloading, setDownloading] = useState(false);
  const toggle = (key) => setInclude({ ...include, [key]: !include[key] });
  const download = async () => {
    setDownloading(true);
    try {
      const blob = await cvService.generate({ sections: CV_SECTIONS.filter((s) => include[s.key]).map((s) => s.key), template, accent });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(profile?.user?.name || "resume").trim().replace(/\s+/g, "-").toLowerCase()}-cv.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      show("Your CV was downloaded.");
    } catch {
      show("We could not generate your CV. Try again.");
    } finally {
      setDownloading(false);
    }
  };
  if (loading) return <Spinner />;
  if (error || !profile) return <ErrorState />;
  const name = profile.user?.name || "Your name";
  return (
    <>
      <PageHeader
        title="CV builder"
        description="Turn your SkillNet profile into a polished, ready-to-share CV."
        actions={
          <Button onClick={download} disabled={downloading}>
            <Download />
            {downloading ? "Preparing…" : "Download PDF"}
          </Button>
        }
      />
      <div className="cv-layout">
        <section className="panel cv-controls">
          <h2>CV content</h2>
          {CV_SECTIONS.map((s) => (
            <label key={s.key}>
              <input type="checkbox" checked={include[s.key]} onChange={() => toggle(s.key)} />
              <span>{s.label}</span>
            </label>
          ))}
          <h3>Accent colour</h3>
          <div className="color-picker">
            {ACCENT_COLORS.map((c) => (
              <button key={c} className={accent === c ? "active" : ""} style={{ background: c }} onClick={() => setAccent(c)} aria-label={`Use accent ${c}`} />
            ))}
          </div>
          <h3>Template</h3>
          <select value={template} onChange={(e) => setTemplate(e.target.value)}>
            <option value="modern">Modern — clean and focused</option>
            <option value="classic">Classic — formal and timeless</option>
          </select>
        </section>
        <section className="cv-preview">
          <div className="cv-page">
            <header>
              <div>
                <h1>{name}</h1>
                <p>{(profile.headline || "").toUpperCase()}</p>
              </div>
              <div>
                <span>{profile.user?.email}</span>
                <span>{profile.user?.phone}</span>
                <span>{profile.location}</span>
              </div>
            </header>
            {include.summary && profile.summary && (
              <CVSection title="Profile">
                <p>{profile.summary}</p>
              </CVSection>
            )}
            {include.experience && profile.experience?.length > 0 && (
              <CVSection title="Experience">
                {profile.experience.map((x) => (
                  <div key={x.id}>
                    <h4>
                      {x.title} <span>{formatRange(x.start_date, x.end_date, x.current).toUpperCase()}</span>
                    </h4>
                    <b>{x.company}</b>
                    {x.description && <p>{x.description}</p>}
                  </div>
                ))}
              </CVSection>
            )}
            {include.education && profile.education?.length > 0 && (
              <CVSection title="Education">
                {profile.education.map((e) => (
                  <div key={e.id}>
                    <h4>
                      {e.degree}
                      {e.field ? ` in ${e.field}` : ""} <span>{formatRange(e.start_date, e.end_date).toUpperCase()}</span>
                    </h4>
                    <b>{e.institution}</b>
                  </div>
                ))}
              </CVSection>
            )}
            {include.skills && profile.skills?.length > 0 && (
              <CVSection title="Skills">
                <div className="cv-skills">
                  {profile.skills.map((s) => (
                    <span key={s.id}>{s.name}</span>
                  ))}
                </div>
              </CVSection>
            )}
            {include.certificates && profile.certificates?.length > 0 && (
              <CVSection title="Certificates">
                {profile.certificates.map((c) => (
                  <div key={c.id}>
                    <h4>{c.name}</h4>
                    <b>
                      {c.issuer} · {formatMonth(c.issued_date)}
                    </b>
                  </div>
                ))}
              </CVSection>
            )}
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
  const { show } = useToast();
  const { data, loading, error } = useAsync(enrollmentService.getAll);
  const [enrollments, setEnrollments] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [completing, setCompleting] = useState(null);
  useEffect(() => {
    if (data) {
      setEnrollments(data);
      setActiveId((current) => current ?? (data.find((e) => !e.is_completed) || data[0])?.id);
    }
  }, [data]);
  const active = enrollments?.find((e) => e.id === activeId);
  const completeModule = async (moduleId) => {
    setCompleting(moduleId);
    try {
      const updated = await enrollmentService.completeModule(active.id, moduleId);
      setEnrollments((list) => list.map((e) => (e.id === active.id ? updated : e)));
      if (updated.is_completed) show(`You completed ${updated.course.title}!`);
    } catch {
      show("We could not update your progress.");
    } finally {
      setCompleting(null);
    }
  };
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
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState />
      ) : active ? (
        <>
          <div className="learning-hero">
            <div className="course-icon">{active.course.title.charAt(0)}</div>
            <div>
              <Badge tone="success">{active.is_completed ? "COMPLETED" : "CONTINUE LEARNING"}</Badge>
              <h2>{active.course.title}</h2>
              <p>{active.course.modules?.length || 0} modules available</p>
              <div className="progress">
                <i style={{ width: `${active.progress}%` }} />
              </div>
              <span>
                {active.progress}% complete · {active.completed_modules?.length || 0} of {active.course.modules?.length || 0} modules completed
              </span>
            </div>
            <Link to={`/courses/${active.course.id}`} className="btn btn-primary">
              Open course <ChevronRight />
            </Link>
          </div>
          {active.course.modules?.length > 0 && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Modules</h2>
                  <p>Mark each module complete as you finish it.</p>
                </div>
              </div>
              <div className="entry-list">
                {active.course.modules.map((module) => {
                  const done = (active.completed_modules || []).some((m) => (m.id ?? m) === module.id);
                  return (
                    <div key={module.id}>
                      <span className="entry-icon">{done ? <CheckCircle2 /> : <Circle />}</span>
                      <div>
                        <strong>{module.title}</strong>
                      </div>
                      {done ? (
                        <Badge tone="success">Completed</Badge>
                      ) : (
                        <Button variant="secondary" disabled={completing === module.id} onClick={() => completeModule(module.id)}>
                          {completing === module.id ? "Saving…" : "Mark complete"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <h2 className="subheading">Your courses</h2>
          <div className="card-grid three">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} onClick={() => setActiveId(enrollment.id)} style={{ cursor: "pointer" }}>
                <CourseCard course={enrollment.course} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState icon={GraduationCap} title="No courses yet" description="Enroll in a course to start your learning path." action={<Link to="/courses" className="btn btn-primary">Browse courses</Link>} />
      )}
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

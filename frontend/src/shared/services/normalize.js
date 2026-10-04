// Shapes raw Django REST payloads into the display-friendly fields the UI expects.
// Used by more than one role's service module, so it lives here rather than under a role folder.
export const titleCase = (value = '') => value.toLowerCase().split('_').map((item, i) => i === 0 ? item.charAt(0).toUpperCase() + item.slice(1) : item).join('-');
export const money = (value) => Number(value || 0).toLocaleString('en-BD');
// Shared by the seeker's profile/CV pages and the employer's candidate-CV review.
export const formatMonth = (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
export const formatRange = (start, end, current) => `${formatMonth(start)} – ${current ? 'Present' : formatMonth(end)}`;

// A deterministic gradient badge per company (same company always gets the same one),
// so job cards read as distinct, polished brand marks instead of one flat pale tone.
// No green here on purpose — that's the app's own brand/success color (buttons,
// "Active"/"Published" badges), so a green company badge reads as a status pill
// instead of a company mark.
const LOGO_PALETTE = [
  ['#2563eb', '#1d4ed8'], // blue
  ['#475569', '#334155'], // slate
  ['#ea580c', '#c2410c'], // orange
  ['#db2777', '#be185d'], // pink
  ['#7c3aed', '#6d28d9'], // purple
  ['#0891b2', '#0e7490'], // cyan
  ['#ca8a04', '#a16207'], // amber
  ['#dc2626', '#b91c1c'], // red
  ['#4f46e5', '#4338ca'], // indigo
  ['#0d9488', '#0f766e'], // teal
];
// Specific companies pinned to a specific color, checked before the automatic
// assignment below.
const LOGO_OVERRIDES = {
  'Orbit Systems': ['#eab308', '#a16207'], // yellow
};
// Hashing the company name straight into a palette index collides easily once more
// than a couple of companies exist (birthday paradox against only 10 colors) — e.g.
// "Amazon" and "Orbit Systems" landed on the same purple. Instead, hand out palette
// entries in the order each distinct company is first seen, so every company stays
// visually distinct (for this browser session) until more companies than colors exist.
const logoAssignments = new Map();
let nextLogoIndex = 0;
const companyLogoStyle = (seed) => {
  const key = String(seed || 'SkillNet');
  if (!logoAssignments.has(key)) {
    logoAssignments.set(key, LOGO_OVERRIDES[key] || LOGO_PALETTE[nextLogoIndex % LOGO_PALETTE.length]);
    if (!LOGO_OVERRIDES[key]) nextLogoIndex += 1;
  }
  const [from, to] = logoAssignments.get(key);
  return { background: `linear-gradient(135deg, ${from}, ${to})`, color: '#fff' };
};
export const normalizeJob = (job) => ({
  ...job,
  skills: (job.skills || []).map((skill) => typeof skill === 'string' ? skill : skill.name),
  type: job.type || titleCase(job.job_type),
  quiz: job.quiz ?? job.has_quiz,
  salary: job.salary || (job.salary_min ? `৳${money(job.salary_min)}${job.salary_max ? `–${money(job.salary_max)}` : ''}` : 'Salary negotiable'),
  posted: job.posted || (job.created_at ? new Date(job.created_at).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' }) : ''),
  // A real uploaded company logo always wins; otherwise fall back to a colored-initials badge.
  logoUrl: job.logoUrl || job.employer?.logo || null,
  logo: job.logo || job.company?.split(' ').map((item) => item[0]).slice(0, 2).join('') || 'SN',
  logoStyle: job.logoStyle || companyLogoStyle(job.company || job.employer?.company_name),
  requirements: Array.isArray(job.requirements) ? job.requirements : String(job.requirements || '').split('\n').filter(Boolean),
});
export const normalizeCourse = (course) => ({
  ...course,
  skills: (course.skills || []).map((skill) => typeof skill === 'string' ? skill : skill.name),
  skill: course.skill || course.skills?.[0]?.name || course.skills?.[0] || course.category,
  provider: course.provider_name || course.provider || 'SkillNet provider',
  duration: course.duration || (course.duration_minutes ? `${Math.floor(course.duration_minutes / 60)}h ${course.duration_minutes % 60}m` : 'Self-paced'),
  lessons: course.lessons || course.modules?.length || 0,
  modules: (course.modules || []).map((module) => typeof module === 'string' ? module : module.title),
  image: course.image || String(course.category || 'course').toLowerCase().replaceAll(' ', '-'),
  level: course.level || 'All levels',
  reviews: course.reviews || 0,
  price: Number(course.price || 0),
  rating: Number(course.rating || 0),
});
// Client-side CSV export for admin tables — no backend endpoint needed since the
// rows are already loaded on the page.
export const downloadCsv = (filename, rows) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
export const normalizeApplication = (application) => ({
  ...application,
  job_detail: application.job,
  job: application.job?.title || application.job,
  status_code: application.status,
  status: titleCase(application.status),
  company: application.company || application.job?.company,
  jobTitle: application.job?.title || application.job,
  date: application.date || new Date(application.created_at).toLocaleDateString('en-BD'),
  updated: application.updated || new Date(application.updated_at).toLocaleDateString('en-BD'),
  score: application.score ?? application.quiz_score,
});

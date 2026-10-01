// Shapes raw Django REST payloads into the display-friendly fields the UI expects.
// Used by more than one role's service module, so it lives here rather than under a role folder.
export const titleCase = (value = '') => value.toLowerCase().split('_').map((item, i) => i === 0 ? item.charAt(0).toUpperCase() + item.slice(1) : item).join('-');
export const money = (value) => Number(value || 0).toLocaleString('en-BD');
// Shared by the seeker's profile/CV pages and the employer's candidate-CV review.
export const formatMonth = (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
export const formatRange = (start, end, current) => `${formatMonth(start)} – ${current ? 'Present' : formatMonth(end)}`;

export const normalizeJob = (job) => ({
  ...job,
  skills: (job.skills || []).map((skill) => typeof skill === 'string' ? skill : skill.name),
  type: job.type || titleCase(job.job_type),
  quiz: job.quiz ?? job.has_quiz,
  salary: job.salary || (job.salary_min ? `৳${money(job.salary_min)}${job.salary_max ? `–${money(job.salary_max)}` : ''}` : 'Salary negotiable'),
  posted: job.posted || (job.created_at ? new Date(job.created_at).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' }) : ''),
  logo: job.logo || job.company?.split(' ').map((item) => item[0]).slice(0, 2).join('') || 'SN',
  color: job.color || '#e8f7f1',
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

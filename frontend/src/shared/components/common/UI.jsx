import { useState } from 'react';
import { AlertCircle, ArrowRight, Briefcase, Check, ChevronRight, MapPin, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
// Deterministic demo headshots (same seed always returns the same photo) — used as a
// stand-in profile picture for any user who hasn't uploaded a real one. Passing a
// gender picks from a photo set explicitly labeled that way, rather than guessing.
const hashSeed = (seed) => {
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash % 100;
};
export const demoAvatarUrl = (seed, size = 150, gender) => {
  if (gender === 'male') return `https://randomuser.me/api/portraits/men/${hashSeed(seed)}.jpg`;
  if (gender === 'female') return `https://randomuser.me/api/portraits/women/${hashSeed(seed)}.jpg`;
  return `https://i.pravatar.cc/${size}?u=${encodeURIComponent(seed)}`;
};
// Demo photography for course offerings, keyed by the same "image" slug normalizeCourse
// already derives (an explicit course.image, or the course's category, lowercased/hyphenated).
// A category with no specific match still gets a relevant generic photo via the fallback.
const COURSE_IMAGE_IDS = {
  excel: '1454165804606-c3d57bc86b40',
  comms: '1600880292203-757bb62b4baf',
  communication: '1600880292203-757bb62b4baf',
  react: '1517180102446-f3ece451e9d8',
  technology: '1517180102446-f3ece451e9d8',
  safety: '1504328345606-18bbc8c9d7d1',
  'skilled-trades': '1504328345606-18bbc8c9d7d1',
  design: '1561070791-2526d30994b5',
  'customer-service': '1553775282-20af80779df7',
  sales: '1556740758-90de374c12ad',
  business: '1553729459-efe14ef6055d',
  finance: '1553729459-efe14ef6055d',
  marketing: '1571260899304-425eee4c7efc',
  'data-analysis': '1551288049-bebda4e38f71',
  career: '1524995997946-a1c2e315a42f',
};
const DEFAULT_COURSE_IMAGE_ID = '1524995997946-a1c2e315a42f';
export const courseImageUrl = (slug, width = 600) => `https://images.unsplash.com/photo-${COURSE_IMAGE_IDS[slug] || DEFAULT_COURSE_IMAGE_ID}?w=${width}&q=60&auto=format&fit=crop`;
export const Button=({children,variant='primary',className='',...props})=><button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>;
export const Badge=({children,tone='default'})=><span className={`badge badge-${tone}`}>{children}</span>;
export function Avatar({initials='SN',size='md',seed,photo,gender}){
  const [errored,setErrored]=useState(false);
  const src=!errored&&(photo||(seed?demoAvatarUrl(seed,150,gender):null));
  if(src)return <img src={src} alt="" className={`avatar avatar-${size}`} style={{objectFit:'cover'}} onError={()=>setErrored(true)}/>;
  return <span className={`avatar avatar-${size}`}>{initials}</span>;
}
export function PageHeader({eyebrow,title,description,actions}){return <div className="page-header"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description&&<p>{description}</p>}</div>{actions&&<div className="header-actions">{actions}</div>}</div>}
export function EmptyState({icon:Icon=Briefcase,title='Nothing here yet',description='New items will appear here.',action}){return <div className="empty-state"><span className="empty-icon"><Icon/></span><h3>{title}</h3><p>{description}</p>{action}</div>}
export const Spinner=()=> <div className="loading-state"><span className="spinner"/><span>Loading your workspace…</span></div>;
export const ErrorState=({message='Something went wrong. Please try again.'})=><div className="error-state"><AlertCircle/><div><strong>We couldn’t load this</strong><p>{message}</p></div></div>;
export function JobCard({job,compact=false}){return <article className={`job-card ${compact?'compact':''}`}><div className="job-top">{job.logoUrl?<img src={job.logoUrl} alt="" className="company-logo" style={{objectFit:'cover'}}/>:<span className="company-logo" style={job.logoStyle}>{job.logo}</span>}<button className="icon-btn" aria-label="Save job">♡</button></div><div><p className="muted small">{job.company}</p><h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3></div><div className="job-meta"><span><MapPin size={14}/>{job.location}</span><span><Briefcase size={14}/>{job.type}</span></div><div className="skills">{job.skills.slice(0,3).map(s=><Badge key={s}>{s}</Badge>)}</div><div className="job-foot"><div><strong>{job.salary}</strong><small>{job.posted}</small></div><Link className="round-link" to={`/jobs/${job.id}`} aria-label={`View ${job.title}`}><ArrowRight size={18}/></Link></div></article>}
export function CourseCard({course}){return <article className="course-card"><Link to={`/courses/${course.id}`} className={`course-art art-${course.image}`}><img src={courseImageUrl(course.image)} alt="" loading="lazy"/><span>{course.skill}</span></Link><div className="course-body"><div className="row between"><Badge>{course.level}</Badge><span className="rating"><Star size={14} fill="currentColor"/>{course.rating}</span></div><h3><Link to={`/courses/${course.id}`}>{course.title}</Link></h3><p className="muted small">by {course.provider}</p><div className="course-foot"><span>{course.duration} · {course.lessons} lessons</span><strong>{course.price?`৳${course.price.toLocaleString()}`:'Free'}</strong></div></div></article>}
export function SearchBox({value,onChange,placeholder='Search'}){return <label className="search-box"><Search size={18}/><input value={value} onChange={onChange} placeholder={placeholder}/></label>}
export function StatCard({label,value,change,icon:Icon,tone='green'}){return <div className="stat-card"><div className={`stat-icon ${tone}`}>{Icon&&<Icon/>}</div><div><p>{label}</p><strong>{value}</strong>{change&&<small>{change}</small>}</div></div>}
export function StatusBadge({status}){const tone=status==='Hired'||status==='Interview'?'success':status==='Rejected'?'danger':status==='Shortlisted'?'purple':'default';return <Badge tone={tone}>{status}</Badge>}
export function Modal({open,onClose,title,children,footer}){if(!open)return null;return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true"><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}>×</button></div><div className="modal-body">{children}</div>{footer&&<div className="modal-foot">{footer}</div>}</section></div>}
export const Field=({label,error,children,hint})=><label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}{error&&<em>{error}</em>}</label>;
export const Stepper=({status})=>{const steps=['Applied','Shortlisted','Interview','Hired'];const rejected=status==='Rejected';const active=rejected?1:Math.max(0,steps.indexOf(status));return <div className="stepper">{steps.map((s,i)=><div className={`step ${i<=active&&!rejected?'done':''} ${i===active?'current':''}`} key={s}><span>{i<active?<Check size={14}/>:i+1}</span><small>{rejected&&i===2?'Rejected':s}</small>{i<steps.length-1&&<i/>}</div>)}</div>}
export const TableActions=()=> <button className="icon-btn">•••</button>;
export const ViewAll=({to,children='View all'})=><Link to={to} className="text-link">{children}<ChevronRight size={16}/></Link>;

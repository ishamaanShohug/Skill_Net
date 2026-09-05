import { jobs, courses, applications, notifications, applicants } from '../data/mockData';
const wait=(data,ms=280)=>new Promise(resolve=>setTimeout(()=>resolve(structuredClone(data)),ms));
export const mockService={
 getJobs:()=>wait(jobs), getJobById:(id)=>wait(jobs.find(x=>String(x.id)===String(id))),
 getCourses:()=>wait(courses), getCourseById:(id)=>wait(courses.find(x=>String(x.id)===String(id))),
 getApplications:()=>wait(applications), getNotifications:()=>wait(notifications), getApplicants:()=>wait(applicants),
 applyForJob:(id)=>wait({success:true,jobId:id}), enrollCourse:(id)=>wait({success:true,courseId:id}),
 submitQuiz:(answers)=>wait({score:Object.values(answers).filter((v,i)=>v===['b','c','a','d','b'][i]).length,total:5,gaps:['Data Analysis','Communication']}),
 login:({email,role='JOB_SEEKER'})=>wait({access:'mock-access-token',refresh:'mock-refresh-token',user:{id:1,name:role==='EMPLOYER'?'Tasnim at Orbit':role==='ADMIN'?'Admin User':'Shohug',email,role}})
};

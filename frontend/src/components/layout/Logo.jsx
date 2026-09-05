import { Link } from 'react-router-dom';
export default function Logo({light=false}){return <Link to="/" className={`logo ${light?'logo-light':''}`}><span><i/><i/><i/></span>Skill<span>Net</span></Link>}

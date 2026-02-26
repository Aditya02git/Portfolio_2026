import ModalWrapper from './ModalWrapper.jsx'

const resumeData = {
  name: 'Aditya Mondal',
  title: 'Full Stack Developer & 3D Creative',
  email: 'm.adityamondal@email.com',
  github: 'https://github.com/Aditya02git',
  linkedin: 'https://www.linkedin.com/in/aditya-mondal-aa9658288/',
  about: 'Passionate developer crafting immersive web experiences at the intersection of code and creativity. Specialising in modern full-stack development with game development.',
  experience: [
    {
      role: 'Frontend Developer',
      company: 'VenRoh VR LLP',
      period: '7/2025 – 11/2025',
      desc: 'Built an internal admin dashboard with responsive UI components using React.js and Node.js and also Developed a real-time chat system integrated with the dashboard for team communication',
    },
  ],
  education: [
    {
      degree: 'B.Tech in Computer Science',
      college: 'Meghnad Saha Intitute of Technology',
      university: 'MAKAUT, West Bengal, India',
      period: '2022 – 2026',
    },
  ],
  skills: ['C++', 'React.js', 'Three.js', 'Node.js', 'Blender', 'WebGL', 'Python', 'MongoDB'],
}

export default function ResumeModal({ onClose }) {
  return (
    <ModalWrapper icon="📄" title="Resume" onClose={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }
        .resume-section { margin-bottom: 18px }
        .resume-section h3 { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#8B6914; margin:0 0 8px; border-bottom:1px solid #c9a22766; padding-bottom:4px }
        .resume-entry { margin-bottom:10px }
        .resume-entry .role { font-weight:700; font-size:14px; color:#3d2800 }
        .resume-entry .meta { font-size:12px; color:#7a5c1e; margin: 2px 0 }
        .resume-entry p { margin:3px 0; font-size:13px; color:#5a3e10 }
        .skills-grid { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px }
        .skill-tag { background:linear-gradient(135deg,#f5c842,#e8b820); border:1px solid #8B6914; border-radius:4px; padding:3px 10px; font-size:12px; font-weight:600; color:#3d2800; letter-spacing:0.5px }
        .contact-row { display:flex; gap:12px; flex-wrap:wrap; font-size:12px; color:#7a5c1e; margin-bottom:6px }
        .contact-row a { color:#8B6914; text-decoration:none; font-weight:600 }
        .name-block { text-align:center; margin-bottom:16px }
        .name-block .big-name { font-size:22px; font-weight:800; color:#3d2800; letter-spacing:2px; text-transform:uppercase }
        .name-block .sub-title { font-size:13px; color:#7a5c1e; margin-top:2px; font-style:italic }
        .download-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:10px; background:linear-gradient(135deg,#3d2800,#5c4209); border:2px solid #8B6914; border-radius:6px; color:#f5e4a8; font-family:inherit; font-weight:700; font-size:13px; letter-spacing:1px; text-transform:uppercase; cursor:pointer; margin-top:16px; transition:all 0.15s; text-decoration:none }
        .download-btn:hover { background:linear-gradient(135deg,#5c4209,#8B6914); box-shadow:0 4px 15px rgba(0,0,0,0.3) }
      `}</style>

      <div className="name-block">
        <div className="big-name">{resumeData.name}</div>
        <div className="sub-title">{resumeData.title}</div>
      </div>

      <div className="contact-row">
        <span><i class="fa fa-envelope" aria-hidden="true"></i> <a href={`mailto:${resumeData.email}`}>{resumeData.email}</a></span>
        <span><i class="fa fa-github" aria-hidden="true"></i> <a href={`https://${resumeData.github}`} target="_blank" rel="noreferrer">{resumeData.github}</a></span>
        <span><i class="fa fa-linkedin-square" aria-hidden="true"></i> <a href={`https://${resumeData.linkedin}`} target="_blank" rel="noreferrer">{resumeData.linkedin}</a></span>
      </div>

      <div className="resume-section">
        <h3>About</h3>
        <p style={{fontSize:13,color:'#5a3e10',margin:0}}>{resumeData.about}</p>
      </div>

      <div className="resume-section">
        <h3>Experience</h3>
        {resumeData.experience.map((e, i) => (
          <div className="resume-entry" key={i}>
            <div className="role">{e.role}</div>
            <div className="meta">{e.company} · {e.period}</div>
            <p>{e.desc}</p>
          </div>
        ))}
      </div>

      <div className="resume-section">
        <h3>Education</h3>
        {resumeData.education.map((e, i) => (
          <div className="resume-entry" key={i}>
            <div className="role">{e.degree}</div>
            <div className="meta">{e.school} · {e.period}</div>
          </div>
        ))}
      </div>

      <div className="resume-section">
        <h3>Skills</h3>
        <div className="skills-grid">
          {resumeData.skills.map(s => <span className="skill-tag" key={s}>{s}</span>)}
        </div>
      </div>

      {/* Download button — point to your actual PDF */}
      <a className="download-btn" href="/docs/Aditya_Mondal_Resume.pdf" download="Resume.pdf">
        ⬇ Download PDF Resume
      </a>
    </ModalWrapper>
  )
}
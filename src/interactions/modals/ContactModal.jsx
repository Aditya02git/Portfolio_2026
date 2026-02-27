import ModalWrapper from "./ModalWrapper.jsx";

const YOUR_EMAIL = "m.adityamondal2003@gmail.com";

const QUICK_MESSAGES = [
  {
    icon: <i class="fa fa-hand-paper-o" aria-hidden="true"></i>,
    label: "Say Hello",
    subject: "Hey Aditya!",
    body: `Hi Aditya,\n\nI came across your portfolio and just wanted to say hello!\n\nLooking forward to hearing from you.`,
  },
  {
    icon: <i class="fa fa-suitcase" aria-hidden="true"></i>,
    label: "Work Together",
    subject: "I'd love to collaborate with you!",
    body: `Hi Aditya,\n\nI'm reaching out because I think we could work on something great together.\n\nHere's what I have in mind:\n[Your idea here]\n\nLet me know if you're interested!`,
  },
  {
    icon: <i class="fa fa-bug" aria-hidden="true"></i>,
    label: "Report a Bug",
    subject: "Bug Report",
    body: `Hi Aditya,\n\nI found a bug I'd like to report:\n\nPage / Feature: \nWhat happened: \nWhat I expected: \n\nThanks for looking into it!`,
  },
  {
    icon: <i class="fa fa-comment" aria-hidden="true"></i>,
    label: "Give Feedback",
    subject: "Feedback on your portfolio",
    body: `Hi Aditya,\n\nI wanted to share some feedback about your work:\n\n[Your feedback here]\n\nKeep it up!`,
  }
];

function buildMailto(subject, body) {
  return `mailto:${YOUR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ContactModal({ onClose }) {
  return (
    <ModalWrapper icon="📞" title="Contact Me" onClose={onClose}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');

        .contact-root { font-family: 'DM Sans', sans-serif; }

        .contact-social { display:flex; gap:8px; justify-content:center; margin-bottom:20px; flex-wrap:wrap; }
        .social-chip {
          display:flex; align-items:center; gap:6px;
          padding:6px 14px;
          background:linear-gradient(135deg,#f5c842,#e8b820);
          border:1px solid #8B6914; border-radius:20px;
          color:#3d2800; font-weight:700; font-size:12px;
          text-decoration:none; transition:all 0.15s;
        }
        .social-chip:hover { background:linear-gradient(135deg,#3d2800,#5c4209); color:#f5e4a8; }

        .section-label {
          font-size:10px; letter-spacing:3px; text-transform:uppercase;
          color:#8B6914; text-align:center; margin-bottom:12px;
          display:flex; align-items:center; gap:8px;
        }
        .section-label::before, .section-label::after {
          content:''; flex:1; height:1px;
          background:linear-gradient(90deg,transparent,#c9a22766,transparent);
        }

        .quick-grid {
          display:grid; grid-template-columns:1fr 1fr; gap:8px;
        }

        .quick-btn {
          display:flex; align-items:center; gap:10px;
          padding:11px 14px;
          background:rgba(245,200,66,0.07);
          border:1.5px solid #c9a22744;
          border-radius:8px;
          color:#3d1f00;
          text-decoration:none;
          transition:all 0.18s;
          cursor:pointer;
        }
        .quick-btn:hover {
          background:linear-gradient(135deg,#f5c84222,#e8b82011);
          border-color:#c9a227;
          transform:translateY(-1px);
          box-shadow:0 4px 14px rgba(201,162,39,0.18);
        }

        .quick-btn-icon {
          font-size:20px; line-height:1; flex-shrink:0;
        }

        .quick-btn-text { display:flex; flex-direction:column; }
        .quick-btn-label { font-size:13px; font-weight:700; color:#3d1f00; }
        .quick-btn-sub { font-size:10px; color:#8B6914; margin-top:1px; }

        .contact-note {
          text-align:center; margin-top:16px;
          font-size:11px; color:#a07830; letter-spacing:0.3px;
        }
        .contact-note a { color:#8B6914; font-weight:700; text-decoration:none; }
        .contact-note a:hover { text-decoration:underline; }
      `}</style>

      <div className="contact-root">
        {/* Social links */}
        <div className="contact-social">
          <a
            className="social-chip"
            href="https://github.com/Aditya02git"
            target="_blank"
            rel="noreferrer"
          >
            <i class="fa fa-github-square" aria-hidden="true"></i> GitHub
          </a>
          <a
            className="social-chip"
            href="https://www.linkedin.com/in/aditya-mondal-aa9658288/"
            target="_blank"
            rel="noreferrer"
          >
            <i class="fa fa-linkedin-square" aria-hidden="true"></i> LinkedIn
          </a>
        </div>

        {/* Quick message buttons */}
        <div className="section-label">Quick Message</div>

        <div className="quick-grid">
          {QUICK_MESSAGES.map(({ icon, label, subject, body }) => (
            <a
              key={label}
              className="quick-btn"
              href={buildMailto(subject, body)}
            >
              <span className="quick-btn-icon">{icon}</span>
              <span className="quick-btn-text">
                <span className="quick-btn-label">{label}</span>
                <span className="quick-btn-sub">Opens your mail app</span>
              </span>
            </a>
          ))}
        </div>

        <p className="contact-note">
          Clicking a button opens your mail app with a pre-filled message.
          <br />
          Or reach me directly at{" "}
          <a href={`mailto:${YOUR_EMAIL}`}>{YOUR_EMAIL}</a>
        </p>
      </div>
    </ModalWrapper>
  );
}

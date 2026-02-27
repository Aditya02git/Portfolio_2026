import ModalWrapper from './ModalWrapper.jsx'

const CREDITS = [
  {
    category: "Design & Direction",
    people: ["Aditya Mondal"],
  },
  {
    category: "3d Modeling & Art",
    people: ["Aditya Mondal", "Sketchfab"],
  },
  {
    category: "Music & Sound FX",
    people: ["YT channel(NCS) - Mood Videos — Creative Background Music", "The Open Source Community", "Pixabay.com", "Soundsnap.com"],
  },
]

export default function CreditsModal({ onClose }) {
  return (
    <ModalWrapper icon="🪙" title="Credits" onClose={onClose}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        @keyframes starPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }

        @keyframes scrollCredits {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        .credits-root {
          font-family: 'Crimson Text', Georgia, serif;
          background: linear-gradient(160deg, #1a0e00 0%, #2c1a00 50%, #1a0e00 100%);
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          position: relative;
          min-height: 320px;
        }

        .credits-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,162,39,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 100%, rgba(201,162,39,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Decorative top rule */
        .credits-rule {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 24px 0;
          animation: fadeSlideIn 0.5s ease both;
        }
        .credits-rule-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9a227aa, transparent);
        }
        .credits-rule-diamond {
          color: #c9a227;
          font-size: 10px;
          animation: starPulse 2.5s ease-in-out infinite;
        }

        /* Subtitle */
        .credits-subtitle {
          font-family: 'Cinzel', serif;
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #c9a22788;
          text-align: center;
          padding: 8px 24px 14px;
          animation: fadeSlideIn 0.5s 0.1s ease both;
        }

        /* Scroll container */
        .credits-scroll-mask {
          overflow: hidden;
          height: 260px;
          position: relative;
          padding: 0 24px;
        }
        .credits-scroll-mask::before,
        .credits-scroll-mask::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 36px;
          z-index: 2;
          pointer-events: none;
        }
        .credits-scroll-mask::before {
          top: 0;
          background: linear-gradient(to bottom, #1a0e00, transparent);
        }
        .credits-scroll-mask::after {
          bottom: 0;
          background: linear-gradient(to top, #1a0e00, transparent);
        }

        .credits-scroll-inner {
          animation: scrollCredits 18s linear infinite;
        }
        .credits-scroll-inner:hover {
          animation-play-state: paused;
        }

        /* Category heading */
        .credits-cat {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: #c9a227;
          text-align: center;
          margin: 24px 0 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .credits-cat::before,
        .credits-cat::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9a22755, transparent);
        }

        /* Person name */
        .credits-name {
          text-align: center;
          font-size: 17px;
          font-weight: 600;
          color: #f5e6c0;
          margin: 5px 0;
          letter-spacing: 0.5px;
          transition: color 0.2s;
        }
        .credits-name:hover {
          color: #fff;
        }

        /* Gold shimmer on special thanks last item */
        .credits-name.shimmer {
          background: linear-gradient(90deg, #c9a227, #fff8dc, #e8b820, #fff8dc, #c9a227);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        /* Bottom ornament */
        .credits-ornament {
          text-align: center;
          padding: 12px 24px 18px;
          font-size: 18px;
          letter-spacing: 8px;
          color: #c9a22766;
          animation: fadeSlideIn 0.5s 0.4s ease both;
          user-select: none;
        }
      `}</style>

      <div className="credits-root">
        <div className="credits-rule">
          <div className="credits-rule-line" />
          <span className="credits-rule-diamond">◆</span>
          <div className="credits-rule-line" />
        </div>

        <div className="credits-subtitle">A production of our team</div>

        <div className="credits-scroll-mask">
          {/* Duplicate inner for seamless loop */}
          <div className="credits-scroll-inner">
            {[...CREDITS, ...CREDITS].map((section, si) => (
              <div key={si}>
                <div className="credits-cat">{section.category}</div>
                {section.people.map((name, ni) => (
                  <div
                    key={ni}
                    className={
                      "credits-name" +
                      (name.includes("✨") ? " shimmer" : "")
                    }
                  >
                    {name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="credits-ornament">· · ✦ · ·</div>
      </div>
    </ModalWrapper>
  )
}
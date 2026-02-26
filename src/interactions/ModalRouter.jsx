import ResumeModal from './modals/ResumeModal.jsx'
import ProjectsModal from './modals/ProjectsModal.jsx'
import SkillsModal from './modals/SkillsModal.jsx'
import AchievementsModal from './modals/AchievementsModal.jsx'
import ContactModal from './modals/ContactModal.jsx'
import WaterModal from './modals/WaterModal.jsx'
import CoffeeModal from './modals/CoffeeModal.jsx'
import KrishnaModal from './modals/KrishnaModal.jsx'
import TelescopeModal from './modals/TelescopeModal.jsx'
import CreditsModal from './modals/CreditsModal.jsx'

// Routes modal type → component
export default function ModalRouter({ activeModal, onClose }) {
  if (!activeModal) return null

  const props = { onClose }

  switch (activeModal.type) {
    case 'resume':       return <ResumeModal {...props} />
    case 'projects':     return <ProjectsModal {...props} />
    case 'skills':       return <SkillsModal {...props} />
    case 'achievements': return <AchievementsModal {...props} />
    case 'contact':      return <ContactModal {...props} />
    case 'bottle':      return <WaterModal {...props} />
    case 'coffee':      return <CoffeeModal {...props} />
    case 'krishna':      return <KrishnaModal {...props} />
    case 'telescope':      return <TelescopeModal {...props} />
    case 'miniboard':      return <CreditsModal {...props} />
    default:             return null
  }
}
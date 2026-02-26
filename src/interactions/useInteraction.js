import { useState, useCallback } from 'react'
import { getInteractable } from './interactables.js'

export function useInteraction() {
  const [activeModal, setActiveModal] = useState(null) // { type, label, icon }

  const handleClick = useCallback((meshName) => {
    const interactable = getInteractable(meshName)
    if (interactable) {
      setActiveModal(interactable)
    }
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  return { activeModal, handleClick, closeModal }
}
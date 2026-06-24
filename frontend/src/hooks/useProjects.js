import { useCallback } from 'react'
import useStore from '../store'

export function useProjects() {
  const { projects, activeProject, messages, addProject, setActiveProject, setActiveView } = useStore()

  const saveCurrentThread = useCallback((name) => {
    const project = {
      id:          Date.now(),
      name:        name || `Project ${projects.length + 1}`,
      messages:    messages,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
      messageCount: messages.length,
    }
    addProject(project)
    return project
  }, [messages, projects.length, addProject])

  const openProject = useCallback((project) => {
    setActiveProject(project)
    setActiveView('thread')
  }, [setActiveProject, setActiveView])

  return { projects, activeProject, saveCurrentThread, openProject }
}

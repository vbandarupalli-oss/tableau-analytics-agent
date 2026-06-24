import React from 'react'
import useStore from './store'
import SetupWizard  from './components/Setup/SetupWizard'
import TopNav       from './components/Layout/TopNav'
import SubNav       from './components/Layout/SubNav'
import Sidebar      from './components/Layout/Sidebar'
import HomeScreen   from './components/Home/HomeScreen'
import Thread       from './components/Thread/Thread'
import SettingsPanel from './components/Settings/SettingsPanel'

export default function App() {
  const { setupComplete, activeView } = useStore()

  if (!setupComplete) {
    return <SetupWizard />
  }

  function renderMain() {
    switch (activeView) {
      case 'home':
        return <HomeScreen />
      case 'thread':
      case 'explore':
        return <Thread />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg">
      <TopNav />
      <SubNav />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {renderMain()}
        </main>
      </div>
      <SettingsPanel />
    </div>
  )
}

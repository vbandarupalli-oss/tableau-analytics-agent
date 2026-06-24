import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(persist((set, get) => ({
  // Auth
  isAuthenticated: false,
  setupComplete:   false,
  user:            null,
  sessionId:       null,

  // UI
  activeView:    'home',
  activeProject: null,
  settingsOpen:  false,

  // Thread
  messages:       [],
  isTyping:       false,
  currentCards:   [],
  conversationId: null,

  // Projects
  projects: [],

  // Pulse
  pulseMetrics: [],
  pulseLoading: false,
  pulseError:   null,

  // Business context
  businessContext: null,

  // Actions — Auth
  setUser:          (user) => set({ user, isAuthenticated: true }),
  setSetupComplete: (v)    => set({ setupComplete: v }),
  setSessionId:     (id)   => set({ sessionId: id }),

  // Actions — UI
  setActiveView:   (view) => set({ activeView: view }),
  setSettingsOpen: (v)    => set({ settingsOpen: v }),
  setActiveProject:(p)    => set({ activeProject: p }),

  // Actions — Thread
  addMessage:         (msg)   => set(s => ({ messages: [...s.messages, msg] })),
  setTyping:          (v)     => set({ isTyping: v }),
  setCards:           (cards) => set({ currentCards: cards }),
  setConversationId:  (id)    => set({ conversationId: id }),
  clearThread:        ()      => set({ messages: [], currentCards: [], conversationId: null }),

  // Actions — Projects
  addProject: (p) => set(s => ({ projects: [...s.projects, p] })),

  // Actions — Pulse
  setPulseMetrics: (metrics) => set({ pulseMetrics: metrics }),
  setPulseLoading: (v)       => set({ pulseLoading: v }),
  setPulseError:   (e)       => set({ pulseError: e }),

  // Actions — Context
  setBusinessContext: (ctx) => set({ businessContext: ctx }),
}), { name: 'tableau-agent-store' }))

export default useStore

import { createContext, useContext, useState, useEffect } from 'react'
import { LogOut, X } from 'lucide-react'

const AuthContext = createContext(null)

export function GoogleIcon({ size = 18, className = '' }) {
  return (
    <img
      src="/google.svg"
      alt="Google"
      width={size}
      height={size}
      className={`inline-block shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('neon_google_user')
      if (!saved) return null
      const parsed = JSON.parse(saved)
      if (parsed?.sub?.startsWith('demo_')) {
        localStorage.removeItem('neon_google_user')
        return null
      }
      return parsed
    } catch {
      return null
    }
  })

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '555317198936-ges26301aoa401bh3odtord9ppltdqqe.apps.googleusercontent.com'

  // Dynamically load Google GSI Client Script
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script')
      script.id = 'google-gsi-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])

  // Listen for storage events across tabs (industry standard session sync)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'neon_google_user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null)
        } catch {
          setUser(null)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Save / clear user in localStorage
  const saveUser = (userData) => {
    setUser(userData)
    try {
      if (userData) {
        localStorage.setItem(
          'neon_google_user',
          JSON.stringify({
            ...userData,
            loginAt: Date.now(),
          })
        )
      } else {
        localStorage.removeItem('neon_google_user')
      }
    } catch (err) {
      console.error('LocalStorage write error:', err)
    }
  }

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Close confirmation modal on Escape key
  useEffect(() => {
    if (!showLogoutConfirm) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowLogoutConfirm(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showLogoutConfirm])

  // Pure Google OAuth Login Trigger - Opens Google's native popup
  const loginWithGoogle = () => {
    if (!googleClientId) {
      console.warn('Google Client ID missing. Please add VITE_GOOGLE_CLIENT_ID to .env')
      alert('Google Sign-in setup: Please paste your Google OAuth Client ID into .env (VITE_GOOGLE_CLIENT_ID=...) to activate real Google Login.')
      return
    }

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })
                const profile = await res.json()
                if (profile && profile.email) {
                  saveUser({
                    name: profile.name || profile.given_name || 'Festival Guest',
                    email: profile.email.toLowerCase(),
                    picture: profile.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.email}`,
                    sub: profile.sub,
                  })
                }
              } catch (fetchErr) {
                console.error('Google profile fetch error:', fetchErr)
              }
            }
          },
        })
        tokenClient.requestAccessToken()
      } catch (err) {
        console.error('Google OAuth init error:', err)
      }
    } else {
      console.warn('Google Identity Services script is still loading. Please try again in 1 second.')
    }
  }

  const performLogout = () => {
    saveUser(null)
    try {
      if (window.google?.accounts?.id?.disableAutoSelect) {
        window.google.accounts.id.disableAutoSelect()
      }
    } catch (e) {
      console.warn('Google logout cleanup warning:', e)
    }
  }

  const logout = () => {
    setShowLogoutConfirm(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && user.email),
        loginWithGoogle,
        logout,
        performLogout,
        setUser: saveUser,
        isConfigured: Boolean(googleClientId),
      }}
    >
      {children}

      {/* Global Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#0f0a1c] border border-white/20 p-6 text-center space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X button */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Warning Icon */}
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 grid place-items-center mx-auto">
              <LogOut size={22} />
            </div>

            {/* Modal Heading & Text */}
            <div>
              <h3 className="font-bold font-space text-lg text-white">Sign Out?</h3>
              <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                Are you sure you want to sign out? You will need to sign in with Google again to access your passes.
              </p>
              {user?.email && (
                <div className="mt-2.5 inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/80 truncate max-w-[260px]">
                  {user.email}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false)
                  performLogout()
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all cursor-pointer shadow-[0_0_20px_rgba(225,29,72,0.4)]"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

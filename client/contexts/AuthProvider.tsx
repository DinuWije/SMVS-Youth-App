import { useState } from 'react'
import { AuthenticatedUser } from '@/types/AuthTypes'
import AuthContext from './AuthContext'

const AuthProvider = ({ children }) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<AuthenticatedUser | null>(null)

  return (
    <AuthContext.Provider value={{ authenticatedUser, setAuthenticatedUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

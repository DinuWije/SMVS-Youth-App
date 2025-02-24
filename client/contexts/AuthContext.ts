import { createContext } from 'react'
import { AuthenticatedUser } from '../types/AuthTypes' // Import your type for `AuthenticatedUser`

type AuthContextType = {
  authenticatedUser: AuthenticatedUser | null // Allow null initially
  setAuthenticatedUser: (_authenticatedUser: AuthenticatedUser) => void
}

const AuthContext = createContext<AuthContextType>({
  authenticatedUser: null,
  setAuthenticatedUser: () => {},
})

export default AuthContext

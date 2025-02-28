// import {
//   FetchResult,
//   MutationFunctionOptions,
//   OperationVariables,
// } from "@apollo/client";
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants'
import { AuthenticatedUser } from '../types/AuthTypes'
import baseAPIClient from './BaseAPIClient'
import {
  getLocalStorageObj,
  getLocalStorageObjProperty,
  setLocalStorageObjProperty,
} from '../utils/LocalStorageUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'

const is_email_verified = async () => {
  const response = await baseAPIClient.get('/auth/check_email_verified')
  return response.status == 200
}

const login = async (
  email: string,
  password: string
): Promise<AuthenticatedUser> => {
  try {
    const { data } = await baseAPIClient.post(
      '/auth/login',
      { email, password },
      { withCredentials: true }
    )
    await AsyncStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(data))
    return data
  } catch (error) {
    throw error
  }
}

const loginWithGoogle = async (idToken: string): Promise<AuthenticatedUser> => {
  try {
    const { data } = await baseAPIClient.post(
      '/auth/login',
      { idToken },
      { withCredentials: true }
    )
    await AsyncStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(data))
    return data
  } catch (error) {
    return null
  }
}

const logout = async (): Promise<boolean> => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
  if (userObject == null) {
    console.log('Error getting user object')
    return false
  }

  const bearerToken = `Bearer ${userObject!['accessToken']}`
  const userId = userObject['id']
  try {
    await baseAPIClient.post(
      `/auth/logout/${userId}`,
      {},
      { headers: { Authorization: bearerToken } }
    )
    await AsyncStorage.removeItem(AUTHENTICATED_USER_KEY)
    return true
  } catch (error) {
    return false
  }
}

const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<AuthenticatedUser> => {
  try {
    const { data } = await baseAPIClient.post(
      '/auth/register',
      { firstName, lastName, email, password },
      { withCredentials: true }
    )
    // await AsyncStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(data))
    return data
  } catch (error) {
    throw error
  }
}

const resetPassword = async (email: string | undefined): Promise<boolean> => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
  if (userObject == null) {
    console.log('Error getting user object')
    return false
  }

  const bearerToken = `Bearer ${userObject['accessToken']}`
  try {
    await baseAPIClient.post(
      `/auth/resetPassword/${email}`,
      {},
      {
        headers: { Authorization: bearerToken },
      }
    )
    return true
  } catch (error) {
    return false
  }
}

// for testing only, refresh does not need to be exposed in the client
const refresh = async (): Promise<boolean> => {
  try {
    const { data } = await baseAPIClient.post(
      '/auth/refresh',
      {},
      { withCredentials: true }
    )
    await setLocalStorageObjProperty(
      AUTHENTICATED_USER_KEY,
      'accessToken',
      data.accessToken
    )
    return true
  } catch (error) {
    return false
  }
}

export default {
  login,
  logout,
  loginWithGoogle,
  register,
  resetPassword,
  refresh,
  is_email_verified,
}

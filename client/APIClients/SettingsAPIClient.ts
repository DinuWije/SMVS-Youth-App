import baseAPIClient from './BaseAPIClient'
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants'
import {
  getLocalStorageObj,
  getLocalStorageObjProperty,
} from '../utils/LocalStorageUtils'

export type SettingsUserInfoResponse = {
  id: string | number
  allowNotifs: boolean
  email: string
  firstName: string
  lastName: string
  location: string
  phoneNumber: string
  role: string
  interests: string[]
}

export type ProgressResponse = {
  content_type: string
  date: string
  id: string | number
  points_collected: number
  user_id: string | number
}

export type UpdateSettingsUserInfoRequest = {
  allowNotifs: boolean
  email: string
  firstName: string
  lastName: string
  location: string
  phoneNumber: string
  role: string
  interests: string[]
}

const get = async (): Promise<SettingsUserInfoResponse[] | null> => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
  if (userObject == null) {
    console.log('Error getting user object')
    return null
  }

  const bearerToken = `Bearer ${userObject!['accessToken']}`
  const userId = userObject['id']

  try {
    const { data } = await baseAPIClient.get(`/users?user_id=${userId}`, {
      headers: { Authorization: bearerToken },
    })
    return data
  } catch (error) {
    return null
  }
}

const getProgressData = async (): Promise<ProgressResponse[] | null> => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
  if (userObject == null) {
    console.log('Error getting user object')
    return null
  }

  const bearerToken = `Bearer ${userObject!['accessToken']}`
  const userId = userObject['id']

  try {
    const { data } = await baseAPIClient.get(
      `/users/get_points_by_date?user_id=${userId}`,
      {
        headers: { Authorization: bearerToken },
      }
    )
    return data
  } catch (error) {
    return null
  }
}

const update = async ({
  entityData,
}: {
  entityData: UpdateSettingsUserInfoRequest
}): Promise<SettingsUserInfoResponse | null> => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
  if (userObject == null) {
    console.log('Error getting user object')
    return null
  }

  const bearerToken = `Bearer ${userObject!['accessToken']}`
  const userId = userObject['id']

  try {
    const { data } = await baseAPIClient.put(`/users/${userId}`, entityData, {
      headers: { Authorization: bearerToken },
    })
    return data
  } catch (error) {
    return null
  }
}

export type UpdateProgressRequest = {
  user_id: string | number
  content_type: string // should be "meditation" "ariticle" or "feed"
  points_collected: number
}

/**
 * Updates the user's progress by adding an item to the progress table
 * @param progressData - The progress data to be added
 * @returns The created progress object or null if an error occurred
 */
const updateProgress = async (
  progressData: UpdateProgressRequest
): Promise<ProgressResponse | null> => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
  if (userObject == null) {
    console.log('Error getting user object')
    return null
  }

  const bearerToken = `Bearer ${userObject!['accessToken']}`

  try {
    console.log(progressData)
    const { data } = await baseAPIClient.post(
      '/users/update_progress',
      progressData,
      {
        headers: { Authorization: bearerToken },
      }
    )
    return data
  } catch (error) {
    console.error('Error updating progress:', error)
    return null
  }
}

const deleteAllProgress = async (): Promise<boolean> => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
  if (userObject == null) {
    console.log('Error getting user object')
    return false
  }

  const bearerToken = `Bearer ${userObject!['accessToken']}`
  const userId = userObject['id']

  try {
    const { status } = await baseAPIClient.delete(
      `/users/delete_progress?user_id=${userId}`,
      {
        headers: { Authorization: bearerToken },
      }
    )
    return status === 200
  } catch (error) {
    console.error('Error deleting progress data:', error)
    return false
  }
}

// Updated export to include the new function
export default { get, update, getProgressData, updateProgress, deleteAllProgress }

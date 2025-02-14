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
    console.log(bearerToken)
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

export default { get, update }

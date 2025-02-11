import baseAPIClient from './BaseAPIClient'
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants'
import { getLocalStorageObjProperty } from '../utils/LocalStorageUtils'

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

const get = async (
  userId: string | number
): Promise<SettingsUserInfoResponse[] | null> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    'accessToken'
  )}`
  try {
    const { data } = await baseAPIClient.get(`/users?user_id=${userId}`, {
      //   headers: { Authorization: bearerToken },
    })
    return data
  } catch (error) {
    return null
  }
}

const update = async (
  id: number | string,
  {
    entityData,
  }: {
    entityData: UpdateSettingsUserInfoRequest
  }
): Promise<SettingsUserInfoResponse | null> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    'accessToken'
  )}`
  try {
    const { data } = await baseAPIClient.put(`/users/${id}`, entityData, {
      //   headers: { Authorization: bearerToken },
    })
    return data
  } catch (error) {
    return null
  }
}

export default { get, update }

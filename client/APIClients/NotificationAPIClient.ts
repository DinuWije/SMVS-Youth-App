import baseAPIClient from './BaseAPIClient'
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants'
import { getLocalStorageObj } from '../utils/LocalStorageUtils'

export type SendEmailInfo = {
  subject: string
  body: string
  location?: string // Optional location field
}

const send_email = async ({
  entityData,
}: {
  entityData: SendEmailInfo
}): Promise<null> => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
  if (userObject == null) {
    console.log('Error getting user object')
    return null
  }

  const bearerToken = `Bearer ${userObject!['accessToken']}`

  try {
    const { data } = await baseAPIClient.post(
      `/users/send_email_notifs`, // Using the same endpoint
      entityData,  // Payload now supports location
      {
        headers: { Authorization: bearerToken },
      }
    )
    return data
  } catch (error) {
    return null
  }
}

export default { send_email }

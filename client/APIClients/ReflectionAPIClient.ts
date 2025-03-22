import baseAPIClient from './BaseAPIClient'
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants'
import { getLocalStorageObj } from '../utils/LocalStorageUtils'

export type Reflection = {
  id: number
  user_id: number  // Using snake_case to match backend
  reflectionType: 'gratitude' | 'stress' | 'goals' | 'meditation' | 'emotion'
  prompt: string
  userReflection: string
  aiResponse: string
  saved: boolean
  createdAt: string
  updatedAt: string
}

export type CreateReflectionRequest = {
  reflectionType: 'gratitude' | 'stress' | 'goals' | 'meditation' | 'emotion'
  prompt: string
  userReflection: string
  aiResponse?: string
  saved?: boolean
  user_id?: number // Added for direct passing
}

export type UpdateReflectionRequest = Partial<CreateReflectionRequest>

export type ReflectionPromptRequest = {
  reflection_type: 'gratitude' | 'stress' | 'goals' | 'meditation' | 'emotion'
  user_id?: number
}

export type AIResponseRequest = {
  reflection_id?: number
  user_reflection: string
  reflection_type: 'gratitude' | 'stress' | 'goals' | 'meditation' | 'emotion'
  user_id?: number
}

const getAuthHeaders = async () => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
  if (!userObject) {
    console.error('Error getting user object')
    return null
  }
  return {
    Authorization: `Bearer ${userObject['accessToken']}`,
  }
}

// Helper to get user ID from local storage
const getUserId = async (): Promise<number> => {
  try {
    const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
    return userObject?.id || 1  // Default to 1 if not found
  } catch (error) {
    console.error('Error getting user ID:', error)
    return 1  // Default user ID
  }
}

// **GET ALL REFLECTIONS**
const getAll = async (): Promise<Reflection[] | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const userId = await getUserId()
    const { data } = await baseAPIClient.get(`/reflections/?user_id=${userId}`, { headers })
    return data
  } catch (error) {
    console.error('Error fetching reflections:', error)
    return null
  }
}

// **GET RECENT REFLECTIONS**
const getRecent = async (limit: number = 5): Promise<Reflection[] | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const userId = await getUserId()
    const { data } = await baseAPIClient.get(`/reflections/recent?user_id=${userId}&limit=${limit}`, { headers })
    return data
  } catch (error) {
    console.error('Error fetching recent reflections:', error)
    return null
  }
}

// **GET SINGLE REFLECTION**
const getById = async (reflectionId: number): Promise<Reflection | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const userId = await getUserId()
    const { data } = await baseAPIClient.get(`/reflections/${reflectionId}?user_id=${userId}`, { headers })
    return data
  } catch (error) {
    console.error(`Error fetching reflection ${reflectionId}:`, error)
    return null
  }
}

// **CREATE REFLECTION**
const create = async (reflectionData: CreateReflectionRequest): Promise<Reflection | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    // Ensure user_id is included
    if (!reflectionData.user_id) {
      reflectionData.user_id = await getUserId()
    }

    // Convert to snake_case for the API
    const apiData = {
      reflection_type: reflectionData.reflectionType,
      prompt: reflectionData.prompt,
      user_reflection: reflectionData.userReflection,
      ai_response: reflectionData.aiResponse || "",
      saved: reflectionData.saved || false,
      user_id: reflectionData.user_id
    }

    const { data } = await baseAPIClient.post('/reflections/', apiData, { headers })
    return data
  } catch (error) {
    console.error('Error creating reflection:', error)
    return null
  }
}

// **UPDATE REFLECTION**
const update = async (
  reflectionId: number,
  reflectionData: UpdateReflectionRequest
): Promise<Reflection | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    // Ensure user_id is included
    if (!reflectionData.user_id) {
      reflectionData.user_id = await getUserId()
    }

    // Convert to snake_case for the API
    const apiData: any = {}
    if (reflectionData.reflectionType) apiData.reflection_type = reflectionData.reflectionType
    if (reflectionData.prompt) apiData.prompt = reflectionData.prompt
    if (reflectionData.userReflection) apiData.user_reflection = reflectionData.userReflection
    if (reflectionData.aiResponse) apiData.ai_response = reflectionData.aiResponse
    if (reflectionData.saved !== undefined) apiData.saved = reflectionData.saved
    apiData.user_id = reflectionData.user_id

    const { data } = await baseAPIClient.put(`/reflections/${reflectionId}`, apiData, { headers })
    return data
  } catch (error) {
    console.error(`Error updating reflection ${reflectionId}:`, error)
    return null
  }
}

// **DELETE REFLECTION**
const remove = async (reflectionId: number): Promise<boolean> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return false

    const userId = await getUserId()
    await baseAPIClient.delete(`/reflections/${reflectionId}?user_id=${userId}`, { headers })
    return true
  } catch (error) {
    console.error(`Error deleting reflection ${reflectionId}:`, error)
    return false
  }
}

// **SAVE REFLECTION**
const saveReflection = async (reflectionId: number): Promise<Reflection | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const userId = await getUserId()
    const { data } = await baseAPIClient.post(`/reflections/${reflectionId}/save`, { user_id: userId }, { headers })
    return data
  } catch (error) {
    console.error(`Error saving reflection ${reflectionId}:`, error)
    return null
  }
}

// **GET REFLECTION PROMPT**
const getPrompt = async (
  reflectionType: 'gratitude' | 'stress' | 'goals' | 'meditation' | 'emotion'
): Promise<string | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const userId = await getUserId()
    const { data } = await baseAPIClient.post(
      '/reflections/prompt',
      { 
        reflection_type: reflectionType,
        user_id: userId
      },
      { headers }
    )
    return data.prompt
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return getDefaultPrompt(reflectionType)
  }
}

// **GET AI RESPONSE**
const getAIResponse = async (
  request: AIResponseRequest
): Promise<string | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    // Ensure user_id is included
    if (!request.user_id) {
      request.user_id = await getUserId()
    }

    const { data } = await baseAPIClient.post(
      '/reflections/ai-response',
      {
        reflection_id: request.reflection_id,
        user_reflection: request.user_reflection,
        reflection_type: request.reflection_type,
        user_id: request.user_id
      },
      { headers }
    )
    return data.aiResponse
  } catch (error) {
    console.error('Error getting AI response:', error)
    return getMockResponse(request.reflection_type)
  }
}

// Default prompts for offline use
const getDefaultPrompt = (reflectionType: string): string => {
  const prompts: Record<string, string> = {
    gratitude: "What are three things you're grateful for today?",
    stress: "What's causing you the most stress right now?",
    goals: "What's one goal you're working toward currently?",
    meditation: "What insights arose during your recent meditation?",
    emotion: "What emotion has been most present for you today?"
  };
  
  return prompts[reflectionType] || prompts.gratitude;
};

// Mock responses for offline use or when API fails
const getMockResponse = (reflectionType: string): string => {
  const responses: Record<string, string> = {
    gratitude: "Practicing gratitude helps shift our focus to the positive aspects of life. It's wonderful that you're taking time to acknowledge what you're thankful for. How might carrying this gratitude forward affect your upcoming days?",
    stress: "It sounds like you've been dealing with some challenges. Remember that acknowledging stress is the first step in managing it. What's one small thing you could do today to create a moment of calm for yourself?",
    goals: "Setting meaningful goals gives us direction and purpose. Breaking them into smaller steps can make progress more visible and sustainable. What's one tiny action you could take today toward this goal?",
    meditation: "Your meditation practice is creating space for insight and awareness. Every session, even the challenging ones, contributes to your growth. What patterns are you beginning to notice through your practice?",
    emotion: "Emotions provide valuable information about our needs and values. By acknowledging them without judgment, we gain deeper self-understanding. How might this emotion be trying to guide you right now?"
  };
  
  return responses[reflectionType] || responses.gratitude;
};

export default {
  getAll,
  getRecent,
  getById,
  create,
  update,
  remove,
  saveReflection,
  getPrompt,
  getAIResponse
}

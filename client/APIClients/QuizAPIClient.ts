import baseAPIClient from './BaseAPIClient'
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants'
import { getLocalStorageObj } from '../utils/LocalStorageUtils'

export type Choice = {
  text: string
  isCorrect: boolean
}

export type Question = {
  text: string
  choices: Choice[]
}

export type Quiz = {
  id: number
  title: string
  articleId: number
  description?: string | null
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export type QuizCompletion = {
    id: number
    userId: number
    quizId: number
    articleId: number
    score: number
    completedAt: string
  }

export type CreateQuizRequest = {
  title: string
  articleId: number
  description?: string | null
  questions: Question[]
}

export type UpdateQuizRequest = Partial<CreateQuizRequest>

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

// **GET ALL QUIZZES**
const getAll = async (): Promise<Quiz[] | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const { data } = await baseAPIClient.get('/quizzes/', { headers })
    return data
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return null
  }
}

// **GET SINGLE QUIZ**
const getById = async (quizId: number): Promise<Quiz | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const { data } = await baseAPIClient.get(`/quizzes/${quizId}`, { headers })
    return data
  } catch (error) {
    console.error(`Error fetching quiz ${quizId}:`, error)
    return null
  }
}

// **GET QUIZ BY ARTICLE ID**
const getByArticleId = async (articleId: number): Promise<Quiz | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const { data } = await baseAPIClient.get(`/quizzes/article/${articleId}`, { headers })
    return data
  } catch (error) {
    console.error(`Error fetching quiz for article ${articleId}:`, error)
    return null
  }
}

// **CHECK IF QUIZ EXISTS FOR ARTICLE**
const checkQuizExists = async (articleId: number): Promise<boolean> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return false

    const response = await baseAPIClient.get(`/quizzes/article/${articleId}`, { 
      headers,
      validateStatus: (status) => status < 500 // Don't throw on 404
    })
    
    return response.status === 200
  } catch (error) {
    console.error(`Error checking quiz existence for article ${articleId}:`, error)
    return false
  }
}

// **CREATE QUIZ**
const create = async (quizData: CreateQuizRequest): Promise<Quiz | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const { data } = await baseAPIClient.post('/quizzes/', quizData, { headers })
    return data
  } catch (error) {
    console.error('Error creating quiz:', error)
    return null
  }
}

// **UPDATE QUIZ**
const update = async (
  quizId: number,
  quizData: UpdateQuizRequest
): Promise<Quiz | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const { data } = await baseAPIClient.put(`/quizzes/${quizId}`, quizData, { headers })
    return data
  } catch (error) {
    console.error(`Error updating quiz ${quizId}:`, error)
    return null
  }
}

// **DELETE QUIZ**
const remove = async (quizId: number): Promise<boolean> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return false

    await baseAPIClient.delete(`/quizzes/${quizId}`, { headers })
    return true
  } catch (error) {
    console.error(`Error deleting quiz ${quizId}:`, error)
    return false
  }
}

const recordCompletion = async (
    userId: number,
    quizId: number,
    articleId: number,
    score: number
  ): Promise<QuizCompletion | null> => {
    try {
      const headers = await getAuthHeaders()
      if (!headers) return null
  
      const { data } = await baseAPIClient.post('/quizzes/completions', {
        user_id: userId,
        quiz_id: quizId,
        article_id: articleId,
        score
      }, { headers })
      return data
    } catch (error) {
      console.error('Error recording quiz completion:', error)
      return null
    }
  }

  const checkCompletion = async (
    userId: number,
    articleId: number
  ): Promise<{ completed: boolean, completion: QuizCompletion | null }> => {
    try {
      const headers = await getAuthHeaders()
      if (!headers) return { completed: false, completion: null }
  
      const { data } = await baseAPIClient.get(`/quizzes/completions/check?user_id=${userId}&article_id=${articleId}`, { headers })
      return data
    } catch (error) {
      console.error('Error checking quiz completion:', error)
      return { completed: false, completion: null }
    }
  }
  
  // **GET USER QUIZ COMPLETIONS**
  const getUserCompletions = async (
    userId: number
  ): Promise<QuizCompletion[] | null> => {
    try {
      const headers = await getAuthHeaders()
      if (!headers) return null
  
      const { data } = await baseAPIClient.get(`/quizzes/completions/user/${userId}`, { headers })
      return data
    } catch (error) {
      console.error(`Error getting user quiz completions:`, error)
      return null
    }
  }

  const deleteCompletion = async (completionId: number): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return false;
  
      await baseAPIClient.delete(`/quizzes/completions/${completionId}`, { headers });
      return true;
    } catch (error) {
      console.error(`Error deleting quiz completion ${completionId}:`, error);
      return false;
    }
  };

  export default { 
    getAll, 
    getById, 
    getByArticleId, 
    checkQuizExists, 
    create, 
    update, 
    remove,
    recordCompletion,
    checkCompletion,
    getUserCompletions,
    deleteCompletion,
  }

import baseAPIClient from './BaseAPIClient'
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants'
import { getLocalStorageObj } from '../utils/LocalStorageUtils'

export type Article = {
  id: number
  title: string
  subtitle: string
  authorId: number
  centre?: string | null
  createdAt: string
  updatedAt: string
  likesCount: number
  commentsCount: number
  views_count: number
  coverImage: string
  contents: Content[]
}

export type Content = {
  id?: number
  contentType: 'text' | 'image'
  contentData: string
  position: number
}

export type CreateArticleRequest = {
  title: string
  subtitle: string
  authorId: number
  centre?: string | null
  coverImage?: string | null
  contents: Content[]
}

export type UpdateArticleRequest = Partial<CreateArticleRequest>

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

// **GET ALL ARTICLES**
const getAll = async (): Promise<Article[] | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const { data } = await baseAPIClient.get('/articles/', { headers })
    return data
  } catch (error) {
    console.error('Error fetching articles:', error)
    return null
  }
}

// **GET SINGLE ARTICLE**
const getById = async (articleId: number): Promise<Article | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const { data } = await baseAPIClient.get(`/articles/${articleId}`, { headers })
    return data
  } catch (error) {
    console.error(`Error fetching article ${articleId}:`, error)
    return null
  }
}

// **CREATE ARTICLE**
const create = async (articleData: CreateArticleRequest): Promise<Article | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const { data } = await baseAPIClient.post('/articles/', articleData, { headers })
    return data
  } catch (error) {
    console.error('Error creating article:', error)
    return null
  }
}

// **UPDATE ARTICLE**
const update = async (
  articleId: number,
  articleData: UpdateArticleRequest
): Promise<Article | null> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return null

    const { data } = await baseAPIClient.put(`/articles/${articleId}`, articleData, { headers })
    return data
  } catch (error) {
    console.error(`Error updating article ${articleId}:`, error)
    return null
  }
}

// **DELETE ARTICLE**
const remove = async (articleId: number): Promise<boolean> => {
  try {
    const headers = await getAuthHeaders()
    if (!headers) return false

    await baseAPIClient.delete(`/articles/${articleId}`, { headers })
    return true
  } catch (error) {
    console.error(`Error deleting article ${articleId}:`, error)
    return false
  }
}

export default { getAll, getById, create, update, remove }

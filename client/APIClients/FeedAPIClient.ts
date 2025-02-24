import baseAPIClient from './BaseAPIClient';
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants';
import { getLocalStorageObj } from '../utils/LocalStorageUtils';

export type CreateFeedRequest = {
  title: string;
  content: string;
  author_id: number;
  centre: string;
  likes_count: number;
  users_who_have_liked: string[];
  comments_count: number;
  views_count: number;
};

export type FeedResponse = {
  id: string | number;
  title: string;
  content: string;
  author_id: number;
  centre: string;
  likes_count: number;
  users_who_have_liked: string[];
  comments_count: number;
  views_count: number;
  created_at: string;
};

// ** Create a new feed post **
const create = async (feedData: CreateFeedRequest): Promise<FeedResponse | null> => {
  const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
  if (!userObject) {
    console.log('Error: User not authenticated.');
    return null;
  }

  const bearerToken = `Bearer ${userObject['accessToken']}`;
  try {
    const { data } = await baseAPIClient.post('/feeds', feedData, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    console.error('Error creating feed:', error);
    return null;
  }
};

// ** Fetch all feed posts with Authentication **
const getAll = async (): Promise<FeedResponse[] | null> => {
    const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
    if (!userObject || !userObject['accessToken']) {
      console.log('Error: User not authenticated.');
      return null;
    }
  
    const bearerToken = `Bearer ${userObject['accessToken']}`;
    
    try {
      const { data } = await baseAPIClient.get('/feeds', {
        headers: { Authorization: bearerToken },  // ✅ Now includes token
      });
      return data;
    } catch (error) {
      console.error('Error fetching feeds:', error);
      return null;
    }
  };
  
  // ** Fetch a single feed post by ID with Authentication **
  const getById = async (id: string): Promise<FeedResponse | null> => {
    const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
    if (!userObject || !userObject['accessToken']) {
      console.log('Error: User not authenticated.');
      return null;
    }
  
    const bearerToken = `Bearer ${userObject['accessToken']}`;
    
    try {
      const { data } = await baseAPIClient.get(`/feeds/${id}`, {
        headers: { Authorization: bearerToken },  // ✅ Now includes token
      });
      return data;
    } catch (error) {
      console.error(`Error fetching feed with ID ${id}:`, error);
      return null;
    }
  };
  
  
export default { create, getAll, getById };


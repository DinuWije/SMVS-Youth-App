import baseAPIClient from './BaseAPIClient';
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants';
import { getLocalStorageObj } from '../utils/LocalStorageUtils';

export type CreateFeedRequest = {
  title: string;
  content: string;
  authorId: number;
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
  authorId: number;
  centre: string;
  likes_count: number;
  users_who_have_liked: string[];
  comments_count: number;
  views_count: number;
  createdAt: string;
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

const getAll = async (): Promise<(FeedResponse & { author_name?: string })[] | null> => {
    const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
    if (!userObject || !userObject['accessToken']) {
      console.log('Error: User not authenticated.');
      return null;
    }
  
    const bearerToken = `Bearer ${userObject['accessToken']}`;
    
    try {
      // Fetch all feed posts
      const { data: posts } = await baseAPIClient.get('/feeds', {
        headers: { Authorization: bearerToken },
      });

      // Fetch all users (to resolve author_id to their name)
      const { data: users } = await baseAPIClient.get('/users', {
        headers: { Authorization: bearerToken },
      });

      // Create a mapping of userId -> firstName
      const userMap: Record<number, string> = {};
      users.forEach((user: { id: number; firstName: string }) => {
        userMap[user.id] = user.firstName;
      });

      // Attach author's first name to each post
      const postsWithAuthorNames = posts.map((post: FeedResponse) => ({
        ...post,
        author_name: userMap[post.authorId] || "Unknown",
      }));

      return postsWithAuthorNames;
    } catch (error) {
      console.error('Error fetching feeds:', error);
      return null;
    }
};

  
  const getById = async (id: string): Promise<FeedResponse & { author_name?: string } | null> => {
    const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
    if (!userObject || !userObject['accessToken']) {
      console.log('Error: User not authenticated.');
      return null;
    }
  
    const bearerToken = `Bearer ${userObject['accessToken']}`;
  
    try {
      // Fetch the post by ID
      const { data: postData } = await baseAPIClient.get(`/feeds/${id}`, {
        headers: { Authorization: bearerToken },
      });

      console.log("Fetched Post Data:", postData);

      if (!postData.authorId) {
        console.warn("Error: Author ID is missing in post data.");
        return {
          ...postData,
          created_at: postData.createdAt || "Missing Created At",
          author_name: "Unknown",
        };
      }

      // Fetch all users (since API doesn't return just one)
      const { data: allUsers } = await baseAPIClient.get(`/users`, {
        headers: { Authorization: bearerToken },
      });

      console.log("Fetched Author Data:", allUsers);

      // Find the user that matches the authorId
      const authorData = allUsers.find((user: any) => user.id === postData.authorId);

      return {
        ...postData,
        created_at: postData.createdAt || "Missing Created At",
        author_name: authorData?.firstName || "Unknown",
      };
    } catch (error) {
      console.error(`Error fetching feed with ID ${id}:`, error);
      return null;
    }
  };


  
export default { create, getAll, getById };


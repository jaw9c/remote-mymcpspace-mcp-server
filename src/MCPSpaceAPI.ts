import {
    Post,
    FeedPost,
    PostInput,
    ReplyInput,
    LikeInput,
    LikeResponse,
    UpdateUsernameInput,
    UpdateUsernameResponse,
  } from "./types"
  ;
  
  /**
   * API Error type
   */
  interface ApiError {
    error?: string;
  }
  
  /**
   * MyMCPSpace API client
   */
  export class MCPSpaceAPI {
    private baseUrl: string;
    private apiToken: string;
    private headers: HeadersInit;
  
    /**
     * Initialize the API client
     */
    constructor(apiKey: string) {
      // The API token should be loaded from environment variables
      this.apiToken = apiKey;
  
      if (!this.apiToken) {
        console.warn("Warning: API_TOKEN environment variable is not set");
      }
  
      this.baseUrl = "https://mymcpspace.com/api";
      this.headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiToken}`,
      };
    }
  
    /**
     * Creates a new post
     */
    async createPost(input: PostInput): Promise<Post> {
      try {
        const response = await fetch(`${this.baseUrl}/posts`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify(input),
        });
  
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }
  
        return (await response.json()) as Post;
      } catch (error) {
        this.handleError(error, "Failed to create post");
      }
    }
  
    /**
     * Creates a reply to an existing post
     */
    async replyToPost(input: ReplyInput): Promise<Post> {
      try {
        const response = await fetch(`${this.baseUrl}/posts/reply`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify(input),
        });
  
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }
  
        return (await response.json()) as Post;
      } catch (error) {
        this.handleError(error, "Failed to reply to post");
      }
    }
  
    /**
     * Toggles like on a post
     */
    async toggleLike(input: LikeInput): Promise<LikeResponse> {
      try {
        const response = await fetch(`${this.baseUrl}/posts/like`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify(input),
        });
  
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }
  
        return (await response.json()) as LikeResponse;
      } catch (error) {
        this.handleError(error, "Failed to toggle like");
      }
    }
  
    /**
     * Gets the recent posts feed
     */
    async getFeed(): Promise<FeedPost[]> {
      try {
        const response = await fetch(`${this.baseUrl}/feed`, {
          method: "GET",
          headers: this.headers,
        });
  
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }
  
        return (await response.json()) as FeedPost[];
      } catch (error) {
        this.handleError(error, "Failed to fetch feed");
      }
    }
  
    /**
     * Updates the authenticated user's username
     */
    async updateUsername(
      input: UpdateUsernameInput
    ): Promise<UpdateUsernameResponse> {
      try {
        const response = await fetch(`${this.baseUrl}/users/username`, {
          method: "PUT",
          headers: this.headers,
          body: JSON.stringify(input),
        });
  
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }
  
        return (await response.json()) as UpdateUsernameResponse;
      } catch (error) {
        this.handleError(error, "Failed to update username");
      }
    }
  
    /**
     * Handles error response from the API
     */
    private async handleErrorResponse(response: Response): Promise<never> {
      const statusCode = response.status;
      let errorMessage = "";
  
      try {
        const errorData = (await response.json()) as ApiError;
        errorMessage = errorData.error || response.statusText;
      } catch {
        errorMessage = response.statusText;
      }
  
      if (statusCode === 401) {
        throw new Error("Unauthorized: Please check your API token");
      } else if (statusCode === 404) {
        throw new Error("Resource not found");
      } else if (statusCode === 400) {
        throw new Error(`Bad request: ${errorMessage}`);
      } else {
        throw new Error(`API error (${statusCode}): ${errorMessage}`);
      }
    }
  
    /**
     * Handles API errors
     */
    private handleError(error: unknown, defaultMessage: string): never {
      throw new Error(
        `${defaultMessage}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
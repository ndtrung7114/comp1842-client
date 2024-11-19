import { defineStore } from "pinia";
import { useApi, useApiPrivate } from "../composables/useApi";
import { useCommentsStore } from "./comments";
import { useAuthStore } from "./auth";

export interface AuthorProfile {
    facebook?: string;
    avatar?: string;
}

export interface Author {
    _id: string;
    username: string;
    profile: AuthorProfile;
}
export interface Post {
    id: string,
    title: string,
    body: string,
    username: string,
    authorId: string,
    author?: Author,
    createdAt: string,
    updatedAt: string,
    commentsCount?: number,
    imageUrls?: string[],
    likes?: number,
    likedBy?: string[],
}

export interface State {
    posts: Post[],
    currentPost: Post | null,
    loading: boolean,
    error: string | null,
}

export const usePostsStore = defineStore('posts', {
    state: (): State => ({
        posts: [],
        currentPost: null,
        loading: false,
        error: null,
    }),

    getters: {
        allPosts: (state: State) => state.posts,
        isLoading: (state: State) => state.loading,
        getError: (state: State) => state.error,
    },

    actions: {
        async getAllPost() {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await useApi().get('/api/post/');
                const userId = useAuthStore().userDetail.user.id;

                // Map the fetched posts to match the expected structure
                this.posts = await Promise.all(data.posts.map(async (post: any) => {
                    // Fetch the count of comments for each post
                    const commentsResponse = await useApi().get(`/api/comment/${post._id}`);
                    const commentsCount = commentsResponse.data.comments.length;

                    return {
                        id: post._id,
                        title: post.title,
                        body: post.body,
                        username: post.author.username,
                        authorId: post.author._id,
                        author: {
                            _id: post.author._id,
                            username: post.author.username,
                            profile: {
                                avatar: post.author.profile?.avatar || '',
                                facebook: post.author.profile?.facebook || ''
                            }
                        },
                        createdAt: post.createdAt,
                        updatedAt: post.updatedAt,
                        commentsCount,
                        imageUrls: post.imageUrls,
                        likes: post.likes,
                        likedBy: post.likedBy,
                    };
                }));
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to fetch posts";
                console.error(this.error); // Log the error
            } finally {
                this.loading = false;
            }
        },

        async getPostById(postId: string): Promise<Post | null> {
            this.loading = true;
            this.error = null;
        
            try {
                const { data } = await useApi().get(`/api/post/${postId}`);
                console.log('Fetched post detail:', data);
        
                if (!data.post) {
                    throw new Error("Post not found");
                }
        
                // Set up the post structure
                this.currentPost = {
                    id: data.post._id,
                    title: data.post.title,
                    body: data.post.body,
                    username: data.post.author.username,
                    authorId: data.post.author._id,
                    createdAt: data.post.createdAt,
                    updatedAt: data.post.updatedAt,
                    imageUrls: data.post.imageUrls,
                    likes: data.post.likes,
                    likedBy: data.post.likedBy,
                };
        
                return this.currentPost;
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to fetch post";
                console.error(this.error);
                return null;  // Explicitly return null if there's an error
            } finally {
                this.loading = false;
            }
        },

        async createPost(formData: FormData) {  // Accept FormData
            this.loading = true;
            this.error = null;
      
            try {
              const { data } = await useApiPrivate().post('/api/post/create', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',  // Set appropriate headers
                },
              });
      
              // Assuming the response includes the created post object
              this.posts.push({
                id: data.post._id,
                title: data.post.title,
                body: data.post.body,
                username: data.post.author.username,
                authorId: data.post.author._id,
                createdAt: data.post.createdAt,
                updatedAt: data.post.updatedAt,
                imageUrls: data.post.imageUrls, 
              });
            } catch (error: any) {
              this.error = error.response?.data?.message || "Failed to create post";
            } finally {
              this.loading = false;
            }
          },

        async updatePost(postId: string, postData: FormData) {
            this.loading = true;
            this.error = null;

            try {
                const { data } = await useApiPrivate().put(`/api/post/${postId}`, postData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',  // Set appropriate headers
                    },
                }

                );
                console.log('Post updated successfully:', data); // Log the response data
                const index = this.posts.findIndex(post => post.id === postId);
                if (index !== -1) {
                    this.posts[index] = data;
                }
                return data;
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to update post";
            } finally {
                this.loading = false;
            }
        },
        async deletePost(postId: string) {
            this.loading = true;
            this.error = null;

            try {
                await useApiPrivate().delete(`/api/post/${postId}`);
                this.posts = this.posts.filter(post => post.id !== postId);
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to delete post";
            } finally {
                this.loading = false;
            }
        },

        async likePost(postId: string) {
            this.loading = true;
            this.error = null;

            try {
                const { data } = await useApiPrivate().post(`/api/post/${postId}/like`);
                const index = this.posts.findIndex(post => post.id === postId);
                if (index !== -1) {
                    this.posts[index].likes = data.post.likes;
                    this.posts[index].likedBy = data.post.likedBy;
                }
                return data;
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to like post";
            } finally {
                this.loading = false;
            }
        },
        async unlikePost(postId: string) {
            this.loading = true;
            this.error = null;

            try {
                const { data } = await useApiPrivate().post(`/api/post/${postId}/unlike`);
                const index = this.posts.findIndex(post => post.id === postId);
                if (index !== -1) {
                    this.posts[index].likes = data.post.likes;
                    this.posts[index].likedBy = data.post.likedBy;
                }
                return data;
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to unlike post";
            } finally {
                this.loading = false;
            }
        }
    }


})
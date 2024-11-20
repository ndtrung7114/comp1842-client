// src/store/commentsStore.ts

import { defineStore } from "pinia";
import { useApi, useApiPrivate } from "../composables/useApi";

export interface Comment {
    id: string;
    postId: string;  // Reference to the associated post
    userId: string;  // User who made the comment
    username?: string;
    content: string;
    likeCount?: number;
    createdAt: string;
    updatedAt: string;
    avatar?: string;
}

export interface State {
    comments: Comment[];
    loading: boolean;
    error: string | null;
}

export const useCommentsStore = defineStore('comments', {
    state: (): State => ({
        comments: [],
        loading: false,
        error: null,
    }),

    getters: {
        allComments: (state: State) => state.comments,
        isLoading: (state: State) => state.loading,
        getError: (state: State) => state.error,
    },

    actions: {
        async getCommentsByPostId(postId: string) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await useApi().get(`/api/comment/${postId}`);
                console.log('Fetched comments:', data); // Log the fetched data
                this.comments =  data.comments.map((comment: any) => ({
                    id: comment._id,
                    postId: comment.post,
                    userId: comment.user._id,
                    username: comment.user.username,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    avatar: comment.user.profile.avatar,
                }));
               
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to fetch comments";
                console.error(this.error);
                return [];
            } finally {
                this.loading = false;
            }
        },

        async createComment(postId: string, content: string) {
            this.loading = true;
            this.error = null;
        
            try {
                const { data } = await useApiPrivate().post('/api/comment/create', { postId, content });
                this.comments.push({
                    id: data.comment._id,
                    postId: data.comment.post,
                    userId: data.comment.user, // Assuming this is provided by the API
                    content: data.comment.content,
                    createdAt: data.comment.createdAt,
                    updatedAt: data.comment.updatedAt,
                });
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to create comment";
                console.error(this.error);
            } finally {
                this.loading = false;
            }
        },

        async updateComment(commentId: string, content: string) {
            this.loading = true;
            this.error = null;

            try {
                const { data } = await useApiPrivate().put(`/api/comment/${commentId}`, { content });
                const index = this.comments.findIndex(comment => comment.id === commentId);
                if (index !== -1) {
                    this.comments[index] = {
                        ...this.comments[index],
                        content: data.content,
                        updatedAt: data.updatedAt,
                    };
                }
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to update comment";
                console.error(this.error);
            } finally {
                this.loading = false;
            }
        },

        async deleteComment(commentId: string) {
            this.loading = true;
            this.error = null;

            try {
                await useApiPrivate().delete(`/api/comment/${commentId}`);
                this.comments = this.comments.filter(comment => comment.id !== commentId);
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to delete comment";
                console.error(this.error);
            } finally {
                this.loading = false;
            }
        },
    },
});

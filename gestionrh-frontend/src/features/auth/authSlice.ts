import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import type { LoginRequest, User } from './types';
import { axiosClient } from '@/api/axiosClient';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null, // On ne charge plus rien du localStorage
    isAuthenticated: false,
    isLoading: true, // On commence à true pour attendre le checkAuth
    error: null,
};

// Async Thunk for Login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.login(credentials);
            return {
                email: response.email,
                nomComplet: response.nomComplet,
                roles: response.roles,
                token: '', // Token is in cookie now
            } as User;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Échec de la connexion');
        }
    }
);

// Check Auth Logic (Session Persistence)
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosClient.get('/auth/me');
        return {
            email: response.data.email,
            nomComplet: response.data.nomComplet,
            roles: response.data.roles,
            token: '',
        } as User;
    } catch (err) {
        return rejectWithValue('Session expirée');
    }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await authApi.logout();
});


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

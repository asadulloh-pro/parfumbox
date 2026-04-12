import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'parfumbox_admin_token';

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

type AuthState = {
  accessToken: string | null;
};

const initialState: AuthState = {
  accessToken: readStoredToken(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string }>) {
      state.accessToken = action.payload.accessToken;
      try {
        localStorage.setItem(STORAGE_KEY, action.payload.accessToken);
      } catch {
        /* ignore */
      }
    },
    logout(state) {
      state.accessToken = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

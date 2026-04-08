import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const TOKEN_KEY = 'parfumbox_token';

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

type SessionState = {
  token: string | null;
};

const initialState: SessionState = {
  token: readToken(),
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      try {
        if (action.payload) {
          localStorage.setItem(TOKEN_KEY, action.payload);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        /* ignore */
      }
    },
  },
});

export const { setToken } = sessionSlice.actions;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const KEY = 'parfumbox_admin_token';

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

type State = { token: string | null };

const initialState: State = { token: read() };

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      try {
        if (action.payload) {
          localStorage.setItem(KEY, action.payload);
        } else {
          localStorage.removeItem(KEY);
        }
      } catch {
        /* ignore */
      }
    },
  },
});

export const { setToken } = sessionSlice.actions;

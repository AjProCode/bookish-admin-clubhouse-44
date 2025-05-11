
import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not defined. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Create a mock Supabase client that logs actions instead of performing them
const createMockClient = () => {
  const mockFn = () => ({
    select: mockFn,
    eq: mockFn,
    single: mockFn,
    insert: mockFn,
    update: mockFn,
    delete: mockFn,
    then: (callback: Function) => Promise.resolve(callback({ data: null, error: { message: 'Supabase not configured' } })),
  });

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ subscription: { unsubscribe: () => {} } }),
    },
    from: () => mockFn(),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    functions: {
      invoke: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    },
  };
};

// Initialize Supabase client or use mock if not configured
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

export const supabaseEnv = {
  // PUBLIC_INTERFACE
  /**
   * Returns the Supabase environment configuration.
   * Reads REACT_APP_* variables that must be provided at build/runtime.
   */
  getConfig() {
    return {
      url: process.env.REACT_APP_SUPABASE_URL || '',
      key: process.env.REACT_APP_SUPABASE_KEY || '',
    };
  },
};

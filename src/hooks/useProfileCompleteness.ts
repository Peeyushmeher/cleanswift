// Re-export from context for backwards compatibility
// The actual implementation now lives in ProfileCompletenessContext
// to ensure all components share the same state
export { useProfileCompleteness } from '../contexts/ProfileCompletenessContext';

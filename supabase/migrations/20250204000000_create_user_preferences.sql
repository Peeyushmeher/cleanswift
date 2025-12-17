-- ============================================================================
-- Create USER_PREFERENCES table
-- ============================================================================
-- This table stores user app preferences following the same pattern as notification_settings

CREATE TABLE user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    language text NOT NULL DEFAULT 'en',
    units text NOT NULL DEFAULT 'imperial' CHECK (units IN ('imperial', 'metric')),
    default_tip_percentage numeric(5,2) NOT NULL DEFAULT 15.00 CHECK (default_tip_percentage >= 0 AND default_tip_percentage <= 100),
    auto_select_favorite_detailer boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies - Users can manage their own preferences
-- ============================================================================
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Updated_at Trigger
-- ============================================================================
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


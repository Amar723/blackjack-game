-- Supabase Database Schema for Blackjack Game
-- Run these commands in your Supabase SQL editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  chips INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS GAMES (
  ID UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  USER_ID UUID REFERENCES USERS(ID) ON DELETE CASCADE,
  BET_AMOUNT INTEGER NOT NULL,
  PLAYER_HAND INTEGER[] NOT NULL,
  DEALER_HAND INTEGER[] NOT NULL,
  RESULT TEXT CHECK (RESULT IN ('win', 'lose', 'push')) NOT NULL,
  WINNINGS INTEGER NOT NULL,
  CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);

CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW level security;

ALTER TABLE games ENABLE ROW level security;

-- Create RLS policies for users table
CREATE POLICY "Users can view own data" ON USERS
  FOR SELECT USING (AUTH.UID() = ID);

CREATE POLICY "Users can update own data" ON USERS
  FOR UPDATE USING (AUTH.UID() = ID);

CREATE POLICY "Users can insert own data" ON USERS
  FOR INSERT WITH CHECK (AUTH.UID() = ID);

-- Create RLS policies for games table
CREATE POLICY "Users can view own games" ON GAMES
  FOR SELECT USING (AUTH.UID() = USER_ID);

CREATE POLICY "Users can insert own games" ON GAMES
  FOR INSERT WITH CHECK (AUTH.UID() = USER_ID);

-- Create function to automatically create user record on signup
CREATE OR REPLACE FUNCTION PUBLIC.HANDLE_NEW_USER(
) RETURNS TRIGGER AS
  $$     BEGIN INSERT INTO PUBLIC.USERS (
    ID,
    EMAIL,
    CHIPS
  ) VALUES (
    NEW.ID,
    NEW.EMAIL,
    500
  );
  return NEW;
END;
$$     LANGUAGE PLPGSQL SECURITY DEFINER;
 
-- Create trigger to automatically create user record
create OR REPLACE TRIGGER ON_AUTH_USER_CREATED AFTER INSERT ON AUTH.USERS FOR EACH ROW EXECUTE FUNCTION PUBLIC.HANDLE_NEW_USER(
);
 
-- Create function to update updated_at timestamp
create OR REPLACE

FUNCTION PUBLIC.UPDATE_UPDATED_AT_COLUMN(
) RETURNS TRIGGER AS
  $$     BEGIN NEW.UPDATED_AT = NOW();
  return NEW;
END;
$$     LANGUAGE PLPGSQL;
 
-- Create trigger to update updated_at on users table
create OR REPLACE TRIGGER UPDATE_USERS_UPDATED_AT BEFORE UPDATE ON USERS FOR EACH ROW EXECUTE

FUNCTION PUBLIC.UPDATE_UPDATED_AT_COLUMN(
);
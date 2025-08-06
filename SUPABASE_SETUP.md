# Supabase Authentication with Spotify OAuth Setup

This guide will help you set up Supabase authentication with Spotify OAuth in your React Native Expo app.

## Prerequisites

- Supabase account and project
- Spotify Developer account
- Expo CLI installed
- React Native development environment

## 1. Supabase Project Setup

### Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

### Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Enable **Email confirmations** if needed
3. Configure **Site URL** to your app's URL scheme: `songspot://`

### Set up Spotify OAuth Provider

1. Go to **Authentication > Providers**
2. Find **Spotify** and enable it
3. You'll need to configure this after setting up Spotify app

## 2. Spotify App Setup

### Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note down your **Client ID** and **Client Secret**

### Configure Redirect URIs

Add these redirect URIs to your Spotify app:

- Development: `songspot://auth/callback`
- Production: `songspot://auth/callback`

## 3. Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Spotify Configuration
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# API Configuration
EXPO_PUBLIC_SERVICE_URL=your_api_service_url
EXPO_PUBLIC_AI_API_URL=your_ai_api_url
AI_API_KEY=your_ai_api_key
```

## 4. Supabase Database Schema

Create the following tables in your Supabase database:

### Users Table (extends Supabase auth.users)

```sql
-- Create a custom users table that extends auth.users
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  spotify_id TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, spotify_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'spotify_id',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Chat Sessions Table

```sql
CREATE TABLE public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions
  FOR DELETE USING (auth.uid() = user_id);
```

### Chat Messages Table

```sql
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 5. App Configuration

### URL Schemes

The app is configured with the `songspot` URL scheme for OAuth redirects. This is already set up in `app.json`.

### Deep Linking

The app handles deep links for OAuth callbacks. The configuration is in:

- `app.json` - URL scheme configuration
- `src/contexts/AuthContext.tsx` - OAuth flow handling

## 6. Testing

### Development Testing

1. Run `expo start` to start the development server
2. Use Expo Go app or simulator to test
3. Test OAuth flow on both iOS and Android

### Production Testing

1. Build the app with `eas build`
2. Test on physical devices
3. Verify OAuth redirects work correctly

## 7. Troubleshooting

### Common Issues

#### OAuth Redirect Issues

- Ensure URL schemes are correctly configured in `app.json`
- Check that redirect URIs match in Spotify app settings
- Verify Supabase site URL configuration

#### Token Storage Issues

- Check that `expo-secure-store` is properly configured
- Verify environment variables are set correctly
- Check device-specific storage limitations

#### Authentication State Issues

- Ensure Supabase client is properly initialized
- Check auth state listener is working
- Verify session persistence

### Debug Steps

1. Check console logs for authentication errors
2. Verify environment variables are loaded
3. Test OAuth flow step by step
4. Check Supabase dashboard for user creation

## 8. Security Considerations

### Token Security

- Spotify tokens are stored securely using `expo-secure-store`
- Supabase session is handled by the Supabase client
- Tokens are automatically refreshed when needed

### Data Protection

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Sensitive data is encrypted at rest

### Best Practices

- Never log sensitive tokens
- Use environment variables for secrets
- Regularly rotate API keys
- Monitor authentication events

## 9. Production Deployment

### Environment Setup

1. Set up production environment variables
2. Configure production Supabase project
3. Update Spotify app redirect URIs
4. Test OAuth flow in production

### Monitoring

1. Set up Supabase analytics
2. Monitor authentication events
3. Track OAuth success/failure rates
4. Monitor token refresh patterns

## 10. Additional Features

### Token Refresh

The app automatically handles Spotify token refresh when needed.

### Session Persistence

User sessions persist across app restarts using Supabase's built-in session management.

### Error Handling

Comprehensive error handling for all authentication scenarios.

### Loading States

Proper loading states during authentication processes.

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Supabase and Spotify documentation
3. Check console logs for detailed error messages
4. Verify all configuration steps are completed

create type user_role as enum ('admin', 'user');

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role user_role default 'user',
  phone_number text,
  bio text,
  profile_picture text,
  date_of_birth date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create events table
create table events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  location text,
  max_participants integer,
  status text check (status in ('draft', 'published','live', 'completed', 'cancelled')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event_participants table
create table event_participants (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  registration_date timestamp with time zone default timezone('utc'::text, now()) not null,
  attendance_status boolean default false,
  certificate_generated boolean default false,
  certificate_url text,
  unique(event_id, user_id)
);

-- Create certificates table
create table certificates (
  id uuid default uuid_generate_v4() primary key,
  participant_id uuid references event_participants(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  certificate_url text not null
);

-- Create question bank for quizes
create table questionBank(
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade,
  questionsNo integer,
  timeTocomplete integer not null default 60, -- default 60 seconds
  questions text not null,
  correct_option text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
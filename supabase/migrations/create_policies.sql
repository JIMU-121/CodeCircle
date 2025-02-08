-- -- Profiles policies
-- create policy "Users can view their own profile"
--   on profiles for select
--   using (auth.uid() = id);

-- create policy "Admin can view all profiles"
--   on profiles for select
--   using (
--     exists (
--       select 1 from profiles
--       where id = auth.uid()
--       and role = 'admin'
--     )
--   );

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (role = 'user');

create policy "Admin can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Events policies
create policy "Anyone can view published events"
  on events for select
  using (status = 'published');

create policy "Admin can view all events"
  on events for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admin can create events"
  on events for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admin can update events"
  on events for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Event participants policies
create policy "Users can view their own participations"
  on event_participants for select
  using (user_id = auth.uid());

create policy "Admin can view all participations"
  on event_participants for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Users can register for events"
  on event_participants for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from events
      where id = event_id
      and status = 'published'
    )
  );

-- Certificates policies
create policy "Users can view their own certificates"
  on certificates for select
  using (
    exists (
      select 1 from event_participants
      where certificates.participant_id = event_participants.id
      and event_participants.user_id = auth.uid()
    )
  );

create policy "Admin can manage certificates"
  on certificates for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Drop existing policies
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Admin can view all profiles" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Admin can update any profile" on profiles;

drop policy if exists "Anyone can view published events" on events;
drop policy if exists "Admin can view all events" on events;
drop policy if exists "Admin can create events" on events;
drop policy if exists "Admin can update events" on events;

-- Create new policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Admin can view all profiles"
  on profiles for select
  using (auth.uid() = id and role = 'admin');

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can see live events"
  on events for select
  using (status = 'live');
  
create policy "Admin can update any profile"
  on profiles for update
  using (auth.uid() = id and role = 'admin');

create policy "Anyone can view published events"
  on events for select
  using (status = 'published');

create policy "Admin can view all events"
  on events for select
  using (auth.uid() = id and role = 'admin');

create policy "Admin can create events"
  on events for insert
  with check (auth.uid() = id and role = 'admin');

create policy "Admin can update events"
  on events for update
  using (auth.uid() = id and role = 'admin');

-- Policies for Event Questions

-- Allow admins to insert questions
CREATE POLICY "Admin can create events questions"
  ON questionBank
  FOR INSERT
  WITH CHECK (auth.uid() = id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Allow admins to select questions
CREATE POLICY "Admin can view the event questions"
  ON questionBank
  FOR SELECT
  USING (auth.uid() = id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Allow admins to delete questions
CREATE POLICY "Admin can delete events questions"
  ON questionBank
  FOR DELETE
  USING (auth.uid() = id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
-- Function to register user for an event
create or replace function register_for_event(
  p_event_id uuid,
  p_user_id uuid
) returns event_participants as $$
declare
  v_result event_participants;
begin
  -- Check if event exists and is published
  if not exists (
    select 1 from events
    where id = p_event_id
    and status = 'published'
  ) then
    raise exception 'Event not found or not published';
  end if;

  -- Check if event is full
  if exists (
    select 1 from events e
    where e.id = p_event_id
    and e.max_participants <= (
      select count(*) from event_participants
      where event_id = p_event_id
    )
  ) then
    raise exception 'Event is full';
  end if;

  -- Register user
  insert into event_participants (event_id, user_id)
  values (p_event_id, p_user_id)
  returning * into v_result;

  return v_result;
end;
$$ language plpgsql security definer;

-- Function to generate certificate
create or replace function generate_certificate(
  p_participant_id uuid
) returns certificates as $$
declare
  v_result certificates;
begin
  -- Check if participant exists and attended
  if not exists (
    select 1 from event_participants
    where id = p_participant_id
    and attendance_status = true
  ) then
    raise exception 'Participant not found or did not attend';
  end if;

  -- Generate certificate (you'll need to implement the actual certificate generation logic)
  insert into certificates (
    participant_id,
    event_id,
    certificate_url
  )
  select
    ep.id,
    ep.event_id,
    'https://your-certificate-url.com/' || ep.id -- Replace with actual certificate generation
  from event_participants ep
  where ep.id = p_participant_id
  returning * into v_result;

  -- Update participant record
  update event_participants
  set certificate_generated = true,
    certificate_url = v_result.certificate_url
  where id = p_participant_id;

  return v_result;
end;
$$ language plpgsql security definer;

-- Drop existing policies if they exist
drop policy if exists "Users can upload profile pictures" on storage.objects;
drop policy if exists "Users can delete their own profile pictures" on storage.objects;

-- Create policy to allow users to upload their profile pictures
create policy "Users can upload profile pictures"
  on storage.objects
  for insert
  using (auth.uid() = user_id); -- Assuming you have a user_id column in your storage metadata

-- Create policy to allow users to delete their own profile pictures
create policy "Users can delete their own profile pictures"
  on storage.objects
  for delete
  using (auth.uid() = user_id); -- Assuming you have a user_id column in your storage metadata 
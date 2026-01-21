-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the table for storing encrypted memories
create table if not exists encrypted_memories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, 
  encrypted_embedding vector(384),
  metadata_blob jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table encrypted_memories enable row level security;

-- Create a policy to allow anonymous access (since we handle security via client-side encryption + local user ID)
-- This allows anyone with the ANON key to Insert, Select, Update, Delete.
-- In a production app with Supabase Auth, you would use "auth.uid() = user_id".
-- Here, we rely on the privacy filter and rotation encryption for security.
create policy "Allow public access to encrypted memories"
on encrypted_memories
for all
using (true)
with check (true);


-- Create a search function that works with the encrypted vectors (since we use rotation, L2 distance is preserved)
create or replace function match_memories (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  p_user_id text
)
returns table (
  id uuid,
  metadata_blob jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    encrypted_memories.id,
    encrypted_memories.metadata_blob,
    1 - (encrypted_memories.encrypted_embedding <=> query_embedding) as similarity
  from encrypted_memories
  where encrypted_memories.user_id = p_user_id
  and 1 - (encrypted_memories.encrypted_embedding <=> query_embedding) > match_threshold
  order by encrypted_memories.encrypted_embedding <=> query_embedding
  limit match_count;
end;
$$;

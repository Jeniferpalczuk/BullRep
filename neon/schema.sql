create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  weight double precision,
  height double precision,
  goal text,
  fitness_level text,
  frequency text,
  app_level integer not null default 1,
  xp integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscle_group text not null,
  equipment text,
  level text,
  gif_url text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  workout_id uuid,
  date date not null default current_date,
  training_type text not null default 'Livre',
  notes text,
  duration_min integer,
  created_at timestamptz not null default now()
);

create table if not exists training_session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete set null,
  name text not null,
  sets_done integer not null default 0,
  reps_done integer not null default 0,
  weight double precision not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_training_sessions_user_date
  on training_sessions(user_id, date desc);

create index if not exists idx_training_session_exercises_session
  on training_session_exercises(session_id, order_index asc);

create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_updated_at on users;
create trigger users_updated_at
before update on users
for each row
execute function handle_updated_at();

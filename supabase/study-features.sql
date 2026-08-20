-- ============================================================
-- ESB — Étude Analytics & Recommandations
-- Tables minimales, optimisées pour le free tier Supabase
-- Run in: Supabase SQL Editor
-- ============================================================

-- 1. reading_history — tracke les vues/lectures par utilisateur
create table if not exists public.reading_history (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  document_id uuid references public.documents(id) on delete cascade not null,
  viewed_at   timestamptz default now(),
  action      text default 'view'           -- 'view' | 'download'
);

create index if not exists reading_history_user_idx on public.reading_history(user_id, viewed_at desc);
create index if not exists reading_history_doc_idx on public.reading_history(document_id);

-- 2. study_sessions — sessions Pomodoro / focus
create table if not exists public.study_sessions (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  duration_minutes numeric not null,
  started_at      timestamptz default now(),
  module_name     text
);

create index if not exists study_sessions_user_idx on public.study_sessions(user_id, started_at desc);

-- 3. user_progress — agrégats légers (last docs, compteurs)
create table if not exists public.user_progress (
  user_id             uuid references auth.users(id) on delete cascade primary key,
  last_opened_doc_ids uuid[] default '{}',
  last_opened_at      timestamptz,
  total_views         integer default 0,
  total_downloads     integer default 0,
  total_study_minutes integer default 0,
  updated_at          timestamptz default now()
);

-- RLS : chaque utilisateur ne voit que ses données
alter table public.reading_history enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_progress enable row level security;

create policy "Users view own reading history"
  on public.reading_history for select using (auth.uid() = user_id);
create policy "Users insert own reading history"
  on public.reading_history for insert with check (auth.uid() = user_id);

create policy "Users view own study sessions"
  on public.study_sessions for select using (auth.uid() = user_id);
create policy "Users insert own study sessions"
  on public.study_sessions for insert with check (auth.uid() = user_id);

create policy "Users view own progress"
  on public.user_progress for select using (auth.uid() = user_id);
create policy "Users upsert own progress"
  on public.user_progress for upsert with check (auth.uid() = user_id)
  using (auth.uid() = user_id);

-- ============================================================
-- Logique simplifiée et SÛRE : on ne fait qu'insérer dans history
-- et les compteurs sont calculés à la volée (jointures légères).
-- ============================================================

-- Log a document view
create or replace function public.log_document_view(p_document_id uuid)
returns void
security definer set search_path = public
language plpgsql as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.reading_history (user_id, document_id, action)
  values (auth.uid(), p_document_id, 'view');
end;
$$;

-- Log a download
create or replace function public.log_download(p_document_id uuid)
returns void
security definer set search_path = public
language plpgsql as $$
begin
  if auth.uid() is null then return; end if;

  insert into public.reading_history (user_id, document_id, action)
  values (auth.uid(), p_document_id, 'download');
end;
$$;

-- Log a Pomodoro/focus session
create or replace function public.log_study_session(p_duration_minutes int, p_module text)
returns void
security definer set search_path = public
language plpgsql as $$
begin
  if auth.uid() is null then return; end if;

  insert into public.study_sessions (user_id, duration_minutes, module_name)
  values (auth.uid(), p_duration_minutes, coalesce(p_module, 'Général'));
end;
$$;

-- ============================================================
-- get_study_stats — agrégats légers pour le dashboard analytics
-- ============================================================
create or replace function public.get_study_stats()
returns json
security definer set search_path = public
language plpgsql as $$
declare
  result json;
begin
  if auth.uid() is null then return null; end if;

  select json_build_object(
    'total_views', (select count(*) from reading_history h where h.user_id = auth.uid()),
    'total_downloads', (select count(*) from reading_history h where h.user_id = auth.uid() and h.action = 'download'),
    'total_study_minutes', coalesce((select sum(duration_minutes) from study_sessions s where s.user_id = auth.uid()), 0),
    'sessions_this_week', (select count(*) from study_sessions s
      where s.user_id = auth.uid() and s.started_at > now() - interval '7 days'),
    'views_this_week', (select count(*) from reading_history h
      where h.user_id = auth.uid() and h.viewed_at > now() - interval '7 days'),
    'last_7_days', (
      select coalesce(json_agg(json_build_object('day', to_char(d.day, 'YYYY-MM-DD'), 'count', d.cnt) order by d.day), '[]'::json)
      from (
        select
          date_trunc('day', h.viewed_at) as day,
          count(*) as cnt
        from reading_history h
        where h.user_id = auth.uid() and h.viewed_at > now() - interval '7 days'
        group by 1
      ) d
    ),
    'top_courses', (
      select coalesce(json_agg(json_build_object('category', dl.category, 'count', dl.total) order by dl.total desc), '[]'::json)
      from (
        select d.category, count(*) as total
        from reading_history h2
        join documents d on d.id = h2.document_id
        where h2.user_id = auth.uid()
        group by d.category
        order by total desc
        limit 5
      ) dl
    ),
    'recent_documents', (
      select coalesce(json_agg(json_build_object(
        'id', r.document_id,
        'title', r.title,
        'cycle', r.cycle,
        'category', r.category,
        'viewed_at', r.viewed_at
      )), '[]'::json)
      from (
        select h.document_id, d.title, d.cycle, d.category, h.viewed_at
        from reading_history h
        join documents d on d.id = h.document_id
        where h.user_id = auth.uid()
        order by h.viewed_at desc
      ) r
    )
  ) into result;

  return result;
end;
$$;

-- ============================================================
-- get_continue_learning — "Reprendre là où vous vous êtes arrêté"
-- ============================================================
create or replace function public.get_continue_learning()
returns table (
  document_id uuid,
  title text,
  category text,
  cycle text,
  viewed_at timestamptz
)
security definer set search_path = public
language sql as $$
  select
    d.id as document_id,
    d.title,
    d.category,
    d.cycle,
    max(h.viewed_at) as viewed_at
  from reading_history h
  join documents d on d.id = h.document_id
  where h.user_id = auth.uid()
  group by d.id
  order by max(h.viewed_at) desc
  limit 6;
$$;

grant execute on function public.log_document_view(uuid) to authenticated;
grant execute on function public.log_download(uuid) to authenticated;
grant execute on function public.log_study_session(int, text) to authenticated;
grant execute on function public.get_study_stats() to authenticated;
grant execute on function public.get_continue_learning() to authenticated;

-- ============================================================
-- 4. document_questions — Q&A collaboratif par document
-- (légères : une question = un post, des réponses = réponses imbriquées)
-- ============================================================
create table if not exists public.document_questions (
  id            uuid default gen_random_uuid() primary key,
  document_id   uuid references public.documents(id) on delete cascade not null,
  author_id     uuid references auth.users(id) on delete cascade not null,
  content       text not null check (char_length(content) <= 1000),
  parent_id     uuid references public.document_questions(id) on delete cascade, -- null = question, sinon réponse
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists document_questions_doc_idx on public.document_questions(document_id, created_at);
create index if not exists document_questions_parent_idx on public.document_questions(parent_id);

alter table public.document_questions enable row level security;

create policy "Anyone can view questions"
  on public.document_questions for select using (true);
create policy "Users can post questions"
  on public.document_questions for insert with check (auth.uid() = author_id);
create policy "Authors can update own"
  on public.document_questions for update using (auth.uid() = author_id);
create policy "Authors delete own"
  on public.document_questions for delete using (auth.uid() = author_id);

-- RPC: questions utilisées par le composant (joint le nom de l'auteur)
create or replace function public.get_document_questions(p_document_id uuid)
returns table (
  id uuid,
  content text,
  author_name text,
  parent_id uuid,
  created_at timestamptz,
  reply_count bigint
)
security definer set search_path = public
language sql as $$
  select
    q.id,
    q.content,
    coalesce(p.full_name, 'Étudiant·e'),
    q.parent_id,
    q.created_at,
    (select count(*) from document_questions r where r.parent_id = q.id) as reply_count
  from document_questions q
  left join profiles p on p.id = q.author_id
  where q.document_id = p_document_id
  order by q.created_at desc;
$$;

grant execute on function public.get_document_questions(uuid) to authenticated;
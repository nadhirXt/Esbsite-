-- Crée la table pour stocker les tokens de vérification d'email
create table if not exists public.email_verification_tokens (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    token text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone not null
);

-- Active la RLS mais on fera tout via le service_role, donc aucune policy n'est requise.
alter table public.email_verification_tokens enable row level security;

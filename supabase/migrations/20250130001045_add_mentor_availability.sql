create extension if not exists "uuid-ossp"; alter table auth.users add column if not exists available boolean default false;

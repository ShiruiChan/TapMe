---
name: project-tapme-v2
description: TapMe v2 — архитектура, стек, ключевые решения после масштабирования
metadata:
  type: project
---

TapMe был переписан с vanilla JS (index.html 1674 строки) на Vite + React + TypeScript с Supabase и Vercel.

**Стек:**
- React 18 + TypeScript + Vite
- Supabase (Auth + Postgres + Storage)
- Tanstack Query, Framer Motion, React Router v6
- Lucide icons, qrcode.react

**Архитектура навигации:**
- Desktop/Tablet (≥768px): Sidebar слева, фиксированная, `var(--sidebar-w)=240px`
- Mobile (<768px): Floating Pill Dock с центральным FAB + радиальное меню (QR, Share, Edit)

**Модульная система вкладок:**
- `src/tabs/*.tab.tsx` — каждый файл = одна вкладка (Vite glob import)
- `src/tabs/registry.ts` — авторегистрация через `import.meta.glob`
- Добавить новую вкладку = создать один файл с `default export TabModule`

**Supabase:**
- Миграции в `supabase/migrations/`
- Таблицы: profiles, cards, events, tabs, orgs
- View: card_stats (агрегированная аналитика)
- RLS: каждый видит только своё + публичные карточки
- Storage bucket: avatars (public, 5MB limit, только image/*)

**Backward compatibility:**
- Старые ссылки `?d=<base64>` поддерживаются через `PublicCardPage`
- Новые ссылки: `/c/:slug`
- `MigrationBanner` в AppShell — предлагает перенос данных из localStorage

**Переменные окружения:**
- `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` нужны для работы

**Why:** пользователь попросил масштабировать от 1 index.html до полноценного SaaS для 100+ юзеров.
**How to apply:** при добавлении новых фич — следовать модульной системе вкладок. Новые API = новый файл в `src/api/`. Стили — в `src/styles/components.css` через CSS-переменные.

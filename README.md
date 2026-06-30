# Premier Fitness Gym — Aplicație de gestiune

Aplicație web pentru gestionarea membrilor și a abonamentelor pentru sala
**Premier Fitness Gym** din Pucioasa. Interfața este integral în limba română și
este gândită pentru a fi folosită ușor de personal non-tehnic.

## Funcționalități

- **Dashboard** — statistici la zi (membri activi, abonamente expirate recent,
  încasări luna curentă, total membri), alerte pentru abonamentele care expiră în
  3 zile și ultimele abonamente adăugate.
- **Membri** — listă căutabilă (după nume sau telefon), status abonament curent,
  adăugare membru, ștergere cu confirmare.
- **Detalii membru** — abonamentul curent cu numărul de zile rămase, istoricul
  complet al abonamentelor, editarea datelor și adăugarea unui abonament nou.
- **Abonamente** — listă filtrabilă după status (activ / expirat) și după tip.
- **Autentificare** — email și parolă (Supabase Auth). Toate paginile sunt
  protejate; conturile se creează manual din panoul Supabase.

## Tehnologii

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- Componente UI proprii în stil shadcn/ui
- [Supabase](https://supabase.com/) (bază de date PostgreSQL + autentificare)

## Tipuri de abonament

| Tip            | Preț implicit | Durată  |
| -------------- | ------------- | ------- |
| Standard       | 150 lei       | 30 zile |
| Cardio inclus  | 170 lei       | 30 zile |
| Student        | 120 lei       | 30 zile |

Prețul poate fi modificat manual la crearea fiecărui abonament. Data de sfârșit
se calculează automat ca **data de start + 30 de zile**.

## Configurare

### 1. Instalează dependențele

```bash
npm install
```

### 2. Variabile de mediu

Fișierul `.env.local` conține deja cheile proiectului Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Dacă folosești alt proiect Supabase, înlocuiește valorile cu URL-ul și cheia
publică (publishable / anon) din **Project Settings → API**.

### 3. Schema bazei de date

Tabelele `membri` și `abonamente` sunt deja create în proiectul Supabase. Dacă
inițializezi un proiect nou, rulează migrația din **SQL Editor**:

```sql
create table if not exists membri (
  id uuid primary key default gen_random_uuid(),
  nume text not null,
  telefon text,
  created_at timestamptz default now()
);

create table if not exists abonamente (
  id uuid primary key default gen_random_uuid(),
  membru_id uuid references membri(id) on delete cascade,
  tip text not null check (tip in ('standard', 'cardio', 'student')),
  pret numeric(10,2) not null,
  data_start date not null,
  data_sfarsit date not null,
  created_at timestamptz default now()
);

create index if not exists idx_abonamente_membru on abonamente(membru_id);
create index if not exists idx_abonamente_sfarsit on abonamente(data_sfarsit);
```

### 4. Creează un cont de autentificare

Nu există pagină de înregistrare. Conturile se adaugă manual:

1. Intră în panoul Supabase → **Authentication → Users**.
2. Apasă **Add user → Create new user**.
3. Completează un email și o parolă și salvează.

Cu acest cont te poți autentifica în aplicație la `/login`.

## Rulare

### Dezvoltare

```bash
npm run dev
```

Aplicația pornește pe [http://localhost:3000](http://localhost:3000).

### Producție

```bash
npm run build
npm start
```

## Mod de utilizare

1. **Autentifică-te** cu emailul și parola create în Supabase.
2. **Adaugă un membru** din pagina *Membri* (butonul „Adaugă Membru”). Numele este
   obligatoriu, telefonul opțional.
3. **Deschide fișa membrului** apăsând pe rândul din tabel.
4. **Adaugă un abonament** cu butonul „Abonament Nou”: alege tipul (prețul se
   completează automat), data de start (implicit azi), iar data de sfârșit se
   calculează automat.
5. Urmărește pe **Dashboard** cine are abonamentul pe cale să expire și
   contactează membrii respectivi.

## Structura proiectului

```
app/
  (dashboard)/        # pagini protejate (dashboard, membri, abonamente)
  login/              # pagina de autentificare
components/           # componente UI și de funcționalitate
  ui/                 # primitive în stil shadcn/ui
lib/
  supabase.ts         # client Supabase (browser)
  supabase-server.ts  # client Supabase (server)
  utils.ts            # funcții pentru date, prețuri, status
  abonamente.ts       # logica abonamentului curent / status membru
types/
  index.ts            # tipurile TypeScript
proxy.ts              # protecția rutelor + reîmprospătarea sesiunii
```

> Notă: în Next.js 16 convenția `middleware` a fost redenumită `proxy`.

# Ghid Instalare Premier Fitness Gym

---

## 1. INSTALEAZĂ NODE.JS
- Du-te la: https://nodejs.org
- Descarcă versiunea **LTS**
- Instalează cu toate opțiunile default
- Restart laptop după instalare

---

## 2. COPIAZĂ PROIECTUL
- Copiază folderul `PremierFitness` pe laptopul lor
- Pune-l undeva stabil — ex: `C:\PremierFitness`
- NU pe Desktop (cale cu spații poate da erori)

---

## 3. INSTALEAZĂ DEPENDENȚELE
Deschide Command Prompt (cmd) în folderul proiectului:
```
cd C:\PremierFitness
npm install
```
Așteaptă să termine (1-2 minute).

---

## 4. BUILD PROIECT
```
npm run build
```
Rulează o singură dată. Dacă apare eroare, trimite-mi screenshot.

---

## 5. MODIFICĂ BAT-UL
Deschide `StartPremierFitness.bat` cu Notepad.
Schimbă linia:
```
cd /d "C:\Users\Turculet Andrei\Projects\PremierFitness"
```
Cu path-ul real de pe laptopul lor:
```
cd /d "C:\PremierFitness"
```
Salvează. Pune bat-ul pe Desktop.

---

## 6. ACTUALIZEAZĂ NUMĂRUL DE TELEFON
Caută în tot proiectul textul `0700 000 000` și `0700000000`.
Înlocuiește cu numărul real al sălii.
Fișiere de verificat:
- `app/` — toate paginile
- `index.html` — site-ul

---

## 7. TRANSFERĂ SUPABASE
1. Creează cont nou Supabase pe emailul lor: https://supabase.com
2. Du-te la proiectul tău Supabase → Settings → General
3. Transfer ownership → emailul lor
4. Ei acceptă invitația din email

---

## 8. CREEAZĂ CONT LOGIN APP
- Intră pe https://supabase.com cu contul lor
- Deschide proiectul → Authentication → Users
- Add user → emailul lor + parolă nouă
- Șterge contul `admin@premierfitness.ro` dacă vrei

---

## 9. ÎNLOCUIEȘTE POZELE DE PE SITE
În `index.html` caută toate linkurile `picsum.photos`.
Înlocuiește cu poze reale din sală (pune pozele în același folder sau folosește linkuri directe).

---

## 10. TESTEAZĂ TOT
- Dublu-click pe `StartPremierFitness.bat`
- Se deschide Chrome la `localhost:3000`
- Loghează-te cu credențialele noi
- Testează: adaugă membru, adaugă abonament, verifică dashboard

---

## IMPORTANT — INTERNET
Aplicația are nevoie de internet activ (Supabase e în cloud).
Dacă internetul cade, aplicația nu funcționează.

---

## DACĂ SE RESTARTEAZĂ LAPTOPUL
Dau dublu-click pe `StartPremierFitness.bat` de pe Desktop.
Gata.

---

## CREDENȚIALE INIȚIALE (de schimbat)
```
Email:  admin@premierfitness.ro
Parolă: Premier2026!
```

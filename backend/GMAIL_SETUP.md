# Configuration Gmail — Notifications automatiques CeLL&Ordi

Ce guide explique comment configurer votre compte Gmail pour envoyer des courriels automatiques depuis le site.

---

## Étape 1 — Activer la validation en 2 étapes

1. Aller sur **[myaccount.google.com](https://myaccount.google.com)**
2. Cliquer sur **Sécurité** dans le menu de gauche
3. Sous "Comment vous connectez-vous à Google", cliquer sur **Validation en 2 étapes**
4. Suivre les instructions pour l'activer (si pas déjà fait)

> ⚠️ La validation en 2 étapes est **obligatoire** pour créer un mot de passe d'application.

---

## Étape 2 — Créer un mot de passe d'application

1. Aller sur **[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**
   - Ou : **myaccount.google.com → Sécurité → Mots de passe des applications**
2. Dans "Nom de l'application", saisir : `CeLL&Ordi`
3. Cliquer sur **Créer**
4. Google affiche un mot de passe de **16 caractères** (format : `xxxx xxxx xxxx xxxx`)
5. **Copier ce mot de passe immédiatement** (il ne sera plus affiché)

---

## Étape 3 — Configurer le fichier `.env`

Ouvrir `backend/.env` et remplir les valeurs :

```env
GMAIL_USER=votre.adresse@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
ADMIN_NOTIFY_EMAIL=admin@reparationcellordi.ca
SITE_URL=https://reparationcellordi.ca
```

| Variable | Description |
|---|---|
| `GMAIL_USER` | L'adresse Gmail utilisée pour envoyer les emails |
| `GMAIL_APP_PASSWORD` | Le mot de passe de 16 caractères généré à l'étape 2 |
| `ADMIN_NOTIFY_EMAIL` | L'adresse qui reçoit les alertes admin (peut être différente de GMAIL_USER) |
| `SITE_URL` | URL du site (pour les liens dans les emails) |

> 💡 En développement, `SITE_URL=http://localhost:5173`. En production, mettre `https://reparationcellordi.ca`.

---

## Étape 4 — Redémarrer le backend

```bash
cd backend
node server.js
```

Ou si vous utilisez nodemon :
```bash
npm run dev
```

---

## Vérification

Soumettre un rendez-vous test via le formulaire du site. Vous devriez recevoir :
- ✅ **Email au client** — confirmation avec numéro de ticket (ex: `RCO-20260227-001`)
- ✅ **Email à l'admin** — notification avec les détails du RDV

Dans la console du serveur, vous devriez voir :
```
[RDV] ✅ Ticket créé automatiquement : RCO-20260227-001
[Mailer] ✅ Email envoyé à client@exemple.com — <...messageId...>
[Mailer] ✅ Email envoyé à admin@reparationcellordi.ca — <...messageId...>
```

---

## Comportement si Gmail n'est pas configuré

Si `GMAIL_USER` ou `GMAIL_APP_PASSWORD` ne sont pas renseignés dans `.env`, le système **ignore silencieusement l'envoi** et affiche dans la console :
```
[Mailer] Variables GMAIL_USER / GMAIL_APP_PASSWORD non configurées — email ignoré.
```
Le site continue de fonctionner normalement — les formulaires sont toujours sauvegardés en base de données.

---

## Emails envoyés automatiquement

| Formulaire | Email client | Email admin |
|---|---|---|
| Rendez-vous | ✅ Confirmation + numéro de ticket | ✅ Notification nouveau RDV |
| Contact | ✅ Accusé de réception (réponse sous 24h) | ✅ Message complet + lien répondre |
| Décharge | ✅ Confirmation d'enregistrement (si email fourni) | ❌ |

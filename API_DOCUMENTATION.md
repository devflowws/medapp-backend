# 📚 Documentation API - MedApp Plateforme de Santé

**Version:** 1.0.0  
**Dernière mise à jour:** 12 Avril 2026  
**Base URL:** `http://localhost:5000`  
**Swagger UI:** `http://localhost:5000/api-docs`

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture & Technologies](#architecture--technologies)
3. [Authentification & Autorisation](#authentification--autorisation)
4. [Modèles de Données](#modèles-de-données)
5. [Endpoints API](#endpoints-api)
6. [Guide de Test avec Exemples](#guide-de-test-avec-exemples)
7. [Codes d'Erreur](#codes-derreur)
8. [WebSocket (Socket.io)](#websocket-socketio)
9. [Bonnes Pratiques](#bonnes-pratiques)
10. [FAQ](#faq)

---

## 🎯 Vue d'Ensemble

MedApp est une plateforme de santé numérique qui connecte trois acteurs principaux :

| Acteur | Description | Actions Principales |
|--------|-------------|---------------------|
| **Patient** | Utilisateur final | S'inscrire, consulter médecins, recevoir ordonnances, commander médicaments, chatter avec pharmacies |
| **Médecin** | Professionnel de santé | Créer des ordonnances numériques pour les patients |
| **Pharmacie** | Point de vente médicaments | Recevoir commandes, accepter/refuser, communiquer avec patients |

### Flux de Travail Typique

```
1. Patient s'inscrit → Reçoit token JWT
2. Médecin crée ordonnance → Générée avec QR Code
3. Patient scan ordonnance → Voit détails
4. Patient crée commande → Envoie à pharmacie choisie
5. Pharmacie reçoit → Accepte ou refuse
6. Chat en temps réel → Coordination livraison/paiement
```

---

## 🏗️ Architecture & Technologies

### Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Backend** | Node.js + Express | v5+ |
| **Base de Données** | PostgreSQL | v17+ |
| **ORM** | Sequelize | v6+ |
| **Authentification** | JWT (jsonwebtoken) | v9+ |
| **Temps Réel** | Socket.io | v4+ |
| **Documentation** | Swagger/OpenAPI | v3.0 |
| **Hachage MDP** | bcryptjs | v3+ |

### Structure des Réponses

**Réponse Succès :**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Réponse Erreur :**
```json
{
  "status": "error",
  "message": "Description de l'erreur"
}
```

---

## 🔐 Authentification & Autorisation

### Comment fonctionne l'Authentification ?

L'API utilise **JWT (JSON Web Tokens)** pour l'authentification. Voici le processus :

#### 1️⃣ **Inscription/Connexion → Obtention du Token**

```
┌─────────────────────────────────────────────────────┐
│ 1. Patient s'inscrit ou se connecte                 │
│ 2. Backend vérifie les identifiants                  │
│ 3. Si valides → Génère un JWT                       │
│ 4. Token contient: { id, role, iat, exp }           │
│ 5. Frontend stocke le token (localStorage/cookies)  │
│ 6. Chaque requête suivante inclut le token          │
└─────────────────────────────────────────────────────┘
```

#### 2️⃣ **Utilisation du Token dans les Requêtes**

Chaque requête authentifiée doit inclure ce header :

```
Authorization: Bearer <votre_token_jwt>
```

**Exemple :**
```bash
curl -X GET http://localhost:5000/api/patients/uuid-du-patient \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Rôles Utilisateur

| Rôle | Description | Permissions |
|------|-------------|-------------|
| `patient` | Patient inscrit | Voir son profil, créer commandes, envoyer messages |
| `pharmacy` | Pharmacie active | Voir commandes, mettre à jour statuts, répondre messages |
| `doctor` | Médecin enregistré | Créer ordonnances, voir patients |
| `admin` | Administrateur | Accès complet (non implémenté) |

### ⚠️ Important pour le Frontend

1. **Stockage sécurisé** : Préférez `httpOnly cookies` à `localStorage` pour éviter les attaques XSS
2. **Expiration** : Le token expire après 1h (configurable dans `.env`)
3. **Refresh Token** : Non implémenté actuellement - l'utilisateur doit se reconnecter
4. **Middleware Auth** : Actuellement **commenté** sur la plupart des routes (en développement)

---

## 🗃️ Modèles de Données

### 1. Patient 👤

Représente un patient inscrit sur la plateforme.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | UUID | Auto | Identifiant unique |
| `nom` | String | ✅ | Nom de famille |
| `prenoms` | String | ✅ | Prénoms |
| `nom_utilisateur` | String | ✅ | Username unique |
| `email` | String | ✅ | Email unique |
| `telephone` | String | ✅ | Téléphone unique |
| `mot_de_passe` | String | ✅ | Haché automatiquement (bcrypt) |

**Exemple de réponse :**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nom": "Kouassi",
  "prenoms": "Jean Marc",
  "nom_utilisateur": "jkouassi",
  "email": "jean.kouassi@email.com",
  "telephone": "+225 07 12 34 56"
}
```

**Notes :**
- ✅ Le mot de passe est automatiquement haché avant sauvegarde
- ✅ Méthode `validatePassword()` disponible pour vérification
- ❌ Le mot de passe n'est **JAMAIS** renvoyé dans les réponses

---

### 2. Doctor (Médecin) 👨‍⚕️

Représente un médecin enregistré.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | UUID | Auto | Identifiant unique |
| `matricule` | String | ✅ | Numéro d'inscription unique |
| `nom` | String | ✅ | Nom de famille |
| `prenoms` | String | ✅ | Prénoms |
| `date_naissance` | Date | ✅ | Format: YYYY-MM-DD |
| `email` | String | ✅ | Email unique |
| `telephone` | String | ✅ | Téléphone |
| `specialite` | String | ✅ | Ex: Cardiologie, Pédiatrie |
| `grade` | String | ✅ | Ex: Professeur, Résident |
| `hopital` | String | ✅ | Établissement |
| `photo_url` | Text | ❌ | URL de la photo |
| `qr_code_url` | Text | ❌ | URL du QR Code personnel |
| `is_active` | Boolean | Auto | Par défaut: true |

**Exemple :**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "matricule": "MED-2024-001",
  "nom": "Diabaté",
  "prenoms": "Fatou",
  "date_naissance": "1985-03-15",
  "email": "fatou.diabate@hopital.ci",
  "telephone": "+225 05 98 76 54",
  "specialite": "Pédiatrie",
  "grade": "Professeur",
  "hopital": "CHU de Cocody",
  "is_active": true
}
```

---

### 3. Pharmacy (Pharmacie) 💊

Représente une pharmacie partenaire.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | UUID | Auto | Identifiant unique |
| `nom` | String | ✅ | Nom de la pharmacie |
| `adresse` | String | ✅ | Adresse physique |
| `latitude` | Decimal | ❌ | Coordonnée GPS |
| `longitude` | Decimal | ❌ | Coordonnée GPS |
| `horaires` | String | ❌ | Ex: "Lun-Ven 8h-20h" |
| `telephone` | String | ✅ | Contact |
| `email` | String | ✅ | Email unique |
| `mot_de_passe` | String | ✅ | Haché automatiquement |
| `note` | Decimal | Auto | Note /5.0 (optionnel) |

**Exemple :**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "nom": "Pharmacie du Plateau",
  "adresse": "123 Avenue Franchet d'Esperey, Abidjan",
  "latitude": 5.316667,
  "longitude": -4.016667,
  "horaires": "Lundi-Vendredi 7h30-21h00",
  "telephone": "+225 27 21 22 23 24",
  "email": "contact@pharmacie-plateau.ci",
  "note": 4.5
}
```

---

### 4. Prescription (Ordonnance) 📝

Représente une ordonnance numérique créée par un médecin.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | UUID | Auto | Identifiant unique |
| `medecin_id` | UUID | ✅ | ID du médecin |
| `patient_id` | UUID | ❌ | ID du patient (peut être null) |
| `type` | Enum | ✅ | `unique` ou `periodique` |
| `nom_hopital` | String | ✅ | Émetteur |
| `note` | Text | ❌ | Instructions spéciales |
| `periode_validite` | Integer | ❌ | Durée de validité |
| `unite_periode` | Enum | ❌ | `jour`, `mois`, `annee` |
| `date_expiration` | Date | ❌ | Calculée automatiquement |
| `statut` | Enum | Auto | `active`, `expiree`, `utilisee` |
| `prix_total` | Decimal | Auto | Somme des items |

**Types d'Ordonnance :**

| Type | Description | Exemple |
|------|-------------|---------|
| `unique` | Usage unique, expire après utilisation | Antibiotiques 7 jours |
| `periodique` | Valide pour plusieurs renouvellements | Traitement mensuel diabète |

**Exemple :**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "medecin_id": "660e8400-e29b-41d4-a716-446655440001",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "unique",
  "nom_hopital": "CHU de Cocody",
  "note": "Prendre après les repas",
  "statut": "active",
  "prix_total": 15000.00,
  "created_at": "2026-04-12T10:30:00Z",
  "items": [
    {
      "id": "item-001",
      "nom_produit": "Amoxicilline 500mg",
      "medication_code": "AMX500",
      "posologie": "1 comprimé 3x/jour pendant 7 jours",
      "prix_unitaire": 8500.00
    },
    {
      "id": "item-002",
      "nom_produit": "Paracétamol 1g",
      "medication_code": "PARA1G",
      "posologie": "1 comprimé si fièvre (max 3/jour)",
      "prix_unitaire": 6500.00
    }
  ]
}
```

---

### 5. PrescriptionItem (Ligne d'Ordonnance) 💊

Chaque médicament dans une ordonnance.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | UUID | Auto | Identifiant unique |
| `ordonnance_id` | UUID | ✅ | ID de l'ordonnance parente |
| `nom_produit` | String | ✅ | Nom du médicament |
| `medication_code` | String | ✅ | Code médicament |
| `posologie` | Text | ✅ | Instructions de prise |
| `prix_unitaire` | Decimal | ✅ | Prix unitaire |

---

### 6. Order (Commande) 📦

Représente une commande de médicaments par un patient.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | UUID | Auto | Identifiant unique |
| `ordonnance_id` | UUID | ❌ | Ordonnance associée |
| `pharmacie_id` | UUID | ✅ | Pharmacie cible |
| `patient_id` | UUID | ✅ | Patient demandeur |
| `statut` | Enum | Auto | Voir tableau ci-dessous |
| `requiert_ordonnance` | Boolean | ✅ | Si ordonnance requise |
| `message_pharmacie` | Text | ❌ | Message de la pharmacie |

**Statuts de Commande :**

| Statut | Description | Qui peut définir |
|--------|-------------|------------------|
| `en_attente` | Commande créée, non traitée | Système (défaut) |
| `accepte` | Pharmacie a accepté | Pharmacie |
| `indisponible` | Médicaments indisponibles | Pharmacie |
| `livre` | Commande livrée au patient | Pharmacie/Patient |
| `refuse` | Commande refusée | Pharmacie |

**Exemple :**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "ordonnance_id": "880e8400-e29b-41d4-a716-446655440003",
  "pharmacie_id": "770e8400-e29b-41d4-a716-446655440002",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "statut": "accepte",
  "requiert_ordonnance": true,
  "message_pharmacie": "Votre commande sera prête dans 30 minutes",
  "created_at": "2026-04-12T11:00:00Z",
  "pharmacie": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "nom": "Pharmacie du Plateau",
    "adresse": "123 Avenue Franchet d'Esperey",
    "telephone": "+225 27 21 22 23 24"
  },
  "patient": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nom": "Kouassi",
    "prenoms": "Jean Marc",
    "telephone": "+225 07 12 34 56"
  }
}
```

---

### 7. Message (Messagerie) 💬

Messages échangés entre patient et pharmacie.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | UUID | Auto | Identifiant unique |
| `order_id` | UUID | ✅ | Commande associée |
| `sender_type` | Enum | ✅ | `patient` ou `pharmacy` |
| `sender_id` | UUID | ✅ | ID de l'expéditeur |
| `content` | Text | ✅ | Contenu du message |
| `is_read` | Boolean | Auto | Lu ou non |

**Exemple :**
```json
{
  "id": "msg-001",
  "order_id": "990e8400-e29b-41d4-a716-446655440004",
  "sender_type": "patient",
  "sender_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Bonjour, à quelle heure puis-je passer ?",
  "is_read": false,
  "created_at": "2026-04-12T11:15:00Z"
}
```

---

### 8. OtpToken (Token OTP) 🔑

Tokens à usage unique pour vérification (2FA).

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | UUID | Auto | Identifiant unique |
| `user_id` | UUID | ✅ | ID de l'utilisateur |
| `user_type` | Enum | ✅ | `patient`, `doctor`, `pharmacy`, `admin` |
| `code` | String | ✅ | Code à 6 chiffres |
| `expires_at` | Date | ✅ | Expiration |
| `used` | Boolean | Auto | Déjà utilisé ? |

---

### 9. AuditLog (Journal d'Audit) 📊

Traçabilité des actions dans le système.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | UUID | Auto | Identifiant unique |
| `action` | String | ✅ | Description de l'action |
| `user_type` | String | ❌ | Type d'utilisateur |
| `user_id` | UUID | ❌ | ID de l'utilisateur |
| `details` | JSONB | ❌ | Détails en JSON |
| `ip_address` | String | ❌ | IP de la requête |

---

## 🔌 Endpoints API

### Base URL
```
http://localhost:5000/api
```

### Swagger UI (Documentation Interactive)
```
http://localhost:5000/api-docs
```

---

### 1. 🔐 AUTHENTIFICATION

#### 1.1 Inscription Patient

**Endpoint:** `POST /api/auth/patient/register`

**Description:** Crée un nouveau compte patient et retourne un token JWT.

**Requête :**
```json
{
  "nom": "Kouassi",
  "prenoms": "Jean Marc",
  "nom_utilisateur": "jkouassi",
  "email": "jean.kouassi@email.com",
  "telephone": "+2250712345678",
  "mot_de_passe": "MonMotDePasse123!"
}
```

**Réponse Succès (201) :**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsInJvbGUiOiJwYXRpZW50IiwiaWF0IjoxNjE3MjEyODAwLCJleHAiOjE2MTcyMTY0MDB9.abc123",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nom": "Kouassi",
    "prenoms": "Jean Marc",
    "role": "patient"
  }
}
```

**Réponse Erreur (400) :**
```json
{
  "status": "error",
  "message": "Cet email est déjà utilisé"
}
```

**⚠️ Notes Importantes :**
- `nom_utilisateur`, `email`, et `telephone` doivent être **uniques**
- Le mot de passe est automatiquement **haché** (bcrypt, salt=12)
- Le token JWT est valide **1 heure** par défaut (configurable dans `.env`)

---

#### 1.2 Connexion Patient

**Endpoint:** `POST /api/auth/patient/login`

**Description:** Authentifie un patient et retourne un token JWT.

**Requête :**
```json
{
  "identifiant": "jean.kouassi@email.com",
  "mot_de_passe": "MonMotDePasse123!"
}
```

**💡 L'identifiant peut être :**
- Email
- Nom d'utilisateur
- Numéro de téléphone

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nom": "Kouassi",
    "prenoms": "Jean Marc",
    "role": "patient"
  }
}
```

**Réponse Erreur (401) :**
```json
{
  "status": "error",
  "message": "Identifiants incorrects"
}
```

---

#### 1.3 Connexion Pharmacie

**Endpoint:** `POST /api/auth/pharmacy/login`

**Description:** Authentifie une pharmacie et retourne un token JWT.

**Requête :**
```json
{
  "email": "contact@pharmacie-plateau.ci",
  "mot_de_passe": "PharmaPass123!"
}
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "nom": "Pharmacie du Plateau",
    "role": "pharmacy"
  }
}
```

**Réponse Erreur (401) :**
```json
{
  "status": "error",
  "message": "Identifiants incorrects"
}
```

---

### 2. 👨‍⚕️ MÉDECINS (Doctors)

#### 2.1 Liste des Médecins

**Endpoint:** `GET /api/doctors`

**Description:** Récupère tous les médecins actifs.

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "matricule": "MED-2024-001",
      "nom": "Diabaté",
      "prenoms": "Fatou",
      "date_naissance": "1985-03-15",
      "email": "fatou.diabate@hopital.ci",
      "telephone": "+225 05 98 76 54",
      "specialite": "Pédiatrie",
      "grade": "Professeur",
      "hopital": "CHU de Cocody",
      "photo_url": null,
      "qr_code_url": null,
      "is_active": true
    }
  ]
}
```

---

#### 2.2 Détails d'un Médecin

**Endpoint:** `GET /api/doctors/:id`

**Description:** Récupère les informations d'un médecin spécifique.

**Paramètres :**
| Nom | Type | Requis | Description |
|-----|------|--------|-------------|
| `id` | UUID | ✅ | ID du médecin |

**Exemple d'URL :**
```
GET /api/doctors/660e8400-e29b-41d4-a716-446655440001
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "matricule": "MED-2024-001",
    "nom": "Diabaté",
    "prenoms": "Fatou",
    "date_naissance": "1985-03-15",
    "email": "fatou.diabate@hopital.ci",
    "telephone": "+225 05 98 76 54",
    "specialite": "Pédiatrie",
    "grade": "Professeur",
    "hopital": "CHU de Cocody",
    "photo_url": null,
    "qr_code_url": null,
    "is_active": true,
    "created_at": "2026-01-10T08:00:00Z",
    "updated_at": "2026-04-12T09:00:00Z"
  }
}
```

**Réponse Erreur (404) :**
```json
{
  "status": "error",
  "message": "Médecin non trouvé"
}
```

---

#### 2.3 Créer un Médecin

**Endpoint:** `POST /api/doctors`

**Description:** Crée un nouveau médecin (normalement réservé aux admins).

**Requête :**
```json
{
  "matricule": "MED-2024-002",
  "nom": "Kone",
  "prenoms": "Moussa",
  "date_naissance": "1990-07-20",
  "email": "moussa.kone@hopital.ci",
  "telephone": "+225 07 11 22 33 44",
  "specialite": "Cardiologie",
  "grade": "Docteur",
  "hopital": "Hôpital Général de Bingerville"
}
```

**Réponse Succès (201) :**
```json
{
  "status": "success",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "matricule": "MED-2024-002",
    "nom": "Kone",
    "prenoms": "Moussa",
    "date_naissance": "1990-07-20",
    "email": "moussa.kone@hopital.ci",
    "telephone": "+225 07 11 22 33 44",
    "specialite": "Cardiologie",
    "grade": "Docteur",
    "hopital": "Hôpital Général de Bingerville",
    "photo_url": null,
    "qr_code_url": null,
    "is_active": true,
    "created_at": "2026-04-12T10:00:00Z",
    "updated_at": "2026-04-12T10:00:00Z"
  }
}
```

**Réponse Erreur (400) :**
```json
{
  "status": "error",
  "message": "Un médecin avec ce matricule existe déjà"
}
```

---

### 3. 👤 PATIENTS

#### 3.1 Profil d'un Patient

**Endpoint:** `GET /api/patients/:id`

**Description:** Récupère le profil d'un patient (sans le mot de passe).

**Paramètres :**
| Nom | Type | Requis | Description |
|-----|------|--------|-------------|
| `id` | UUID | ✅ | ID du patient |

**Exemple d'URL :**
```
GET /api/patients/550e8400-e29b-41d4-a716-446655440000
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nom": "Kouassi",
    "prenoms": "Jean Marc",
    "nom_utilisateur": "jkouassi",
    "email": "jean.kouassi@email.com",
    "telephone": "+225 07 12 34 56"
  }
}
```

**Réponse Erreur (404) :**
```json
{
  "status": "error",
  "message": "Patient non trouvé"
}
```

---

#### 3.2 Mettre à Jour un Patient

**Endpoint:** `PUT /api/patients/:id`

**Description:** Met à jour le profil d'un patient.

**⚠️ Le mot de passe ne peut PAS être modifié via cette route.**

**Requête :**
```json
{
  "nom": "Kouassi",
  "prenoms": "Jean Marc",
  "telephone": "+225 07 99 88 77 66"
}
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nom": "Kouassi",
    "prenoms": "Jean Marc",
    "nom_utilisateur": "jkouassi",
    "email": "jean.kouassi@email.com",
    "telephone": "+225 07 99 88 77 66"
  }
}
```

---

### 4. 💊 PHARMACIES

#### 4.1 Liste des Pharmacies

**Endpoint:** `GET /api/pharmacies`

**Description:** Récupère toutes les pharmacies actives.

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "nom": "Pharmacie du Plateau",
      "adresse": "123 Avenue Franchet d'Esperey",
      "latitude": 5.316667,
      "longitude": -4.016667,
      "horaires": "Lundi-Vendredi 7h30-21h00",
      "telephone": "+225 27 21 22 23 24",
      "email": "contact@pharmacie-plateau.ci",
      "note": 4.5
    }
  ]
}
```

---

#### 4.2 Profil d'une Pharmacie

**Endpoint:** `GET /api/pharmacies/:id`

**Description:** Récupère les informations d'une pharmacie.

**Exemple d'URL :**
```
GET /api/pharmacies/770e8400-e29b-41d4-a716-446655440002
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "nom": "Pharmacie du Plateau",
    "adresse": "123 Avenue Franchet d'Esperey",
    "latitude": 5.316667,
    "longitude": -4.016667,
    "horaires": "Lundi-Vendredi 7h30-21h00",
    "telephone": "+225 27 21 22 23 24",
    "email": "contact@pharmacie-plateau.ci",
    "note": 4.5
  }
}
```

---

### 5. 📝 ORDONNANCES (Prescriptions)

#### 5.1 Créer une Ordonnance

**Endpoint:** `POST /api/prescriptions`

**Description:** Crée une nouvelle ordonnance avec ses médicaments.

**Requête :**
```json
{
  "medecin_id": "660e8400-e29b-41d4-a716-446655440001",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "unique",
  "nom_hopital": "CHU de Cocody",
  "note": "Prendre après les repas",
  "periode_validite": 30,
  "unite_periode": "jour",
  "items": [
    {
      "nom_produit": "Amoxicilline 500mg",
      "medication_code": "AMX500",
      "posologie": "1 comprimé 3x/jour pendant 7 jours",
      "prix_unitaire": 8500.00
    },
    {
      "nom_produit": "Paracétamol 1g",
      "medication_code": "PARA1G",
      "posologie": "1 comprimé si fièvre (max 3/jour)",
      "prix_unitaire": 6500.00
    }
  ]
}
```

**Réponse Succès (201) :**
```json
{
  "status": "success",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "medecin_id": "660e8400-e29b-41d4-a716-446655440001",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "unique",
    "nom_hopital": "CHU de Cocody",
    "note": "Prendre après les repas",
    "statut": "active",
    "prix_total": 15000.00,
    "created_at": "2026-04-12T10:30:00Z",
    "items": [
      {
        "id": "item-001",
        "ordonnance_id": "880e8400-e29b-41d4-a716-446655440003",
        "nom_produit": "Amoxicilline 500mg",
        "medication_code": "AMX500",
        "posologie": "1 comprimé 3x/jour pendant 7 jours",
        "prix_unitaire": 8500.00
      },
      {
        "id": "item-002",
        "ordonnance_id": "880e8400-e29b-41d4-a716-446655440003",
        "nom_produit": "Paracétamol 1g",
        "medication_code": "PARA1G",
        "posologie": "1 comprimé si fièvre (max 3/jour)",
        "prix_unitaire": 6500.00
      }
    ]
  }
}
```

**💡 Notes :**
- Le `prix_total` est automatiquement calculé (somme des `prix_unitaire`)
- La transaction est **atomique** : si un item échoue, tout est annulé

---

#### 5.2 Voir une Ordonnance

**Endpoint:** `GET /api/prescriptions/:id`

**Description:** Récupère une ordonnance avec ses items, médecin et patient.

**Exemple d'URL :**
```
GET /api/prescriptions/880e8400-e29b-41d4-a716-446655440003
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "type": "unique",
    "nom_hopital": "CHU de Cocody",
    "note": "Prendre après les repas",
    "statut": "active",
    "prix_total": 15000.00,
    "items": [
      {
        "id": "item-001",
        "nom_produit": "Amoxicilline 500mg",
        "medication_code": "AMX500",
        "posologie": "1 comprimé 3x/jour pendant 7 jours",
        "prix_unitaire": 8500.00
      }
    ],
    "medecin": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "nom": "Diabaté",
      "prenoms": "Fatou",
      "specialite": "Pédiatrie",
      "hopital": "CHU de Cocody"
    },
    "patient": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nom": "Kouassi",
      "prenoms": "Jean Marc"
    }
  }
}
```

---

#### 5.3 Ordonnances d'un Patient

**Endpoint:** `GET /api/prescriptions/patient/:patientId`

**Description:** Récupère toutes les ordonnances d'un patient.

**Exemple d'URL :**
```
GET /api/prescriptions/patient/550e8400-e29b-41d4-a716-446655440000
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "type": "unique",
      "nom_hopital": "CHU de Cocody",
      "statut": "active",
      "prix_total": 15000.00,
      "created_at": "2026-04-12T10:30:00Z",
      "medecin": {
        "nom": "Diabaté",
        "prenoms": "Fatou",
        "specialite": "Pédiatrie"
      }
    }
  ]
}
```

---

### 6. 📦 COMMANDES (Orders)

#### 6.1 Créer une Commande

**Endpoint:** `POST /api/orders`

**Description:** Crée une nouvelle commande de médicaments.

**Requête :**
```json
{
  "ordonnance_id": "880e8400-e29b-41d4-a716-446655440003",
  "pharmacie_id": "770e8400-e29b-41d4-a716-446655440002",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "requiert_ordonnance": true
}
```

**Réponse Succès (201) :**
```json
{
  "status": "success",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "ordonnance_id": "880e8400-e29b-41d4-a716-446655440003",
    "pharmacie_id": "770e8400-e29b-41d4-a716-446655440002",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "statut": "en_attente",
    "requiert_ordonnance": true,
    "message_pharmacie": null,
    "created_at": "2026-04-12T11:00:00Z",
    "updated_at": "2026-04-12T11:00:00Z"
  }
}
```

---

#### 6.2 Commandes d'une Pharmacie

**Endpoint:** `GET /api/orders/pharmacy/:pharmacyId`

**Description:** Récupère toutes les commandes reçues par une pharmacie.

**Exemple d'URL :**
```
GET /api/orders/pharmacy/770e8400-e29b-41d4-a716-446655440002
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "statut": "en_attente",
      "requiert_ordonnance": true,
      "message_pharmacie": null,
      "created_at": "2026-04-12T11:00:00Z",
      "patient": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "nom": "Kouassi",
        "prenoms": "Jean Marc",
        "telephone": "+225 07 12 34 56"
      },
      "ordonnance": {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "type": "unique",
        "prix_total": 15000.00
      }
    }
  ]
}
```

---

#### 6.3 Commandes d'un Patient

**Endpoint:** `GET /api/orders/patient/:patientId`

**Description:** Récupère toutes les commandes passées par un patient.

**Exemple d'URL :**
```
GET /api/orders/patient/550e8400-e29b-41d4-a716-446655440000
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "statut": "en_attente",
      "requiert_ordonnance": true,
      "message_pharmacie": null,
      "created_at": "2026-04-12T11:00:00Z",
      "pharmacie": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "nom": "Pharmacie du Plateau",
        "adresse": "123 Avenue Franchet d'Esperey",
        "telephone": "+225 27 21 22 23 24"
      },
      "ordonnance": {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "type": "unique"
      }
    }
  ]
}
```

---

#### 6.4 Mettre à Jour le Statut d'une Commande

**Endpoint:** `PUT /api/orders/:id/status`

**Description:** Permet à une pharmacie de mettre à jour le statut d'une commande.

**Paramètres :**
| Nom | Type | Requis | Description |
|-----|------|--------|-------------|
| `id` | UUID | ✅ | ID de la commande |

**Requête :**
```json
{
  "statut": "accepte",
  "message_pharmacie": "Votre commande sera prête dans 30 minutes"
}
```

**Statuts Validés :**
| Statut | Description |
|--------|-------------|
| `en_attente` | Commande en attente |
| `accepte` | Commande acceptée |
| `indisponible` | Médicaments indisponibles |
| `livre` | Commande livrée |
| `refuse` | Commande refusée |

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "statut": "accepte",
    "message_pharmacie": "Votre commande sera prête dans 30 minutes",
    "updated_at": "2026-04-12T11:30:00Z"
  }
}
```

**💡 Comportement Automatique :**
- Quand le statut passe à `livre` et l'ordonnance est de type `unique`, elle est automatiquement marquée comme `utilisee`

**Réponse Erreur (400) :**
```json
{
  "status": "error",
  "message": "Statut invalide"
}
```

---

### 7. 💬 MESSAGES (Messagerie)

#### 7.1 Envoyer un Message

**Endpoint:** `POST /api/messages`

**Description:** Envoie un message dans le chat d'une commande.

**Requête :**
```json
{
  "order_id": "990e8400-e29b-41d4-a716-446655440004",
  "expediteur_type": "patient",
  "expediteur_id": "550e8400-e29b-41d4-a716-446655440000",
  "contenu": "Bonjour, à quelle heure puis-je passer ?"
}
```

**Réponse Succès (201) :**
```json
{
  "status": "success",
  "data": {
    "id": "msg-001",
    "order_id": "990e8400-e29b-41d4-a716-446655440004",
    "expediteur_type": "patient",
    "expediteur_id": "550e8400-e29b-41d4-a716-446655440000",
    "contenu": "Bonjour, à quelle heure puis-je passer ?",
    "is_read": false,
    "created_at": "2026-04-12T11:15:00Z"
  }
}
```

**💡 Temps Réel :**
- Un événement Socket.io `newMessage` est émis automatiquement
- Voir section [WebSocket](#websocket-socketio) pour plus de détails

---

#### 7.2 Messages d'une Commande

**Endpoint:** `GET /api/messages/order/:orderId`

**Description:** Récupère tous les messages d'une commande (du plus ancien au plus récent).

**Exemple d'URL :**
```
GET /api/messages/order/990e8400-e29b-41d4-a716-446655440004
```

**Réponse Succès (200) :**
```json
{
  "status": "success",
  "data": [
    {
      "id": "msg-001",
      "order_id": "990e8400-e29b-41d4-a716-446655440004",
      "expediteur_type": "patient",
      "expediteur_id": "550e8400-e29b-41d4-a716-446655440000",
      "contenu": "Bonjour, à quelle heure puis-je passer ?",
      "is_read": false,
      "created_at": "2026-04-12T11:15:00Z"
    },
    {
      "id": "msg-002",
      "order_id": "990e8400-e29b-41d4-a716-446655440004",
      "expediteur_type": "pharmacy",
      "expediteur_id": "770e8400-e29b-41d4-a716-446655440002",
      "contenu": "Bonjour ! Votre commande sera prête à 14h.",
      "is_read": false,
      "created_at": "2026-04-12T11:20:00Z"
    }
  ]
}
```

---

### 8. 🏥 SANTÉ API

#### 8.1 Vérification Status

**Endpoint:** `GET /api/health`

**Description:** Vérifie que l'API est en cours d'exécution.

**Réponse Succès (200) :**
```json
{
  "status": "ok",
  "message": "API is running"
}
```

---

## 🧪 Guide de Test avec Exemples

### Prérequis

1. **PostgreSQL doit être en cours d'exécution**
   ```bash
   # Vérifier si PostgreSQL est actif
   pg_isready
   ```

2. **Base de données créée**
   ```bash
   set PGPASSWORD=admin
   psql -U postgres -c "CREATE DATABASE medapp_db;"
   ```

3. **Dépendances installées**
   ```bash
   cd c:\Users\hounk\Desktop\Projet\medapp-backend
   npm install
   ```

4. **Serveur démarré**
   ```bash
   npm run dev
   ```

---

### Test 1: Inscription d'un Patient

**Outil :** Postman / Thunder Client / curl

```bash
curl -X POST http://localhost:5000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d "{\"nom\":\"Test\",\"prenoms\":\"User\",\"nom_utilisateur\":\"testuser\",\"email\":\"test@example.com\",\"telephone\":\"+2250700000001\",\"mot_de_passe\":\"Test1234!\"}"
```

**Réponse attendue :**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": "uuid-généré",
    "nom": "Test",
    "prenoms": "User",
    "role": "patient"
  }
}
```

**💡 Copiez le token JWT pour les tests suivants !**

---

### Test 2: Connexion Patient

```bash
curl -X POST http://localhost:5000/api/auth/patient/login \
  -H "Content-Type: application/json" \
  -d "{\"identifiant\":\"test@example.com\",\"mot_de_passe\":\"Test1234!\"}"
```

**Réponse attendue :** Même structure que l'inscription

---

### Test 3: Créer un Médecin

```bash
curl -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -d "{\"matricule\":\"MED-TEST-001\",\"nom\":\"Doctor\",\"prenoms\":\"Test\",\"date_naissance\":\"1980-01-01\",\"email\":\"doctor@test.com\",\"telephone\":\"+2250700000002\",\"specialite\":\"Généraliste\",\"grade\":\"Docteur\",\"hopital\":\"Hôpital Test\"}"
```

**Réponse attendue :**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-du-medecin",
    "matricule": "MED-TEST-001",
    "nom": "Doctor",
    ...
  }
}
```

---

### Test 4: Créer une Ordonnance

```bash
curl -X POST http://localhost:5000/api/prescriptions \
  -H "Content-Type: application/json" \
  -d "{\"medecin_id\":\"uuid-du-medecin\",\"patient_id\":\"uuid-du-patient\",\"type\":\"unique\",\"nom_hopital\":\"Hôpital Test\",\"note\":\"Test ordonnance\",\"items\":[{\"nom_produit\":\"Aspirine 500mg\",\"medication_code\":\"ASP500\",\"posologie\":\"1 comprimé 2x/jour\",\"prix_unitaire\":5000}]}"
```

**Réponse attendue :**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-ordonnance",
    "type": "unique",
    "prix_total": 5000,
    "items": [...]
  }
}
```

---

### Test 5: Créer une Commande

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"ordonnance_id\":\"uuid-ordonnance\",\"pharmacie_id\":\"uuid-pharmacie\",\"patient_id\":\"uuid-patient\",\"requiert_ordonnance\":true}"
```

---

### Test 6: Mettre à Jour Statut Commande

```bash
curl -X PUT http://localhost:5000/api/orders/uuid-commande/status \
  -H "Content-Type: application/json" \
  -d "{\"statut\":\"accepte\",\"message_pharmacie\":\"Commande acceptée, prête dans 30 min\"}"
```

---

### Test 7: Envoyer un Message

```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d "{\"order_id\":\"uuid-commande\",\"expediteur_type\":\"patient\",\"expediteur_id\":\"uuid-patient\",\"contenu\":\"Bonjour, je passe quand ?\"}"
```

---

### Test 8: Voir Messages d'une Commande

```bash
curl http://localhost:5000/api/messages/order/uuid-commande
```

---

### Tests avec Swagger UI (Recommandé)

1. **Ouvrez votre navigateur**
   ```
   http://localhost:5000/api-docs
   ```

2. **Pour tester un endpoint :**
   - Cliquez sur la route souhaitée
   - Cliquez sur **Try it out**
   - Remplissez les champs
   - Cliquez sur **Execute**
   - Voyez la réponse en temps réel

3. **Pour les routes authentifiées :**
   - Cliquez sur le cadenas 🔒 en haut
   - Entrez votre token JWT (sans "Bearer ")
   - Cliquez **Authorize**

---

## ❌ Codes d'Erreur

| Code | Signification | Causes Courantes | Solution |
|------|---------------|------------------|----------|
| **400** | Bad Request | Données invalides, champs manquants | Vérifiez le corps de la requête |
| **401** | Unauthorized | Token manquant, expiré ou invalide | Reconnectez-vous, vérifiez le header |
| **403** | Forbidden | Rôle insuffisant | Vérifiez les permissions |
| **404** | Not Found | Ressource inexistante | Vérifiez l'ID dans l'URL |
| **500** | Server Error | Bug serveur, DB connection | Vérifiez les logs du serveur |

---

## 🔌 WebSocket (Socket.io)

### Connexion

**URL :** `http://localhost:5000` (même port que l'API)

**Bibliothèque Client :**
```bash
npm install socket.io-client
```

### Configuration Côté Client

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling']
});

// Écouter la connexion
socket.on('connect', () => {
  console.log('Connecté au serveur Socket.io');
});

// Rejoindre une room (ex: room d'une commande)
socket.emit('join', 'order_990e8400-e29b-41d4-a716-446655440004');

// Écouter les nouveaux messages
socket.on('newMessage', (message) => {
  console.log('Nouveau message reçu:', message);
  // Mettre à jour l'UI ici
});

// Déconnexion
socket.on('disconnect', () => {
  console.log('Déconnecté du serveur');
});
```

### Événements Disponibles

| Événement | Direction | Description | Données |
|-----------|-----------|-------------|---------|
| `connect` | Serveur → Client | Connexion établie | Aucun |
| `disconnect` | Serveur → Client | Connexion perdue | Aucun |
| `join` | Client → Serveur | Rejoindre une room | `room: string` (ex: `order_{id}`) |
| `newMessage` | Serveur → Client | Nouveau message | `message: object` |

### Exemple Complet Chat en Temps Réel

```javascript
import { io } from 'socket.io-client';

class ChatService {
  constructor(orderId) {
    this.socket = io('http://localhost:5000');
    this.orderId = orderId;
    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Connecté');
      this.socket.emit('join', `order_${this.orderId}`);
    });

    this.socket.on('newMessage', (message) => {
      console.log('📨 Nouveau message:', message);
      // Callback pour mettre à jour l'UI
      if (this.onMessageReceived) {
        this.onMessageReceived(message);
      }
    });
  }

  // Envoyer un message (via API REST, pas Socket)
  async sendMessage(senderType, senderId, content) {
    const response = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({
        order_id: this.orderId,
        expediteur_type: senderType,
        expediteur_id: senderId,
        contenu: content
      })
    });
    return response.json();
  }

  onMessageReceived(callback) {
    this.onMessageReceived = callback;
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Utilisation
const chat = new ChatService('990e8400-e29b-41d4-a716-446655440004');
chat.onMessageReceived((message) => {
  // Mettre à jour l'interface utilisateur
  addMessageToUI(message);
});
```

---

## ✅ Bonnes Pratiques

### 1. **Gestion des Tokens JWT**

```javascript
// ❌ MAUVAIS - Stockage en clair dans localStorage
localStorage.setItem('token', token);

// ✅ BON - Utilisation de cookies httpOnly (côté serveur)
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 3600000 // 1 heure
});
```

### 2. **Intercepteur Axios**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Ajouter le token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer les erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. **Validation des Données**

Toujours valider côté frontend AVANT d'envoyer :

```javascript
function validatePatientRegistration(data) {
  const errors = {};

  if (!data.nom || data.nom.trim() === '') {
    errors.nom = 'Le nom est requis';
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email invalide';
  }

  if (!data.mot_de_passe || data.mot_de_passe.length < 8) {
    errors.mot_de_passe = 'Le mot de passe doit contenir au moins 8 caractères';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

### 4. **Gestion des Erreurs**

```javascript
async function createOrder(orderData) {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      // Erreur API
      showError(error.response.data.message);
    } else if (error.request) {
      // Pas de réponse du serveur
      showError('Impossible de joindre le serveur');
    } else {
      // Erreur de configuration
      showError('Une erreur est survenue');
    }
    throw error;
  }
}
```

### 5. **WebSocket Reconnexion**

```javascript
const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnecté après ${attemptNumber} tentatives`);
  // Rejoindre à nouveau les rooms
  socket.emit('join', `order_${orderId}`);
});
```

---

## ❓ FAQ

### Q1: Comment tester l'API rapidement ?

**R:** Utilisez Swagger UI :
```
http://localhost:5000/api-docs
```
Cliquez sur "Try it out" pour chaque endpoint.

---

### Q2: Le token JWT expire, que faire ?

**R:** Actuellement, le token expire après **1 heure**. Vous devez :
- Soit reconnecter l'utilisateur
- Soit implémenter un système de refresh token (non inclus actuellement)

Pour changer la durée, modifiez `.env` :
```
JWT_EXPIRES_IN=24h
```

---

### Q3: Comment fonctionne le QR Code ?

**R:** Le QR Code n'est **pas encore implémenté** dans le backend. Le champ `qr_code_url` existe dans le modèle Doctor et Prescription pour une future implémentation.

---

### Q4: Les routes sont-elles protégées ?

**R:** Actuellement, le middleware d'authentification est **commenté** sur la plupart des routes pour faciliter le développement en phase de test.

Pour activer la protection, décommentez cette ligne dans les fichiers de routes :
```javascript
const { protect } = require('../middlewares/auth.middleware');

// Exemple de protection
router.get('/:id', protect(['patient']), patientController.getPatientProfile);
```

---

### Q5: Comment ajouter un rôle Admin ?

**R:** Le middleware `protect()` supporte déjà les rôles :
```javascript
// Dans le controller
const { protect } = require('../middlewares/auth.middleware');

// Route protégée pour admin uniquement
router.delete('/:id', protect(['admin']), controller.deleteResource);
```

Vous devez :
1. Ajouter le rôle `admin` dans le JWT
2. Créer les routes auth pour admin
3. Protéger les routes sensibles

---

### Q6: Comment fonctionne la messagerie temps réel ?

**R:** La messagerie utilise deux mécanismes :
1. **API REST** : Pour envoyer et récupérer les messages
2. **Socket.io** : Pour la diffusion en temps réel

Quand un message est envoyé via REST, un événement `newMessage` est émis via Socket.io aux clients connectés dans la room de la commande.

---

### Q7: Comment gérer les uploads de fichiers ?

**R:** `multer` est installé mais pas encore configuré. Pour implémenter l'upload :

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});
```

---

### Q8: La base de données PostgreSQL ne se connecte pas ?

**R:** Vérifiez :
1. PostgreSQL est démarré : `pg_isready`
2. Les variables d'environnement dans `.env` sont correctes
3. La base `medapp_db` existe : `psql -U postgres -l | findstr medapp_db`

---

## 📞 Support & Contact

Pour toute question ou problème :
- **Vérifiez les logs du serveur** (terminal où `npm run dev` est lancé)
- **Consultez Swagger UI** pour la documentation interactive
- **Examinez les fichiers de routes** dans `src/routes/` pour comprendre le comportement

---

## 🔄 Changelog

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0.0 | 12/04/2026 | Documentation initiale, endpoints de base |

---

**🎉 Fin de la documentation - Bonne intégration Frontend !**

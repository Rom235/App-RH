# Apprendre a coder une application RH

Ce dossier contient une mini application de gestion des employes pour apprendre les bases du developpement web.

## Ce que tu vas apprendre

- Structurer une page avec HTML
- Styliser une interface avec CSS
- Coder la logique metier avec JavaScript
- Sauvegarder des donnees dans le navigateur avec `localStorage`

## Fichiers

- `index.html`: structure de l interface
- `styles.css`: design de l application
- `app.js`: logique JavaScript (ajout, filtre, suppression)

## Lancer l application

Ouvre simplement `index.html` dans ton navigateur.

## Parcours d apprentissage (45 a 90 min)

1. Lis `index.html` et repere les sections principales (`form`, `input`, `ul`).
2. Ouvre `app.js` et suis l ordre:
   - `state`
   - les `addEventListener`
   - `filterEmployees()`
   - `render()`
3. Fais ces exercices dans cet ordre:
   - Exercice 1: ajouter le champ `salaire` dans le formulaire et dans la liste.
   - Exercice 2: empecher les emails en doublon.
   - Exercice 3: ajouter un tri par departement.
   - Exercice 4: ajouter un bouton "Exporter en JSON".

## Prochaine etape

Quand tu maitrises cette version, on peut evoluer vers:

- React + TypeScript (front)
- Node.js + Express (API)
- Base de donnees SQLite ou PostgreSQL
- Authentification (JWT)

## Workflow Git

- `main` : version stable et livrable.
- `dev` : branche d integration pour tester les nouveautes.
- `feature/...` : une branche par fonctionnalite.

Exemple de cycle:

1. Créer une branche feature depuis `dev`.
2. Développer et tester.
3. Committer avec un message clair.
4. Pousser la branche sur GitHub.
5. Faire une pull request vers `dev`.

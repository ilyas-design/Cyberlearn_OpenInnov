# chabot_api

Petit serveur API qui proxifie vers une implémentation OpenAI-compatible (vLLM local ou service externe).

## Prérequis
- Docker & Docker Compose
- (Optionnel) GPU NVIDIA + nvidia-container-toolkit pour vLLM local

## Variables d'environnement (.env)
Exemple minimal (pas d'espaces autour du `=`) :
```
MODEL_NAME=HuggingFaceTB/SmolLM2-135M-Instruct
MODEL_URL=http://model:8000/v1
OPENAI_API_KEY=dummy_api_key_for_testing_purposes
COMPOSE_PROFILES=local_model
```

## Lancer avec Docker Compose
Rebuild & up :
```bash
docker compose build --no-cache api
docker compose up -d --build
```
Voir logs :
```bash
docker compose logs -f api
docker compose logs -f model
```

## Endpoints utiles / Debug
Lister les modèles (hôte) :
```bash
curl -sS http://localhost:8000/v1/models | jq .
```
Depuis le conteneur API (réseau interne) :
```bash
docker compose exec api curl -sS http://model:8000/v1/models | jq .
```
Note : `MODEL_URL` doit pointer sur la racine OpenAI `/v1` (ex. `http://model:8000/v1`) — ne pas doubler `/models`.

## Comportement des logs / prints
Le buffering Python est désactivé dans le Dockerfile via `ENV PYTHONUNBUFFERED=1` pour que les `print()` s'affichent immédiatement.

## Erreurs fréquentes
- `Missing credentials` → définir `OPENAI_API_KEY` ou passer `api_key` au client OpenAI.
- vLLM local échoue sans GPU → utiliser une machine avec GPU ou ne pas lancer le service `model` et pointer `MODEL_URL` vers un service externe OpenAI-compatible.
- Healthcheck 404 → vérifie que `MODEL_URL` fini par `/v1` et que ton code n'ajoute pas `/models` en double.

## Fichiers importants
- app/services/model_services.py — wrapper du client OpenAI
- Dockerfile — PYTHONUNBUFFERED=1
- docker-compose.yml — configuration des services `api` et `model`

## Debug rapide
1. Vérifier modèles disponibles :
   `curl http://localhost:8000/v1/models`
2. Vérifier que l'API appelle `/v1/models` (pas `/v1/models/models`) via les logs.
3. Si besoin, colle les logs et le contenu de `app/core/config.py` pour diagnostic.

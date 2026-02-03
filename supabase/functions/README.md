# Supabase Edge Functions

## delete-account

Permite al usuario borrar su propia cuenta. Requiere desplegar la función en Supabase.

### Despliegue

```bash
# Desde la raíz del proyecto (tennis-ml-frontend)
cd supabase

# Si no tienes Supabase CLI instalado:
# npm install -g supabase

# Login (solo la primera vez)
supabase login

# Vincular al proyecto (obtén el project ref del dashboard)
supabase link --project-ref TU_PROJECT_REF

# Desplegar la función
supabase functions deploy delete-account
```

La función usa automáticamente `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el entorno de Supabase.

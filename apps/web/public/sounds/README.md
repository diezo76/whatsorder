# Sons de notification

Ce dossier contient les fichiers audio pour les notifications temps réel.

## Fichiers requis

- `new-order.mp3` - Son pour nouvelle commande
- `message.mp3` - Son pour nouveau message

## Téléchargement

Vous pouvez télécharger des sons gratuits depuis :
- https://freesound.org/
- https://mixkit.co/free-sound-effects/

### Suggestions de sons

**new-order.mp3** :
- Son de notification doux mais audible
- Durée : 1-2 secondes
- Format : MP3, 44.1kHz

**message.mp3** :
- Son de notification discret
- Durée : 0.5-1 seconde
- Format : MP3, 44.1kHz

## Alternative : Utiliser des URLs externes

Si vous préférez utiliser des URLs externes, modifiez les hooks dans :
- `apps/web/hooks/useRealtimeOrders.ts` (ligne ~40)
- `apps/web/hooks/useRealtimeMessages.ts` (ligne ~60)

Exemple :
```typescript
const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
```

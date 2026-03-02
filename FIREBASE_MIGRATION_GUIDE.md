# Supabase to Firebase Migration Guide

This guide ensures a seamless transition of the Bazinga backend from Supabase to Firebase, keeping the actual feature logic strictly un-touched. You will perform updates by replacing the Supabase configurations and mapping queries where applicable.

## 1. Firebase Console Setup

To configure Firebase Console to align with your `CONTEXT.md` specifications:

1. **Create Firebase Project**: Navigate to the [Firebase Console](https://console.firebase.google.com/) and create a new project named "Bazinga".
2. **Enable Authentication**:
   - Go to **Build** > **Authentication**.
   - Click "Get Started" and enable **Email/Password**.
3. **Enable Firestore**:
   - Go to **Build** > **Firestore Database**.
   - Create Database.
   - Start in Test Mode initially (or configure rules based on the collections below).
   - Once created, ensure you use collections representing your Supabase tables.
4. **Enable Storage**:
   - Go to **Build** > **Storage**.
   - Click "Get Started" to initialize your storage buckets.
5. **Get Credentials**:
   - Go to Project Settings (Gear icon) > General.
   - Under "Your apps", add a Web app.
   - Copy the configuration object and add it to your `.env` variables (e.g., `VITE_FIREBASE_API_KEY`, etc.).

### Firestore Collections Needed
Create the following root collections in your Firestore matching your Supabase tables:
- `profiles`
- `dating_matches`
- `dating_conversations`
- `dating_messages`
- `connections`
- `messages`
- `clubs`
- `club_members`
- `club_messages`
- `campus_events`
- `event_rsvps`
- `posts`
- `anon_posts`

## 2. Replacing the Supabase Client

Your existing code relies heavily on `src/integrations/supabase/client.ts`. To ensure existing components do not outright break visually (though they will need syntax swaps below), we recommend **phasing out** `supabase` imports gracefully.

Because the command structures are different, simply aliasing Firebase as `supabase` will cause runtime errors since the SDK is completely altered.

**Updating `client.ts`**:
Instead of completely removing `src/integrations/supabase/client.ts`, you can deprecate it by pointing data fetchers toward the new `src/lib/firebase.ts`.
In every component currently using `import { supabase } from "@/integrations/supabase/client"`, replace it with:
```typescript
import { db, auth, storage } from "@/lib/firebase";
```

## 3. Query Mapping Guide (Supabase to Firestore)

To update standard operations within your UI and hook logic, here is the translation layer when refactoring your data-fetching methods.

### Getting a Single Document (e.g. Profile)
**Supabase**:
```typescript
const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
```
**Firestore**:
```typescript
import { doc, getDoc } from 'firebase/firestore';

const docRef = doc(db, 'profiles', userId);
const snapshot = await getDoc(docRef);
const data = snapshot.exists() ? snapshot.data() : null;
```

### Querying Multiple Documents
**Supabase**:
```typescript
const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
```
**Firestore**:
```typescript
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const postsRef = collection(db, 'posts');
const q = query(postsRef, orderBy('created_at', 'desc'));
const snapshot = await getDocs(q);
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### Inserting Data
**Supabase**:
```typescript
const { data } = await supabase.from('messages').insert({ content: "Hello", sender_id: userId });
```
**Firestore**:
```typescript
import { collection, addDoc } from 'firebase/firestore';

const messagesRef = collection(db, 'messages');
const docRef = await addDoc(messagesRef, { content: "Hello", sender_id: userId });
// The ID generated is docRef.id
```

### Updating Data
**Supabase**:
```typescript
const { data } = await supabase.from('profiles').update({ bio: "New bio" }).eq('id', userId);
```
**Firestore**:
```typescript
import { doc, updateDoc } from 'firebase/firestore';

const docRef = doc(db, 'profiles', userId);
await updateDoc(docRef, { bio: "New bio" });
```

### Real-time Subscriptions (Chat, Matches)
**Supabase**:
```typescript
supabase.channel('custom-all-channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
    console.log('Change received!', payload)
  }).subscribe()
```
**Firestore**:
```typescript
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const q = query(collection(db, 'messages'), where('chat_id', '==', chatId));
const unsubscribe = onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
        console.log("New message: ", change.doc.data());
    }
  });
});
```

Follow this manual whenever resolving TypeScript/runtime errors in your components. They will map 1:1 functionally!

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  getDocFromServer,
  type Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { VinylTrackSource } from '../utils/engineeringMath';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionTested = false;
export async function testFirestoreConnection(): Promise<void> {
  if (connectionTested) return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'notebook_entries', 'connection_check'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export interface NotebookEntry {
  id: string;
  name: string;
  role: string;
  message: string;
  createdAt: Date | null;
}

const COLLECTION_NAME = 'notebook_entries';

export function subscribeToNotebookEntries(
  onData: (entries: NotebookEntry[]) => void,
  onError: (err: Error) => void
): () => void {
  void testFirestoreConnection();

  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: NotebookEntry[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const ts = data.createdAt as Timestamp | null | undefined;
        return {
          id: docSnap.id,
          name: typeof data.name === 'string' ? data.name : 'Visitor',
          role: typeof data.role === 'string' ? data.role : '',
          message: typeof data.message === 'string' ? data.message : '',
          createdAt: ts && typeof ts.toDate === 'function' ? ts.toDate() : null,
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function createNotebookEntry(payload: {
  name: string;
  role: string;
  message: string;
}): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name: payload.name,
      role: payload.role,
      message: payload.message,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export interface PersistedVinylTrack {
  id: string;
  title: string;
  artist: string;
  pickedBy: string;
  streamUrl: string;
  artworkUrl: string;
  source: VinylTrackSource;
  plays: number;
  createdAt: Date | null;
}

const VINYL_COLLECTION_NAME = 'vinyl_tracks';

export function subscribeToVinylTracks(
  onData: (tracks: PersistedVinylTrack[]) => void,
  onError: (err: Error) => void
): () => void {
  void testFirestoreConnection();

  const q = query(
    collection(db, VINYL_COLLECTION_NAME),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: PersistedVinylTrack[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const ts = data.createdAt as Timestamp | null | undefined;
          const src = data.source;
          if (src !== 'audius' && src !== 'direct') {
            return null;
          }
          const streamUrl = typeof data.streamUrl === 'string' ? data.streamUrl : '';
          if (!streamUrl.startsWith('https://')) {
            return null;
          }
          return {
            id: docSnap.id,
            title: typeof data.title === 'string' ? data.title : 'Untitled Track',
            artist: typeof data.artist === 'string' ? data.artist : 'Unknown Artist',
            pickedBy: typeof data.pickedBy === 'string' ? data.pickedBy : "Visitor's pick",
            streamUrl,
            artworkUrl: typeof data.artworkUrl === 'string' ? data.artworkUrl : '',
            source: src,
            plays: typeof data.plays === 'number' ? data.plays : 1,
            createdAt: ts && typeof ts.toDate === 'function' ? ts.toDate() : null,
          };
        })
        .filter((item): item is PersistedVinylTrack => item !== null);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, VINYL_COLLECTION_NAME);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function createVinylTrack(payload: {
  title: string;
  artist: string;
  pickedBy: string;
  streamUrl: string;
  artworkUrl: string;
  source: VinylTrackSource;
}): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, VINYL_COLLECTION_NAME), {
      title: payload.title,
      artist: payload.artist,
      pickedBy: payload.pickedBy,
      streamUrl: payload.streamUrl,
      artworkUrl: payload.artworkUrl,
      source: payload.source,
      plays: 1,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, VINYL_COLLECTION_NAME);
  }
}

export async function incrementVinylTrackPlays(trackId: string): Promise<void> {
  try {
    await updateDoc(doc(db, VINYL_COLLECTION_NAME, trackId), {
      plays: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${VINYL_COLLECTION_NAME}/${trackId}`);
  }
}

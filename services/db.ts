import { TOPICS as initialTopics } from '../constants';
import { Topic } from '../types';

const DB_NAME = 'PythonDSADatabase';
const DB_VERSION = 1;
const STORE_NAME = 'topics';

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Initializes and returns a promise that resolves with the IDBDatabase instance.
 * Handles database creation, versioning, and initial data seeding.
 */
const getDb = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Check if the database needs to be seeded with initial data.
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
          // The store is empty, so let's seed it.
          const writeTransaction = db.transaction(STORE_NAME, 'readwrite');
          const writeStore = writeTransaction.objectStore(STORE_NAME);
          initialTopics.forEach(topic => writeStore.put(topic));
          
          writeTransaction.oncomplete = () => resolve(db);
          writeTransaction.onerror = () => reject(writeTransaction.error);
        } else {
          // Data already exists, no need to seed.
          resolve(db);
        }
      };
      countRequest.onerror = () => reject(countRequest.error);
    };

    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
  return dbPromise;
};

/**
 * Fetches all topics from the IndexedDB database.
 * @returns A promise that resolves with an array of all topics.
 */
export const getAllTopics = async (): Promise<Topic[]> => {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort topics by category and then title for consistent ordering
      const sortedTopics = request.result.sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
      });
      resolve(sortedTopics);
    };

    request.onerror = () => {
      console.error('Error fetching topics:', request.error);
      reject(request.error);
    };
  });
};

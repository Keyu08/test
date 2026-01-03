import { DatasetMetadata, AnalysisPlan, AnalysisRun } from './types';

const DB_NAME = 'methodica_db';
const DB_VERSION = 1;

const STORES = {
  DATASETS: 'datasets',
  PLANS: 'plans',
  RUNS: 'runs',
};

let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.DATASETS)) {
        db.createObjectStore(STORES.DATASETS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.PLANS)) {
        db.createObjectStore(STORES.PLANS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.RUNS)) {
        db.createObjectStore(STORES.RUNS, { keyPath: 'id' });
      }
    };
  });
}

export async function saveDataset(dataset: DatasetMetadata): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([STORES.DATASETS], 'readwrite');
  const store = transaction.objectStore(STORES.DATASETS);

  return new Promise((resolve, reject) => {
    const request = store.put(dataset);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getDataset(id: string): Promise<DatasetMetadata | undefined> {
  const db = await initDB();
  const transaction = db.transaction([STORES.DATASETS], 'readonly');
  const store = transaction.objectStore(STORES.DATASETS);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getAllDatasets(): Promise<DatasetMetadata[]> {
  const db = await initDB();
  const transaction = db.transaction([STORES.DATASETS], 'readonly');
  const store = transaction.objectStore(STORES.DATASETS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteDataset(id: string): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([STORES.DATASETS], 'readwrite');
  const store = transaction.objectStore(STORES.DATASETS);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function savePlan(plan: AnalysisPlan): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([STORES.PLANS], 'readwrite');
  const store = transaction.objectStore(STORES.PLANS);

  return new Promise((resolve, reject) => {
    const request = store.put(plan);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getPlan(id: string): Promise<AnalysisPlan | undefined> {
  const db = await initDB();
  const transaction = db.transaction([STORES.PLANS], 'readonly');
  const store = transaction.objectStore(STORES.PLANS);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getAllPlans(): Promise<AnalysisPlan[]> {
  const db = await initDB();
  const transaction = db.transaction([STORES.PLANS], 'readonly');
  const store = transaction.objectStore(STORES.PLANS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deletePlan(id: string): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([STORES.PLANS], 'readwrite');
  const store = transaction.objectStore(STORES.PLANS);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function saveRun(run: AnalysisRun): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([STORES.RUNS], 'readwrite');
  const store = transaction.objectStore(STORES.RUNS);

  return new Promise((resolve, reject) => {
    const request = store.put(run);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getRun(id: string): Promise<AnalysisRun | undefined> {
  const db = await initDB();
  const transaction = db.transaction([STORES.RUNS], 'readonly');
  const store = transaction.objectStore(STORES.RUNS);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getAllRuns(): Promise<AnalysisRun[]> {
  const db = await initDB();
  const transaction = db.transaction([STORES.RUNS], 'readonly');
  const store = transaction.objectStore(STORES.RUNS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteRun(id: string): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([STORES.RUNS], 'readwrite');
  const store = transaction.objectStore(STORES.RUNS);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

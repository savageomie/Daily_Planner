import {
  db,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { Milestone, DayRecord, CustomTask, Category } from '../types';

export function subscribeToUserMilestones(
  userId: string,
  onUpdate: (milestones: Milestone[]) => void
): () => void {
  const colPath = `users/${userId}/milestones`;
  const q = collection(db, 'users', userId, 'milestones');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Milestone[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Milestone);
      });
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, colPath);
    }
  );
}

export function subscribeToUserRecords(
  userId: string,
  onUpdate: (records: Record<string, DayRecord>) => void
): () => void {
  const colPath = `users/${userId}/records`;
  const q = collection(db, 'users', userId, 'records');
  return onSnapshot(
    q,
    (snapshot) => {
      const recs: Record<string, DayRecord> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        recs[docSnap.id] = {
          completedMilestoneIds: data.completedMilestoneIds || [],
          note: data.note || undefined,
          energyLevel: data.energyLevel || undefined,
        };
      });
      onUpdate(recs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, colPath);
    }
  );
}

export function subscribeToUserTasks(
  userId: string,
  onUpdate: (tasks: CustomTask[]) => void
): () => void {
  const colPath = `users/${userId}/tasks`;
  const q = collection(db, 'users', userId, 'tasks');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CustomTask[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CustomTask);
      });
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, colPath);
    }
  );
}

export function subscribeToUserCategories(
  userId: string,
  onUpdate: (categories: Category[]) => void
): () => void {
  const colPath = `users/${userId}/categories`;
  const q = collection(db, 'users', userId, 'categories');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Category[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Category);
      });
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, colPath);
    }
  );
}

export async function saveMilestoneToFirestore(userId: string, milestone: Milestone): Promise<void> {
  const path = `users/${userId}/milestones/${milestone.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'milestones', milestone.id), {
      ...milestone,
      userId,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteMilestoneFromFirestore(userId: string, milestoneId: string): Promise<void> {
  const path = `users/${userId}/milestones/${milestoneId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'milestones', milestoneId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveRecordToFirestore(
  userId: string,
  dateStr: string,
  record: DayRecord
): Promise<void> {
  const path = `users/${userId}/records/${dateStr}`;
  try {
    await setDoc(doc(db, 'users', userId, 'records', dateStr), {
      date: dateStr,
      userId,
      completedMilestoneIds: record.completedMilestoneIds || [],
      note: record.note || '',
      energyLevel: record.energyLevel || 0,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveCustomTaskToFirestore(userId: string, task: CustomTask): Promise<void> {
  const path = `users/${userId}/tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'tasks', task.id), {
      ...task,
      userId,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteCustomTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveCategoryToFirestore(userId: string, category: Category): Promise<void> {
  const path = `users/${userId}/categories/${category.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'categories', category.id), {
      ...category,
      userId,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveUserProfile(
  userId: string,
  profile: { email: string | null; displayName: string | null; photoURL: string | null }
): Promise<void> {
  const path = `users/${userId}`;
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        userId,
        email: profile.email || '',
        displayName: profile.displayName || '',
        photoURL: profile.photoURL || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

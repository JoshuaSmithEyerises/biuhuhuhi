import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  CollectionReference,
  DocumentData,
  addDoc,
  updateDoc,
  Timestamp,
  getDoc,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private workordersRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.workordersRef = collection(this.firestore, 'WorkOrders');
  }

  /** Fetch a single workorder by its Firestore document ID */
async getWorkOrderById(id: string): Promise<any | null> {
  if (!id) {
    console.error('Cannot fetch workorder: ID is missing');
    return null;
  }

  try {
    const docRef = doc(this.firestore, 'WorkOrders', id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.warn(`WorkOrder with ID ${id} not found`);
      return null;
    }

    // Return the data with the Firestore document ID included
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('Error fetching workorder by ID:', err);
    return null;
  }
}


  async getAllWorkOrders(): Promise<any[]> {
    const q = query(this.workordersRef, orderBy('created', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,        // Attach Firestore document ID
      ...docSnap.data()
    }));
  }

  async getActiveWorkOrders(): Promise<any[]> {
    const q = query(this.workordersRef, where('status', '!=', 2));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  }

  async createWorkOrder(workorder: any) {
  const newWorkOrder = {
    applianceID: workorder.applianceID,
    notes: workorder.notes,
    status: 0,
    created: Timestamp.now()
  };
  const docRef = await addDoc(this.workordersRef, newWorkOrder);
  console.log('WorkOrder created with ID:', docRef.id);
  return docRef.id;  // This is the actual Firestore document ID
}

  async updateWorkOrder(workorder: any): Promise<void> {
    if (!workorder.id) throw new Error('Missing workorder ID');
    const docRef = doc(this.firestore, 'WorkOrders', workorder.id);
    await updateDoc(docRef, {
      applianceID: workorder.applianceID,
      notes: workorder.notes,
      status: workorder.status,
    });
  }

  async updateStatus(id: string, status: number): Promise<void> {
    if (!id) throw new Error('Missing workorder ID');
    const docRef = doc(this.firestore, 'WorkOrders', id);
    await updateDoc(docRef, { status });
  }

  async deleteWorkOrder(id: string): Promise<void> {
    if (!id) throw new Error('Missing workorder ID');
    const docRef = doc(this.firestore, 'WorkOrders', id);
    await deleteDoc(docRef);
  }
}

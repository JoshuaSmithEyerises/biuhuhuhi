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
  Timestamp
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private workordersRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.workordersRef = collection(this.firestore, 'WorkOrders');
  }

  /** Get all active work orders (optionally ordered by creation date) */ 
  async getActiveWorkOrders(): Promise<any[]> 
  { const q = query(this.workordersRef, where('status', '!=', 2)); 
    const snapshot = await getDocs(q); return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); }
  
async getAllWorkOrders(): Promise<any[]>{
  const q = query(this.workordersRef,  orderBy('created', 'desc'));

  const snapshot = await getDocs(q); return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

}

async createWorkOrder(workorder: any) {
    try {
      const colRef = collection(this.firestore, 'WorkOrders');

      const newWorkOrder = {
      ...workorder,
      status: 0,              // Always default status to 0
      created: Timestamp.now() // Use Firestore timestamp for creation time
    };

      const docRef = await addDoc(colRef, newWorkOrder);
      console.log('WorkOrder created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding workorder:', error);
      throw error;
    }
  }

  /** Delete a work order by its document ID */
  async deleteWorkOrder(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'WorkOrders', id);
    await deleteDoc(docRef);
  }

  async updateStatus(id: string, status: number): Promise<void> {
    const docRef = doc(this.firestore, 'WorkOrders', id);
    await updateDoc(docRef, { status });
    console.log(`WorkOrder ${id} status updated to ${status}`);
  }
 
  async getWorkOrdersByAddress(address: string): Promise<any[]> {
    const q = query(this.workordersRef, where('address', '==', address));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  }

  
}

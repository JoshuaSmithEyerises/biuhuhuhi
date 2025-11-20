import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
updateDoc,
  CollectionReference,
} from '@angular/fire/firestore';

export interface Appliance {
  id: string;
  address?: string;
  type?: string;
  model?: string;
  serial?: string;
  Manufacture_Year?: number;
}

@Injectable({ providedIn: 'root' })
export class ApplianceService {
  constructor(private firestore: Firestore) {}

  async deleteAppliance(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'Appliances', id);
    await deleteDoc(docRef);
  }

  async createAppliance(appliance: any) {
    try {
      const colRef = collection(this.firestore, 'Appliances');
      const docRef = await addDoc(colRef, appliance);
      console.log('Appliance created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding appliance:', error);
      throw error;
    }
  }

  async getAllAppliances() {
    const snapshot = await getDocs(collection(this.firestore, 'Appliances'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

 async updateAppliance(appliance: any): Promise<void> {
  if (!appliance.id) throw new Error('Cannot update appliance: ID missing');
  console.log('Updating appliance in Firestore:', appliance);
  const docRef = doc(this.firestore, 'Appliances', appliance.id);
  await updateDoc(docRef, {
    address: appliance.address,
    type: appliance.type,
    model: appliance.model,
    Manufacture_Year: appliance.Manufacture_Year,
    serial: appliance.serial
  });
  console.log('Appliance updated successfully in Firestore');
}

 async getApplianceById(id: string): Promise<Appliance | undefined> {
  const docRef = doc(this.firestore, 'Appliances', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data() as Appliance;
    return { ...data, id: data.id || docSnap.id };
  }
  return undefined;
}

  async getAppliancesByAddress(address: string) {
    console.log('Fetching appliances for address:', address);

    const q = query(
      collection(this.firestore, 'Appliances'),
      where('address', '==', address),
    );

    const snapshot = await getDocs(q);
    console.log('Found', snapshot.size, 'Appliances');

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}

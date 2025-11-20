import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { ApplianceService } from '../../services/appliance.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1>Appliance Manager</h1>

      <form (ngSubmit)="submitForm()">
        <h2>{{ isEdit ? 'Edit Appliance' : 'Add New Appliance' }}</h2>
        <input type="text" placeholder="Address" [(ngModel)]="newAppliance.address" name="address" required />
        <input type="text" placeholder="Type" [(ngModel)]="newAppliance.type" name="type" required />
        <input type="text" placeholder="Model" [(ngModel)]="newAppliance.model" name="model" required />
        <input type="number" placeholder="Manufacture Year" [(ngModel)]="newAppliance.Manufacture_Year" name="year" required />
        <input type="text" placeholder="Serial Number" [(ngModel)]="newAppliance.serial" name="serial" required />
        <button type="submit">{{ isEdit ? 'Save Changes' : 'Add Appliance' }}</button>
        <button *ngIf="isEdit" type="button" (click)="cancelEdit()">Cancel</button>
      </form>

      <h2>All Appliances</h2>
      <div class='wide-table'>
        <ul *ngIf="appliances.length > 0; else noAppliances">
          <!-- Table Header -->
          <li>
            <div class='table-cell'><strong>Address</strong></div>
            <div class='table-cell'><strong>Type</strong></div>
            <div class='table-cell'><strong>Model</strong></div>
            <div class='table-cell'><strong>Manufacture Year</strong></div>
            <div class='table-cell'><strong>&nbsp;</strong></div>
            <div class='table-cell'><strong>&nbsp;</strong></div>
            <div class='table-cell'><strong>&nbsp;</strong></div>
          </li>

          <!-- Table Rows -->
          <li *ngFor="let appliance of appliances">
            <div class='table-cell'>{{ appliance.address }}</div>
            <div class='table-cell'>{{ appliance.type }}</div>
            <div class='table-cell'>{{ appliance.model }}</div>
            <div class='table-cell'>{{ appliance.Manufacture_Year }}</div>
            <div class='table-cell'><button type="button" (click)="goToWorkOrder(appliance.id)">File WorkOrder</button></div>
            <div class='table-cell'><button type="button" (click)="editAppliance(appliance)">Edit</button></div>
            <div class='table-cell'><button type="button" (click)="delete(appliance.id)">Delete</button></div>
          </li>
        </ul>
      </div>

      <ng-template #noAppliances>
        <p>No appliances found.</p>
      </ng-template>
    </div>
  `
})
export class ApplianceManagerComponent implements OnInit {
  appliances: any[] = [];

  newAppliance: any = {
    id: '', // Document name from Firestore
    address: '',
    type: '',
    model: '',
    Manufacture_Year: 0,
    serial: ''
  };

  isEdit = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private applianceService: ApplianceService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('Initializing ApplianceManagerComponent...');
    await this.loadAppliances();
  }

  async loadAppliances() {
    console.log('Loading appliances from Firestore...');
    this.appliances = await this.applianceService.getAllAppliances();
    console.log('Appliances loaded:', this.appliances);
    this.cdr.detectChanges();
  }

  async submitForm() {
  console.log('Form submitted. isEdit=', this.isEdit, 'newAppliance=', this.newAppliance);
  if (this.isEdit) {
    await this.saveChanges();
  } else {
    await this.addAppliance();
  }
}
  async addAppliance() {
    try {
      console.log('Adding appliance:', this.newAppliance);
      const id = await this.applianceService.createAppliance(this.newAppliance);
      console.log('Appliance added with ID:', id);

      this.newAppliance = { id: '', address: '', type: '', model: '', Manufacture_Year: 0, serial: '' };
      await this.loadAppliances();
    } catch (error) {
      console.error('Failed to add appliance:', error);
    }
  }

  editAppliance(appliance: any) {
  console.log('Editing appliance:', appliance);
  this.isEdit = true;
  this.newAppliance = { ...appliance }; 
  console.log('Form prefilled with appliance:', this.newAppliance);

   this.cdr.detectChanges();
}

  async saveChanges() {
  console.log('saveChanges called. Current appliance:', this.newAppliance);
  if (!this.newAppliance.id) {
    console.error('Cannot save changes: Appliance ID missing.', this.newAppliance);
    return;
     this.cdr.detectChanges();
  }
  await this.applianceService.updateAppliance(this.newAppliance);
  console.log('saveChanges completed for appliance:', this.newAppliance.id);
  this.isEdit = false;
  this.newAppliance = { id: '', address: '', type: '', model: '', Manufacture_Year: 0, serial: '' };
  await this.loadAppliances();
}
  cancelEdit() {
    console.log('Cancelling edit.');
    this.isEdit = false;
    this.newAppliance = { id: '', address: '', type: '', model: '', Manufacture_Year: 0, serial: '' };
     this.cdr.detectChanges();
  }

  async delete(id: string) {
    console.log('Deleting appliance with ID:', id);
    await this.applianceService.deleteAppliance(id);
    await this.loadAppliances();
  }

  goToWorkOrder(applianceId: string) {
    console.log('Navigating to work order page for applianceId:', applianceId);
    this.router.navigate(['/manager/fileworkorder'], { queryParams: { applianceID: applianceId } });
  }
}

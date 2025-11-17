import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth.service';
import { WorkOrderService } from '../../services/workorder.service';
import { ApplianceService } from '../../services/appliance.service';
import { FormsModule } from '@angular/forms';
import { Appliance } from '../../services/appliance.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  template: `
    <div>
      <h1>Work Orders</h1>

      <form (ngSubmit)="addWorkOrder()">
        <h2>File WorkOrder</h2>
        <input type="text" placeholder="ApplianceID" [(ngModel)]="newWorkOrder.applianceID" name="applianceID" required />
        <input type="text" placeholder="Notes" [(ngModel)]="newWorkOrder.notes" name="model" required />
        <button type="submit">File WorkOrder</button>
      </form>


      </div>
      <div class = 'work-order-side-panel'>
        <h2>All Work Orders </h2>
        <ul *ngIf="workorders.length">
  <li>
    <div class="table-cell"><strong>Appliance ID</strong></div>
    <!--<div class="table-cell"><strong>Address</strong></div>-->
    <div class="table-cell"><strong>Notes</strong></div>
    <div class="table-cell"><strong>Status</strong></div>
    <div class="table-cell"><strong>Date Created</strong></div>
    <div class="table-cell"><strong></strong></div>
  </li>

  <li *ngFor="let w of workorders" style="margin-top:10px;">
    <div class="table-cell">{{ w.id }}</div>
    <!--<div class="table-cell">{{ w.address }}</div>-->
    <div class="table-cell">{{ w.notes }}</div>
    <div class="table-cell">{{ getStatusText(w.status) }}</div>
    <div class="table-cell">{{ w.created | date: 'medium' }}</div>
    <div class="table-cell"><button (click)="delete(w.id)">Delete</button></div>
  </li>
</ul>
</div>

  `
})

export class WorkOrderManagerComponent implements OnInit {
  workorders: any[] = [];

  newWorkOrder = {
    applianceID: '',
    created: '',
    notes: '',
    status: '',
    updated: '',

  };

  constructor(
    public auth: AuthService,
    private router: Router,
    private workOrderService: WorkOrderService,
    private applianceService: ApplianceService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
  this.workorders = await this.workOrderService.getAllWorkOrders();

  // Convert timestamps & attach address
  this.workorders = await Promise.all(
    this.workorders.map(async (w) => {
      const created = this.convertTimestampToDate(w.created);

      // Fetch appliance data using the foreign key (applianceID)
      const address = await this.getAddress(w.applianceID);

      console.log(`WorkOrder ID: ${w.id}, ApplianceID: ${w.applianceID}, Address: ${address}`);

      console.log(`WorkOrder ID: ${w.id}, ApplianceID: ${w.applianceID}`);

      return { ...w, created, address };  
    })
  );

  this.cdr.detectChanges();
}

  async addWorkOrder() {
    try {
      const id = await this.workOrderService.createWorkOrder(this.newWorkOrder);
      console.log('Appliance added with ID:', id);

      // Refresh all workorders (manager view)
      this.workorders = await this.workOrderService.getAllWorkOrders();


      // Clear form after adding
      this.newWorkOrder = {
        applianceID: '',
        created: '',
        notes: '',
        status: '',
        updated: '',
      };

      this.cdr.detectChanges(); // Trigger UI update
    } catch (error) {
      console.error('Failed to add appliance:', error);
    }
  }

  async getAddress(ApplianceID: string): Promise<string> {
    if (!ApplianceID) return 'Unknown';

    try {
      const appliance: Appliance | undefined = await this.applianceService.getApplianceById(ApplianceID);
      return appliance?.address || 'Unknown';
    } catch (err) {
      console.error('Error fetching appliance address:', err);
      return 'Unknown';
    }
  }


  async delete(id: string) {
    await this.workOrderService.deleteWorkOrder(id);
    this.workorders = await this.workOrderService.getActiveWorkOrders();
    this.cdr.detectChanges();
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login/manager']);
  }

  convertTimestampToDate(timestamp: any): Date {
    if (!timestamp) return new Date();
    if (timestamp.toDate) return timestamp.toDate(); // Firestore Timestamp
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1_000_000);
    return new Date(timestamp); // already a JS Date or ISO string
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'New';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }
}
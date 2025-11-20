import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink,} from '@angular/router';
import { AuthService } from '../../auth.service';
import { WorkOrderService } from '../../services/workorder.service';
import { FormsModule } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { updateDoc, doc } from '@angular/fire/firestore';


@Component({
    selector: 'app-manager-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <div>
      <h1>Welcome, {{ auth.manager?.email }}</h1>
      </div>
      <div class = 'work-order-side-panel'>
        <h2>Active Work Orders </h2>
        <ul *ngIf="workorders.length">
  <li>
    <div class="table-cell"><strong>Appliance</strong></div>
    <div class="table-cell"><strong>Notes</strong></div>
    <div class="table-cell"><strong>Status</strong></div>
    <div class="table-cell"><strong>Actions</strong></div>
  </li>

  <li *ngFor="let w of workorders" style="margin-top:10px;">
  <div class="table-cell">{{ w.applianceID }}</div>
  <div class="table-cell">{{ w.notes }}</div>
  <div class="table-cell">
    <select [(ngModel)]="w.status" (change)="updateStatus(w)">
      <option [ngValue]=0>New</option>
      <option [ngValue]=1>In Progress</option>
      <option [ngValue]=2>Completed</option>
    </select>
  </div>
  <div class="table-cell">
    <button (click)="delete(w.id)">Delete</button>
  </div>
</li>

</ul>

<div class= 'left-side-buttons'>
  <a routerLink="/manager/passkeys">Manage Tenant Keys</a>
  <br>
  <a routerLink="/manager/workorders">Manage Work Orders</a>
  <br>
  <a routerLink="/manager/appliances">Manage Appliances</a>
  <!-- TODO For Future Inclusion  <a routerLink="/manager/workorders">View Work Orders</a> -->
<button (click)="logout()">Logout</button>
</div>
  `
})

export class ManagerDashboardComponent implements OnInit {
    workorders: any[] = [];

    constructor(
        public auth: AuthService,
        private router: Router,
        private workOrderService: WorkOrderService,
        private cdr: ChangeDetectorRef,
        private firestore: Firestore,
    ) { }

    async ngOnInit() {
        this.workorders = await this.workOrderService.getActiveWorkOrders();
        this.cdr.detectChanges();
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

    async updateStatus(workorder: any) {
    try {
      const docRef = doc(this.firestore, 'WorkOrders', workorder.id);
      await updateDoc(docRef, { status: workorder.status });
      console.log(`Work order ${workorder.id} updated to status ${workorder.status}`);

  this.workorders = await this.workOrderService.getActiveWorkOrders();
    this.cdr.detectChanges();

    } catch (error) {
      console.error('Failed to update status:', error);
    }
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
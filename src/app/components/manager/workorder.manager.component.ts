import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { WorkOrderService } from '../../services/workorder.service';
import { ApplianceService } from '../../services/appliance.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1>Work Orders</h1>
      <form (ngSubmit)="addWorkOrder()">
        <input placeholder="Appliance ID" [(ngModel)]="newWorkOrder.applianceID" name="applianceID" required />
        <input placeholder="Notes" [(ngModel)]="newWorkOrder.notes" name="notes" required />
        <button type="submit">File WorkOrder</button>
      </form>
    </div>

    <h2>All Work Orders</h2>

    <div class="wide-table">
  <ul *ngIf="workorders.length">
    <!-- Table Header -->
    <li class="table-header">
      <div class="table-cell"><strong>Appliance ID</strong></div>
      <div class="table-cell"><strong>Notes</strong></div>
      <div class="table-cell"><strong>Status</strong></div>
      <div class="table-cell"><strong>Actions</strong></div>
       <div class="table-cell"><strong>&nbsp;</strong></div>
    </li>

    <li *ngFor="let w of workorders" class="table-row">
      <div class="table-cell">{{ w.applianceID }}</div>
      <div class="table-cell">{{ w.notes }}</div>
      <div class="table-cell">
        <select [(ngModel)]="w.status" (change)="updateStatus(w)">
          <option [ngValue]="0">New</option>
          <option [ngValue]="1">In Progress</option>
          <option [ngValue]="2">Completed</option>
        </select>
      </div>
      <div class="table-cell">
        <button (click)="edit(w.id)">Edit</button>
      </div>
      <div class="table-cell">
        <button (click)="delete(w.id)">Delete</button>
      </div>
    </li>
  </ul>

  <p *ngIf="!workorders.length">No work orders found.</p>
</div>
    
  `
})
export class WorkOrderManagerComponent implements OnInit {
  workorders: any[] = [];
  newWorkOrder = { applianceID: '', notes: '', status: 0 };

  constructor(
    private router: Router,
    private workOrderService: WorkOrderService,
    private applianceService: ApplianceService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadWorkOrders();
  }

  async loadWorkOrders() {
    this.workorders = await this.workOrderService.getAllWorkOrders();

    // Optional: fetch address for each appliance
    this.workorders = await Promise.all(
      this.workorders.map(async w => {
        const address = w.applianceID ? await this.getAddress(w.applianceID) : 'Unknown';
        return { ...w, address };
      })
    );

    this.cdr.detectChanges();
  }

  async addWorkOrder() {
    await this.workOrderService.createWorkOrder(this.newWorkOrder);
    this.newWorkOrder = { applianceID: '', notes: '', status: 0 };
    await this.loadWorkOrders();
  }

  async updateStatus(workorder: any) {
    await this.workOrderService.updateStatus(workorder.id, workorder.status);
    await this.loadWorkOrders();
  }

  async delete(id: string) {
    await this.workOrderService.deleteWorkOrder(id);
    await this.loadWorkOrders();
  }

  edit(id: string) {
    if (!id) return;
    this.router.navigate(['/manager/fileworkorder', id]);
  }

  async getAddress(applianceID: string): Promise<string> {
    try {
      const appliance = await this.applianceService.getApplianceById(applianceID);
      return appliance?.address || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }
}

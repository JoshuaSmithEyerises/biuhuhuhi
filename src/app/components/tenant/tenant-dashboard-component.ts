import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ApplianceService, Appliance } from '../../services/appliance.service';
import { WorkOrderService } from '../../services/workorder.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div>
    <h1>Welcome, {{ auth.tenant?.address }}</h1>
    <h2>Access granted with passkey: {{ auth.tenant?.passkey }}</h2>

    <h2>Appliances</h2>
    <ul *ngIf="appliances.length; else noAppliances">
      <li class="header-row">
        <div class='table-cell'><strong>Type</strong></div>
        <div class='table-cell'><strong>Model</strong></div>
        <div class='table-cell'><strong>Serial No</strong></div>
        <div class='table-cell'><strong>&nbsp;</strong></div>
      </li>

      <li *ngFor="let appliance of appliances">
        <div class='table-cell'>{{ appliance.type }}</div>
        <div class='table-cell'>{{ appliance.model }}</div>
        <div class='table-cell'>{{ appliance.serial }}</div>
        <div class="table-cell">
          <button type="button" (click)="fileWorkOrder(appliance)">File WorkOrder</button>
        </div>
      </li>
    </ul>

    <ng-template #noAppliances>
      <p>No appliances found for your address.</p>
    </ng-template>

    <h2>Active Work Orders</h2>
    <ul *ngIf="workorders.length; else noWorkOrders">
      <li class="header-row">
        <div class='table-cell'><strong>Appliance</strong></div>
        <div class='table-cell'><strong>Notes</strong></div>
        <div class='table-cell'><strong>Status</strong></div>
      </li>

      <li *ngFor="let w of workorders">
        <div class='table-cell'>{{ w.appliance?.type }} {{ w.appliance?.model }}</div>
        <div class='table-cell'>{{ w.notes }}</div>
        <div class='table-cell'>{{ getStatusText(w.status) }}</div>
      </li>
    </ul>

    <ng-template #noWorkOrders>
      <p>No active work orders for your appliances.</p>
    </ng-template>

    <form>
      <button (click)="logout()">Logout</button>
    </form>
  </div>
  `
})
export class TenantDashboardComponent implements OnInit {
  appliances: Appliance[] = [];
  workorders: any[] = [];

  constructor(
    public auth: AuthService,
    private router: Router,
    private applianceService: ApplianceService,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const tenantAddress = this.auth.tenant?.address;
    if (!tenantAddress) return;

    // Fetch all appliances for this tenant
    this.appliances = await this.applianceService.getAppliancesByAddress(tenantAddress);

    // Fetch all active work orders
    const allWorkOrders = await this.workOrderService.getActiveWorkOrders();

    // Filter work orders to only those whose appliance has the same address
    this.workorders = await Promise.all(
      allWorkOrders.map(async w => {
        const appliance = await this.applianceService.getApplianceById(w.applianceID);
        if (appliance?.address === tenantAddress) {
          return { ...w, appliance };
        }
        return null;
      })
    );

    // Remove nulls
    this.workorders = this.workorders.filter(w => w !== null);

    this.cdr.detectChanges();
  }

  fileWorkOrder(appliance: Appliance) {
    this.router.navigate(['/tenant/fileworkorder'], {
      queryParams: { applianceID: appliance.id }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login/tenant']);
  }

  getStatusText(status: number) {
    switch (status) {
      case 0: return 'New';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }
}
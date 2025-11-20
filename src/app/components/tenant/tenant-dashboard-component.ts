import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ApplianceService } from '../../services/appliance.service';
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

<ul *ngIf="appliances.length > 0; else noAppliances">

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
       <button type="button" (click)="goToWorkOrder(appliance.id)">
        File WorkOrder
      </button>
    </div>

  </li>

</ul>

<ng-template #noAppliances>
  <p>No appliances found for your address.</p>
</ng-template>
   </div>
   <form>
   <button (click)="logout()">Logout</button>
</form>
  
  `
})
export class TenantDashboardComponent implements OnInit {
  appliances: any[] = [];

  workorders: any[] = [];

    newWorkOrder = {
    applianceID: '',
    created: '',
    notes: '',
    status:'',
    updated:'',

    }

  constructor(
    public auth: AuthService,
    private router: Router,
    private applianceService: ApplianceService,
     private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef 
  ) {}

  async ngOnInit() {
    const tenantAddress = this.auth.tenant?.address;
    console.log('Tenant address:', tenantAddress);

    if (!tenantAddress) {
      console.warn('Tenant has no address — cannot load appliances.');
      return;
    }

    // Fetch all appliances where address == tenantAddress
    this.appliances = await this.applianceService.getAppliancesByAddress(tenantAddress);
    console.log('Appliances found:', this.appliances);

    this.cdr.detectChanges(); // <-- Tell Angular to update the view
  }

  goToWorkOrder(applianceId: string) {
    this.router.navigate(['/tenant/fileworkorder'], {
      queryParams: { applianceID: applianceId }
    });
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
        status:'',
        updated:'',
      };

      this.cdr.detectChanges(); // Trigger UI update
    } catch (error) {
      console.error('Failed to add appliance:', error);
    }
  }

  prepareWorkOrder(id: string) {
  this.newWorkOrder.applianceID = id;
  this.addWorkOrder();
}

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login/tenant']);
  }
}

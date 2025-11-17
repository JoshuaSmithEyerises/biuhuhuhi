import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ApplianceService } from '../services/appliance.service';
import { WorkOrderService } from '../services/workorder.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-dashboard.component.html'
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

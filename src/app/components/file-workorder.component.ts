import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { ApplianceService, Appliance } from '../services/appliance.service';
import { WorkOrderService } from '../services/workorder.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'file-workorder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div>
    <h1>File Work Order</h1>

    <h2 *ngIf="selectedAppliance">
      Filing work order for {{ selectedAppliance.type }} {{ selectedAppliance.model }} <br>
      at {{ selectedAppliance.address || auth.tenant?.address }}
    </h2>

    <form (ngSubmit)="addWorkOrder()">
      <input 
        type="text" 
        placeholder="applianceID" 
        [(ngModel)]="newWorkOrder.applianceID" 
        name="applianceID" 
        readonly 
        required 
      />
      <input 
        type="text" 
        placeholder="Notes" 
        [(ngModel)]="newWorkOrder.notes" 
        name="notes" 
        required 
      />
      <button type="submit">File WorkOrder</button>
    </form>
  </div>
  `
})
export class FileWorkOrderComponent implements OnInit {
  appliances: Appliance[] = [];
  selectedAppliance: Appliance | undefined;

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
    private route: ActivatedRoute,
    private applianceService: ApplianceService,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Fetch all appliances (managers) or by tenant address
    const tenantAddress = this.auth.tenant?.address;
    this.appliances = tenantAddress
      ? await this.applianceService.getAppliancesByAddress(tenantAddress)
      : await this.applianceService.getAllAppliances();

    // Check for query param to prefill appliance
    this.route.queryParams.subscribe(async params => {
      if (params['applianceID']) {
        this.newWorkOrder.applianceID = params['applianceID'];
        this.selectedAppliance = await this.applianceService.getApplianceById(params['applianceID']);
        this.cdr.detectChanges();
      }
    });
  }

  async addWorkOrder() {
    try {
      const id = await this.workOrderService.createWorkOrder(this.newWorkOrder);
      console.log('Work order filed with ID:', id);

      // Clear form
      this.newWorkOrder.notes = '';
      this.newWorkOrder.status = '';
      this.newWorkOrder.created = '';
      this.newWorkOrder.updated = '';

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to file work order:', error);
    }
  }
}

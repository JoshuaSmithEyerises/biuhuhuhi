import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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

      <div *ngIf="successMessage" class="success-message"><h2>
      {{ successMessage }}</h2>
    </div>

  </div>
  `
})
export class FileWorkOrderComponent implements OnInit {
  appliances: Appliance[] = [];
  selectedAppliance?: Appliance;
  successMessage = '';
  isEdit = false;

  newWorkOrder: any = {
    id: '',
    applianceID: '',
    notes: '',
    status: 0,
  };

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private applianceService: ApplianceService,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Load appliances
    const tenantAddress = this.auth.tenant?.address;
    this.appliances = tenantAddress
      ? await this.applianceService.getAppliancesByAddress(tenantAddress)
      : await this.applianceService.getAllAppliances();

    // Check if editing a work order by route param
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      const workorder = await this.workOrderService.getWorkOrderById(id);
      if (workorder) {
        this.newWorkOrder = {
          id,
          applianceID: workorder.applianceID,
          notes: workorder.notes,
          status: workorder.status,
        };
        this.selectedAppliance = await this.applianceService.getApplianceById(workorder.applianceID);
      }
      this.cdr.detectChanges();
      return;
    }

    // Otherwise, prefill applianceID from query param if provided
    this.route.queryParams.subscribe(async params => {
      if (params['applianceID']) {
        this.newWorkOrder.applianceID = params['applianceID'];
        this.selectedAppliance = await this.applianceService.getApplianceById(params['applianceID']);
        this.cdr.detectChanges();
      }
    });
  }

  submitForm() {
    if (this.isEdit) this.saveChanges();
    else this.addWorkOrder();
  }

  async addWorkOrder() {
    try {
      await this.workOrderService.createWorkOrder(this.newWorkOrder);
      this.successMessage = 'Work order filed successfully!';
      this.newWorkOrder.notes = '';
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
      this.successMessage = 'Failed to file work order.';
    }
  }

  async saveChanges() {
    try {
      await this.workOrderService.updateWorkOrder(this.newWorkOrder);
      this.successMessage = 'Work order updated successfully!';
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
      this.successMessage = 'Failed to update work order.';
    }
  }
}

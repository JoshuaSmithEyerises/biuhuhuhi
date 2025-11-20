import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ApplianceService, Appliance } from '../services/appliance.service';
import { WorkOrderService } from '../services/workorder.service';

@Component({
  selector: 'file-workorder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div>
    <h1>{{ isEdit ? 'Edit' : 'File' }} Work Order</h1>

    <h2 *ngIf="selectedAppliance">
      {{ isEdit ? 'Editing' : 'Filing' }} work order for {{ selectedAppliance.type }} {{ selectedAppliance.model }} <br>
      at {{ selectedAppliance.address || auth.tenant?.address }}
    </h2>

    <form (ngSubmit)="submitForm()">
      <input 
        type="text" 
        placeholder="ApplianceID" 
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
      <button type="submit">{{ isEdit ? 'Save Changes' : 'File WorkOrder' }}</button>
    </form>

    <div *ngIf="successMessage" class="success-message">
      <h2>{{ successMessage }}</h2>
    </div>
  </div>
  `
})
export class FileWorkOrderComponent implements OnInit {
  newWorkOrder: any = {
    applianceID: '',
    notes: '',
    status: 0
  };
  selectedAppliance?: Appliance;
  isEdit = false;
  successMessage = '';

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private applianceService: ApplianceService,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Check if editing a workorder via route param
    const workorderId = this.route.snapshot.paramMap.get('id');

    if (workorderId) {
      this.isEdit = true;

      // Fetch workorder by its primary key (id)
      const workorder = await this.workOrderService.getWorkOrderById(workorderId);
      if (!workorder) {
        console.error('Workorder not found:', workorderId);
        this.router.navigate(['/manager/workorders']);
        return;
      }

      // Prefill form fields
      this.newWorkOrder = {
  id: workorder.id,      
  applianceID: workorder.applianceID,
  notes: workorder.notes,
  status: workorder.status
};

      // Fetch the appliance for display
      this.selectedAppliance = await this.applianceService.getApplianceById(workorder.applianceID);

      this.cdr.detectChanges();
    } else {
      // Filing new workorder
      this.isEdit = false;

      // Only prefill applianceID from query param if provided
      this.route.queryParams.subscribe(async params => {
        if (params['applianceID']) {
          this.newWorkOrder.applianceID = params['applianceID'];
          this.selectedAppliance = await this.applianceService.getApplianceById(params['applianceID']);
          this.cdr.detectChanges();
        }
      });
    }
  }

  async submitForm() {
    if (this.isEdit) {
      await this.saveChanges();
    } else {
      await this.addWorkOrder();
    }
  }

  async addWorkOrder() {
    try {
      await this.workOrderService.createWorkOrder(this.newWorkOrder);
      this.successMessage = 'Work order filed successfully!';
      this.newWorkOrder.notes = '';
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error filing workorder:', error);
      this.successMessage = 'Failed to file work order.';
    }
  }

  async saveChanges() {
    try {
      if (!this.newWorkOrder.id) {
        throw new Error('Cannot save changes: WorkOrder ID missing.');
      }
      await this.workOrderService.updateWorkOrder(this.newWorkOrder);
      this.successMessage = 'Work order updated successfully!';
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error updating workorder:', error);
      this.successMessage = 'Failed to update work order.';
    }
  }
}

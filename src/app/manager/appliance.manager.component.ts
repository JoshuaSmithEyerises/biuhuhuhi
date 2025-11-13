import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { ApplianceService } from '../services/appliance.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1>Appliance Manager</h1>

      <!-- Add Appliance Form -->

      <form (ngSubmit)="addAppliance()">
        <h2>Add New Appliance</h2>
        <input type="text" placeholder="Address" [(ngModel)]="newAppliance.address" name="address" required />
        <input type="text" placeholder="Type" [(ngModel)]="newAppliance.type" name="type" required />
        <input type="text" placeholder="Model" [(ngModel)]="newAppliance.model" name="model" required />
        <input type="number" placeholder="Manufacture Year" [(ngModel)]="newAppliance.Manufacture_Year" name="year" required />
        <input type="text" placeholder="Serial Number" [(ngModel)]="newAppliance.serial" name="serial" required />
        <button type="submit">Add Appliance</button>
      </form>

      
      <ul *ngIf="appliances.length > 0; else noAppliances">
        <h2 *ngIf="appliances.length > 0">All Appliances:</h2>
        <li>
          <div class='table-cell'><strong>ApplianceID</strong></div>
          <div class='table-cell'><strong>Address</strong></div>
          <div class='table-cell'><strong>Type</strong></div>
          <div class='table-cell'><strong>Model</strong></div>
          <div class='table-cell'><strong>Manufacture Year</strong></div>
          <div class='table-cell'><strong>Serial No</strong></div>
          <div class='table-cell'><strong></strong></div>
        </li>
        <li *ngFor="let appliance of appliances">
          <div class='table-cell'>{{ appliance.id }}</div>
          <div class='table-cell'>{{ appliance.address }}</div>
          <div class='table-cell'>{{ appliance.type }}</div>
          <div class='table-cell'>{{ appliance.model }}</div>
          <div class='table-cell'>{{ appliance.Manufacture_Year }}</div>
          <div class='table-cell'>{{ appliance.serial }}</div>
          <div class='table-cell'><button (click)="delete(appliance.id)">Delete</button></div>
        </li>
      </ul>

      <ng-template #noAppliances>
        <p>No appliances found.</p>
      </ng-template>
    </div>
  `
})
export class ApplianceManagerComponent implements OnInit {
  appliances: any[] = [];
  
  newAppliance = {
    address: '',
    type: '',
    model: '',
    Manufacture_Year: null,
    serial: ''
  };

  constructor(
    public auth: AuthService,
    private router: Router,
    private applianceService: ApplianceService,
    private cdr: ChangeDetectorRef
  ) {}

  async addAppliance() {
    try {
      const id = await this.applianceService.createAppliance(this.newAppliance);
      console.log('Appliance added with ID:', id);

      // Refresh all appliances (manager view)
      this.appliances = await this.applianceService.getAllAppliances();

      // Clear form after adding
      this.newAppliance = {
        address: '',
        type: '',
        model: '',
        Manufacture_Year: null,
        serial: ''
      };

      this.cdr.detectChanges(); // Trigger UI update
    } catch (error) {
      console.error('Failed to add appliance:', error);
    }
  }

  async ngOnInit() {
    this.appliances = await this.applianceService.getAllAppliances();
    this.cdr.detectChanges();
  }

  async delete(id: string) {
        await this.applianceService.deleteAppliance(id);
        this.appliances = await this.applianceService.getAllAppliances();
        this.cdr.detectChanges();
    }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login/manager']);
  }
}

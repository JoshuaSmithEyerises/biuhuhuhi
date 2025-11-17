import { Routes } from '@angular/router';
import { ManagerLoginComponent } from './components/login/manager-login-component';
import { TenantLoginComponent } from './components/login/tenant-login-component';
import { FailLoginComponent } from './components/login/fail-login.component';
import { LaunchLoginComponent } from './components/login/launch-login-component';
import { ManagerDashboardComponent } from './components/manager/manager-dashboard.component';
import { TenantDashboardComponent } from './components/tenant/tenant-dashboard-component';
import { managerGuard, tenantGuard } from './auth.guard';
import { PasskeyManagerComponent } from './components/manager/passkey.manager.component';
import { WorkOrderManagerComponent } from './components/manager/workorder.manager.component';
import { ApplianceManagerComponent } from './components/manager/appliance.manager.component';

// Creates guarded routes between pages; This is the "route" object all the components reference
export const routes: Routes = [
    {path: '', redirectTo: 'login/launch', pathMatch: 'full'},

    // public login pages
    {path: 'login/manager', component: ManagerLoginComponent},
    {path: 'login/tenant', component: TenantLoginComponent},
    {path: 'login/launch', component: LaunchLoginComponent},
    {path: 'login/fail', component: FailLoginComponent},

    // private dashboards
    {
    path: 'manager',
    canActivate: [managerGuard],
    children: [
      { path: 'dashboard', component: ManagerDashboardComponent },
      { path: 'passkeys', component: PasskeyManagerComponent },
      { path: 'workorders', component: WorkOrderManagerComponent },
      { path: 'appliances', component: ApplianceManagerComponent },
    ]
  },
    {
        path: 'tenant/dashboard',
        component: TenantDashboardComponent,
        canActivate: [tenantGuard],
    },

    // catchall redirect
    { path: "*", redirectTo: 'login/launch'}
];
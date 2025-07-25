import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { DashboardCanvas } from '../../components/dashboard-canvas/dashboard-canvas';

@Component({
    selector: 'app-dashboard',
    imports: [
        Sidebar,
        DashboardCanvas
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.less'
})
export class Dashboard {

}

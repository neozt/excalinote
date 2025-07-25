import { Component } from "@angular/core";
import { DashboardSidebar } from "@features/dashboard/components/dashboard-sidebar/dashboard-sidebar.component";
import { DashboardMain } from "@features/dashboard/components/dashboard-main/dashboard-main.component";

@Component({
  selector: "app-dashboard",
  imports: [DashboardSidebar, DashboardMain],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.less",
})
export class Dashboard {}

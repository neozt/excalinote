import { Routes } from "@angular/router";
import { Home } from "@features/home/home";
import { DashboardComponent } from "@features/dashboard/pages/dashboard/dashboard.component";

export const routes: Routes = [
  // TODO add home page
  // {
  //   path: "",
  //   component: Home,
  // },
  {
    path: "dashboard",
    component: DashboardComponent,
  },
  // TODO redirect to home page
  {
    path: "**",
    redirectTo: "dashboard",
  },
];

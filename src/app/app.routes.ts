import { Routes } from "@angular/router";
import { Home } from "@features/home/home";
import { Dashboard } from "@features/dashboard/pages/dashboard/dashboard";

export const routes: Routes = [
  // TODO add home page
  // {
  //   path: "",
  //   component: Home,
  // },
  {
    path: "dashboard",
    component: Dashboard,
  },
  // TODO redirect to home page
  {
    path: "**",
    redirectTo: "dashboard",
  },
];

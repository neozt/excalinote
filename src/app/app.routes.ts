import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';

export const routes: Routes = [
    {
        path: "",
        component: Home
    },
    {
        path: "dashboard",
        component: Dashboard
    },
    {
        path: "**",
        redirectTo: ""
    }
];



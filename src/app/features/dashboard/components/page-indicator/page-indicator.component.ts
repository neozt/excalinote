import { Component, input } from "@angular/core";

@Component({
  selector: "app-page-indicator",
  imports: [],
  templateUrl: "./page-indicator.component.html",
  styleUrl: "./page-indicator.component.css",
})
export class PageIndicatorComponent {
  currentPage = input.required<number>();
  maxPage = input.required<number>();
}

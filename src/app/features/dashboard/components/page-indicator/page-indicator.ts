import { Component, input } from "@angular/core";

@Component({
  selector: "app-page-indicator",
  imports: [],
  templateUrl: "./page-indicator.html",
  styleUrl: "./page-indicator.css",
})
export class PageIndicator {
  currentPage = input.required<number>();
  maxPage = input.required<number>();
}

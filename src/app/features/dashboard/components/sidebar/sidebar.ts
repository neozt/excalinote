import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  host: {
    class: 'w-[200px] bg-[#e4d3b2] p-5 shadow-[2px_0_10px_rgba(0,0,0,0.1)] overflow-y-auto flex flex-col'
  },
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.less'
})
export class Sidebar {

}

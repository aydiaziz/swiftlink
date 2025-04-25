import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [NgIf],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent {
  activeTab = 0;

  selectTab(index: number) {
    this.activeTab = index;
  }
}

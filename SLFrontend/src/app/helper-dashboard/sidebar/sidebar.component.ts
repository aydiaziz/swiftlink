import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() sectionChanged = new EventEmitter<string>();
  currentSection: string = 'profile';

  navigate(section: string) {
    this.currentSection = section;
    this.sectionChanged.emit(section);
  }
}

import { Component } from '@angular/core';
import { ServicesComponent } from "./services/services.component";
import { AboutComponent } from "./about/about.component";
import { ContactComponent } from "./contact/contact.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ServicesComponent, AboutComponent, ContactComponent,FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  helpMessage: string = '';

  sendMessage() {
    if (this.helpMessage.trim()) {
      console.log('User message:', this.helpMessage);
      alert(`Message sent: ${this.helpMessage}`);
      this.helpMessage = ''; // Réinitialiser le champ après envoi
    }
  }

}

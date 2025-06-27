import { Component, NgModule, OnInit } from '@angular/core';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FullCalendarModule,FormsModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },
    eventClick: this.onCalendarEventClick.bind(this)
  };
  selectedOrder: Order | null = null;
  startTime: Date | null = null;
  endTime: Date | null = null;
  isTiming = false;
  todayJobs: any[]=[];
  timerDisplay = '00:00:00';
 intervalId: any;
  manualDuration: number = 0;
  detailOrder: any | null = null;

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.orderService.getHelperAgenda().subscribe(orders => {
      this.calendarOptions.events = orders.map(order => ({
        title: order.jobTitle,
        date: order.executionDate,
        extendedProps: {
         address: order.jobAddress,
          order: order
        }
      }));
    });
    this.orderService.getJobsToday().subscribe({
      next: orders => {
        this.todayJobs = orders.filter((order: any) => !order.hasInvoice);
      },
      error: err => {
        console.error('❌ Failed to load today’s jobs:', err);
      }
    });
  }

  showDetails(job: any) {
    this.detailOrder = job;
  }
    onCalendarEventClick(arg: EventClickArg) {
    const order = arg.event.extendedProps['order'];
    if (order) {
      this.detailOrder = order;
    } else {
      // Fallback: build minimal order from event data
      this.detailOrder = {
        jobTitle: arg.event.title,
        executionDate: arg.event.start,
        jobAddress: arg.event.extendedProps['address']
      };
    }
  }
  startJob(job: Order) {
    this.selectedOrder = job;
    this.startTime = new Date();
    this.isTiming = true;
  
    let seconds = 0;
    this.timerDisplay = '00:00:00';
  
    this.intervalId = setInterval(() => {
      seconds++;
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      this.timerDisplay = `${this.pad(hrs)}:${this.pad(mins)}:${this.pad(secs)}`;
    }, 1000);
  }
  
  stopJob() {
    this.endTime = new Date();
    this.isTiming = false;
    clearInterval(this.intervalId);
  
    if (this.selectedOrder) {
      let durationInMinutes: number;
  
      if (this.manualDuration > 0) {
        // Cas où le helper a choisi une durée manuelle
        durationInMinutes = this.manualDuration;
      } else {
        // Calcul de la durée basée sur le chronomètre
        const diffMs = (this.endTime.getTime() - (this.startTime?.getTime() || 0));
        let minutes = Math.ceil(diffMs / 60000); // conversion en minutes
  
        // Arrondi selon tes règles
        if (minutes <= 30) {
          durationInMinutes = 30;
        } else if (minutes <= 60) {
          durationInMinutes = 60;
        } else if (minutes <= 90) {
          durationInMinutes = 90;
        } else if (minutes <= 120) {
          durationInMinutes = 120;
        } else if (minutes <= 150) {
          durationInMinutes = 150;
        } else {
          durationInMinutes = 180;  // max exemple
        }
      }
  
      
  
      // Envoi vers l'API
      this.orderService.updateOrderDuration(
        this.selectedOrder.orderID,
        this.startTime?.toISOString() || '',
        this.endTime.toISOString(),
        durationInMinutes  // Envoie la durée finale
      ).subscribe({
        next: res => {
          
          const orderId = this.selectedOrder?.orderID;
          this.selectedOrder = null;
          this.timerDisplay = '00:00:00';
          this.manualDuration = 0;
          
          if (orderId) {
            this.router.navigate(['/helper-dashboard/invoice', orderId]);
          }
        },
        error: err => {
          console.error('❌ Failed to save duration:', err);
        }
      });
    }
  }
  
  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
  setManualDuration(job: Order) {
    if (this.manualDuration > 0) {
      const now = new Date(); // On peut utiliser la date actuelle pour start & end fictifs
  
      this.orderService.updateOrderDuration(
        job.orderID,
        now.toISOString(),
        now.toISOString(),
        this.manualDuration
      ).subscribe({
        next: res => {
          
          const orderId = job.orderID;
          this.manualDuration = 0;
          alert('Duration has been set successfully!');
          this.router.navigate(['/helper-dashboard/invoice', orderId]);
        },
        error: err => {
          console.error('❌ Failed to save manual duration:', err);
        }
      });
    } else {
      alert('Please select a duration before submitting.');
    }
  }
}

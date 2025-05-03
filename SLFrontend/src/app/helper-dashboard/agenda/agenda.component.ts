import { Component, OnInit } from '@angular/core';
import { CalendarOptions} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
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
    }
  };
  selectedOrder: Order | null = null;
  startTime: Date | null = null;
  endTime: Date | null = null;
  isTiming = false;
  todayJobs: any[]=[];
  timerDisplay = '00:00:00';
 intervalId: any;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getHelperAgenda().subscribe(orders => {
      this.calendarOptions.events = orders.map(order => ({
        title: order.jobTitle,
        date: order.executionDate,
        extendedProps: {
          address: order.jobAddress
        }
      }));
    });
    this.orderService.getJobsToday().subscribe({
      next: orders => {
        this.todayJobs = orders;
      },
      error: err => {
        console.error('❌ Failed to load today’s jobs:', err);
      }
    });
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
      this.orderService.updateOrderDuration(
        this.selectedOrder.orderID,
        this.startTime?.toISOString() || '',
        this.endTime.toISOString()
      ).subscribe({
        next: res => {
          console.log('✅ Duration saved:', res);
          this.selectedOrder = null;
           this.timerDisplay = '00:00:00'
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
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-helper-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './helper-profile.component.html',
  styleUrls: ['./helper-profile.component.css']
})
export class HelperProfileComponent implements OnInit {
  profile: any;

  constructor(private route: ActivatedRoute, private helperService: DashboardService) {}

  ngOnInit() {
    const helperId = Number(this.route.snapshot.paramMap.get('id'));
    this.helperService.getHelperProfile(helperId).subscribe(data => {
      this.profile = data;
    });
  }
}


import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RandomNumberService } from '../../services/random-number.service';
import { Chart as ChartJS } from 'chart.js/auto';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NumberModalComponent } from '../number-modal/number-modal.component';

@Component({
  selector: 'app-random-number-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './random-number-dashboard.component.html',
  styleUrls: ['./random-number-dashboard.component.css']
})
export class RandomNumberDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  randomNumbers: any[] = [];
  displayedColumns: string[] = ['id', 'value', 'created_at'];
  isLoading = false;
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalCount = 0;
  
  private chart: ChartJS | null = null;

  constructor(
    private randomNumberService: RandomNumberService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadNumbers();
  }

  ngAfterViewInit(): void {
    this.loadChartData();
  }

  loadNumbers(): void {
    this.isLoading = true;
    const offset = this.currentPage * this.pageSize;
    
    this.randomNumberService.getRandomNumbers(this.pageSize, offset).subscribe({
      next: (response: any) => {
        this.randomNumbers = response.results;
        this.totalCount = response.count;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading numbers:', error);
        this.isLoading = false;
      }
    });
  }

  loadChartData(): void {
    this.randomNumberService.getRandomNumbers(20, 0).subscribe({
      next: (response: any) => {
        // Get the most recent 20 numbers (they should already be in descending order by creation date)
        const numbers = response.results;
        
        // Extract values for the chart
        const values = numbers.map((item: any) => item.value);
        
        // Create labels where the most recent is #1
        const labels = numbers.map((_: any, index: number) => `#${index + 1}`);
        
        this.createOrUpdateChart(values, labels);
      },
      error: (error) => console.error('Error loading chart data:', error)
    });
  }

  createOrUpdateChart(data: number[], labels: string[]): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Random Numbers',
            data: data,
            backgroundColor: 'rgba(63, 81, 181, 0.2)',
            borderColor: 'rgba(63, 81, 181, 1)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgba(63, 81, 181, 1)',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Most Recent → Oldest'
              }
            },
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Value'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  const index = tooltipItems[0].dataIndex;
                  return `Number #${index + 1}`;
                }
              }
            }
          }
        }
      });
    }
  }

  generateNumber(): void {
    this.isLoading = true;
    this.randomNumberService.generateRandomNumber().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.openNumberDialog(response.value);
        this.loadNumbers();
        this.loadChartData();
      },
      error: (error) => {
        console.error('Error generating number:', error);
        this.isLoading = false;
      }
    });
  }

  openNumberDialog(number: number): void {
    this.dialog.open(NumberModalComponent, {
      data: { number: number },
      width: '300px'
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadNumbers();
  }
}

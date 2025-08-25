import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RandomNumberService } from '../../services/random-number.service';
import { Chart as ChartJS } from 'chart.js/auto';
import { NumberModalComponent } from '../number-modal/number-modal.component';

@Component({
  selector: 'app-random-number-dashboard',
  standalone: true,
  imports: [CommonModule, NumberModalComponent],
  template: `
    <div class="container">
      <h1>Random Number Generator</h1>
      
      <button (click)="generateNumber()" class="generate-btn">Generate New Number</button>
      
      <div class="chart-container">
        <h2>Last 20 Generated Numbers</h2>
        <canvas #chartCanvas></canvas>
      </div>
      
      <div class="table-container">
        <h2>Generated Numbers</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Value</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let number of randomNumbers">
              <td>{{ number.id }}</td>
              <td>{{ number.value }}</td>
              <td>{{ number.created_at | date:'medium' }}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="pagination">
          <button [disabled]="currentPage === 0" (click)="previousPage()">Previous</button>
          <span>Page {{ currentPage + 1 }}</span>
          <button [disabled]="!hasNextPage" (click)="nextPage()">Next</button>
        </div>
      </div>
    </div>
    
    <app-number-modal 
      [isOpen]="isModalOpen" 
      [number]="generatedNumber" 
      (closeModal)="closeModal()">
    </app-number-modal>
  `,
  styles: [`
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    .generate-btn {
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 20px;
    }
    .chart-container {
      margin-bottom: 30px;
      height: 300px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    .pagination button {
      padding: 5px 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .pagination button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  `]
})
export class RandomNumberDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  randomNumbers: any[] = [];
  generatedNumber: number | null = null;
  isModalOpen = false;
  
  currentPage = 0;
  pageSize = 10;
  totalCount = 0;
  hasNextPage = false;
  
  private chart: ChartJS | null = null;

  constructor(private randomNumberService: RandomNumberService) { }

  ngOnInit(): void {
    this.loadNumbers();
  }

  ngAfterViewInit(): void {
    this.loadChartData();
  }

  loadNumbers(): void {
    const offset = this.currentPage * this.pageSize;
    this.randomNumberService.getRandomNumbers(this.pageSize, offset).subscribe({
      next: (response: any) => {
        this.randomNumbers = response.results;
        this.totalCount = response.count;
        this.hasNextPage = offset + this.pageSize < this.totalCount;
      },
      error: (error) => console.error('Error loading numbers:', error)
    });
  }

  loadChartData(): void {
    this.randomNumberService.getRandomNumbers(20, 0).subscribe({
      next: (response: any) => {
        const numbers = response.results.reverse();
        const values = numbers.map((item: any) => item.value);
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
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  }

  generateNumber(): void {
    this.randomNumberService.generateRandomNumber().subscribe({
      next: (response: any) => {
        this.generatedNumber = response.value;
        this.isModalOpen = true;
        this.loadNumbers();
        this.loadChartData();
      },
      error: (error) => console.error('Error generating number:', error)
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadNumbers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadNumbers();
    }
  }
}

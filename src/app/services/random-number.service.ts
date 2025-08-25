import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RandomNumberService {
  private apiUrl = '/api/v1/devtest/randominteger';
  private token = 'd8efa5fb05336cda75b731ec67e375d28d092ceb';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Token ${this.token}`
    });
  }

  getRandomNumbers(limit: number = 10, offset: number = 0): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
      
    console.log(`Fetching data with limit=${limit}, offset=${offset}`);
    
    return this.http.get(`${this.apiUrl}/`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  generateRandomNumber(): Observable<any> {
    return this.http.get(`${this.apiUrl}/generate/`, {
      headers: this.getHeaders()
    });
  }
}

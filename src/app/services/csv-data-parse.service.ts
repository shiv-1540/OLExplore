import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsvDataParseService {
  // csvParsedData: any[] = [];
  // csvParsedData: { [key: string]: any[] } = {};
  hp: { [key: string]: any[] } = {};



  headers: any[] = [];

  csvParsedData$=new BehaviorSubject<{[key:string]:any[]}>({});

  constructor() {}

  parseCsvFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const csvContent = e.target.result;
      this.parseCsv(csvContent);
    };
    reader.readAsText(file);
  }

  private parseCsv(csvContent: string) {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    this.headers = headers;
    
    this.hp={};

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      for (let j = 0; j < values.length; j++) {
        const key = headers[j];
        const value = (key === "timeElapsed" || key === "Time") ? values[j] : parseFloat(values[j]);

        if (this.hp[key]) {
          this.hp[key].push(value);
        } else {
          this.hp[key] = [value];
        }
      }
    }
    this.csvParsedData$.next(this.hp);

    console.log("F9pthread>> ", this.hp["F9pThread"]);
    console.log("timeElapsed>> ", this.hp["timeElapsed"]);
  }
}

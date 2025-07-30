import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlotlyService } from '../../services/plotly.service';
import { AnamaoliesdetectService } from '../../services/anamaoliesdetect.service';
import { CsvDataParseService } from '../../services/csv-data-parse.service';

interface AnamoliesInterface{
  index:number,
  timeDiff:number,
  timeElapsed:string
}

@Component({
  selector: 'app-report-csv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-csv.component.html',
  styleUrl: './report-csv.component.scss'
})


export class ReportCsvComponent {
    csvParsedData:{ [key: string]: any[] }={};
    headers:string[]=[];

    timeElapsed:string[]=[];
    f9pThread:number[]=[];
    // anamolies1:number[]=[];
    anamolies1:AnamoliesInterface[]=[];
    //HashMap | headers-> as index keys  | values as an arr |
    hp:{[key:string]:any[]}={

    }
    constructor(private anamaloyDetectService:AnamaoliesdetectService,private csvdataparseservice:CsvDataParseService) { }

    ngOnInit(): void {
        this.csvdataparseservice.csvParsedData$.subscribe((data)=>{
          this.csvParsedData=data;
          this.headers=Object.keys(data);
          console.log("Data dekh lu ek bar>>",data);


           // Only trigger anomaly detection once data is available
          if (data["F9pThread"] && data["timeElapsed"]) {
            this.anamaloyDetectService.detectAnomalies(
              data["F9pThread"],
              data["timeElapsed"],
              60,
              0
            );
          }

          if(data["rtcmOutThread"] && data["timeElapsed"]){
            this.anamaloyDetectService.detectAnomalies(
              data["rtcmOutThread"],
              data['timeElapsed'],
              60,
              0
            )
          }
        });
      

        this.anamaloyDetectService.anamolies$.subscribe((data)=>{
        this.anamolies1=data;
        console.log("Anamaloies aaye",this.anamolies1);
      })

    }

  onFileSelected(event:any):void {
    const file:File=event.target.files[0];

    if(file){
      this.csvdataparseservice.parseCsvFile(file);
    }

     console.log("Data to aa rha hai>> ",this.csvParsedData);
    // this.anamaloyDetectService.detectAnomalies(this.csvParsedData["F9pThread"],this.csvParsedData["timeElapsed"],60,0);
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}

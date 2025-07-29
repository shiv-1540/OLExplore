import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlotlyService } from '../../services/plotly.service';

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
    csvParsedData:any=[];
    headings:any=[];

    timeElapsed:string[]=[];
    f9pThread:number[]=[];
    // anamolies1:number[]=[];
    anamolies1:AnamoliesInterface[]=[];
    //HashMap | headers-> as index keys  | values as an arr |
    hp:{[key:string]:any[]}={

    }
    constructor(private plotservice:PlotlyService) { }

  ngOnInit(): void {
    //  let x=[1,2,3,4,5];
    //  let y=[1,2,3,4,5];
    //  this.plotservice.plotLine("Line Plot","plot",x,y)

  }

  detectAnomalies(values:number[],timeElapsed:string[],timeThresoldInSec:number=60,valueTolerance:number=0):AnamoliesInterface[]{
    
    function parseTime(timestr:string):number{
      const parts=timestr.split(':').map(parseFloat);
      if(parts.length==2){
        return parts[0]*60+parts[1];
      }
      else if(parts.length==3){ 
        return parts[0]*3600+parts[1]*60+parts[2];
      }
      return 0;
    }

    const timeInSec=timeElapsed.map(parseTime);
    let lastChangeinTime=timeInSec[0];
    let lastval=values[0];
    const anamaloies:AnamoliesInterface[]=[];

    for(let i=0;i<values.length;i++){
      const timeDiff=timeInSec[i]-lastChangeinTime;
      const valDiff=Math.abs(values[i]-lastval);
      
      if(valDiff>valueTolerance){
        lastChangeinTime=timeInSec[i];
        lastval=values[i];
      }

      if(timeDiff>timeThresoldInSec && valDiff<=valueTolerance){
        anamaloies.push({ index: i, timeDiff, timeElapsed: timeElapsed[i] });
      }
    }
    return anamaloies;
  }
  onFileSelected(event:any){
    const file:File=event.target.files[0];
    if(file){
      const reader=new FileReader();

      reader.onload=(e:any)=>{
        const csvContent=e.target.result;
        this.parseCsv(csvContent);
        this.headings=this.csvParsedData[0];
      }
      reader.readAsText(file);
    }
  }

  // parseCsv(csvContent:string){
  //   const lines=csvContent.split('\n');
  //   const headers=lines[0].split(',');  //First Line ==> header

  //   for(let i=0;i<lines.length;i++){
  //      const currLine=lines[i].trim();

  //      if(currLine){
  //        const row:any={};
  //        const values=currLine.split(',');

  //        for(let j=0;j<headers.length;j++){
  //          row[headers[j].trim()]=values[j]?values[j].trim():'';
  //        }

  //        this.csvParsedData.push(row);
  //      }
  //   }
  //   // console.log(this.csvParsedData);
    
  //   console.log("Date Time  ka >>",this.csvParsedData[0]);


  //   for(let i=1;i<this.csvParsedData.length;i++){
  //       this.f9pThread.push(this.csvParsedData[i][headers[3].trim()]);
  //       this.timeElapsed.push(this.csvParsedData[i][headers[2].trim()]);

  //       console.log("aai>> ",this.csvParsedData[i][headers[4].trim()]);
  //   }
  //   this.anamolies1=this.detectAnomalies(this.f9pThread,this.timeElapsed ,60,0);
  // }
  parseCsv(csvContent: string) {
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim());
      
      for(let i=1;i<lines.length;i++){
        const values = lines[i].split(',').map(v => v.trim());
        for(let j=0;j<values.length;j++){
            if(this.hp[headers[j]]){
              if(headers[j]=="timeElapsed" ||"Time"){
                 this.hp[headers[j]].push(values[j]);
              }
              else{
                this.hp[headers[j]].push(parseFloat(values[j]));
              }
            }
            else{
               if(headers[j]=="timeElapsed" ||"Time"){
                 this.hp[headers[j]]=[values[j]];
              }
              else{
                this.hp[headers[j]]=[parseFloat(values[j])];
              }
            }
        }
      }

    console.log("F9pthread>> ",this.hp["F9pThread"]);
    console.log("timeElapsed>> ",this.hp["timeElapsed"]);
  
  // const timeElapsedIndex = headers.findIndex(h => h.toLowerCase().includes('timeelapsed'));
  // const f9pThreadIndex = headers.findIndex(h => h.toLowerCase().includes('f9pthread'));

  // if (timeElapsedIndex === -1 || f9pThreadIndex === -1) {
  //   console.error("Required columns not found.");
  //   return;
  // }

  // Clear previous data
  // this.f9pThread = [];
  // this.timeElapsed = [];

  // for (let i = 1; i < lines.length; i++) {
  //   const values = lines[i].split(',').map(v => v.trim());
  //   if (values.length <= Math.max(timeElapsedIndex, f9pThreadIndex)) continue;

  //   this.f9pThread.push(Number(values[f9pThreadIndex]));
  //   this.timeElapsed.push(values[timeElapsedIndex]);
  // }

  // // Run anomaly detection
  this.anamolies1 = this.detectAnomalies(this.hp["F9pThread"], this.hp["timeElapsed"], 60, 0);
}


  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  graph = {
      data: [
            { x: [1, 2, 3], y: [2, 6, 3], type: 'scatter', mode: 'lines+markers', name: 'Series A' },
            { x: [1, 2, 3], y: [1, 3, 5], type: 'bar', name: 'Series B' }
          ],
      layout: { title: 'My Plotly Chart' }
  };






}

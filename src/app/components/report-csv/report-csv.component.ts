import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlotlyService } from '../../services/plotly.service';

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

  constructor(private plotservice:PlotlyService) { }

  ngOnInit(): void {
     let x=[1,2,3,4,5];
     let y=[1,2,3,4,5];
     this.plotservice.plotLine("Line Plot","plot",x,y)
  }
  onFileSelected(event:any){
    const file:File=event.target.files[0];
    if(file){
      const reader=new FileReader();

      reader.onload=(e:any)=>{
        const csvContent=e.target.result;
        this.parseCsv(csvContent);
      }
      reader.readAsText(file);
    }
  }

  parseCsv(csvContent:string){
    const lines=csvContent.split('\n');
    const headers=lines[0].split(',');  //First Line ==> header

    for(let i=0;i<lines.length;i++){
       const currLine=lines[i].trim();

       if(currLine){
         const row:any={};
         const values=currLine.split(',');

         for(let j=0;j<headers.length;j++){
           row[headers[j].trim()]=values[j]?values[j].trim():'';
         }

         this.csvParsedData.push(row);
       }
    }
    console.log(this.csvParsedData);
    
    // for(const  s of this.csvParsedData){
    //   const k=this.getKeys(s);

    //   for(let ik of k){
    //     console.log(">>  ",s[ik]);
    //   }
    // }
  
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

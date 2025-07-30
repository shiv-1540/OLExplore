import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface AnamoliesInterface{
  index:number,
  timeDiff:number,
  timeElapsed:string
}

@Injectable({
  providedIn: 'root'
})

export class AnamaoliesdetectService {
  anamolies1:AnamoliesInterface[]=[];
  constructor() { }

  anomalySubject = new BehaviorSubject<AnamoliesInterface[]>([])
  anamolies$ = this.anomalySubject.asObservable();

  detectAnomalies(values:number[],timeElapsed:string[],timeThresoldInSec:number,valueTolerance:number):void{
    
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
    // const anamaloies:AnamoliesInterface[]=[];

    for(let i=0;i<values.length;i++){
      const timeDiff=timeInSec[i]-lastChangeinTime;
      const valDiff=Math.abs(values[i]-lastval);
      
      if(valDiff>valueTolerance){
        lastChangeinTime=timeInSec[i];
        lastval=values[i];
      }

      if(timeDiff>timeThresoldInSec && valDiff<=valueTolerance){
        this.anamolies1.push({ index: i, timeDiff, timeElapsed: timeElapsed[i] });
      }

      this.anomalySubject.next(this.anamolies1);
    }
  }
}

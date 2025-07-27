import { Injectable } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { Data, Layout } from 'plotly.js-dist-min';

@Injectable({
  providedIn: 'root'
})
export class PlotlyService {
  constructor() {}

  plotLine(title: string, plotDiv: string, x: number[], y: number[]) {
    const trace: Partial<Data> = {
      x: x,
      y: y,
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'blue' }
    };

   const layout: Partial<Layout> = {
      title: {
        text: title
      }
    };
    Plotly.newPlot(plotDiv, [trace], layout);
  }
}

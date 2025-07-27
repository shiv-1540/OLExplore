import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { PlotComponent } from './components/plot/plot.component';
import { ReportCsvComponent } from './components/report-csv/report-csv.component';
import { MapComponent } from './components/map/map.component';

export const routes: Routes = [
    { path:'',component:AppComponent },
    { path:'plot',component:PlotComponent },
    { path:'report-csv',component:ReportCsvComponent },
    { path:'map',component:MapComponent }
];

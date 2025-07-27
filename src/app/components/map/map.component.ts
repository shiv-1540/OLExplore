
import { Component, NgModule, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoTIFF from 'ol/source/GeoTIFF';
import WebGLTile from 'ol/layer/WebGLTile';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { transform } from 'ol/proj';
//  import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
// const proj4 = require('proj4');
import { XYZ } from 'ol/source';
import Text from 'ol/style/Text';

import VectorLayer from 'ol/layer/Vector';
import {getArea, getLength} from 'ol/sphere';

import VectorSource from 'ol/source/Vector';

import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Type } from 'ol/geom/Geometry';
import { Feature } from 'ol';
import { Draw, Modify, Snap } from 'ol/interaction';
import Select from 'ol/interaction/Select'; // Optional, for selecting features


import { Circle, LineString } from 'ol/geom';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { noModifierKeys } from "ol/events/condition";

// MATERIAL UI 
import { MatSnackBar } from '@angular/material/snack-bar';       // service
import { MatSnackBarModule } from '@angular/material/snack-bar'; // module
import {MatInputModule} from '@angular/material/input';
// import {FloatLabelType, MatFormFieldModule} from '@angular/material/form-field';
import {FloatLabelType, MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule,FormsModule,HttpClientModule,MatSnackBarModule,MatInputModule,MatFormFieldModule,MatButtonModule,MatDialogModule,MatCheckboxModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  map!: Map;
  isStreet:boolean=true;
  selectedOption:Type="Polygon";
  modalVisible:boolean=false;
  isDrawEnable:boolean=true;
  isModifyAllow:boolean=false;

  polygonCount = 0;
  circleCount = 0;
  lineCount = 0;
  pointCount = 0;

  sateliteLayer!:TileLayer;
  streetLayer!:TileLayer;
  vectorLayer!:VectorLayer;

  vectorSource!: VectorSource;

//DRAWINGS 
  polygonLayer!:VectorLayer;
  LineStringlayer!:VectorLayer;
  PointLayer!:VectorLayer;
  circleLayer:any;

  polygonSource!:VectorSource;
  lineStringSource!:VectorSource;
  pointSource!:VectorSource;
  circleSource!:VectorSource;

  modifyInteraction!:Modify ;
  snapInteraction!:Snap ;   


//MEASUREMENTS 
  radii:number[]=[];
  centers:number[][]=[];
  lengths:number[]=[];

  draw!: Draw;

   options=[
    {label:"Polygon",value:"Polygon"},
    {label:"LineString",value:"LineString"},
    {label:"Point",value:"Point"},
    {label:"Circle",value:"Circle"}
    ];

    exModify={
      init:()=>{
        const select:Select=new Select();
        this.map.addInteraction(select);

        const modify:Modify=new Modify({features:select.getFeatures()});
        this.map.addInteraction(modify);

      }
    }
   constructor(private http: HttpClient,private snackbar:MatSnackBar) {}

    ngOnInit(): void {
         this.vectorSource = new VectorSource();
          this.vectorLayer = new VectorLayer({
            source: this.vectorSource,
            style: new Style({
              fill: new Fill({
                color: 'rgba(18, 4, 4, 0.2)'
              }),
              stroke: new Stroke({
                color: '#070707',
                width: 2
              })
            })
          });
          
        this.polygonSource=new VectorSource();
        this.polygonLayer=new VectorLayer({
          source:this.polygonSource,
          style:new Style({
              
              fill: new Fill({
                color:'rgba(164, 35, 9, 0.4)'
              }),
              stroke: new Stroke({
                color: '#FFCC00',
                width: 2
              }),
              text: new Text({ 
                text: 'polygon', // Set the default label text
                font: '12px Calibri,sans-serif', // Optional: Customize font style
                fill: new Fill({ color: '#000' }), // Optional: Customize text fill color
                stroke: new Stroke({ color: '#fff', width: 2 }) // Optional: Customize text stroke color and width
              })
          })
        })
       
        this.circleSource=new VectorSource();
        this.circleLayer=new VectorLayer({
          source:this.circleSource,
          style:new Style({
              fill: new Fill({
                color:'rgba(8, 162, 11, 0.4)'
              }),
              stroke: new Stroke({
                color: '#000000',// '#1fcb2f'
                width: 2
              }),
               text: new Text({ // Add the Text style for the label
                text: 'circle', // Set the default label text
                font: '12px Calibri,sans-serif', // Optional: Customize font style
                fill: new Fill({ color: '#000' }), // Optional: Customize text fill color
                stroke: new Stroke({ color: '#fff', width: 2 }) // Optional: Customize text stroke color and width
              })
          })
        })


      this.initBaseMap();
      this.loadGeoTiffFromCloud();

       this.addInteraction();
      
      this.getCircleRadii();


      // const modifyInteraction = new Modify({
      //     source: this.vectorSource, // Or features: selectInteraction.getFeatures() if using Select
      // });

      // this.map.addInteraction(modifyInteraction);
    }
    draw1!: Draw;
    // source1:VectorSource | undefined;


    onCheckboxChange(event:any){
      //  console.log("Evented is Checked wala>> ",event.checked);
      //  console.log("Modify Allow>> ",this.isModifyAllow);
       this.isModifyAllow=event.checked;
       if(event.checked){
        this.exModify.init();
       }
    }
    clearCircles(){
      this.circleSource.clear();
      this.centers=[];
      this.radii=[];
    }
    clearPolygons(){
      this.polygonSource.clear();
    }
    clearLines(){
      this.vectorSource.clear();
    }
    ToggleDraw(){
      // this.isDrawEnable!=this.isDrawEnable;
      if(this.isDrawEnable){
        this.isDrawEnable=false;
      }
      else{
        this.isDrawEnable=true;
        this.addInteraction();
      }
      console.log("enableity >>",this.isDrawEnable);
    }
    showModal() {
      this.modalVisible = true;
      this.snackbar.open("Ye Le Bro",'Close',{
        duration:8000
      })
    }
  

  // addInteractions() {
  //       this.modifyInteraction = new Modify({ source: this.vectorSource });
  //       this.map.addInteraction(this.modifyInteraction);

  //       // Snap interaction should be added after modify interaction
  //       this.snapInteraction = new Snap({ source: this.vectorSource });
  //       this.map.addInteraction(this.snapInteraction);
  //   }

    openSnackBar(message: string, action: string): void {
      this.snackbar.open(message, action, {
        duration: 8000
      });
   }

    hideModal() {
      this.modalVisible = false;
    }
     // Function to Add a Circle Feature
      addCircleFeature(
        center: number[],
        radius: number,
        label: string,
        fillColor: string,
        strokeColor: string
      ): void {
        const circle = new Circle(center, radius); // Create a Circle geometry
        const feature = new Feature(circle); // Create a Feature from the Circle geometry

        // Set properties for the feature, including the label for use in the style function
        feature.setProperties({
          label: label,
          fillColor: fillColor,
          strokeColor: strokeColor,
        });

        this.circleSource.addFeature(feature); // Add the feature to the vector source
      }

    getCircleRadii():void{
      if(this.circleLayer?.getSource()!=null){
        const source1: VectorSource = this.circleLayer?.getSource();
          // const source1: VectorSource<Feature> = this.circleLayer.getSource() ?? new VectorSource(); // Creates a new VectorSource if it's null
          const features:Feature[]=source1.getFeatures();
          console.log("Features>> ",features[0]);

       for(let i=0;i<features.length;i++){
         const feature=features[i];
         const geometry=feature.getGeometry();

         if(geometry instanceof Circle){
           const circle:Circle=geometry as Circle;
           const radius:number=circle.getRadius();
          
           const center1:number[]=  circle.getCenter();

           //ADD a label based on iteration or some another attribute --
           const label=`circle ${i+1} -Radius ${radius.toFixed(0)}`
           
          //  feature.setProperties({text:new Text({ // Add the Text style for the label
          //       text: `${label}`, // Set the default label text
          //       font: '12px Calibri,sans-serif', // Optional: Customize font style
          //       fill: new Fill({ color: '#fkxtdm' }), // Optional: Customize text fill color
          //       stroke: new Stroke({ color: '#fff', width: 2 }) // Optional: Customize text stroke color and width
          //     })});
          //     feature.set('label',label);
          //     feature.changed() //--> Notify the open layers that features are changed triggering style update
          //  this.addCircleFeature(center1,radius,label ,'#1fcb2f','#ffffff' );  
          //  this.circleSource.addFeature(feature); 
          
           console.log("Areaa>>" ,3.14*radius*radius);
           console.log("Centers>> ",center1);
          //  this.centers.push(center1);
          //  this.radii.push(radius);
         }
       }

       console.log("Radii of circle>> ",this.radii)
      }
     
    }
    getArea(radius: number): number {
     return Math.PI * radius * radius;
    }


    styleFunction = (feature: Feature, resolution: number) => {
      const label = feature.get('label');

     if (label) {
      const textStyle = new Text({
        text: label,
        font: '14px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
        textAlign: 'center',
        textBaseline: 'middle',
      });

      // Determine the style based on geometry type
      let featureFillColor = feature.get('fillColor') || 'rgba(255, 255, 255, 0.4)';
      let featureStrokeColor = feature.get('strokeColor') || '#3399CC';

      return [
        new Style({
          stroke: new Stroke({
            color: featureStrokeColor,
            width: 3,
          }),
          fill: new Fill({
            color: featureFillColor,
          }),
          text: textStyle, // Apply the text style here for direct labeling {Link: according to Stack Overflow https://stackoverflow.com/questions/52227638/openlayers-how-to-display-label-of-feature}
        }),
      ];
    } else {
      let featureFillColor = feature.get('fillColor') || 'rgba(255, 255, 255, 0.4)';
      let featureStrokeColor = feature.get('strokeColor') || '#3399CC';

      return [
        new Style({
          stroke: new Stroke({
            color: featureStrokeColor,
            width: 3,
          }),
          fill: new Fill({
            color: featureFillColor,
          }),
        }),
      ];
    }
     };

    addInteraction(){
     if(this.isDrawEnable){
            if(this.selectedOption=="Polygon"){
              this.draw1=new Draw({
                type:this.selectedOption,
                source:this.polygonSource,
            
                condition: (e) => this.isDrawEnable
              })
            this.polygonLayer.setZIndex(1);
            }
            else if(this.selectedOption=="Circle"){
              this.draw1=new Draw({
                type:this.selectedOption,
                source:this.circleSource,
              
                condition: (e) => this.isDrawEnable 
              })
            this.circleLayer.setZIndex(2);
        
            }
            else{
              this.draw1=new Draw({
              type:this.selectedOption,
              source:this.vectorSource,
            
              condition: (e) => this.isDrawEnable 
              })

              this.vectorLayer.setZIndex(2);
            }
            
            this.map.addInteraction(this.draw1);

              this.draw1.on('drawend', (event) => {
                const drawnFeature = event.feature;
                let label = '';
                console.log(event.feature);

              switch (this.selectedOption) {
                case 'Polygon':
                  this.polygonCount++;
                  console.log(this.polygonCount);
                  label = `Polygon ${this.polygonCount}`;
                  // Set a custom style directly on the feature
                      drawnFeature.setStyle(new Style({
                        stroke: new Stroke({
                          color: '#ff8800',
                          width: 2
                        }),
                        fill: new Fill({
                          color: 'rgba(170, 207, 22, 0.3)'
                        }),
                        text: new Text({
                          text: label,
                          font: '14px Calibri,sans-serif',
                          fill: new Fill({ color: '#000' }),
                          stroke: new Stroke({ color: '#fff', width: 2 }),
                          textAlign: 'center',
                          textBaseline: 'middle'
                        })
                      }));
                  break;
                case 'Circle':
                  this.circleCount++;
                  console.log(this.circleCount);
                  label = `Circle ${this.circleCount}`;

                  const geometry=event.feature.getGeometry();

              if(geometry instanceof Circle){
                const circle:Circle=geometry as Circle;
                const radius:number=circle.getRadius();
                
                const center1:number[]=  circle.getCenter();

                  // Set a custom style directly on the feature
                    drawnFeature.setStyle(new Style({
                      stroke: new Stroke({
                        color: '#000',
                        width: 2
                      }),
                      fill: new Fill({
                        color: 'rgba(23, 229, 33, 0.3)'
                      }),
                      text: new Text({
                        text: label,
                        font: '14px Calibri,sans-serif',
                        fill: new Fill({ color: '#000' }),
                        stroke: new Stroke({ color: '#fff', width: 2 }),
                        textAlign: 'center',
                        textBaseline: 'middle'
                      })
                    }));

                    this.centers.push(center1);
                    this.radii.push(radius);
                  }
                  break;
                case 'LineString':
                  this.lineCount++;
                  label = `Line ${this.lineCount}`;

                const geometry1=event.feature.getGeometry();

                if(geometry1 instanceof LineString){
                    const line:LineString=geometry as LineString;
                    const length:number=line.getLength();
                    this.lengths.push(length);
                }
                  // Set a custom style directly on the feature
                    drawnFeature.setStyle(new Style({
                      stroke: new Stroke({
                        color: '#000',
                        width: 2
                      }),
                      fill: new Fill({
                        color: 'rgba(11, 11, 11, 0.3)'
                      }),
                      text: new Text({
                        text: label,
                        font: '14px Calibri,sans-serif',
                        fill: new Fill({ color: '##000000' }),
                        stroke: new Stroke({ color: '#fff', width: 2 }),
                        textAlign: 'center',
                        textBaseline: 'middle'
                      })
                    }));


                  break;
                case 'Point':
                  this.pointCount++;
                  console.log(this.pointCount);
                  label = `Point ${this.pointCount}`;


                  break;
              }

          
              drawnFeature.set('label', label);
              drawnFeature.changed(); // trigger style update



        this.modifyInteraction = new Modify({ source: this.vectorSource });
        this.map.addInteraction(this.modifyInteraction);

        // Snap interaction should be added after modify interaction
        this.snapInteraction = new Snap({ source: this.vectorSource });
        this.map.addInteraction(this.snapInteraction);
          });
      //     this.draw1.on('drawend', (event) => {
      //   const drawnFeature = event.feature;

      //   // Generate a label
      //   this.polygonCount++;
      //   const label = `Polygon ${this.polygonCount}`;

      //   // Set a label property
      //   drawnFeature.set('label', label);

      //   // Set a custom style directly on the feature
      //   drawnFeature.setStyle(new Style({
      //     stroke: new Stroke({
      //       color: '#ff8800',
      //       width: 2
      //     }),
      //     fill: new Fill({
      //       color: 'rgba(255, 136, 0, 0.3)'
      //     }),
      //     text: new Text({
      //       text: label,
      //       font: '14px Calibri,sans-serif',
      //       fill: new Fill({ color: '#000' }),
      //       stroke: new Stroke({ color: '#fff', width: 2 }),
      //       textAlign: 'center',
      //       textBaseline: 'middle'
      //     })
      //   }));

      //   // Force update
      //   drawnFeature.changed();
      // });
        }

    }
    
    OnChangeOption(){
      console.log("Selected Option >>",this.selectedOption);
      this.map.removeInteraction(this.draw1);
      this.addInteraction();
    }

    ToggleView():void{
      // console.log("kisine click kiya")
      if(this.isStreet){
        this.isStreet=false;
      }
      else{
        this.isStreet=true;
      }
      //  console.log(this.isStreet);
      this.streetLayer.setVisible(this.isStreet);
      this.sateliteLayer.setVisible(!this.isStreet);
    }
  
    initBaseMap(): void {
      // proj4.defs("EPSG:32645", "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs");
      // register(proj4);

      this.streetLayer = new TileLayer({
          source: new OSM()
      });

      this.sateliteLayer = new TileLayer({
        source: new XYZ({
          url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          attributions: '© Google'
        }),
        visible: false // hide satellite initially
      });

      console.log("Hi from intialize base map>> ")
      this.map = new Map({
        target: 'map',
        layers: [this.streetLayer,this.sateliteLayer,this.vectorLayer,this.polygonLayer,this.circleLayer],
        
        view: new View({
          projection: 'EPSG:32645',
          center:[283655.0760507892, 2143000.559187768],
          zoom: 17,
        }),
        
      });
    

    }

    loadGeoTiffFromCloud(): void {
      const cloudFunctionURL = 'https://us-central1-nibrusweb-133b7.cloudfunctions.net/geoToolsGenerateURL';

      const signedUrlRequest = {
        fileType: 'ortho',
        fileUniqueID: 'orthophoto_17526682211925311006425',
        filesName: 'orthophoto.tif',
        operation: 'download',
        projectName: '30dec2024latestprojectwithoutgcp',
        purpose: 'tiffFileUploadDownload',
        userID: 'Ijkqc9fp2KgQmoN9L7re9AxOrek1',
        createdFromGeoworkspace: true,
      };

      this.http.post<any>(cloudFunctionURL, signedUrlRequest, {
        headers: { 'Content-Type': 'application/json' }
      }).subscribe(
        (data) => {
          const signedUrl = data.download_url;
          this.addGeoTiffLayer(signedUrl);
        },
        (error) => {
          console.error('Error loading GeoTIFF:', error);
        }
      );
    }

    addGeoTiffLayer(signedUrl: string): void {
      const geotiffSource = new GeoTIFF({
        sources: [{ url: signedUrl }],
      });

      const geotiffLayer = new WebGLTile({
        source: geotiffSource,
        // style: {
        //   color: ['rgb', ['clamp', ['band', 1], 0, 255], ['clamp', ['band', 2], 0, 255], ['clamp', ['band', 3], 0, 255]]
        // }
      });

      this.map.addLayer(geotiffLayer);
    }
    
    // ngAfterViewInit() {
    //     this.addInteractions(); // Call this after the map is initialized
    // }

    ngOnDestroy() {
        if (this.map) {
            if (this.modifyInteraction) {
                this.map.removeInteraction(this.modifyInteraction);
            }
            if (this.snapInteraction) {
                this.map.removeInteraction(this.snapInteraction);
            }
        }
    }
}

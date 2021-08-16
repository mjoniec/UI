import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { NbThemeService } from '@nebular/theme';
import { registerMap } from 'echarts';

@Component({
  selector: 'ngx-bubble-map',
  styleUrls: ['./bubble-map.component.scss'],
  template: `
    <nb-card>
      <nb-card-header>Bubble Maps</nb-card-header>
      <div echarts [options]="options" class="echarts"></div>
      <!--<img src = "assets/images/traffic.jpg" height="596" width="1000"/> -->
    </nb-card>
  `,
})
export class BubbleMapComponent implements OnDestroy {

  latlong: any = {};
  mapData: any[];
  mapData2: any[];
  max = -Infinity;
  min = Infinity;
  options: any;

  bubbleTheme: any;
  geoColors: any[];

  private alive = true;

  constructor(private theme: NbThemeService,
              private http: HttpClient) {

    combineLatest([
      // this.http.get('assets/map/world.json'),
//      this.http.get('https://mockairtraffic.azurewebsites.net/api/MockAirTrafficInfo/WorldMap'),
        
        //production
        //this.http.get('https://airtraffic.azurewebsites.net/api/AirTrafficInfo/WorldMap'),
        
        //localhost
        this.http.get('https://localhost:44389/api/AirTrafficInfo/WorldMap'),
      this.theme.getJsTheme(),
    ])
      .pipe(takeWhile(() => this.alive))
      .subscribe(([map, config]: [any, any]) => {

        registerMap('world', map);

        const colors = config.variables;
        this.bubbleTheme = config.variables.bubbleMap;
        this.geoColors = [colors.primary, colors.info, colors.success, colors.warning, colors.danger];
        
        interval(2000)
          .pipe(takeWhile(() => this.alive))
          .subscribe(() => {
            this.getAirTrafficInfo()
            .subscribe((res: any) => { 
              console.log('json: ', res);
              this.mapData = res['planes'];
              this.mapData2 = res['airports'];
  
                // this.mapData = [
                //   { 'latitude': 10, 'longitude': 10, 'name': 'plane x 1', 'value': 30, 'color': color1, symbolRotate: 45, symbol: 'arrow' },
                //   { 'latitude': 20, 'longitude': 20, 'name': 'plane x 2', 'value': 30, 'color': color1, symbolRotate: 10, symbol: 'arrow' },
                //   { 'latitude': 30, 'longitude': 30, 'name': 'airport x', 'value': 80, 'color': color1, symbolRotate: 60, symbol: 'triangle'},
                //   { 'latitude': 40, 'longitude': 40, 'name': 'plane y 1', 'value': 30, 'color': color2, symbolRotate: 20, symbol: 'arrow' },
                //   { 'latitude': 50, 'longitude': 50, 'name': 'airport y', 'value': 80, 'color': color2, symbolRotate: 10, symbol: 'triangle' }
                // ];
  
                // this.mapData2 = [
                //   { 'latitude': 60, 'longitude': 10, 'name': 'plane x 1', 'value': 30, 'color': color3 },
                //   { 'latitude': 60, 'longitude': 20, 'name': 'plane x 2', 'value': 30, 'color': color3 },
                //   { 'latitude': 60, 'longitude': 30, 'name': 'airport x', 'value': 80, 'color': color3 },
                //   { 'latitude': 60, 'longitude': 40, 'name': 'plane y 1', 'value': 30, 'color': color4 },
                //   { 'latitude': 60, 'longitude': 50, 'name': 'airport y', 'value': 80, 'color': color4 }        
                // ];
  
                //console.log('mapdata ', this.mapData);
                //console.log('mapdata2 ', this.mapData2);
  
                this.mapData.forEach((itemOpt) => {
                  if (itemOpt.value > this.max) {
                    this.max = itemOpt.value;
                  }
                  if (itemOpt.value < this.min) {
                    this.min = itemOpt.value;
                  }
                });
  
                this.options = {
                  title: {
                    text: 'Air Traffic',
                    left: 'center',
                    top: '16px',
                    textStyle: {
                      color: this.bubbleTheme.titleColor,
                    },
                  },
                  tooltip: {
                    trigger: 'item',

                    useHTML: true,
                    // formatter: function() {
                    //   var img = '<img src = "assets/images/eva.png" height="50" width="50"/><p>plane 1</p>'
                    //   return img
                    // },

                    formatter: params => {
                      //return `${params.name}: ${params.value[2]}`;
                      // return `<img src = "assets/images/${params.name}.png" height="50" width="50"/>${params.name}: ${params.value[2]}`
                      //png vs jpg return `<img src = "assets/images/Plane 1.png" height="50" width="50"/>`
                      return `<img src = "assets/images/${params.name}.jpg" height="80" width="80"/> ${params.name}`
                    },
                  },
                  visualMap: {
                    show: false,
                    min: 0,
                    max: this.max,
                    inRange: {
                      symbolSize: [2, 15]//,
                      //symbol: 'triangle' // overrides each individual item style
                      //symbol: 'arrow'
                    },
                  },
                  geo: {
                    name: 'Air Traffic',//change that
                    type: 'map',
                    map: 'world',
                    roam: true,
                    label: {
                      emphasis: {
                        show: false,
                      },
                    },
                    itemStyle: {
                      normal: {
                        areaColor: this.bubbleTheme.areaColor,
                        borderColor: this.bubbleTheme.areaBorderColor,
                      },
                      emphasis: {
                        areaColor: this.bubbleTheme.areaHoverColor,
                      },
                    },
                    zoom: 1.1,
                  },
                  series: [
                    {
                      type: 'scatter',
                      coordinateSystem: 'geo',
                      data: this.mapData.map(itemOpt => {
                        return {
                          name: itemOpt.name,
                          symbol: "triangle",//itemOpt.symbol,
                          symbolRotate: itemOpt.symbolRotate,
                          value: [
                            itemOpt.longitude,
                            itemOpt.latitude,
                            //itemOpt.value
                            10
                          ],
                          itemStyle: {
                            normal: {
                              color: itemOpt.color
                            },
                          }
                        };
                      }),
                    },
                    {
                      type: 'graph',
                      //type: 'scatter',
                      coordinateSystem: 'geo',
                      data: this.mapData2.map(itemOpt => {
                        return {
                          name: itemOpt.name,
                          symbol: "circle",//itemOpt.symbol,
                          symbolRotate: itemOpt.symbolRotate,
                          value: [
                            itemOpt.longitude,
                            itemOpt.latitude,
                            // itemOpt.value,
                            20
                          ],
                          itemStyle: {
                            normal: {
                              color: itemOpt.color,
                            },
                          }
                        };
                      }),
                    }
                  ],
                };
            });
          });
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  private getAirTrafficInfo(){
    //todo: figure out environment detection? 
    //todo: split into 2 separate pages each independently pointing each azure hosting - dockerised and mock

    //localhost on premises mock
    //return this.http.get('https://localhost:44389/api/MockAirTrafficInfo');
    
    //localhost on premises
    return this.http.get('https://localhost:44389/api/AirTrafficInfo');
    
    //Docker localhost
    //return this.http.get('http://localhost:8880/api/AirTrafficInfo');

    //Azure mock
    //return this.http.get('https://mockairtraffic.azurewebsites.net/api/MockAirTrafficInfo');
  }
}

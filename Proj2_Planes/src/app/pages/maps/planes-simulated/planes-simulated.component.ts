import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { NbThemeService } from '@nebular/theme';
import { registerMap } from 'echarts';

@Component({
  selector: 'ngx-planes-simulated',
  styleUrls: ['./planes-simulated.component.scss'],
  template: `
    <nb-card>
      <nb-card-header>Planes Simulated</nb-card-header>
      <div echarts [options]="options" class="echarts"></div>
      <!--<img src = "assets/images/traffic.jpg" height="596" width="1000"/> -->
    </nb-card>
  `,
})
export class PlanesSimulatedMapComponent implements OnDestroy {

  latlong: any = {};
  planes: any[];
  airports: any[];
  max = -Infinity;
  min = Infinity;
  options: any;

  bubbleTheme: any;
  geoColors: any[];

  private alive = true;

  constructor(private theme: NbThemeService,
              private http: HttpClient) {

    combineLatest([        
      //production on premises simulated
      //this.http.get('https://airtraffic.azurewebsites.net/api/TrafficInfo/WorldMap'),
      
      //localhost on premises
      this.http.get('https://localhost:44389/api/TrafficInfo/WorldMap'),
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
            this.getTrafficInfo()
            .subscribe((res: any) => { 
              
              //console.log('json: ', res);
              this.planes = res['planes'];
              this.airports = res['airports'];

                this.planes.forEach((itemOpt) => {
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
                    formatter: params => {
                      return `<img src = "assets/images/${params.name}.jpg" height="80" width="80"/> ${params.name}`;
                      
                      //#46 - tried to type dynamically info - this part seems to be static once per launch ... can not get ui changes to work here...
                      // if(typeof params.isGoodWeather == 'undefined') {
                      //   return `<img src = "assets/images/${params.name}.jpg" height="80" width="80"/> ${params.name} ${params.destinationAirportName}`;
                      // }
                      // else if(params.isGoodWeather == 'true') {
                      //   return `<img src = "assets/images/${params.name}.jpg" height="80" width="80"/> ${params.name}`;
                      // }
                      // else {
                      //   return `<img src = "assets/images/${params.name}.jpg" height="80" width="80"/> <img src = "assets/images/badWeather.jpg" height="80" width="80"/> ${params.name}`;
                      // }
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
                      data: this.planes.map(itemOpt => {
                        return {
                          name: itemOpt.name,// + ' Destination: ' + itemOpt.destinationAirportName,
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
                      data: this.airports.map(itemOpt => {
                        return {
                          name: itemOpt.name,// + ' weather:' + itemOpt.isGoodWeather,
                          symbol: this.getSymbolBasedOnWeather(itemOpt),//"circle",//itemOpt.symbol,
                          symbolRotate: itemOpt.symbolRotate,
                          value: [
                            itemOpt.longitude,
                            itemOpt.latitude,
                            // itemOpt.value,
                            20
                          ],
                          itemStyle: {
                            normal: {
                              color: this.getColorBasedOnWeather(itemOpt)
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

  private getSymbolBasedOnWeather(itemOpt) {
    if(itemOpt.isGoodWeather) { 
      return 'circle'; 
    } 
    else { 
      return 'square';
    }
  }

  private getColorBasedOnWeather(itemOpt) {
    if(itemOpt.isGoodWeather) { 
      return itemOpt.color; 
    } 
    else { 
      return '#000000';
    }
  }

  private getTrafficInfo(){
    //todo: figure out environment detection? 
    //todo: split into 2 separate pages each independently pointing to either dockerized or simulated backend's api

    //localhost on premises
    return this.http.get('https://localhost:44389/api/TrafficInfo');
  }
}

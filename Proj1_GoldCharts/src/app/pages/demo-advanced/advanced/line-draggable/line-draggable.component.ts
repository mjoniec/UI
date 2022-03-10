import { Component, OnDestroy, OnInit } from '@angular/core';
import * as util from 'zrender/lib/core/util';
import { HttpClient } from '@angular/common/http';

declare const require: any; // DEMO IGNORE

const SymbolSize = 2;
const Data = [];

@Component({
  selector: 'app-line-draggable',
  templateUrl: './line-draggable.component.html',
  styleUrls: ['./line-draggable.component.scss'],
})
export class LineDraggableComponent implements OnInit, OnDestroy {
  html = require('!!html-loader?-minimize!./line-draggable.component.html'); // DEMO IGNORE
  component = require('!!raw-loader!./line-draggable.component.ts').default; // DEMO IGNORE
  options: any;
  updatePosition: () => void;
  goldUsdPricesAll: any[];

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.getGoldUsd().subscribe((dataGold: any[])=>{
      this.goldUsdPricesAll = dataGold['prices'].map(function(a) {return a.value;} );

      for (let i = 0; i < 3000; i++) {
        var tmpArray = [];
        tmpArray.push(i);
        tmpArray.push(this.goldUsdPricesAll[i]);
        Data.push(tmpArray);
      }

      this.options = {
        title: {
          text: 'Try Dragging these Points',
        },
        tooltip: {
          triggerOn: 'none',
          formatter: (params) =>
            'X: ' + params.data[0].toFixed(2) + '<br>Y: ' + params.data[1].toFixed(2),
        },
        grid: {},
        xAxis: {
          min: 0,
          max: 3000,
          type: 'value',
          axisLine: { onZero: false },
        },
        yAxis: {
          min: 0,
          max: 1000,
          type: 'value',
          axisLine: { onZero: false },
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'empty',
          },
          {
            type: 'slider',
            yAxisIndex: 0,
            filterMode: 'empty',
          },
          {
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'empty',
          },
          {
            type: 'inside',
            yAxisIndex: 0,
            filterMode: 'empty',
          },
        ],
        series: [
          {
            id: 'a',
            type: 'line',
            smooth: true,
            symbolSize: SymbolSize,
            data: Data,
          },
        ],
      }
    });
  }

  ngOnDestroy() {
    if (this.updatePosition) {
      window.removeEventListener('resize', this.updatePosition);
    }
  }
  
  onChartReady(myChart: any) {

    const onPointDragging = function(dataIndex) {
      Data[dataIndex] = myChart.convertFromPixel({ gridIndex: 0 }, this.position) as number[];

      // Update data
      myChart.setOption({
        series: [
          {
            id: 'a',
            data: Data,
          },
        ],
      });
    };

    const showTooltip = (dataIndex) => {
      myChart.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex,
      });
    };

    const hideTooltip = () => {
      myChart.dispatchAction({
        type: 'hideTip',
      });
    };

    const updatePosition = () => {
      myChart.setOption({
        graphic: util.map(Data, (item) => ({
          position: myChart.convertToPixel({ gridIndex: 0 }, item),
        })),
      });
    };

    window.addEventListener('resize', updatePosition);
    myChart.on('dataZoom', updatePosition);

    // save handler and remove it on destroy
    this.updatePosition = updatePosition;

    setTimeout(() => {
      myChart.setOption({
        graphic: util.map(Data, (item, dataIndex) => {
          return {
            type: 'circle',
            position: myChart.convertToPixel({ gridIndex: 0 }, item),
            shape: {
              cx: 0,
              cy: 0,
              r: SymbolSize / 2,
            },
            invisible: true,
            draggable: true,
            ondrag: util.curry<(dataIndex: any) => void, number>(onPointDragging, dataIndex),
            onmousemove: util.curry<(dataIndex: any) => void, number>(showTooltip, dataIndex),
            onmouseout: util.curry<(dataIndex: any) => void, number>(hideTooltip, dataIndex),
            z: 100,
          };
        }),
      });
    }, 0);
  }//onChartReady
  
  public getGoldUsd() {
    return this.httpClient.get("https://goldchartsapi.azurewebsites.net/api/GoldCharts/USD/Gold/2000-1-1/2009-3-31")
    //return this.httpClient.get("https://localhost:44314/api/GoldCharts/USD/Gold/2000-1-1/2009-3-31") 
  }
}

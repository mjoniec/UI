import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare const require: any; // DEMO IGNORE

@Component({
  selector: 'app-basic-simple',
  templateUrl: './basic-simple.component.html',
  styleUrls: ['./basic-simple.component.scss'],
})
export class BasicSimpleComponent implements OnInit {
  html = require('!!html-loader?-minimize!./basic-simple.component.html'); // DEMO IGNORE
  component = require('!!raw-loader!./basic-simple.component.ts').default; // DEMO IGNORE
  options: any;
  datesAll: any[];
  goldUsdPricesAll: any[];
  goldEurPricesAll: any[];

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {

    this.getGoldUsd().subscribe((goldUsdJson: any[])=>{
      this.getGoldEUR().subscribe((goldEurJson: any[])=>{

        this.datesAll = goldUsdJson['prices'].map(function(a) {return a.date;} );
        this.goldUsdPricesAll = goldUsdJson['prices'].map(function(a) {return a.value;} );
        this.goldEurPricesAll = goldEurJson['prices'].map(function(a) {return a.value;} );

        const takeEveryDay = 30;
        const datesEvery30Day = [];
        const goldUsdPricesEvery30Day = [];
        const goldEurPricesEvery30Day = [];

        for (let i = 0; i < 100; i++) {
          datesEvery30Day.push(this.datesAll[i * takeEveryDay]);
          goldUsdPricesEvery30Day.push(this.goldUsdPricesAll[i * takeEveryDay]);
          goldEurPricesEvery30Day.push(this.goldEurPricesAll[i * takeEveryDay]);
        }

        this.options = {
          legend: {
            data: ['gold eur', 'gold usd'],
            align: 'left',
          },
          tooltip: {},
          xAxis: {
            data: datesEvery30Day,
            silent: false,
            splitLine: {
              show: false,
            },
          },
          yAxis: {},
          series: [
            {
              name: 'gold eur',
              type: 'bar',
              data: goldEurPricesEvery30Day,
              animationDelay: (idx) => idx * 10,
            },
            {
              name: 'gold usd',
              type: 'bar',
              data: goldUsdPricesEvery30Day,
              animationDelay: (idx) => idx * 10 + 100,
            },
          ],
          animationEasing: 'elasticOut',
          animationDelayUpdate: (idx) => idx * 5,
        }; // this.options

      }) //getSilverUsd
    }); //getGoldUsd
  }

  public getGoldUsd() {
    return this.httpClient.get("https://goldchartsapi.azurewebsites.net/api/GoldCharts/USD/Gold/2000-1-1/2009-3-31")
    //return this.httpClient.get("https://localhost:44314/api/GoldCharts/USD/Gold/2000-1-1/2009-3-31") 
  }

  public getGoldEUR() {
    return this.httpClient.get("https://goldchartsapi.azurewebsites.net/api/GoldCharts/EUR/Gold/2000-1-1/2009-3-31")
    //return this.httpClient.get("https://localhost:44314/api/GoldCharts/EUR/Gold/2000-1-1/2009-3-31") 
  }
}

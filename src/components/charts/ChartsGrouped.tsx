"use client";

import React, { useEffect, useState, useRef } from "react";
import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface ChartProps {
  titleChart?: string;
  title?: string;
  type?: string;
  categoriesList?: any;
  dataChart?: any;
  categoryTitle?: any;
  tooltipShow?: any;
}

const ChartsGrouped = ({
  titleChart,
  title,
  type,
  categoriesList,
  dataChart,
  categoryTitle,
  tooltipShow,
}: ChartProps) => {
  const chartRef = useRef<any>(null);

  const [isHighchartsReady, setIsHighchartsReady] = useState(false);

  useEffect(() => {
    require("highcharts/modules/accessibility")(Highcharts);
    setIsHighchartsReady(true);
  }, [Highcharts]);

  const options = {
    chart: {
      type: type,
    },
    title: {
      align: "center",
      text: title,
    },
    tooltip: {},
    xAxis: {
      categories: categoriesList,
      labels: {
        enabled: categoriesList?.length > 0 ? true : false,
      },
      // tickPositions: categoriesList,
      // tickLength: categoriesList?.length,
      title: {
        style: {
          textAlign: "center",
        },
        text: categoryTitle,
      },
    },
    yAxis: {
      title: {
        text: "Value",
      },
    },

    // plotOptions: {
    //   series: {
    //     borderWidth: 0,
    //     dataLabels: {
    //       enabled: true,
    //     },
    //   },
    // },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          allowOverlap: false,
          crop: false,
          padding: 4,
          // distance: 40,
          // rotation: 90,
          // overflow: "none",
          // style: { fontWeight: "normal", textShadow: "none" },
          // color: "#000000",
          formatter: function (this: any) {
            // return "(" + this.y + " art.)";
            return this.y;
          },
        },
      },
    },

    credits: {
      enabled: false,
    },
    series: dataChart,
  };

  if (tooltipShow) {
    options.tooltip = tooltipShow;
  }

  return (
    <div className="items-center">
      {titleChart && (
        <h1 className="flex justify-center py-4 font-bold">{titleChart}</h1>
      )}
      {isHighchartsReady ? (
        <HighchartsReact highcharts={Highcharts} options={options} />
      ) : (
        "loading..."
      )}
    </div>
  );
};

export default ChartsGrouped;

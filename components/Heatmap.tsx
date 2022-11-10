import React from "react";
import styles from "./Heatmap.module.scss";

export type HeatmapItem = {
  style: string;
  value: string;
  hint: string;
};

export type LegendItem = {
  style: string;
  label: string;
};

export type HeatmapProps = {
  fields: HeatmapItem[][];
  xValues: string[];
  yValues: string[];
  legends?: LegendItem[];
};

export default function Heatmap({
  fields,
  xValues,
  yValues,
  legends,
}: HeatmapProps) {
  return (
    <div className={styles.root}>
      <div className={styles.heatmap}>
        <div className={styles.yAxisCol}>
          {yValues.map((y, i) => (
            <div key={i} className={styles.yAxisCell}>
              {y}
            </div>
          ))}
          <div className={styles.yAxisCell}></div>
        </div>
        {fields.map((col, i) => (
          <div key={i} className={styles.col}>
            {col.map((cell, i) => (
              <div key={i} title={cell.hint} className={styles[cell.style]}>
                {cell.value}
              </div>
            ))}
            <div className={styles.xAxisCell}>{xValues[i]}</div>
          </div>
        ))}
      </div>
      {legends && (
        <div className={styles.legends}>
          {legends.map(({ style, label }, i) => (
            <React.Fragment key={i}>
              <div className={styles[style] + " " + styles.legendMark}> </div>
              <div className={styles.legendLabel}>{label}</div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

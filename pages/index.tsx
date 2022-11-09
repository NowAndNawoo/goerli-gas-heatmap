import Head from "next/head";
import Heatmap, { HeatmapItem, HeatmapProps } from "../components/Heatmap";
import styles from "../styles/Home.module.css";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { maxBy, range } from "lodash";

type FeeInfo = {
  block: number;
  time: number;
  base: number;
  rewards: number[];
};

function addDate(date: Date, value: number): Date {
  const result = new Date(date.getTime());
  result.setDate(date.getDate() + value);
  return result;
}

function getStyle(gwei: number): string {
  if (gwei < 0.1) return "cell1";
  if (gwei < 1) return "cell2";
  if (gwei < 10) return "cell3";
  if (gwei < 100) return "cell4";
  if (gwei < 300) return "cell5";
  return "cell6";
}

function getXLabel(time: number): string {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date(time);
  return `${date.toLocaleDateString()} ${weekDays[date.getDay()]}`;
}

function getYLabel(hour: number): string {
  return `${hour}:00`;
}

function toHeatmapProps(data: FeeInfo[]): HeatmapProps {
  const fees = data.map((feeInfo) => ({
    ...feeInfo,
    hour: new Date(feeInfo.time).getHours(),
    date: new Date(feeInfo.time).setHours(0, 0, 0, 0),
  }));
  const lastDate = new Date(maxBy(fees, "date")?.date!);
  const dates = range(8)
    .map((i) => addDate(lastDate, -i).getTime())
    .reverse();
  const hours = range(24);

  const fields: HeatmapItem[][] = dates.map((date) =>
    hours.map((hour) => {
      const item = fees.find((p) => p.hour === hour && p.date === date);
      if (item == null)
        return { style: "cellNull", value: "", hint: "no data" };
      const base = item.base / 10 ** 9;
      const reward20 = item.rewards[0] / 10 ** 9;
      const reward50 = item.rewards[1] / 10 ** 9;
      const reward80 = item.rewards[2] / 10 ** 9;
      const total = base + reward20;
      const dateStr = getXLabel(date);
      const timeStr = getYLabel(hour);
      return {
        style: getStyle(total),
        value: total.toFixed(4),
        hint: `${dateStr} ${timeStr}
Base: ${base.toFixed(4)}
Priority(Low): ${reward20.toFixed(4)}
Priority(Ave): ${reward50.toFixed(4)}
Priority(High): ${reward80.toFixed(4)}
Total: ${total.toFixed(4)}`,
      };
    })
  );
  const xValues = dates.map((date) => getXLabel(date));
  const yValues = hours.map((hour) => getYLabel(hour));

  return { fields, xValues, yValues };
}

export default function Home() {
  const { data } = useSWR<FeeInfo[], Error>(`/api/get`);

  const [heatmapProps, setHeatmapProps] = useState<HeatmapProps>();
  useEffect(() => {
    if (!data) return;
    setHeatmapProps(toHeatmapProps(data));
  }, [data]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Goerli Gas Heatmap</title>
        <meta name="description" content="Goerli Gas Heatmap" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Goerli Gas Heatmap</h1>

        <div className={styles.contents}>
          {!heatmapProps ? (
            <div>Loading...</div>
          ) : (
            <Heatmap {...heatmapProps} />
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://twitter.com/NowAndNawoo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by nawoo
        </a>
      </footer>
    </div>
  );
}

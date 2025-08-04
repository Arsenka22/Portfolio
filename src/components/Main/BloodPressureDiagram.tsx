// BloodPressureDiagram.tsx
import React, { useState, useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import { type TooltipItem } from "chart.js";
import { fetchPatients } from "../../Api/PatientsApi";
import ArrowBtn from "../../assets/ArrowBtn.svg";
import { StateCard } from "../../common/StateCard";
import CardIcon from "../../assets/CardIcon.svg";
import HeartBPm from "../../assets/HeartBPm.svg";
import temperature from "../../assets/temperature.svg";

declare module "chart.js" {
  interface GridLineOptions {
    borderDash?: number[];
  }
}

interface DiagnosisHistory {
  diagnosis: string;
  date: string;
  month: string;
  year: number;
  blood_pressure: {
    systolic: { value: number; levels: string };
    diastolic: { value: number; levels: string };
  };
  respiratory_rate: {
    value: number;
    levels: string;
  };
  heart_rate: {
    value: number;
    levels: string;
  };
  temperature: {
    value: number;
    levels: string;
  };
}

interface ChartPoint {
  x: number;
  y: number;
  level?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: ChartPoint[];
    borderColor: string;
    backgroundColor: string;
    pointRadius: number;
    pointHoverRadius: number;
    tension: number;
  }[];
}

export const BloodPressureChart = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [averages, setAverages] = useState({
    systolic: 0,
    diastolic: 0,
    respiratory: 0,
    heart: 0,
    temperature: 0,
  });
  const [activeValues, setActiveValues] = useState<{
    systolic: { value: number; level: string; comparison: string };
    diastolic: { value: number; level: string; comparison: string };
    date: string;
  } | null>(null);
  const [lastRecord, setLastRecord] = useState<DiagnosisHistory | null>(null);

  const chartRef = useRef<Chart<"line"> | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const patients = await fetchPatients();
        if (patients.length < 4) {
          throw new Error("Недостаточно пациентов в данных API");
        }
        const patient = patients[3];
        const history = patient.diagnosis_history;

        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const sortedHistory = Array.isArray(history)
          ? history.sort((a, b) => {
              const dateA = new Date(a.year, months.indexOf(a.month));
              const dateB = new Date(b.year, months.indexOf(b.month));
              return dateB.getTime() - dateA.getTime();
            })
          : [];

        const lastSixMonths = sortedHistory.slice(0, 6);

        const labels = lastSixMonths.map(
          (entry) => `${entry.month} ${entry.year}`
        );
        const systolicData = lastSixMonths.map((entry, index) => ({
          x: index,
          y: entry.blood_pressure.systolic.value,
          level: entry.blood_pressure.systolic.levels,
        }));
        const diastolicData = lastSixMonths.map((entry, index) => ({
          x: index,
          y: entry.blood_pressure.diastolic.value,
          level: entry.blood_pressure.diastolic.levels,
        }));

        const systolicValues = lastSixMonths.map(
          (entry) => entry.blood_pressure.systolic.value
        );
        const diastolicValues = lastSixMonths.map(
          (entry) => entry.blood_pressure.diastolic.value
        );
        const respiratoryValues = lastSixMonths.map(
          (entry) => entry.respiratory_rate.value
        );
        const heartValues = lastSixMonths.map(
          (entry) => entry.heart_rate.value
        );
        const temperatureValues = lastSixMonths.map(
          (entry) => entry.temperature.value
        );

        setAverages({
          systolic:
            systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length,
          diastolic:
            diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length,
          respiratory:
            respiratoryValues.reduce((a, b) => a + b, 0) /
            respiratoryValues.length,
          heart: heartValues.reduce((a, b) => a + b, 0) / heartValues.length,
          temperature:
            temperatureValues.reduce((a, b) => a + b, 0) /
            temperatureValues.length,
        });

        setLastRecord(lastSixMonths[0]);

        const lastIndex = lastSixMonths.length - 1;
        setActiveValues({
          systolic: {
            value: systolicData[lastIndex].y,
            level: systolicData[lastIndex].level || "N/A",
            comparison:
              systolicData[lastIndex].y > averages.systolic
                ? "higher than average"
                : systolicData[lastIndex].y < averages.systolic
                ? "lower than average"
                : "equal to average",
          },
          diastolic: {
            value: diastolicData[lastIndex].y,
            level: diastolicData[lastIndex].level || "N/A",
            comparison:
              diastolicData[lastIndex].y > averages.diastolic
                ? "higher than average"
                : diastolicData[lastIndex].y < averages.diastolic
                ? "lower than average"
                : "equal to average",
          },
          date: labels[lastIndex],
        });

        setChartData({
          labels,
          datasets: [
            {
              label: "Systolic",
              data: systolicData,
              borderColor: "#ff6384",
              backgroundColor: "#ff6384",
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.4,
            },
            {
              label: "Diastolic",
              data: diastolicData,
              borderColor: "#9966ff",
              backgroundColor: "#9966ff",
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.4,
            },
          ],
        });
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить данные пациента");
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (chartData && !chartRef.current) {
      const ctx = document.getElementById(
        "bloodPressureChart"
      ) as HTMLCanvasElement | null;

      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: "line",
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: "category",
                ticks: { color: "#9ca3af" },
                grid: { display: false },
              },
              y: {
                min: 60,
                max: 180,
                ticks: { stepSize: 20, color: "#9ca3af" },
                grid: { display: true, borderDash: [5, 5], color: "#e5e7eb" },
              },
            },
            plugins: {
              legend: {
                position: "right" as const,
                display: false,
                labels: {
                  color: "#6b7280",
                  usePointStyle: true,
                  pointStyle: "circle",
                },
              },
              tooltip: {
                callbacks: {
                  label: (context: TooltipItem<"line">) => {
                    const point = context.raw as ChartPoint;
                    return `${context.dataset.label}: ${point.y} мм рт. ст. (${
                      point.level || "N/A"
                    })`;
                  },
                },
              },
            },
            interaction: {
              mode: "index",
              intersect: false,
            },
            onHover: (event: any, elements: any) => {
              if (
                elements &&
                elements.length > 0 &&
                activeValues &&
                chartData
              ) {
                const index = elements[0].index;

                if (chartData.labels[index] !== activeValues.date) {
                  const newSystolic = chartData.datasets[0].data[
                    index
                  ] as ChartPoint;
                  const newDiastolic = chartData.datasets[1].data[
                    index
                  ] as ChartPoint;

                  setActiveValues({
                    systolic: {
                      value: newSystolic.y,
                      level: newSystolic.level || "N/A",
                      comparison:
                        newSystolic.y > averages.systolic
                          ? "higher than average"
                          : newSystolic.y < averages.systolic
                          ? "lower than average"
                          : "equal to average",
                    },
                    diastolic: {
                      value: newDiastolic.y,
                      level: newDiastolic.level || "N/A",
                      comparison:
                        newDiastolic.y > averages.diastolic
                          ? "higher than average"
                          : newDiastolic.y < averages.diastolic
                          ? "lower than average"
                          : "equal to average",
                    },
                    date: chartData.labels[index],
                  });
                }
              }
            },
          },
        });
      }
    } else if (chartRef.current && chartData) {
      chartRef.current.data = chartData;
      chartRef.current.update();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartData, averages, activeValues]);

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!chartData || !activeValues || !lastRecord)
    return <div className="text-gray-500 text-center">Загрузка...</div>;

  return (
    <div className="bloodPressure-container w-full  max-w-[766px] h-[673px] p-[20px] bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-[40px]">
        Diagnosis history
      </h2>

      <div className="max-w-[726px] w-full h-[298px] ml-[1%] p-4 bg-purple-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Blood Pressure
          </h2>
          <span className="w-content text-gray-500 flex justify-end align-center gap-3 relative right-73">
            Last 6 months <img src={ArrowBtn} alt="Arrow" />
          </span>
        </div>

        <div className="flex">
          <div className="relative h-[187px] flex-1">
            <canvas id="bloodPressureChart" className="w-full h-[298px]" />
          </div>

          <div className="w-64 h-[268px] relative bottom-15 ml-6 p-4 bg-transparent rounded-lg ">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#ff6384] mr-2"></div>
                  <span className="font-medium">Systolic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">
                    {activeValues.systolic.value}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Level: {activeValues.systolic.level}
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              <div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#9966ff] mr-2"></div>
                  <span className="font-medium">Diastolic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">
                    {activeValues.diastolic.value}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Level: {activeValues.diastolic.level}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-[20px] gap-[21px]">
        <StateCard
          icon={
            <img src={CardIcon} alt="Arrow" className="w-[96px] h-[96px]" />
          }
          stateName="Respiratory Rate"
          rate={`${Math.round(averages.respiratory)} BPM`}
          state={lastRecord.respiratory_rate.levels}
          color="bg-[#E0F3FA]"
          textColor="text-green-800"
        />
        <StateCard
          icon={
            <img src={temperature} alt="Arrow" className="w-[96px] h-[96px]" />
          }
          stateName="Temperature"
          rate={`${Math.round(averages.temperature * 10) / 10} F`}
          state={lastRecord.temperature.levels}
          color="bg-[#FFE6F1]"
          textColor="text-yellow-800"
        />
        <StateCard
          icon={
            <img src={HeartBPm} alt="Arrow" className="w-[96px] h-[96px]" />
          }
          stateName="Heart Rate"
          rate={`${Math.round(averages.heart)} BPM`}
          state={lastRecord.heart_rate.levels}
          color="bg-[#FFE6E9]"
          textColor="text-red-800"
        />
      </div>
    </div>
  );
};

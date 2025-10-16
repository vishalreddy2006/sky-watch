import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

type WeatherData = any;

function toCSV(data: WeatherData) {
  if (!data) return "";
  const rows: string[] = [];
  rows.push("section,dt,temp,humidity,pressure,wind_speed,uvi,description");
  if (data.current) {
    rows.push(
      [
        "current",
        data.current.dt,
        data.current.temp,
        data.current.humidity,
        data.current.pressure,
        data.current.wind_speed,
        data.current.uvi,
        data.current.weather?.[0]?.description || "",
      ].join(",")
    );
  }
  (data.hourly || []).slice(0, 24).forEach((h: any) => {
    rows.push(["hourly", h.dt, h.temp, "", "", "", "", h.weather?.[0]?.description || ""].join(","));
  });
  (data.daily || []).slice(0, 7).forEach((d: any) => {
    rows.push(["daily", d.dt, `${d.temp?.min}-${d.temp?.max}`, "", "", "", "", d.weather?.[0]?.description || ""].join(","));
  });
  return rows.join("\n");
}

async function toPDF(data: WeatherData) {
  const mod: any = await import("jspdf");
  const jsPDF = mod.jsPDF || mod.default || mod;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("SkyWatch Weather Report", 14, 16);
  doc.setFontSize(10);
  let y = 24;
  const write = (line: string) => { doc.text(line, 14, y); y += 6; };
  if (data?.current) {
    write(`Now: ${data.current.temp}°, ${data.current.weather?.[0]?.description || ""}`);
    write(`Humidity: ${data.current.humidity}%  Wind: ${data.current.wind_speed}  UVI: ${data.current.uvi}`);
  }
  write(""); write("Next 24 hours:");
  (data?.hourly || []).slice(0, 8).forEach((h: any) => write(`• ${h.temp}°, ${h.weather?.[0]?.description || ""}`));
  write(""); write("Next 7 days:");
  (data?.daily || []).slice(0, 5).forEach((d: any) => write(`• ${d.temp?.min}-${d.temp?.max}°, ${d.weather?.[0]?.description || ""}`));
  return doc.output("blob");
}

interface Props { data: WeatherData; disabled?: boolean }

export const ExportMenu: React.FC<Props> = ({ data, disabled }) => {
  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const onCSV = () => {
    const csv = toCSV(data);
    download(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "weather.csv");
  };

  const onPDF = async () => {
    const blob = await toPDF(data);
    download(blob, "weather.pdf");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onCSV}>Download CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={onPDF}>Download PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;

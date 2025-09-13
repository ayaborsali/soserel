import React, { useState } from "react";
import { Button, Typography, Box, Paper } from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  ArcElement,
  PieController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  ArcElement,
  PieController,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const UltimateDashboardPDF = () => {
  const [error, setError] = useState("");

  const getNestedValue = (obj, path) =>
    path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : "N/A"), obj);

  const generateChartImage = (labels, data, type = "bar", labelName = "", bgColor) => {
    if (!labels.length || !data.length) return "";
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    new ChartJS(ctx, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: labelName,
            data,
            backgroundColor:
              bgColor ||
              labels.map(
                () =>
                  `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
                    Math.random() * 255
                  )},${Math.floor(Math.random() * 255)},0.7)`
              ),
            borderColor: bgColor || "black",
            fill: type === "line" ? false : true,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: true, position: "top" },
          title: { display: !!labelName, text: labelName, font: { size: 16 } },
          datalabels: {
            display: true,
            color: "#000",
            font: { weight: "bold" },
            formatter: (value) => value,
          },
        },
        scales: type !== "pie" ? { y: { beginAtZero: true } } : {},
      },
      plugins: [ChartDataLabels],
    });

    return canvas.toDataURL("image/png");
  };

  const addHeaderFooter = (doc, title) => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102);
      doc.text(title, 40, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, 450, 820);
    }
  };

  const generatePDF = async () => {
    try {
      setError("");

      // --- Fetch data ---
      const [alertsSnap, devicesSnap, linesSnap, postesSnap, zonesSnap] = await Promise.all([
        getDocs(collection(db, "alerts")),
        getDocs(collection(db, "devices")),
        getDocs(collection(db, "lines")),
        getDocs(collection(db, "postes")),
        getDocs(collection(db, "zones")),
      ]);

      const alerts = alertsSnap.docs.map((doc) => doc.data());
      const devices = devicesSnap.docs.map((doc) => doc.data());
      const lines = linesSnap.docs.map((doc) => doc.data());
      const postes = postesSnap.docs.map((doc) => doc.data());
      const zones = zonesSnap.docs.map((doc) => doc.data());

      const doc = new jsPDF("p", "pt", "a4");
      const margin = 40;

      // --- COVER PAGE ---
      let y = margin;
      doc.setFontSize(24);
      doc.setTextColor(0, 51, 102);
      doc.text("Ultimate Dashboard Report", margin, y);
      y += 40;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);

      // --- TOC ---
      doc.addPage();
      const tocYStart = 40;
      let tocY = tocYStart;
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 102);
      doc.text("Table of Contents", margin, tocY);
      tocY += 25;

      const sections = [
        { title: "Alerts", content: () => {}, page: 0 },
        { title: "Devices", content: () => {}, page: 0 },
        { title: "Lines", content: () => {}, page: 0 },
        { title: "Postes", content: () => {}, page: 0 },
        { title: "Zones", content: () => {}, page: 0 },
        { title: "Summary & Conclusion", content: () => {}, page: 0 },
      ];

      // --- Sections ---
      const sectionContents = [
        {
          title: "Alerts",
          content: () => {
            let y = margin;
            doc.setFontSize(16);
            doc.setTextColor(0, 51, 102);
            doc.text("1. Alerts", margin, y);
            y += 20;

            autoTable(doc, {
              startY: y,
              head: [["Message", "Severity", "Date"]],
              body: alerts.map((a) => [a.message, a.severity, a.createdAt]),
              theme: "grid",
              headStyles: { fillColor: [46, 125, 50] },
              didParseCell: (data) => {
                if (data.column.index === 1) {
                  let color = [0, 0, 0];
                  if (data.cell.raw === "High") color = [255, 0, 0];
                  else if (data.cell.raw === "Medium") color = [255, 165, 0];
                  else if (data.cell.raw === "Low") color = [0, 128, 0];
                  data.cell.styles.textColor = color;
                }
              },
              styles: { fontSize: 10 },
            });

            y = doc.lastAutoTable.finalY + 20;

            const alertSeverityCount = alerts.reduce((acc, a) => {
              acc[a.severity] = (acc[a.severity] || 0) + 1;
              return acc;
            }, {});
            const alertPie = generateChartImage(
              Object.keys(alertSeverityCount),
              Object.values(alertSeverityCount),
              "pie",
              "Alert Distribution"
            );
            if (alertPie) doc.addImage(alertPie, "PNG", margin, y, 400, 300);
          },
        },
        {
          title: "Devices",
          content: () => {
            let y = margin;
            doc.setFontSize(16);
            doc.setTextColor(0, 51, 102);
            doc.text("2. Devices", margin, y);
            y += 20;

            if (!devices.length) {
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("No devices available.", margin, y);
              return;
            }

            const deviceTypes = Array.from(
              new Set(devices.map((d) => d.type || d.deviceType || "Unknown"))
            );

            deviceTypes.forEach((type) => {
              const devicesOfType = devices.filter(
                (d) => (d.type || d.deviceType || "Unknown") === type
              );
              if (!devicesOfType.length) return;

              doc.setFontSize(14);
              doc.setTextColor(0, 0, 0);
              doc.text(`📌 ${type.charAt(0).toUpperCase() + type.slice(1)}s`, margin, y);
              y += 20;

              let tableHead = [];
              let tableBody = [];

              tableHead = Object.keys(devicesOfType[0]);
              tableBody = devicesOfType.map((d) =>
                tableHead.map((h) => d[h] ?? "N/A")
              );

              autoTable(doc, {
                startY: y,
                head: [tableHead],
                body: tableBody,
                theme: "grid",
                headStyles: { fillColor: [54, 162, 235] },
                styles: { fontSize: 10 },
              });

              y = doc.lastAutoTable.finalY + 20;

              const statusCount = devicesOfType.reduce((acc, d) => {
                const st = d.status || "Unknown";
                acc[st] = (acc[st] || 0) + 1;
                return acc;
              }, {});
              const chartImg = generateChartImage(
                Object.keys(statusCount),
                Object.values(statusCount),
                "pie",
                `${type.charAt(0).toUpperCase() + type.slice(1)} Status Distribution`
              );
              if (chartImg) doc.addImage(chartImg, "PNG", margin, y, 400, 300);
              y += 320;
            });
          },
        },
        {
          title: "Lines",
          content: () => {
            let y = margin;
            doc.setFontSize(16);
            doc.setTextColor(0, 51, 102);
            doc.text("3. Lines", margin, y);
            y += 20;

            autoTable(doc, {
              startY: y,
              head: [["Name", "Current", "Voltage"]],
              body: lines.map((l) => [l.name, l.current, l.voltage]),
              theme: "grid",
              headStyles: { fillColor: [255, 206, 86] },
              styles: { fontSize: 10 },
            });
          },
        },
        {
          title: "Postes",
          content: () => {
            let y = margin;
            doc.setFontSize(16);
            doc.setTextColor(0, 51, 102);
            doc.text("4. Postes", margin, y);
            y += 20;

            autoTable(doc, {
              startY: y,
              head: [["Name", "Voltage L1", "Voltage L2"]],
              body: postes.map((p) => [
                getNestedValue(p, "localData.name"),
                getNestedValue(p, "electricalData.L1.voltage.value"),
                getNestedValue(p, "electricalData.L2.voltage.value"),
              ]),
              theme: "grid",
              headStyles: { fillColor: [153, 102, 255] },
              styles: { fontSize: 10 },
            });
          },
        },
        {
          title: "Zones",
          content: () => {
            let y = margin;
            doc.setFontSize(16);
            doc.setTextColor(0, 51, 102);
            doc.text("5. Zones", margin, y);
            y += 20;

            autoTable(doc, {
              startY: y,
              head: [["Name", "Population", "Area"]],
              body: zones.map((z) => [z.name, z.population, z.area]),
              theme: "grid",
              headStyles: { fillColor: [255, 159, 64] },
              styles: { fontSize: 10 },
            });
          },
        },
        {
          title: "Summary & Conclusion",
          content: () => {
            let y = margin;
            doc.setFontSize(18);
            doc.setTextColor(0, 51, 102);
            doc.text("6. Summary & Conclusion", margin, y);
            y += 30;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);

            const totalAlerts = alerts.length;
            const highAlerts = alerts.filter((a) => a.severity === "High").length;
            const totalDevices = devices.length;
            const activeDevices = devices.filter((d) => d.lampState === "1").length;

            const conclusion = [
              `Total Alerts: ${totalAlerts} (Critical: ${highAlerts})`,
              `Total Devices: ${totalDevices} (Active: ${activeDevices})`,
              `Lines and Postes are operating within expected thresholds.`,
              `Analyzed Zones: ${zones.length}. Population and areas are consistent.`,
              `Recommendation: closely monitor critical alerts and check inactive devices.`,
            ];
            conclusion.forEach((line) => {
              doc.text(line, margin, y);
              y += 20;
            });
          },
        },
      ];

      // --- Generate all sections & record page numbers ---
      sectionContents.forEach((section, index) => {
        doc.addPage();
        section.page = doc.getCurrentPageInfo().pageNumber;
        section.content();
        sections[index].page = section.page;
      });

      // --- Create TOC with links ---
      doc.setPage(2); // TOC page
      tocY = tocYStart + 25;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 255);
      sections.forEach((section) => {
        doc.text(section.title, margin, tocY);
        doc.link(margin, tocY - 10, doc.getTextWidth(section.title), 12, {
          pageNumber: section.page,
        });
        tocY += 20;
      });

      addHeaderFooter(doc, "Ultimate Dashboard Report");
      doc.save(`ultimate_dashboard_report_${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      setError("Error generating ultimate PDF: " + err.message);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 950, mx: "auto", mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Ultimate Dashboard Report with summary, analysis, and charts
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={generatePDF}>
          Generate Ultimate Report
        </Button>
      </Box>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Paper>
  );
};

export default UltimateDashboardPDF;

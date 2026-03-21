import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

export default function ExportPDFButton({ strain, readings, nutrients, wateringActions, harvests, feedingPlans }) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 16;
      const contentW = pageW - margin * 2;
      let y = 0;

      const addPage = () => {
        doc.addPage();
        y = margin;
      };

      const checkPageBreak = (needed = 10) => {
        if (y + needed > 270) addPage();
      };

      const sectionHeader = (title) => {
        checkPageBreak(14);
        doc.setFillColor(22, 22, 30);
        doc.roundedRect(margin, y, contentW, 9, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(74, 222, 128);
        doc.text(title.toUpperCase(), margin + 4, y + 6);
        y += 14;
        doc.setTextColor(60, 60, 60);
      };

      const labelValue = (label, value, xOffset = 0) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(label, margin + xOffset, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        doc.text(String(value ?? "—"), margin + xOffset, y + 5);
        return y + 10;
      };

      // ── Cover / Header ──────────────────────────────────────────────
      doc.setFillColor(18, 18, 23);
      doc.rect(0, 0, pageW, 40, "F");
      doc.setFillColor(74, 222, 128);
      doc.rect(0, 40, pageW, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("DANK BLOSSOM", margin, 17);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 180, 180);
      doc.text("Grow Report", margin, 24);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, margin, 31);

      y = 50;

      // ── Strain Overview ─────────────────────────────────────────────
      sectionHeader("Strain Overview");
      const cols = [0, contentW / 4, contentW / 2, (contentW * 3) / 4];
      const info = [
        ["STRAIN", strain.name],
        ["TYPE", `${strain.type}${strain.plant_type ? " / " + strain.plant_type : ""}`],
        ["BREEDER", strain.breeder || "—"],
        ["STATUS", strain.status],
        ["THC %", strain.thc_percentage != null ? `${strain.thc_percentage}%` : "—"],
        ["CBD %", strain.cbd_percentage != null ? `${strain.cbd_percentage}%` : "—"],
        ["FLOWERING", strain.flowering_time_weeks ? `${strain.flowering_time_weeks} wks` : "—"],
        ["PLANTED", strain.planted_date ? format(new Date(strain.planted_date), "MMM d, yyyy") : "—"],
      ];
      for (let i = 0; i < info.length; i += 4) {
        const row = info.slice(i, i + 4);
        row.forEach(([lbl, val], ci) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text(lbl, margin + cols[ci], y);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(30, 30, 30);
          doc.text(String(val), margin + cols[ci], y + 5);
        });
        y += 13;
        checkPageBreak();
      }
      if (strain.notes) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text("NOTES", margin, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        const noteLines = doc.splitTextToSize(strain.notes, contentW);
        doc.text(noteLines, margin, y + 5);
        y += 6 + noteLines.length * 4;
      }
      y += 4;

      // ── Environmental Readings ──────────────────────────────────────
      if (readings.length > 0) {
        sectionHeader(`Grow Log (${readings.length} readings)`);

        // Latest snapshot
        const latest = readings[0];
        const metrics = [
          ["TEMP (°F)", latest.temperature],
          ["HUMIDITY", latest.humidity ? `${latest.humidity}%` : "—"],
          ["PPFD", latest.ppfd ? `${latest.ppfd} µmol` : "—"],
          ["EC", latest.ec ? `${latest.ec} mS/cm` : "—"],
          ["VPD", latest.vpd ? `${latest.vpd} kPa` : "—"],
          ["pH", latest.ph],
        ];

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text("LATEST READING SNAPSHOT", margin, y);
        y += 5;

        metrics.forEach(([lbl, val], i) => {
          const x = margin + (i % 3) * (contentW / 3);
          if (i % 3 === 0 && i !== 0) y += 12;
          checkPageBreak(12);
          doc.setFillColor(245, 245, 245);
          doc.roundedRect(x, y, contentW / 3 - 2, 10, 1, 1, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text(lbl, x + 2, y + 4);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(30, 30, 30);
          doc.text(String(val ?? "—"), x + 2, y + 9);
        });
        y += 16;

        // Readings table (last 20)
        const tableReadings = readings.slice(0, 20);
        checkPageBreak(20);
        const headers = ["Date", "Temp °F", "Humidity", "PPFD", "EC", "VPD", "pH", "Stage"];
        const colWs = [30, 18, 18, 18, 16, 16, 14, 22];

        doc.setFillColor(235, 235, 235);
        doc.rect(margin, y, contentW, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        let cx = margin;
        headers.forEach((h, i) => { doc.text(h, cx + 1, y + 5); cx += colWs[i]; });
        y += 7;

        tableReadings.forEach((r, ri) => {
          checkPageBreak(7);
          if (ri % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(margin, y, contentW, 7, "F"); }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(40, 40, 40);
          const row = [
            format(new Date(r.created_date), "MMM d, yy"),
            r.temperature ?? "—",
            r.humidity ? `${r.humidity}%` : "—",
            r.ppfd ?? "—",
            r.ec ?? "—",
            r.vpd ?? "—",
            r.ph ?? "—",
            r.grow_stage ?? "—",
          ];
          cx = margin;
          row.forEach((val, i) => { doc.text(String(val), cx + 1, y + 5); cx += colWs[i]; });
          y += 7;
        });
        if (readings.length > 20) {
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text(`... and ${readings.length - 20} more readings`, margin, y + 4);
          y += 8;
        }
        y += 6;
      }

      // ── Nutrient Schedule ───────────────────────────────────────────
      if (nutrients.length > 0) {
        sectionHeader(`Nutrient Schedule (${nutrients.length} entries)`);
        const nHeaders = ["Date", "Nutrient", "Brand", "Type", "Amount (ml)", "Stage"];
        const nColWs = [26, 44, 30, 22, 22, 22];

        checkPageBreak(14);
        doc.setFillColor(235, 235, 235);
        doc.rect(margin, y, contentW, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        let hx = margin;
        nHeaders.forEach((h, i) => { doc.text(h, hx + 1, y + 5); hx += nColWs[i]; });
        y += 7;

        nutrients.forEach((n, ni) => {
          checkPageBreak(7);
          if (ni % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(margin, y, contentW, 7, "F"); }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(40, 40, 40);
          const row = [
            format(new Date(n.created_date), "MMM d, yy"),
            (n.nutrient_name || "").substring(0, 20),
            (n.brand || "—").substring(0, 14),
            n.nutrient_type || "—",
            n.volume_ml ?? "—",
            n.grow_stage || "—",
          ];
          let nx = margin;
          row.forEach((val, i) => { doc.text(String(val), nx + 1, y + 5); nx += nColWs[i]; });
          y += 7;
        });
        y += 6;
      }

      // ── Feeding Plans ───────────────────────────────────────────────
      if (feedingPlans.length > 0) {
        sectionHeader(`Feeding Plan (${feedingPlans.length} weeks)`);
        feedingPlans.sort((a, b) => a.week - b.week).forEach((p) => {
          checkPageBreak(16);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(50, 50, 50);
          doc.text(`Week ${p.week} — ${p.stage}`, margin, y);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          const details = [`Target EC: ${p.target_ec ?? "—"}`, `Target pH: ${p.target_ph ?? "—"}`, p.completed ? "✓ Completed" : "Pending"].join("   ");
          doc.text(details, margin, y + 5);
          if (p.notes) {
            doc.setTextColor(120, 120, 120);
            doc.text(`Notes: ${p.notes}`, margin, y + 10);
            y += 14;
          } else {
            y += 10;
          }
        });
        y += 4;
      }

      // ── Harvests ────────────────────────────────────────────────────
      if (harvests.length > 0) {
        sectionHeader(`Harvest Records (${harvests.length})`);
        harvests.forEach((h, hi) => {
          checkPageBreak(30);
          doc.setFillColor(248, 255, 250);
          doc.roundedRect(margin, y, contentW, 28, 2, 2, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(30, 30, 30);
          doc.text(`Harvest #${hi + 1} — ${format(new Date(h.harvest_date), "MMMM d, yyyy")}`, margin + 4, y + 7);
          const hRow = [
            ["Wet Weight", h.wet_weight_grams ? `${h.wet_weight_grams}g` : "—"],
            ["Dry Weight", h.dry_weight_grams ? `${h.dry_weight_grams}g` : "—"],
            ["Cured Weight", h.cured_weight_grams ? `${h.cured_weight_grams}g` : "—"],
            ["Quality", h.quality_rating ? `${h.quality_rating}/10` : "—"],
            ["Trichomes", h.trichome_color || "—"],
          ];
          hRow.forEach(([lbl, val], i) => {
            const hx = margin + 4 + i * (contentW / 5);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text(lbl, hx, y + 14);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(30, 30, 30);
            doc.text(String(val), hx, y + 20);
          });
          if (h.notes) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.text(`Notes: ${h.notes.substring(0, 80)}`, margin + 4, y + 26);
          }
          y += 32;
        });
      }

      // ── Footer on all pages ─────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 284, pageW, 13, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(140, 140, 140);
        doc.text("Dank Blossom — dankblossom.app", margin, 291);
        doc.text(`Page ${p} of ${totalPages}`, pageW - margin - 20, 291);
      }

      doc.save(`${strain.name.replace(/\s+/g, "_")}_grow_report.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={loading}
      variant="outline"
      size="sm"
      className="border-white/10 text-white hover:bg-white/5 gap-2"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
      Export PDF
    </Button>
  );
}
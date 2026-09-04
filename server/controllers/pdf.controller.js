import PDFDocument from "pdfkit";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

export const pdfDownload = async (req, res) => {
let tempDir = null;

try {
const { result } = req.body;


if (!result) {
  return res.status(400).json({
    error: "No content provided"
  });
}

// =====================================================
// PDF SETUP
// =====================================================

const doc = new PDFDocument({
  size: "A4",
  margins: {
    top: 60,
    bottom: 55,
    left: 55,
    right: 55
  },
  bufferPages: true,
  info: {
    Title: "SmartNotes AI",
    Author: "SmartNotes AI",
    Subject: "Exam Preparation Notes"
  }
});

res.setHeader("Content-Type", "application/pdf");

res.setHeader(
  "Content-Disposition",
  'attachment; filename="SmartNotesAI.pdf"'
);

doc.pipe(res);

// =====================================================
// COLORS
// =====================================================

const COLORS = {
  primary: "#4F46E5",
  purple: "#7C3AED",
  blue: "#2563EB",
  green: "#16A34A",
  cyan: "#0891B2",
  rose: "#E11D48",
  orange: "#EA580C",
  dark: "#111827",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  border: "#D1D5DB",
  white: "#FFFFFF"
};

// =====================================================
// BASIC HELPERS
// =====================================================

const pageWidth =
  doc.page.width -
  doc.page.margins.left -
  doc.page.margins.right;

const bottomLimit =
  doc.page.height -
  doc.page.margins.bottom;

const cleanText = (text = "") => {
  return String(text)
    .replace(/\r/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
};

const ensureSpace = (height = 50) => {
  if (doc.y + height > bottomLimit) {
    doc.addPage();
  }
};

// =====================================================
// HEADER / FOOTER
// =====================================================

const drawHeader = () => {
  if (doc.page.number === 1) return;

  doc.save();

  doc
    .moveTo(doc.page.margins.left, 38)
    .lineTo(
      doc.page.width - doc.page.margins.right,
      38
    )
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(COLORS.gray)
    .text(
      "SmartNotes AI",
      doc.page.margins.left,
      25
    );

  doc.restore();
};

const drawFooter = () => {
  doc.save();

  doc
    .moveTo(
      doc.page.margins.left,
      doc.page.height - 40
    )
    .lineTo(
      doc.page.width - doc.page.margins.right,
      doc.page.height - 40
    )
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.gray)
    .text(
      `SmartNotes AI  •  Page ${doc.page.number}`,
      doc.page.margins.left,
      doc.page.height - 30,
      {
        width: pageWidth,
        align: "center"
      }
    );

  doc.restore();
};

// =====================================================
// PAGE EVENT
// =====================================================

doc.on("pageAdded", () => {
  drawHeader();
});

// =====================================================
// TEXT HELPERS
// =====================================================

const heading = (
  text,
  color = COLORS.primary
) => {
  ensureSpace(60);

  doc.moveDown(0.5);

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(color)
    .text(cleanText(text), {
      width: pageWidth
    });

  doc.moveDown(0.3);

  doc
    .moveTo(
      doc.page.margins.left,
      doc.y
    )
    .lineTo(
      doc.page.width -
        doc.page.margins.right,
      doc.y
    )
    .strokeColor(color)
    .lineWidth(1)
    .stroke();

  doc.moveDown(0.5);

  doc.fillColor(COLORS.dark);
};

const subHeading = (
  text,
  color = COLORS.purple
) => {
  ensureSpace(40);

  doc.moveDown(0.4);

  doc
    .font("Helvetica-Bold")
    .fontSize(12.5)
    .fillColor(color)
    .text(cleanText(text), {
      width: pageWidth
    });

  doc.moveDown(0.3);

  doc.fillColor(COLORS.dark);
};

const paragraph = (
  text,
  options = {}
) => {
  if (!text) return;

  ensureSpace(35);

  doc
    .font(
      options.bold
        ? "Helvetica-Bold"
        : "Helvetica"
    )
    .fontSize(options.size || 10.5)
    .fillColor(
      options.color || COLORS.dark
    )
    .text(cleanText(text), {
      width: pageWidth,
      lineGap: 3,
      paragraphGap: 5,
      align: "left"
    });

  doc.moveDown(0.25);

  doc
    .font("Helvetica")
    .fillColor(COLORS.dark);
};

const bullet = (text, level = 0) => {
  if (!text) return;

  ensureSpace(25);

  const indent =
    doc.page.margins.left +
    level * 18;

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.dark)
    .text(
      `• ${cleanText(text)}`,
      indent,
      doc.y,
      {
        width:
          doc.page.width -
          indent -
          doc.page.margins.right,
        lineGap: 3
      }
    );

  doc.moveDown(0.15);
};

const numbered = (
  number,
  text
) => {
  ensureSpace(25);

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.dark)
    .text(
      `${number}. ${cleanText(text)}`,
      doc.page.margins.left,
      doc.y,
      {
        width: pageWidth,
        lineGap: 3
      }
    );

  doc.moveDown(0.15);
};

// =====================================================
// MARKDOWN RENDERER
// =====================================================

const renderMarkdown = (
  markdown = ""
) => {

  const lines = String(markdown)
    .replace(/\r/g, "")
    .split("\n");

  let number = 0;

  for (const raw of lines) {

    const line = raw.trim();

    if (!line) {
      doc.moveDown(0.2);
      number = 0;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      heading(
        line.substring(2),
        COLORS.primary
      );
      number = 0;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      subHeading(
        line.substring(3),
        COLORS.purple
      );
      number = 0;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      subHeading(
        line.substring(4),
        COLORS.blue
      );
      number = 0;
      continue;
    }

    // Bullet
    if (
      line.startsWith("- ") ||
      line.startsWith("* ")
    ) {
      bullet(line.substring(2));
      number = 0;
      continue;
    }

    // Numbered list
    const numberedMatch =
      line.match(/^(\d+)\.\s+(.*)$/);

    if (numberedMatch) {

      number =
        Number(numberedMatch[1]);

      numbered(
        number,
        numberedMatch[2]
      );

      continue;
    }

    // Horizontal rule
    if (
      line === "---" ||
      line === "***"
    ) {

      ensureSpace(20);

      doc
        .moveTo(
          doc.page.margins.left,
          doc.y
        )
        .lineTo(
          doc.page.width -
            doc.page.margins.right,
          doc.y
        )
        .strokeColor(COLORS.border)
        .stroke();

      doc.moveDown(0.5);

      continue;
    }

    // Table
    if (
      line.startsWith("|") &&
      line.endsWith("|")
    ) {
      renderTableLine(line);
      continue;
    }

    // Normal paragraph
    paragraph(line);

    number = 0;
  }
};

// =====================================================
// TABLE RENDERER
// =====================================================

let tableRows = [];

const renderTableLine = (
  line
) => {

  const cells = line
    .slice(1, -1)
    .split("|")
    .map(cell =>
      cleanText(cell.trim())
    );

  // Separator row
  if (
    cells.every(cell =>
      /^[-:]+$/.test(cell)
    )
  ) {
    return;
  }

  tableRows.push(cells);

  // Render every 2 rows
  if (tableRows.length < 2) {
    return;
  }

  const rows = tableRows;

  tableRows = [];

  ensureSpace(
    rows.length * 32 + 20
  );

  const columnCount =
    Math.max(
      ...rows.map(
        row => row.length
      )
    );

  const columnWidth =
    pageWidth / columnCount;

  rows.forEach(
    (row, rowIndex) => {

      const rowHeight = 30;

      const startY = doc.y;

      row.forEach(
        (cell, colIndex) => {

          const x =
            doc.page.margins.left +
            colIndex *
              columnWidth;

          doc
            .rect(
              x,
              startY,
              columnWidth,
              rowHeight
            )
            .fillAndStroke(
              rowIndex === 0
                ? "#EEF2FF"
                : "#FFFFFF",
              COLORS.border
            );

          doc
            .font(
              rowIndex === 0
                ? "Helvetica-Bold"
                : "Helvetica"
            )
            .fontSize(8.5)
            .fillColor(COLORS.dark)
            .text(
              cell,
              x + 5,
              startY + 8,
              {
                width:
                  columnWidth - 10,
                height:
                  rowHeight - 8,
                ellipsis: true
              }
            );
        }
      );

      doc.y =
        startY +
        rowHeight;
    }
  );

  doc.moveDown(0.5);
};

// =====================================================
// QUESTION ANSWER CARD
// =====================================================

const renderQuestion = (
  item,
  index,
  marks,
  color
) => {

  if (!item) return;

  const question =
    item.question ||
    "Question not available";

  const answer =
    item.answer ||
    "Answer not available";

  ensureSpace(100);

  // Question header
  const questionY = doc.y;

  doc
    .roundedRect(
      doc.page.margins.left,
      questionY,
      pageWidth,
      55,
      6
    )
    .fillColor(color)
    .fill();

  doc
    .font("Helvetica-Bold")
    .fontSize(10.5)
    .fillColor(COLORS.white)
    .text(
      `Q${index + 1}. ${question}`,
      doc.page.margins.left + 12,
      questionY + 10,
      {
        width:
          pageWidth - 95,
        lineGap: 2
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(COLORS.white)
    .text(
      `${marks} MARKS`,
      doc.page.width -
        doc.page.margins.right -
        65,
      questionY + 20,
      {
        width: 55,
        align: "right"
      }
    );

  doc.y =
    questionY + 70;

  // Answer
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.green)
    .text("Answer:");

  doc.moveDown(0.3);

  doc.fillColor(COLORS.dark);

  renderMarkdown(answer);

  doc.moveDown(0.8);

  doc
    .moveTo(
      doc.page.margins.left,
      doc.y
    )
    .lineTo(
      doc.page.width -
        doc.page.margins.right,
      doc.y
    )
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();

  doc.moveDown(0.8);
};

// =====================================================
// MERMAID RENDERER
// =====================================================

const renderMermaid = async (
  mermaidCode
) => {

  if (!mermaidCode) {
    return null;
  }

  tempDir =
    tempDir ||
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "smartnotes-"
      )
    );

  const inputFile =
    path.join(
      tempDir,
      "diagram.mmd"
    );

  const outputFile =
    path.join(
      tempDir,
      "diagram.png"
    );

  await fs.writeFile(
    inputFile,
    mermaidCode,
    "utf8"
  );

  await execFileAsync(
    "npx",
    [
      "-y",
      "@mermaid-js/mermaid-cli",
      "-i",
      inputFile,
      "-o",
      outputFile,
      "-b",
      "white",
      "-s",
      "2"
    ],
    {
      maxBuffer:
        10 * 1024 * 1024
    }
  );

  return outputFile;
};

// =====================================================
// CHART RENDERER
// =====================================================

const renderChart = (
  chart
) => {

  if (
    !chart ||
    !Array.isArray(chart.data) ||
    chart.data.length === 0
  ) {
    return;
  }

  ensureSpace(260);

  const chartWidth =
    pageWidth;

  const chartHeight =
    230;

  const startX =
    doc.page.margins.left;

  const startY =
    doc.y;

  // Chart title
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.dark)
    .text(
      chart.title || "Chart",
      startX,
      startY
    );

  doc.y += 25;

  const graphTop = doc.y;

  const graphLeft =
    startX + 40;

  const graphWidth =
    chartWidth - 70;

  const graphHeight =
    chartHeight - 60;

  const values =
    chart.data.map(
      item =>
        Number(item.value) || 0
    );

  const maxValue =
    Math.max(...values, 1);

  // Axes
  doc
    .moveTo(
      graphLeft,
      graphTop
    )
    .lineTo(
      graphLeft,
      graphTop +
        graphHeight
    )
    .lineTo(
      graphLeft +
        graphWidth,
      graphTop +
        graphHeight
    )
    .strokeColor(
      COLORS.border
    )
    .stroke();

  // BAR CHART
  if (chart.type === "bar") {

    const barGap = 12;

    const barWidth =
      Math.max(
        18,
        (
          graphWidth -
          barGap *
            chart.data.length
        ) /
          chart.data.length
      );

    chart.data.forEach(
      (item, index) => {

        const value =
          Number(item.value) ||
          0;

        const barHeight =
          (
            value /
            maxValue
          ) *
          (graphHeight - 20);

        const x =
          graphLeft +
          index *
            (
              barWidth +
              barGap
            );

        const y =
          graphTop +
          graphHeight -
          barHeight;

        doc
          .rect(
            x,
            y,
            barWidth,
            barHeight
          )
          .fillColor(
            COLORS.primary
          )
          .fill();

        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor(
            COLORS.dark
          )
          .text(
            cleanText(
              item.name
            ),
            x - 5,
            graphTop +
              graphHeight +
              5,
            {
              width:
                barWidth + 10,
              align: "center"
            }
          );

        doc
          .font("Helvetica-Bold")
          .fontSize(7)
          .fillColor(
            COLORS.dark
          )
          .text(
            String(value),
            x,
            y - 12,
            {
              width: barWidth,
              align: "center"
            }
          );
      }
    );
  }

  // LINE CHART
  if (chart.type === "line") {

    const points = [];

    chart.data.forEach(
      (item, index) => {

        const value =
          Number(item.value) ||
          0;

        const x =
          graphLeft +
          (
            index /
            Math.max(
              chart.data.length - 1,
              1
            )
          ) *
          graphWidth;

        const y =
          graphTop +
          graphHeight -
          (
            value /
            maxValue
          ) *
          (
            graphHeight - 20
          );

        points.push({
          x,
          y
        });

        if (index > 0) {

          doc
            .moveTo(
              points[index - 1]
                .x,
              points[index - 1]
                .y
            )
            .lineTo(x, y)
            .strokeColor(
              COLORS.primary
            )
            .lineWidth(2)
            .stroke();
        }

        doc
          .circle(
            x,
            y,
            3
          )
          .fillColor(
            COLORS.primary
          )
          .fill();

        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor(
            COLORS.dark
          )
          .text(
            cleanText(
              item.name
            ),
            x - 25,
            graphTop +
              graphHeight +
              5,
            {
              width: 50,
              align: "center"
            }
          );
      }
    );
  }

  // PIE CHART
  if (chart.type === "pie") {

    const centerX =
      startX +
      chartWidth / 2;

    const centerY =
      graphTop +
      85;

    const radius = 70;

    const total =
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      ) || 1;

    let currentAngle = 0;

    chart.data.forEach(
      (item, index) => {

        const value =
          Number(item.value) ||
          0;

        const slice =
          (
            value /
            total
          ) *
          Math.PI *
          2;

        const colorList = [
          COLORS.primary,
          COLORS.purple,
          COLORS.blue,
          COLORS.green,
          COLORS.cyan,
          COLORS.orange
        ];

        const color =
          colorList[
            index %
              colorList.length
          ];

        doc
          .moveTo(
            centerX,
            centerY
          )
          .lineTo(
            centerX +
              radius *
                Math.cos(
                  currentAngle
                ),
            centerY +
              radius *
                Math.sin(
                  currentAngle
                )
          )
          .arc(
            centerX,
            centerY,
            radius,
            currentAngle,
            currentAngle +
              slice
          )
          .lineTo(
            centerX,
            centerY
          )
          .fillColor(color)
          .fill();

        currentAngle += slice;
      }
    );

    // Legend
    chart.data.forEach(
      (item, index) => {

        const colorList = [
          COLORS.primary,
          COLORS.purple,
          COLORS.blue,
          COLORS.green,
          COLORS.cyan,
          COLORS.orange
        ];

        const color =
          colorList[
            index %
              colorList.length
          ];

        const legendY =
          graphTop +
          index * 18;

        doc
          .rect(
            startX + 15,
            legendY,
            10,
            10
          )
          .fillColor(color)
          .fill();

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(
            COLORS.dark
          )
          .text(
            `${cleanText(
              item.name
            )} - ${item.value}`,
            startX + 30,
            legendY - 1
          );
      }
    );
  }

  doc.y =
    graphTop +
    chartHeight;

  doc.moveDown(0.5);
};

// =====================================================
// COVER PAGE
// =====================================================

doc.moveDown(4);

doc
  .font("Helvetica-Bold")
  .fontSize(30)
  .fillColor(COLORS.primary)
  .text(
    "SmartNotes AI",
    {
      align: "center"
    }
  );

doc.moveDown(0.5);

doc
  .font("Helvetica")
  .fontSize(13)
  .fillColor(COLORS.gray)
  .text(
    "AI-Powered Exam Preparation",
    {
      align: "center"
    }
  );

doc.moveDown(2);

doc
  .roundedRect(
    90,
    doc.y,
    doc.page.width - 180,
    90,
    10
  )
  .fillColor("#EEF2FF")
  .fill();

doc
  .font("Helvetica-Bold")
  .fontSize(18)
  .fillColor(COLORS.primary)
  .text(
    "Exam-Oriented Study Material",
    110,
    doc.y + 32,
    {
      width:
        doc.page.width - 220,
      align: "center"
    }
  );

doc.moveDown(6);

doc
  .font("Helvetica")
  .fontSize(10)
  .fillColor(COLORS.gray)
  .text(
    "Generated by SmartNotes AI",
    {
      align: "center"
    }
  );

doc.addPage();

// =====================================================
// OVERVIEW
// =====================================================

heading(
  "Study Overview",
  COLORS.primary
);

paragraph(
  `Overall Exam Importance: ${
    result.importance ||
    "Not specified"
  }`,
  {
    bold: true,
    size: 12,
    color: COLORS.primary
  }
);

// =====================================================
// SUB TOPICS
// =====================================================

heading(
  "Important Sub Topics",
  COLORS.primary
);

if (result.subTopics) {

  Object.entries(
    result.subTopics
  ).forEach(
    ([star, topics]) => {

      subHeading(
        `${star} Priority Topics`,
        COLORS.purple
      );

      if (
        Array.isArray(topics)
      ) {
        topics.forEach(
          topic =>
            bullet(topic)
        );
      }
    }
  );
}

// =====================================================
// DETAILED NOTES
// =====================================================

heading(
  "Detailed Notes",
  COLORS.purple
);

renderMarkdown(
  result.notes || ""
);

// =====================================================
// REVISION POINTS
// =====================================================

heading(
  "Quick Revision Points",
  COLORS.green
);

if (
  Array.isArray(
    result.revisionPoints
  )
) {
  result.revisionPoints.forEach(
    point =>
      bullet(point)
  );
}

// =====================================================
// 5 MARK QUESTIONS
// =====================================================

if (
  Array.isArray(
    result.questions?.short
  )
) {

  heading(
    "5-Mark Short Answers",
    COLORS.blue
  );

  paragraph(
    "These answers are designed for 5-mark examination questions.",
    {
      color: COLORS.gray
    }
  );

  result.questions.short.forEach(
    (item, index) => {

      renderQuestion(
        item,
        index,
        5,
        COLORS.blue
      );
    }
  );
}

// =====================================================
// 10 MARK QUESTIONS
// =====================================================

if (
  Array.isArray(
    result.questions?.long
  )
) {

  heading(
    "10-Mark Long Answers",
    COLORS.purple
  );

  paragraph(
    "These answers are designed for 10-mark examination questions and provide detailed, structured explanations.",
    {
      color: COLORS.gray
    }
  );

  result.questions.long.forEach(
    (item, index) => {

      renderQuestion(
        item,
        index,
        10,
        COLORS.purple
      );
    }
  );
}

// =====================================================
// DIAGRAM QUESTION
// =====================================================

if (
  result.questions?.diagram
) {

  heading(
    "Diagram-Based Question",
    COLORS.cyan
  );

  paragraph(
    result.questions.diagram,
    {
      bold: true,
      size: 11
    }
  );
}

// =====================================================
// MERMAID DIAGRAM
// =====================================================

if (
  result.diagram?.data
) {

  heading(
    "Concept Diagram",
    COLORS.cyan
  );

  paragraph(
    "Visual representation of an important concept.",
    {
      color: COLORS.gray
    }
  );

  try {

    const diagramPath =
      await renderMermaid(
        result.diagram.data
      );

    if (diagramPath) {

      ensureSpace(300);

      doc.image(
        diagramPath,
        doc.page.margins.left,
        doc.y,
        {
          fit: [
            pageWidth,
            400
          ],
          align: "center",
          valign: "center"
        }
      );

      doc.moveDown(20);
    }

  } catch (diagramError) {

    console.error(
      "Mermaid rendering failed:",
      diagramError
    );

    paragraph(
      "Diagram could not be rendered. Mermaid source:",
      {
        color: COLORS.gray
      }
    );

    paragraph(
      result.diagram.data,
      {
        size: 8
      }
    );
  }
}

// =====================================================
// CHARTS
// =====================================================

if (
  Array.isArray(
    result.charts
  ) &&
  result.charts.length > 0
) {

  heading(
    "Visual Charts",
    COLORS.primary
  );

  result.charts.forEach(
    chart => {
      renderChart(chart);
    }
  );
}

// =====================================================
// PAGE NUMBERS
// =====================================================

const pageRange =
  doc.bufferedPageRange();

for (
  let i = pageRange.start;
  i <
  pageRange.start +
    pageRange.count;
  i++
) {

  doc.switchToPage(i);

  drawFooter();
}

// =====================================================
// END
// =====================================================

doc.end();


} catch (error) {

console.error(
  "PDF generation error:",
  error
);

if (!res.headersSent) {

  return res.status(500).json({
    error:
      "Failed to generate PDF",
    details:
      error.message
  });
}


} finally {


// =====================================================
// CLEAN TEMP FILES
// =====================================================

if (tempDir) {

  try {

    await fs.rm(
      tempDir,
      {
        recursive: true,
        force: true
      }
    );

  } catch (cleanupError) {

    console.error(
      "Temporary file cleanup failed:",
      cleanupError
    );
  }
}

}
};

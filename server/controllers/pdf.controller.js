import PDFDocument from "pdfkit";

export const pdfDownload = async (req, res) => {
try {
const { result } = req.body;


if (!result) {
  return res.status(400).json({
    error: "No content provided"
  });
}

const doc = new PDFDocument({
  size: "A4",
  margin: 50,
  bufferPages: true,
  info: {
    Title: "ExamNotes AI",
    Author: "ExamNotes AI",
    Subject: "Exam Preparation Notes"
  }
});

res.setHeader("Content-Type", "application/pdf");
res.setHeader(
  "Content-Disposition",
  'attachment; filename="ExamNotesAI.pdf"'
);

doc.pipe(res);

// =====================================================
// COLORS
// =====================================================

const COLORS = {
  primary: "#4F46E5",
  secondary: "#7C3AED",
  green: "#15803D",
  blue: "#2563EB",
  purple: "#7C3AED",
  rose: "#E11D48",
  cyan: "#0891B2",
  gray: "#4B5563",
  lightGray: "#F3F4F6",
  border: "#D1D5DB",
  black: "#111827"
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const cleanMarkdown = (text = "") => {
  return String(text)
    .replace(/\r/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
};

const addPageNumber = () => {
  const range = doc.bufferedPageRange();

  for (
    let i = range.start;
    i < range.start + range.count;
    i++
  ) {
    doc.switchToPage(i);

    const pageNumber = i - range.start + 1;

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#6B7280")
      .text(
        `ExamNotes AI  •  Page ${pageNumber}`,
        50,
        doc.page.height - 30,
        {
          width: doc.page.width - 100,
          align: "center"
        }
      );
  }
};

const ensureSpace = (height = 60) => {
  if (doc.y + height > doc.page.height - 60) {
    doc.addPage();
  }
};

const addMainTitle = (title, subtitle = "") => {
  ensureSpace(100);

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(COLORS.primary)
    .text(title, {
      align: "center"
    });

  if (subtitle) {
    doc.moveDown(0.4);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(COLORS.gray)
      .text(subtitle, {
        align: "center"
      });
  }

  doc.moveDown(1);
};

const addSectionHeading = (title, color = COLORS.primary) => {
  ensureSpace(60);

  doc.moveDown(0.8);

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(color)
    .text(title);

  doc.moveDown(0.25);

  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .strokeColor(color)
    .lineWidth(1)
    .stroke();

  doc.moveDown(0.5);

  doc.fillColor(COLORS.black);
};

const addSubHeading = (title) => {
  ensureSpace(45);

  doc.moveDown(0.5);

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(COLORS.secondary)
    .text(cleanMarkdown(title));

  doc.moveDown(0.25);

  doc.fillColor(COLORS.black);
};

const addParagraph = (text, options = {}) => {
  if (!text) return;

  ensureSpace(40);

  doc
    .font(options.bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(options.size || 10.5)
    .fillColor(options.color || COLORS.black)
    .text(cleanMarkdown(text), {
      align: "left",
      lineGap: 3,
      paragraphGap: 6
    });

  doc.moveDown(0.25);

  doc.font("Helvetica").fillColor(COLORS.black);
};

const addBullet = (text, level = 0) => {
  if (!text) return;

  ensureSpace(30);

  const indent = 55 + level * 18;

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.black)
    .text(`• ${cleanMarkdown(text)}`, indent, doc.y, {
      width: doc.page.width - indent - 50,
      lineGap: 3
    });

  doc.moveDown(0.2);
};

const addNumberedItem = (number, text) => {
  if (!text) return;

  ensureSpace(30);

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.black)
    .text(`${number}. ${cleanMarkdown(text)}`, 55, doc.y, {
      width: doc.page.width - 105,
      lineGap: 3
    });

  doc.moveDown(0.2);
};

// =====================================================
// MARKDOWN NOTES RENDERER
// =====================================================

const renderMarkdown = (markdown = "") => {
  const lines = String(markdown)
    .replace(/\r/g, "")
    .split("\n");

  let numberCounter = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      doc.moveDown(0.25);
      numberCounter = 0;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      addSectionHeading(
        line.replace(/^# /, ""),
        COLORS.primary
      );
      numberCounter = 0;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      addSubHeading(
        line.replace(/^## /, "")
      );
      numberCounter = 0;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      addSubHeading(
        line.replace(/^### /, "")
      );
      numberCounter = 0;
      continue;
    }

    // Bullet
    if (
      line.startsWith("- ") ||
      line.startsWith("* ")
    ) {
      addBullet(line.substring(2));
      numberCounter = 0;
      continue;
    }

    // Numbered list
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);

    if (numberedMatch) {
      numberCounter = Number(numberedMatch[1]);

      addNumberedItem(
        numberCounter,
        numberedMatch[2]
      );

      continue;
    }

    // Horizontal line
    if (
      line === "---" ||
      line === "***"
    ) {
      ensureSpace(20);

      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor(COLORS.border)
        .stroke();

      doc.moveDown(0.4);

      continue;
    }

    // Table separator
    if (
      line.includes("|") &&
      line.replace(/[\|\-\:\s]/g, "") === ""
    ) {
      continue;
    }

    // Basic table row
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map(cell => cleanMarkdown(cell.trim()));

      ensureSpace(35);

      const tableWidth = doc.page.width - 100;
      const cellWidth = tableWidth / cells.length;

      const startX = 50;
      const startY = doc.y;

      cells.forEach((cell, index) => {
        doc
          .rect(
            startX + index * cellWidth,
            startY,
            cellWidth,
            25
          )
          .strokeColor(COLORS.border)
          .stroke();

        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor(COLORS.black)
          .text(
            cell,
            startX + index * cellWidth + 5,
            startY + 7,
            {
              width: cellWidth - 10
            }
          );
      });

      doc.y = startY + 28;

      continue;
    }

    // Normal paragraph
    addParagraph(line);

    numberCounter = 0;
  }
};

// =====================================================
// QUESTION / ANSWER RENDERER
// =====================================================

const addQuestionAnswer = (
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

  ensureSpace(130);

  // Question box
  const boxStartY = doc.y;

  doc
    .roundedRect(
      50,
      boxStartY,
      doc.page.width - 100,
      55,
      6
    )
    .fillColor(color)
    .fill();

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#FFFFFF")
    .text(
      `Q${index + 1}. ${question}`,
      62,
      boxStartY + 10,
      {
        width: doc.page.width - 180
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#FFFFFF")
    .text(
      `${marks} Marks`,
      doc.page.width - 115,
      boxStartY + 20,
      {
        width: 55,
        align: "right"
      }
    );

  doc.y = boxStartY + 68;

  // Answer label
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.green)
    .text("Answer:");

  doc.moveDown(0.3);

  doc.fillColor(COLORS.black);

  // Render answer Markdown
  renderMarkdown(answer);

  doc.moveDown(0.5);

  // Separator
  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .strokeColor(COLORS.border)
    .stroke();

  doc.moveDown(0.5);
};

// =====================================================
// COVER / HEADER
// =====================================================

doc.moveDown(3);

doc
  .font("Helvetica-Bold")
  .fontSize(30)
  .fillColor(COLORS.primary)
  .text("ExamNotes AI", {
    align: "center"
  });

doc.moveDown(0.5);

doc
  .font("Helvetica")
  .fontSize(14)
  .fillColor(COLORS.gray)
  .text("AI-Powered Exam Preparation Notes", {
    align: "center"
  });

doc.moveDown(2);

doc
  .roundedRect(
    100,
    doc.y,
    doc.page.width - 200,
    70,
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
    120,
    doc.y + 23,
    {
      width: doc.page.width - 240,
      align: "center"
    }
  );

doc.moveDown(5);

doc
  .font("Helvetica")
  .fontSize(10)
  .fillColor(COLORS.gray)
  .text(
    "Generated by ExamNotes AI",
    {
      align: "center"
    }
  );

doc.addPage();

// =====================================================
// OVERVIEW
// =====================================================

addMainTitle(
  "Study Overview",
  "Exam-focused learning material"
);

// Importance
addSectionHeading(
  "Overall Importance",
  COLORS.primary
);

addParagraph(
  `Exam Importance: ${result.importance || "Not specified"}`,
  {
    bold: true,
    size: 12,
    color: COLORS.primary
  }
);

// =====================================================
// SUB TOPICS
// =====================================================

addSectionHeading(
  "Important Sub Topics",
  COLORS.primary
);

if (result.subTopics) {
  Object.entries(result.subTopics).forEach(
    ([star, topics]) => {

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(COLORS.secondary)
        .text(`${star} Priority Topics`);

      doc.moveDown(0.3);

      if (Array.isArray(topics)) {
        topics.forEach(topic => {
          addBullet(topic);
        });
      }

      doc.moveDown(0.3);
    }
  );
}

// =====================================================
// DETAILED NOTES
// =====================================================

addSectionHeading(
  "Detailed Notes",
  COLORS.purple
);

renderMarkdown(result.notes || "");

// =====================================================
// REVISION POINTS
// =====================================================

addSectionHeading(
  "Quick Revision Points",
  COLORS.green
);

if (Array.isArray(result.revisionPoints)) {
  result.revisionPoints.forEach(point => {
    addBullet(point);
  });
}

// =====================================================
// 5 MARK QUESTIONS
// =====================================================

if (
  result.questions &&
  Array.isArray(result.questions.short)
) {
  addSectionHeading(
    "5-Mark Short Answers",
    COLORS.blue
  );

  addParagraph(
    "These answers are structured for 5-mark examination questions.",
    {
      color: COLORS.gray
    }
  );

  result.questions.short.forEach(
    (item, index) => {
      addQuestionAnswer(
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
  result.questions &&
  Array.isArray(result.questions.long)
) {
  addSectionHeading(
    "10-Mark Long Answers",
    COLORS.purple
  );

  addParagraph(
    "These answers are structured for 10-mark examination questions and provide detailed, exam-ready explanations.",
    {
      color: COLORS.gray
    }
  );

  result.questions.long.forEach(
    (item, index) => {
      addQuestionAnswer(
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

if (result.questions?.diagram) {
  addSectionHeading(
    "Diagram-Based Question",
    COLORS.cyan
  );

  addParagraph(
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

if (result.diagram?.data) {
  addSectionHeading(
    "Concept Diagram",
    COLORS.cyan
  );

  addParagraph(
    "The following Mermaid diagram represents an important concept from the topic.",
    {
      color: COLORS.gray
    }
  );

  doc
    .roundedRect(
      50,
      doc.y,
      doc.page.width - 100,
      120,
      6
    )
    .fillColor("#ECFEFF")
    .fill();

  doc
    .font("Courier")
    .fontSize(8)
    .fillColor(COLORS.black)
    .text(
      result.diagram.data,
      62,
      doc.y + 12,
      {
        width: doc.page.width - 124,
        lineGap: 2
      }
    );

  doc.moveDown(8);
}

// =====================================================
// CHART INFORMATION
// =====================================================

if (
  Array.isArray(result.charts) &&
  result.charts.length > 0
) {
  addSectionHeading(
    "Visual Charts",
    COLORS.primary
  );

  result.charts.forEach(chart => {

    addSubHeading(
      chart.title || "Chart"
    );

    if (Array.isArray(chart.data)) {
      chart.data.forEach(item => {
        addBullet(
          `${item.name}: ${item.value}`
        );
      });
    }
  });
}

// =====================================================
// FOOTER / PAGE NUMBERS
// =====================================================

addPageNumber();

// =====================================================
// END DOCUMENT
// =====================================================

doc.end();


} catch (error) {


console.error(
  "PDF generation error:",
  error
);

if (!res.headersSent) {
  return res.status(500).json({
    error: "Failed to generate PDF"
  });
}

}
};

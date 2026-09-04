import PDFDocument from "pdfkit";

export const pdfDownload = async (req, res) => {
    try {
        const { result } = req.body;

        if (!result) {
            return res.status(400).json({
                error: "No content provided",
            });
        }

        // =====================================================
        // PDF SETUP
        // =====================================================

        const doc = new PDFDocument({
            size: "A4",

            margins: {
                top: 55,
                bottom: 55,
                left: 55,
                right: 55,
            },

            bufferPages: true,

            info: {
                Title: "SmartNotes AI",
                Author: "SmartNotes AI",
                Subject: "Exam Preparation Notes",
            },
        });

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

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

            dark: "#111827",
            gray: "#6B7280",
            border: "#D1D5DB",

            light: "#F8FAFC",
            white: "#FFFFFF",
        };

        // =====================================================
        // PAGE DIMENSIONS
        // =====================================================

        const left = doc.page.margins.left;

        const right =
            doc.page.width -
            doc.page.margins.right;

        const width =
            doc.page.width -
            doc.page.margins.left -
            doc.page.margins.right;

        const top =
            doc.page.margins.top;

        const bottom =
            doc.page.height -
            doc.page.margins.bottom;

        // =====================================================
        // TEXT CLEANER
        // =====================================================

        const cleanText = (text = "") => {
            return String(text)
                .replace(/\r/g, "")
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/__(.*?)__/g, "$1")
                .replace(/`(.*?)`/g, "$1")
                .replace(/\*(.*?)\*/g, "$1")
                .trim();
        };

        // =====================================================
        // HEADER
        // =====================================================

        const drawHeader = () => {
            doc.save();

            doc
                .font("Helvetica-Bold")
                .fontSize(8)
                .fillColor(COLORS.gray)
                .text(
                    "SmartNotes AI",
                    left,
                    25,
                    {
                        width,
                        align: "left",
                        lineBreak: false,
                    }
                );

            doc
                .moveTo(left, 40)
                .lineTo(right, 40)
                .strokeColor(COLORS.border)
                .lineWidth(0.5)
                .stroke();

            doc.restore();

            // Important:
            // Do not let header rendering change the content cursor.
            doc.y = top;
        };

        // =====================================================
        // FOOTER
        // =====================================================

        const drawFooter = (pageNumber) => {
            doc.save();

            const footerLineY =
                doc.page.height - 42;

            const footerTextY =
                doc.page.height - 30;

            // Footer line
            doc
                .moveTo(
                    left,
                    footerLineY
                )
                .lineTo(
                    right,
                    footerLineY
                )
                .strokeColor(COLORS.border)
                .lineWidth(0.5)
                .stroke();

            // Footer text
            doc
                .font("Helvetica")
                .fontSize(8)
                .fillColor(COLORS.gray)
                .text(
                    `SmartNotes AI  •  Page ${pageNumber}`,
                    left,
                    footerTextY,
                    {
                        width,
                        align: "center",

                        // VERY IMPORTANT
                        lineBreak: false,
                    }
                );

            doc.restore();
        };

        // =====================================================
        // PAGE BREAK
        // =====================================================

        const newPage = () => {
            doc.addPage();

            drawHeader();

            doc.y = top;
        };

        const ensureSpace = (height = 30) => {
            if (doc.y + height > bottom) {
                newPage();
            }
        };

        // =====================================================
        // HEADING
        // =====================================================

        const heading = (
            text,
            color = COLORS.primary
        ) => {
            ensureSpace(55);

            doc
                .font("Helvetica-Bold")
                .fontSize(17)
                .fillColor(color)
                .text(
                    cleanText(text),
                    left,
                    doc.y,
                    {
                        width,
                        lineGap: 2,
                    }
                );

            doc.moveDown(0.3);

            doc
                .moveTo(left, doc.y)
                .lineTo(right, doc.y)
                .strokeColor(color)
                .lineWidth(1)
                .stroke();

            doc.y += 8;

            doc.fillColor(COLORS.dark);
        };

        // =====================================================
        // SUB HEADING
        // =====================================================

        const subHeading = (
            text,
            color = COLORS.purple
        ) => {
            ensureSpace(35);

            doc
                .font("Helvetica-Bold")
                .fontSize(12)
                .fillColor(color)
                .text(
                    cleanText(text),
                    left,
                    doc.y,
                    {
                        width,
                    }
                );

            doc.moveDown(0.35);

            doc.fillColor(COLORS.dark);
        };

        // =====================================================
        // PARAGRAPH
        // =====================================================

        const paragraph = (
            text,
            options = {}
        ) => {
            if (!text) return;

            ensureSpace(25);

            doc
                .font(
                    options.bold
                        ? "Helvetica-Bold"
                        : "Helvetica"
                )
                .fontSize(
                    options.size || 10.5
                )
                .fillColor(
                    options.color ||
                    COLORS.dark
                )
                .text(
                    cleanText(text),
                    left,
                    doc.y,
                    {
                        width,
                        lineGap: 3,
                        align: "left",
                    }
                );

            doc.moveDown(0.25);

            doc
                .font("Helvetica")
                .fillColor(COLORS.dark);
        };

        // =====================================================
        // BULLET
        // =====================================================

        const bullet = (text) => {
            if (!text) return;

            ensureSpace(25);

            doc
                .font("Helvetica")
                .fontSize(10.5)
                .fillColor(COLORS.dark)
                .text(
                    `• ${cleanText(text)}`,
                    left + 10,
                    doc.y,
                    {
                        width: width - 10,
                        lineGap: 3,
                        align: "left",
                    }
                );

            doc.moveDown(0.15);
        };

        // =====================================================
        // NUMBERED ITEM
        // =====================================================

        const numbered = (
            number,
            text
        ) => {
            if (!text) return;

            ensureSpace(25);

            doc
                .font("Helvetica")
                .fontSize(10.5)
                .fillColor(COLORS.dark)
                .text(
                    `${number}. ${cleanText(text)}`,
                    left,
                    doc.y,
                    {
                        width,
                        lineGap: 3,
                        align: "left",
                    }
                );

            doc.moveDown(0.15);
        };

        // =====================================================
        // TABLE
        // =====================================================

        const renderTable = (rows) => {
            if (!rows.length) return;

            const columns = Math.max(
                ...rows.map(
                    row => row.length
                )
            );

            const columnWidth =
                width / columns;

            const padding = 5;

            rows.forEach(
                (row, rowIndex) => {

                    const isHeader =
                        rowIndex === 0;

                    doc.font(
                        isHeader
                            ? "Helvetica-Bold"
                            : "Helvetica"
                    );

                    doc.fontSize(8);

                    let rowHeight = 22;

                    // Calculate row height
                    row.forEach(cell => {

                        const height =
                            doc.heightOfString(
                                cleanText(cell),
                                {
                                    width:
                                        columnWidth -
                                        padding * 2,

                                    lineGap: 2,
                                }
                            );

                        rowHeight =
                            Math.max(
                                rowHeight,
                                height +
                                padding * 2
                            );
                    });

                    // Page break
                    if (
                        doc.y +
                        rowHeight >
                        bottom
                    ) {
                        newPage();
                    }

                    const y = doc.y;

                    row.forEach(
                        (
                            cell,
                            columnIndex
                        ) => {

                            const x =
                                left +
                                columnIndex *
                                columnWidth;

                            // Cell
                            doc
                                .rect(
                                    x,
                                    y,
                                    columnWidth,
                                    rowHeight
                                )
                                .fillAndStroke(
                                    isHeader
                                        ? "#EEF2FF"
                                        : COLORS.white,
                                    COLORS.border
                                );

                            // Cell text
                            doc
                                .font(
                                    isHeader
                                        ? "Helvetica-Bold"
                                        : "Helvetica"
                                )
                                .fontSize(8)
                                .fillColor(
                                    COLORS.dark
                                )
                                .text(
                                    cleanText(cell),
                                    x + padding,
                                    y + padding,
                                    {
                                        width:
                                            columnWidth -
                                            padding * 2,

                                        height:
                                            rowHeight -
                                            padding * 2,

                                        lineGap: 2,
                                    }
                                );
                        }
                    );

                    doc.y =
                        y + rowHeight;
                }
            );

            doc.y += 8;
        };

        // =====================================================
        // MARKDOWN
        // =====================================================

        const renderMarkdown = (
            markdown = ""
        ) => {
            if (!markdown) return;

            const lines =
                String(markdown)
                    .replace(/\r/g, "")
                    .split("\n");

            let tableRows = [];

            const flushTable = () => {

                if (tableRows.length) {

                    renderTable(
                        tableRows
                    );

                    tableRows = [];
                }
            };

            for (
                let i = 0;
                i < lines.length;
                i++
            ) {

                const line =
                    lines[i].trim();

                // Empty line
                if (!line) {

                    flushTable();

                    doc.moveDown(0.2);

                    continue;
                }

                // =================================================
                // TABLE
                // =================================================

                if (
                    line.startsWith("|") &&
                    line.endsWith("|")
                ) {

                    const cells =
                        line
                            .slice(1, -1)
                            .split("|")
                            .map(
                                cell =>
                                    cleanText(
                                        cell.trim()
                                    )
                            );

                    // Markdown separator row
                    if (
                        cells.every(
                            cell =>
                                /^[-:]+$/.test(
                                    cell
                                )
                        )
                    ) {
                        continue;
                    }

                    tableRows.push(cells);

                    const next =
                        lines[i + 1]
                            ?.trim();

                    if (
                        !next ||
                        !next.startsWith("|")
                    ) {
                        flushTable();
                    }

                    continue;
                }

                flushTable();

                // =================================================
                // H1
                // =================================================

                if (
                    line.startsWith("# ")
                ) {

                    heading(
                        line.substring(2),
                        COLORS.primary
                    );

                    continue;
                }

                // =================================================
                // H2
                // =================================================

                if (
                    line.startsWith("## ")
                ) {

                    subHeading(
                        line.substring(3),
                        COLORS.purple
                    );

                    continue;
                }

                // =================================================
                // H3
                // =================================================

                if (
                    line.startsWith("### ")
                ) {

                    subHeading(
                        line.substring(4),
                        COLORS.blue
                    );

                    continue;
                }

                // =================================================
                // BULLET
                // =================================================

                if (
                    line.startsWith("- ") ||
                    line.startsWith("* ")
                ) {

                    bullet(
                        line.substring(2)
                    );

                    continue;
                }

                // =================================================
                // NUMBERED
                // =================================================

                const numberMatch =
                    line.match(
                        /^(\d+)\.\s+(.*)$/
                    );

                if (numberMatch) {

                    numbered(
                        Number(
                            numberMatch[1]
                        ),
                        numberMatch[2]
                    );

                    continue;
                }

                // =================================================
                // HORIZONTAL LINE
                // =================================================

                if (
                    line === "---" ||
                    line === "***"
                ) {

                    ensureSpace(15);

                    doc
                        .moveTo(
                            left,
                            doc.y
                        )
                        .lineTo(
                            right,
                            doc.y
                        )
                        .strokeColor(
                            COLORS.border
                        )
                        .stroke();

                    doc.moveDown(0.5);

                    continue;
                }

                // =================================================
                // NORMAL TEXT
                // =================================================

                paragraph(line);
            }

            flushTable();
        };

        // =====================================================
        // QUESTION
        // =====================================================

        const renderQuestion = (
            item,
            index,
            defaultMarks,
            color
        ) => {

            if (!item) return;

            const question =
                item.question ||
                "Question not available";

            const answer =
                item.answer ||
                "Answer not available";

            const marks =
                item.marks ||
                defaultMarks;

            // =================================================
            // QUESTION HEADER
            // =================================================

            ensureSpace(75);

            const headerY = doc.y;

            doc
                .roundedRect(
                    left,
                    headerY,
                    width,
                    42,
                    6
                )
                .fillColor(color)
                .fill();

            // Question
            doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor(COLORS.white)
                .text(
                    `Q${index + 1}. ${cleanText(
                        question
                    )}`,
                    left + 12,
                    headerY + 10,
                    {
                        width:
                            width - 85,
                        lineGap: 2,
                    }
                );

            // Marks
            doc
                .font("Helvetica-Bold")
                .fontSize(8)
                .fillColor(COLORS.white)
                .text(
                    `${marks} MARKS`,
                    right - 60,
                    headerY + 15,
                    {
                        width: 50,
                        align: "right",
                        lineBreak: false,
                    }
                );

            doc.y =
                headerY + 55;

            // =================================================
            // ANSWER
            // =================================================

            doc
                .font("Helvetica-Bold")
                .fontSize(10.5)
                .fillColor(COLORS.green)
                .text(
                    "Answer:",
                    left,
                    doc.y,
                    {
                        lineBreak: false,
                    }
                );

            doc.moveDown(0.3);

            doc.fillColor(
                COLORS.dark
            );

            renderMarkdown(answer);

            doc.moveDown(0.5);

            // =================================================
            // QUESTION SEPARATOR
            // =================================================

            ensureSpace(10);

            doc
                .moveTo(
                    left,
                    doc.y
                )
                .lineTo(
                    right,
                    doc.y
                )
                .strokeColor(
                    COLORS.border
                )
                .lineWidth(0.5)
                .stroke();

            doc.y += 10;
        };

        // =====================================================
        // DOCUMENT START
        // =====================================================

        drawHeader();

        // =====================================================
        // TITLE
        // =====================================================

        doc
            .font("Helvetica-Bold")
            .fontSize(24)
            .fillColor(COLORS.primary)
            .text(
                "SmartNotes AI",
                left,
                doc.y,
                {
                    width,
                    align: "center",
                }
            );

        doc.moveDown(0.25);

        doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor(COLORS.gray)
            .text(
                "AI-Powered Exam Preparation",
                left,
                doc.y,
                {
                    width,
                    align: "center",
                }
            );

        doc.moveDown(1.5);

        // =====================================================
        // STUDY OVERVIEW
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
                size: 11,
                color: COLORS.primary,
            }
        );

        // =====================================================
        // SUB TOPICS
        // =====================================================

        if (result.subTopics) {

            heading(
                "Important Sub Topics",
                COLORS.primary
            );

            Object.entries(
                result.subTopics
            ).forEach(
                ([star, topics]) => {

                    subHeading(
                        `${star} Priority Topics`,
                        COLORS.purple
                    );

                    if (
                        Array.isArray(
                            topics
                        )
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

        if (
            Array.isArray(
                result.revisionPoints
            ) &&
            result.revisionPoints.length
        ) {

            heading(
                "Quick Revision Points",
                COLORS.green
            );

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
            ) &&
            result.questions.short.length
        ) {

            heading(
                "5-Mark Short Answers",
                COLORS.blue
            );

            paragraph(
                "These answers are designed for 5-mark examination questions.",
                {
                    color: COLORS.gray,
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
            ) &&
            result.questions.long.length
        ) {

            heading(
                "10-Mark Long Answers",
                COLORS.purple
            );

            paragraph(
                "These answers are designed for 10-mark examination questions.",
                {
                    color: COLORS.gray,
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
                    size: 10.5,
                }
            );
        }

        // =====================================================
        // FOOTERS
        // =====================================================

        const pages =
            doc.bufferedPageRange();

        for (
            let i = pages.start;
            i <
            pages.start + pages.count;
            i++
        ) {

            doc.switchToPage(i);

            drawFooter(
                i + 1
            );
        }

        // =====================================================
        // FINISH
        // =====================================================

        doc.end();

    } catch (error) {

        console.error(
            "PDF generation error:",
            error
        );

        if (!res.headersSent) {

            return res.status(500).json({
                error: "Failed to generate PDF",
                details: error.message,
            });
        }
    }
};

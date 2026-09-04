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
                top: 65,
                bottom: 60,
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
            dark: "#111827",
            gray: "#6B7280",
            lightGray: "#F3F4F6",
            border: "#D1D5DB",
            white: "#FFFFFF",
        };

        // =====================================================
        // PAGE DIMENSIONS
        // =====================================================

        const pageWidth =
            doc.page.width -
            doc.page.margins.left -
            doc.page.margins.right;

        const contentLeft = doc.page.margins.left;

        const contentRight =
            doc.page.width - doc.page.margins.right;

        const bottomLimit =
            doc.page.height - doc.page.margins.bottom;

        // =====================================================
        // HELPERS
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

        const checkPageSpace = (height = 40) => {
            if (doc.y + height > bottomLimit) {
                doc.addPage();
                return true;
            }

            return false;
        };

        // =====================================================
        // HEADER
        // =====================================================

        const drawHeader = () => {
            doc.save();

            doc
                .moveTo(contentLeft, 40)
                .lineTo(contentRight, 40)
                .strokeColor(COLORS.border)
                .lineWidth(0.5)
                .stroke();

            doc
                .font("Helvetica-Bold")
                .fontSize(8)
                .fillColor(COLORS.gray)
                .text(
                    "SmartNotes AI",
                    contentLeft,
                    25,
                    {
                        width: pageWidth,
                        align: "left",
                    }
                );

            doc.restore();
        };

        // =====================================================
        // FOOTER
        // =====================================================

        const drawFooter = () => {
            doc.save();

            doc
                .moveTo(contentLeft, doc.page.height - 42)
                .lineTo(
                    contentRight,
                    doc.page.height - 42
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
                    contentLeft,
                    doc.page.height - 31,
                    {
                        width: pageWidth,
                        align: "center",
                    }
                );

            doc.restore();
        };

        // =====================================================
        // PAGE HEADER
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
            checkPageSpace(60);

            doc
                .font("Helvetica-Bold")
                .fontSize(17)
                .fillColor(color)
                .text(
                    cleanText(text),
                    contentLeft,
                    doc.y,
                    {
                        width: pageWidth,
                        lineGap: 2,
                    }
                );

            doc.moveDown(0.35);

            doc
                .moveTo(contentLeft, doc.y)
                .lineTo(contentRight, doc.y)
                .strokeColor(color)
                .lineWidth(1)
                .stroke();

            doc.moveDown(0.55);

            doc.fillColor(COLORS.dark);
        };

        const subHeading = (
            text,
            color = COLORS.purple
        ) => {
            checkPageSpace(45);

            doc
                .font("Helvetica-Bold")
                .fontSize(12.5)
                .fillColor(color)
                .text(
                    cleanText(text),
                    contentLeft,
                    doc.y,
                    {
                        width: pageWidth,
                        lineGap: 2,
                    }
                );

            doc.moveDown(0.4);

            doc.fillColor(COLORS.dark);
        };

        const paragraph = (
            text,
            options = {}
        ) => {
            if (!text) return;

            checkPageSpace(30);

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
                .text(
                    cleanText(text),
                    contentLeft,
                    doc.y,
                    {
                        width: pageWidth,
                        lineGap: 3,
                        paragraphGap: 4,
                        align: "left",
                    }
                );

            doc.moveDown(0.2);

            doc
                .font("Helvetica")
                .fillColor(COLORS.dark);
        };

        const bullet = (
            text,
            level = 0
        ) => {
            if (!text) return;

            const indent =
                contentLeft + level * 18;

            const width =
                contentRight - indent;

            checkPageSpace(25);

            doc
                .font("Helvetica")
                .fontSize(10.5)
                .fillColor(COLORS.dark)
                .text(
                    `• ${cleanText(text)}`,
                    indent,
                    doc.y,
                    {
                        width,
                        lineGap: 3,
                        align: "left",
                    }
                );

            doc.moveDown(0.15);
        };

        const numbered = (
            number,
            text
        ) => {
            if (!text) return;

            checkPageSpace(25);

            doc
                .font("Helvetica")
                .fontSize(10.5)
                .fillColor(COLORS.dark)
                .text(
                    `${number}. ${cleanText(text)}`,
                    contentLeft,
                    doc.y,
                    {
                        width: pageWidth,
                        lineGap: 3,
                        align: "left",
                    }
                );

            doc.moveDown(0.15);
        };

        // =====================================================
        // MARKDOWN TABLE
        // =====================================================

        const renderTable = (rows) => {
            if (!rows || rows.length === 0) {
                return;
            }

            const columnCount = Math.max(
                ...rows.map(row => row.length)
            );

            const columnWidth =
                pageWidth / columnCount;

            const cellPadding = 6;

            const calculateRowHeight = (
                row,
                isHeader = false
            ) => {
                doc.font(
                    isHeader
                        ? "Helvetica-Bold"
                        : "Helvetica"
                );

                doc.fontSize(8.5);

                let maxHeight = 24;

                row.forEach(cell => {
                    const textHeight =
                        doc.heightOfString(
                            cleanText(cell),
                            {
                                width:
                                    columnWidth -
                                    cellPadding * 2,
                                lineGap: 2,
                            }
                        );

                    maxHeight = Math.max(
                        maxHeight,
                        textHeight +
                            cellPadding * 2
                    );
                });

                return maxHeight;
            };

            let currentY = doc.y;

            rows.forEach((row, rowIndex) => {
                const isHeader =
                    rowIndex === 0;

                const rowHeight =
                    calculateRowHeight(
                        row,
                        isHeader
                    );

                if (
                    currentY +
                        rowHeight >
                    bottomLimit
                ) {
                    doc.addPage();

                    currentY =
                        doc.page.margins.top;
                }

                row.forEach(
                    (cell, columnIndex) => {
                        const x =
                            contentLeft +
                            columnIndex *
                                columnWidth;

                        doc
                            .rect(
                                x,
                                currentY,
                                columnWidth,
                                rowHeight
                            )
                            .fillAndStroke(
                                isHeader
                                    ? "#EEF2FF"
                                    : COLORS.white,
                                COLORS.border
                            );

                        doc
                            .font(
                                isHeader
                                    ? "Helvetica-Bold"
                                    : "Helvetica"
                            )
                            .fontSize(8.5)
                            .fillColor(
                                COLORS.dark
                            )
                            .text(
                                cleanText(cell),
                                x + cellPadding,
                                currentY +
                                    cellPadding,
                                {
                                    width:
                                        columnWidth -
                                        cellPadding * 2,
                                    height:
                                        rowHeight -
                                        cellPadding * 2,
                                    lineGap: 2,
                                    align: "left",
                                }
                            );
                    }
                );

                currentY += rowHeight;
            });

            doc.y = currentY + 10;
        };

        // =====================================================
        // MARKDOWN RENDERER
        // =====================================================

        const renderMarkdown = (
            markdown = ""
        ) => {
            if (!markdown) return;

            const lines = String(markdown)
                .replace(/\r/g, "")
                .split("\n");

            let tableRows = [];
            let numberedCounter = 0;

            const flushTable = () => {
                if (tableRows.length > 0) {
                    renderTable(tableRows);
                    tableRows = [];
                }
            };

            for (let i = 0; i < lines.length; i++) {
                const rawLine = lines[i];

                const line = rawLine.trim();

                // Empty line
                if (!line) {
                    flushTable();

                    doc.moveDown(0.25);

                    numberedCounter = 0;

                    continue;
                }

                // =================================================
                // TABLE
                // =================================================

                if (
                    line.startsWith("|") &&
                    line.endsWith("|")
                ) {
                    const cells = line
                        .slice(1, -1)
                        .split("|")
                        .map(cell =>
                            cleanText(cell.trim())
                        );

                    // Skip separator row
                    if (
                        cells.every(cell =>
                            /^[-:]+$/.test(cell)
                        )
                    ) {
                        continue;
                    }

                    tableRows.push(cells);

                    // Check next line
                    const nextLine =
                        lines[i + 1]?.trim();

                    if (
                        !nextLine ||
                        !nextLine.startsWith("|")
                    ) {
                        flushTable();
                    }

                    continue;
                }

                // If current line isn't table
                flushTable();

                // =================================================
                // H1
                // =================================================

                if (line.startsWith("# ")) {
                    heading(
                        line.substring(2),
                        COLORS.primary
                    );

                    numberedCounter = 0;

                    continue;
                }

                // =================================================
                // H2
                // =================================================

                if (line.startsWith("## ")) {
                    subHeading(
                        line.substring(3),
                        COLORS.purple
                    );

                    numberedCounter = 0;

                    continue;
                }

                // =================================================
                // H3
                // =================================================

                if (line.startsWith("### ")) {
                    subHeading(
                        line.substring(4),
                        COLORS.blue
                    );

                    numberedCounter = 0;

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

                    numberedCounter = 0;

                    continue;
                }

                // =================================================
                // NUMBERED LIST
                // =================================================

                const numberedMatch =
                    line.match(
                        /^(\d+)\.\s+(.*)$/
                    );

                if (numberedMatch) {
                    numberedCounter =
                        Number(
                            numberedMatch[1]
                        );

                    numbered(
                        numberedCounter,
                        numberedMatch[2]
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
                    checkPageSpace(20);

                    doc
                        .moveTo(
                            contentLeft,
                            doc.y
                        )
                        .lineTo(
                            contentRight,
                            doc.y
                        )
                        .strokeColor(
                            COLORS.border
                        )
                        .lineWidth(0.5)
                        .stroke();

                    doc.moveDown(0.5);

                    numberedCounter = 0;

                    continue;
                }

                // =================================================
                // NORMAL TEXT
                // =================================================

                paragraph(line);

                numberedCounter = 0;
            }

            flushTable();
        };

        // =====================================================
        // QUESTION CARD
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

            // Estimate minimum space
            checkPageSpace(100);

            const cardTop = doc.y;

            // -------------------------------------------------
            // Question header
            // -------------------------------------------------

            doc
                .roundedRect(
                    contentLeft,
                    cardTop,
                    pageWidth,
                    48,
                    6
                )
                .fillColor(color)
                .fill();

            // Question text
            doc
                .font("Helvetica-Bold")
                .fontSize(10.5)
                .fillColor(COLORS.white)
                .text(
                    `Q${index + 1}. ${cleanText(
                        question
                    )}`,
                    contentLeft + 12,
                    cardTop + 10,
                    {
                        width:
                            pageWidth - 90,
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
                    contentRight - 65,
                    cardTop + 17,
                    {
                        width: 55,
                        align: "right",
                    }
                );

            // Move below header
            doc.y = cardTop + 62;

            // -------------------------------------------------
            // Answer title
            // -------------------------------------------------

            doc
                .font("Helvetica-Bold")
                .fontSize(11)
                .fillColor(COLORS.green)
                .text(
                    "Answer:",
                    contentLeft,
                    doc.y
                );

            doc.moveDown(0.35);

            // -------------------------------------------------
            // Answer
            // -------------------------------------------------

            doc.fillColor(COLORS.dark);

            renderMarkdown(answer);

            doc.moveDown(0.6);

            // -------------------------------------------------
            // Divider
            // -------------------------------------------------

            checkPageSpace(15);

            doc
                .moveTo(
                    contentLeft,
                    doc.y
                )
                .lineTo(
                    contentRight,
                    doc.y
                )
                .strokeColor(
                    COLORS.border
                )
                .lineWidth(0.5)
                .stroke();

            doc.moveDown(0.7);
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
                contentLeft,
                doc.y,
                {
                    width: pageWidth,
                    align: "center",
                }
            );

        doc.moveDown(0.5);

        doc
            .font("Helvetica")
            .fontSize(13)
            .fillColor(COLORS.gray)
            .text(
                "AI-Powered Exam Preparation",
                contentLeft,
                doc.y,
                {
                    width: pageWidth,
                    align: "center",
                }
            );

        doc.moveDown(2);

        const coverBoxY = doc.y;

        doc
            .roundedRect(
                contentLeft + 35,
                coverBoxY,
                pageWidth - 70,
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
                contentLeft + 50,
                coverBoxY + 32,
                {
                    width:
                        pageWidth - 100,
                    align: "center",
                }
            );

        doc.moveDown(6);

        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(COLORS.gray)
            .text(
                "Generated by SmartNotes AI",
                contentLeft,
                doc.y,
                {
                    width: pageWidth,
                    align: "center",
                }
            );

        // New page
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
                        Array.isArray(topics)
                    ) {
                        topics.forEach(topic => {
                            bullet(topic);
                        });
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
            )
        ) {
            heading(
                "Quick Revision Points",
                COLORS.green
            );

            result.revisionPoints.forEach(
                point => {
                    bullet(point);
                }
            );
        }

        // =====================================================
        // 5 MARK QUESTIONS
        // =====================================================

        if (
            Array.isArray(
                result.questions?.short
            ) &&
            result.questions.short.length > 0
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
                        item.marks || 5,
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
            result.questions.long.length > 0
        ) {
            heading(
                "10-Mark Long Answers",
                COLORS.purple
            );

            paragraph(
                "These answers are designed for 10-mark examination questions and provide detailed, structured explanations.",
                {
                    color: COLORS.gray,
                }
            );

            result.questions.long.forEach(
                (item, index) => {
                    renderQuestion(
                        item,
                        index,
                        item.marks || 10,
                        COLORS.purple
                    );
                }
            );
        }

        // =====================================================
        // DIAGRAM QUESTION TEXT
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
                    size: 11,
                }
            );
        }

        // =====================================================
        // NOTE:
        // Mermaid/image section intentionally removed.
        // Charts can also be removed if you want a
        // completely text-only PDF.
        // =====================================================

        // =====================================================
        // FOOTERS
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
        // END PDF
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

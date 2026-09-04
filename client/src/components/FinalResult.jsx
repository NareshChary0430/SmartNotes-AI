import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import MermaidSetup from './MermaidSetup'
import RechartSetUp from './RechartSetUp'
import { downloadPdf } from '../services/api'

const markDownComponent = {
h1: ({ children }) => ( <h1 className="text-2xl font-bold text-indigo-700 mt-6 mb-4 border-b pb-2">
{children} </h1>
),
h2: ({ children }) => ( <h2 className="text-xl font-semibold text-indigo-600 mt-5 mb-3">
{children} </h2>
),
h3: ({ children }) => ( <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
{children} </h3>
),
p: ({ children }) => ( <p className="text-gray-700 leading-relaxed mb-3">
{children} </p>
),
ul: ({ children }) => ( <ul className="list-disc ml-6 space-y-1 text-gray-700">
{children} </ul>
),
ol: ({ children }) => ( <ol className="list-decimal ml-6 space-y-2 text-gray-700">
{children} </ol>
),
li: ({ children }) => ( <li className="marker:text-indigo-500">
{children} </li>
),
table: ({ children }) => ( <div className="overflow-x-auto my-4"> <table className="min-w-full border border-gray-300 text-sm">
{children} </table> </div>
),
th: ({ children }) => ( <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold">
{children} </th>
),
td: ({ children }) => ( <td className="border border-gray-300 px-4 py-2">
{children} </td>
),
}

function FinalResult({ result }) {

const [quickRevision, setQuickRevision] = useState(false)

if (
    !result ||
    !result.subTopics ||
    !result.questions ||
    !result.questions.short ||
    !result.questions.long ||
    !result.revisionPoints
) {
    return null
}

return (
    <div className="mt-6 p-3 space-y-10 bg-white">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <h2
                className="text-3xl font-bold
                bg-gradient-to-r from-indigo-600 to-purple-600
                bg-clip-text text-transparent"
            >
                📘 Generated Notes
            </h2>

            <div className="flex gap-3">

                <button
                    onClick={() => setQuickRevision(!quickRevision)}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition
                        ${
                            quickRevision
                                ? "bg-green-600 text-white"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                        }
                    `}
                >
                    {quickRevision
                        ? "Exit Revision Mode"
                        : "Quick Revision (5 min)"}
                </button>

                <button
                    onClick={() => downloadPdf(result)}
                    className="px-4 py-2 rounded-lg text-sm font-medium
                    bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    ⬇️ Download PDF
                </button>

            </div>
        </div>


        {/* SUB TOPICS */}

        {!quickRevision && (
            <section>

                <SectionHeader
                    icon="⭐"
                    title="Sub Topics"
                    color="indigo"
                />

                {Object.entries(result.subTopics).map(
                    ([star, topics]) => (
                        <div
                            key={star}
                            className="mb-4"
                        >

                            <p className="font-medium text-indigo-600 mb-1">
                                {star} Priority
                            </p>

                            <ul className="list-disc ml-6 text-gray-700">
                                {topics.map((t, i) => (
                                    <li key={i}>
                                        {t}
                                    </li>
                                ))}
                            </ul>

                        </div>
                    )
                )}

            </section>
        )}


        {/* DETAILED NOTES */}

        {!quickRevision && (
            <section>

                <SectionHeader
                    icon="📝"
                    title="Detailed Notes"
                    color="purple"
                />

                <div className="bg-white border border-gray-200 rounded-xl p-6">

                    <ReactMarkdown components={markDownComponent}>
                        {result.notes}
                    </ReactMarkdown>

                </div>

            </section>
        )}


        {/* QUICK REVISION */}

        {quickRevision && (
            <section
                className="rounded-xl
                bg-gradient-to-r from-green-100 to-green-50
                border border-green-200
                p-6"
            >

                <h3 className="font-bold text-green-700 mb-3 text-lg">
                    ⚡ Exam Quick Revision Points
                </h3>

                <ul className="list-disc ml-6 space-y-1 text-gray-800">

                    {result.revisionPoints.map((p, i) => (
                        <li key={i}>
                            {p}
                        </li>
                    ))}

                </ul>

            </section>
        )}


        {/* DIAGRAM */}

        {result.diagram?.data && (
            <section>

                <SectionHeader
                    icon="📊"
                    title="Diagram"
                    color="cyan"
                />

                <MermaidSetup
                    diagram={result.diagram.data}
                />

                <p className="mt-3 text-xs text-gray-500 italic">
                    ℹ️ If you need this diagram for future reference or revision,
                    you can save it by taking a screenshot.
                </p>

            </section>
        )}


        {/* CHARTS */}

        {result.charts?.length > 0 && (
            <section>

                <SectionHeader
                    icon="📈"
                    title="Visual Charts"
                    color="indigo"
                />

                <RechartSetUp
                    charts={result.charts}
                />

                <p className="mt-3 text-xs text-gray-500 italic">
                    ℹ️ If you need this Chart for future reference or revision,
                    you can save it by taking a screenshot.
                </p>

            </section>
        )}


        {/* NO CHART */}

        {result.charts &&
            result.charts.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                    📉 Charts are not relevant for this topic.
                </p>
            )}


        {/* QUESTIONS */}

        <section>

            <SectionHeader
                icon="❓"
                title="Important Questions & Answers"
                color="rose"
            />


            {/* 5 MARK QUESTIONS */}

            <div className="mb-10">

                <div className="flex items-center gap-2 mb-4">

                    <h3 className="text-xl font-bold text-gray-800">
                        5-Mark Short Answers
                    </h3>

                    <span className="px-2 py-1 text-xs font-semibold
                    rounded-full bg-blue-100 text-blue-700">
                        5 Marks
                    </span>

                </div>


                <div className="space-y-6">

                    {result.questions.short.map((item, i) => (

                        <div
                            key={i}
                            className="border border-gray-200
                            rounded-xl
                            overflow-hidden
                            shadow-sm"
                        >

                            {/* QUESTION */}

                            <div className="bg-blue-50 p-4">

                                <div className="flex items-start justify-between gap-3">

                                    <h4 className="font-semibold text-gray-800">
                                        Q{i + 1}. {item.question}
                                    </h4>

                                    <span className="shrink-0
                                    px-2 py-1
                                    rounded-md
                                    bg-blue-600
                                    text-white
                                    text-xs
                                    font-semibold">
                                        {item.marks} Marks
                                    </span>

                                </div>

                            </div>


                            {/* ANSWER */}

                            <div className="p-5 bg-white">

                                <p className="font-semibold text-green-700 mb-3">
                                    Answer:
                                </p>

                                <ReactMarkdown
                                    components={markDownComponent}
                                >
                                    {item.answer}
                                </ReactMarkdown>

                            </div>

                        </div>

                    ))}

                </div>

            </div>


            {/* 10 MARK QUESTIONS */}

            <div>

                <div className="flex items-center gap-2 mb-4">

                    <h3 className="text-xl font-bold text-gray-800">
                        10-Mark Long Answers
                    </h3>

                    <span className="px-2 py-1 text-xs font-semibold
                    rounded-full bg-purple-100 text-purple-700">
                        10 Marks
                    </span>

                </div>


                <div className="space-y-6">

                    {result.questions.long.map((item, i) => (

                        <div
                            key={i}
                            className="border border-gray-200
                            rounded-xl
                            overflow-hidden
                            shadow-sm"
                        >

                            {/* QUESTION */}

                            <div className="bg-purple-50 p-4">

                                <div className="flex items-start justify-between gap-3">

                                    <h4 className="font-semibold text-gray-800">
                                        Q{i + 1}. {item.question}
                                    </h4>

                                    <span className="shrink-0
                                    px-2 py-1
                                    rounded-md
                                    bg-purple-600
                                    text-white
                                    text-xs
                                    font-semibold">
                                        {item.marks} Marks
                                    </span>

                                </div>

                            </div>


                            {/* ANSWER */}

                            <div className="p-5 bg-white">

                                <p className="font-semibold text-green-700 mb-3">
                                    Answer:
                                </p>

                                <ReactMarkdown
                                    components={markDownComponent}
                                >
                                    {item.answer}
                                </ReactMarkdown>

                            </div>

                        </div>

                    ))}

                </div>

            </div>


            {/* DIAGRAM QUESTION */}

            {result.questions.diagram && (
                <div className="mt-8">

                    <h3 className="font-semibold text-gray-800 mb-3">
                        Diagram-Based Question
                    </h3>

                    <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                        <p className="text-gray-700">
                            {result.questions.diagram}
                        </p>
                    </div>

                </div>
            )}

        </section>

    </div>
)

}

function SectionHeader({ icon, title, color }) {


const colors = {
    indigo: "from-indigo-100 to-indigo-50 text-indigo-700",
    purple: "from-purple-100 to-purple-50 text-purple-700",
    blue: "from-blue-100 to-blue-50 text-blue-700",
    green: "from-green-100 to-green-50 text-green-700",
    cyan: "from-cyan-100 to-cyan-50 text-cyan-700",
    rose: "from-rose-100 to-rose-50 text-rose-700",
}

return (
    <div
        className={`
            mb-4 px-4 py-2 rounded-lg
            bg-gradient-to-r ${colors[color]}
            font-semibold flex items-center gap-2
        `}
    >
        <span>{icon}</span>
        <span>{title}</span>
    </div>
)


}

export default FinalResult

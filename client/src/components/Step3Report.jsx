import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { FaArrowLeft } from 'react-icons/fa'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function Step3Report({ report }) {
  const navigate = useNavigate()
  const pdfRef = useRef()

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    )
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ]

  let performanceText = ""
  let shortTagline = ""
  let professionalAdvice = ""

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities."
    shortTagline = "Excellent clarity and structured responses."
    professionalAdvice = "Excellent performance! Your answers were clear, structured, and confident. Keep refining your examples and you'll excel in real interviews."
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews."
    shortTagline = "Good foundation, refine articulation."
    professionalAdvice = "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples."
  } else {
    performanceText = "Significant improvement required."
    shortTagline = "Work on clarity and confidence."
    professionalAdvice = "Focus on building your core knowledge and communication skills. Practice answering questions with clear structure: situation, action, and result."
  }

  const handleDownloadPDF = async () => {
    const element = pdfRef.current
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('interview-report.pdf')
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-100">
          <p className="text-gray-600 font-medium">{label}</p>
          <p className="text-indigo-600 font-semibold">score : {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className='min-h-screen bg-gray-50 px-4 sm:px-8 lg:px-12 py-8'>

      {/* Top bar */}
      <div className='flex items-center justify-between mb-8 flex-wrap gap-4'>
        <div className='flex items-center gap-4'>
          <button onClick={() => navigate('/history')} className='p-2 rounded-full hover:bg-gray-200 transition'>
            <FaArrowLeft className='text-gray-600 text-lg' />
          </button>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Interview Analytics Dashboard</h1>
            <p className='text-gray-400 text-sm mt-0.5'>AI-powered performance insights</p>
          </div>
        </div>
        <button onClick={handleDownloadPDF} className='px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition'>
          Download PDF
        </button>
      </div>

      {/* Dashboard UI */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

        <div className='flex flex-col gap-6'>
          <div className='bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center text-center border border-gray-100'>
            <p className='text-gray-400 text-sm mb-5'>Overall Performance</p>
            <div className='w-36 h-36'>
              <CircularProgressbar
                value={finalScore * 10}
                text={`${finalScore}/10`}
                styles={buildStyles({
                  textSize: '16px',
                  pathColor: '#4f46e5',
                  textColor: '#4f46e5',
                  trailColor: '#e5e7eb',
                })}
              />
            </div>
            <p className='text-gray-400 text-sm mt-4'>Out of 10</p>
            <p className='text-gray-800 font-bold text-sm mt-3'>{performanceText}</p>
            <p className='text-gray-400 text-xs mt-1'>{shortTagline}</p>
          </div>

          <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
            <h2 className='text-gray-800 font-bold text-base mb-5'>Skill Evaluation</h2>
            <div className='flex flex-col gap-5'>
              {skills.map((skill) => (
                <div key={skill.label}>
                  <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-gray-700 text-sm font-medium'>{skill.label}</span>
                    <span className='text-indigo-500 font-bold text-sm'>{skill.value}</span>
                  </div>
                  <div className='w-full h-2.5 bg-gray-100 rounded-full overflow-hidden'>
                    <div className='h-full bg-indigo-500 rounded-full' style={{ width: `${(skill.value / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 flex flex-col gap-6'>
          <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
            <h2 className='text-gray-800 font-bold text-base mb-5'>Performance Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={questionScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} ticks={[0, 3, 6, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fill="url(#scoreGradient)" dot={{ fill: '#4f46e5', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#4f46e5' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className='text-gray-800 font-bold text-base mb-4'>Question Breakdown</h2>
            <div className='flex flex-col gap-4'>
              {questionWiseScore.map((q, index) => (
                <div key={index} className='bg-white rounded-2xl shadow-sm p-5 border border-gray-100'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1'>
                      <p className='text-gray-400 text-xs mb-1'>Question {index + 1}</p>
                      <p className='text-gray-800 font-semibold text-sm leading-snug'>{q.question}</p>
                    </div>
                    <span className='shrink-0 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg'>
                      {q.score || 0}/10
                    </span>
                  </div>
                  {q.answer ? (
                    <div className='mt-3 bg-gray-50 rounded-xl p-3'>
                      <p className='text-gray-400 text-xs font-semibold mb-1'>Your Answer</p>
                      <p className='text-gray-700 text-sm'>{q.answer}</p>
                    </div>
                  ) : (
                    <p className='mt-3 text-red-400 text-xs'>No answer submitted</p>
                  )}
                  {q.feedback && (
                    <div className='mt-2 bg-indigo-50 rounded-xl p-3'>
                      <p className='text-indigo-600 text-xs font-semibold mb-1'>AI Feedback</p>
                      <p className='text-gray-600 text-sm'>{q.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF Template */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={pdfRef} style={{ width: '794px', padding: '40px', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' }}>

          <h1 style={{ color: '#4f46e5', textAlign: 'center', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
            InterviewPrep.AI — Performance Report
          </h1>
          <hr style={{ borderColor: '#4f46e5', marginBottom: '24px' }} />

          {/* Final Score */}
          <div style={{ backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>Final Score: {finalScore}/10</p>
          </div>

          {/* Skills */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>Confidence: {confidence}</p>
            <p style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>Communication: {communication}</p>
            <p style={{ fontWeight: 'bold', color: '#1f2937' }}>Correctness: {correctness}</p>
          </div>

          {/* Professional Advice */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Professional Advice</p>
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>{professionalAdvice}</p>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#4f46e5', color: '#fff' }}>
                <th style={{ padding: '10px', textAlign: 'center', width: '30px' }}>#</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Question</th>
                <th style={{ padding: '10px', textAlign: 'center', width: '60px' }}>Score</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {questionWiseScore.map((q, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>{index + 1}</td>
                  <td style={{ padding: '10px', color: '#1f2937' }}>{q.question}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#4f46e5', fontWeight: 'bold' }}>{q.score || 0}/10</td>
                  <td style={{ padding: '10px', color: '#4b5563' }}>{q.feedback || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

    </div>
  )
}

export default Step3Report

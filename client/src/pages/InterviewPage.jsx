import React, { useState } from 'react'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'
import { useNavigate } from 'react-router-dom'

function InterviewPage() {
    const [step, setStep] = useState(1)
    const [interviewData, setInterviewData] = useState(null)
    const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-gray-50'>
        {step === 1 && (
            <Step1SetUp
                onStart={(data) => {
                    setInterviewData(data)
                    setStep(2)
                }}
                onBack={() => navigate('/')}
            />
        )}
        {step === 2 && (
            <Step2Interview
                interviewData={interviewData}
                onFinish={(report) => {
                    setInterviewData(report)
                    setStep(3)
                }}
                onBack={() => {
                    const confirm = window.confirm("Are you sure you want to exit the interview? Your progress will be lost.")
                    if (confirm) {
                        window.speechSynthesis.cancel()
                        setStep(1)
                    }
                }}
            />
        )}
        {step === 3 && (
            <Step3Report report={interviewData} />
        )}
    </div>
  )
}

export default InterviewPage

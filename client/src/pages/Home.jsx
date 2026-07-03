import React, { useState } from "react"
import { motion } from "motion/react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { BsMic, BsLightningCharge, BsBriefcase, BsShieldCheck, BsCoin } from "react-icons/bs"
import { HiOutlineLogout } from "react-icons/hi"
import axios from "axios"
import { ServerUrl } from "../App"
import { setUserData } from "../redux/userSlice"
import AuthModel from "../components/AuthModel"

function Home() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)
  const [showAuth, setShowAuth] = useState(false)
  const [showUserPopup, setShowUserPopup] = useState(false)

  const goOrAuth = (path) => {
    if (!userData) {
      setShowAuth(true)
      return
    }
    navigate(path)
  }

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
      dispatch(setUserData(null))
      setShowUserPopup(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">InterviewPrep.AI</span>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/pricing')} className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition">Pricing</button>
            <button onClick={() => goOrAuth('/history')} className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition">History</button>

            {userData ? (
              <>
                <button onClick={() => navigate('/pricing')} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-indigo-100 transition">
                  <BsCoin size={16} />
                  {userData.credits || 0}
                </button>
                <div className="relative">
                  <button onClick={() => setShowUserPopup(!showUserPopup)} className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {userData.name?.slice(0, 1).toUpperCase()}
                  </button>
                  {showUserPopup && (
                    <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-100 rounded-xl p-4 z-50">
                      <p className="text-sm text-gray-800 font-medium mb-1 truncate">{userData.name}</p>
                      <button onClick={() => { setShowUserPopup(false); navigate('/history') }} className="w-full text-left text-sm py-2 text-gray-600 hover:text-indigo-600 transition">Interview History</button>
                      <button onClick={handleLogout} className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500">
                        <HiOutlineLogout size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">Sign In</button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              🚀 AI-Powered Interview Practice
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Ace Every Interview<br />
              <span className="text-indigo-600">with AI Practice</span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Practice with a realistic AI interviewer, get instant feedback on your answers, and track your improvement — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => goOrAuth('/interview')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition text-lg">
                Start Practicing Free →
              </button>
              <button onClick={() => goOrAuth('/history')} className="px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl shadow-sm hover:shadow-md transition text-lg">
                View My Reports
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-y border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <BsShieldCheck size={22} />, label: "Free to Start" },
            { icon: <BsMic size={22} />, label: "Voice + Text Interviews" },
            { icon: <BsLightningCharge size={22} />, label: "Instant AI Feedback" },
            { icon: <BsBriefcase size={22} />, label: "HR & Technical Modes" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {item.icon}
              </div>
              <p className="text-gray-600 text-sm font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-500 text-lg">Built for job seekers who take their preparation seriously.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🤖", title: "Realistic AI Interviewer", desc: "Our AI conducts natural voice conversations just like a real interviewer, adapting to your answers in real-time." },
              { icon: "📊", title: "Instant Performance Report", desc: "Get detailed analytics on confidence, communication and correctness immediately after each session." },
              { icon: "🎯", title: "Role-Specific Questions", desc: "Questions tailored to your exact job role, experience level, and tech stack for maximum relevance." },
            ].map((f) => (
              <motion.div key={f.title} whileHover={{ y: -4 }} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 text-lg mb-16">Three simple steps to interview success.</p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Set Up Your Interview", desc: "Choose your job role, experience level, and interview mode — HR or Technical." },
              { step: "02", title: "Practice with AI", desc: "Answer questions verbally or by typing. The AI listens and evaluates your responses." },
              { step: "03", title: "Review & Improve", desc: "Get a detailed report with scores, feedback, and tips to improve for the real thing." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-600 to-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-indigo-100 text-lg mb-10">Join thousands of candidates who improved their interview skills with InterviewPrep.AI</p>
          <button onClick={() => goOrAuth('/interview')} className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition text-lg">
            Start Your Free Interview →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <h3 className="text-white text-2xl font-bold mb-3">InterviewPrep.AI</h3>
              <p className="text-sm leading-relaxed max-w-sm">
                The smartest way to prepare for job interviews. Practice with AI, get real feedback, and walk into every interview with confidence.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => goOrAuth('/interview')} className="hover:text-white transition">Start Interview</button></li>
                <li><button onClick={() => goOrAuth('/history')} className="hover:text-white transition">My History</button></li>
                <li><button onClick={() => navigate('/pricing')} className="hover:text-white transition">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 support@interviewprep.ai</li>
                <li>🌐 interviewprep.ai</li>
                <li>🐦 @interviewprepai</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© {new Date().getFullYear()} InterviewPrep.AI. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default Home

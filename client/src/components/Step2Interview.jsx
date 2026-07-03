import React, { useState, useRef, useEffect } from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from 'motion/react'
import { FaMicrophone, FaMicrophoneSlash, FaArrowLeft } from 'react-icons/fa'
import { BsArrowRight } from 'react-icons/bs'
import axios from 'axios'
import { ServerUrl } from '../App'
function Step2Interview({ interviewData, onFinish, onBack }) {
  const { interviewId, questions, userName } = interviewData
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const isMicOnRef = useRef(true);
  const isAIPlayingRef = useRef(false);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);


  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
        );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Try known male voices
      const maleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
        );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Fallback: first voice (assume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

  }, [])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo


  /* ---------------- SPEAK FUNCTION ---------------- */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.voice = selectedVoice;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        isAIPlayingRef.current = true;
        stopMic()
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);
        isAIPlayingRef.current = false;

        if (isMicOnRef.current) {
          startMic();
        }

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));

        // If last question (hard level)
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }

    }

    runIntro()

  }, [selectedVoice, isIntroPhase, currentIndex])


  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1
      })
    }, 1000);

    return () => clearInterval(timer)

  }, [isIntroPhase, currentIndex])

  useEffect(() => {
  if (!isIntroPhase && currentQuestion) {
    setTimeLeft(currentQuestion.timeLimit || 60);
  }
}, [currentIndex]);


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
        } else {
          interimText += event.results[i][0].transcript;
        }
      }

      if (finalText) {
        setAnswer((prev) => prev + finalText);
        setLiveTranscript("");
      } else {
        setLiveTranscript(interimText);
      }
    };

    recognition.onend = () => {
      if (isMicOnRef.current && !isAIPlayingRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "not-allowed") {
        setIsMicOn(false);
        isMicOnRef.current = false;
        alert("Microphone permission denied. Please allow mic access in browser settings.");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      // Disable the auto-restart handler before tearing down, otherwise
      // stop() below fires onend which immediately calls start() again on
      // this same (about-to-be-discarded) instance, leaving a zombie
      // recognition session running in the background that fights the
      // fresh instance created on remount (React 18 StrictMode double
      // mount) for the mic stream.
      recognition.onend = null;
      try { recognition.stop(); } catch {}
      try { recognition.abort(); } catch {}
    };
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlayingRef.current) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  };

  const toggleMic = () => {
    const next = !isMicOn;
    isMicOnRef.current = next;
    if (next) {
      startMic();
    } else {
      stopMic();
    }
    setIsMicOn(next);
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic()
    setIsSubmitting(true)

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken:
          currentQuestion.timeLimit - timeLeft,
      }, { withCredentials: true })
      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)
    } catch (error) {

      setIsSubmitting(false)

    }
  }

  const handleNext = async () => {
  setAnswer("");
  setFeedback("");
  setLiveTranscript("");

  if (currentIndex + 1 >= questions.length) {
    finishInterview();
    return;
  }

  await speakText("Alright, let's move to the next question.");

  setCurrentIndex(currentIndex + 1);
  setTimeout(() => {
    if (isMicOn) startMic();
  }, 500);
}

const finishInterview = async () => {
  stopMic()
  setIsMicOn(false)
  try {
    const result = await axios.post(ServerUrl + "/api/interview/finish", {
      interviewId }, {withCredentials:true})

    console.log(result.data)
    onFinish(result.data)
  } catch (error) {
    console.log(error)
  }
}

useEffect(() => {
  if (isIntroPhase) return;
  if (!currentQuestion) return;

  if (timeLeft === 0 && !isSubmitting && !feedback) {
    submitAnswer();
  }
}, [timeLeft]);

useEffect(() => {
  return () => {
    window.speechSynthesis.cancel();
  };
}, []);



  return (
    <div className='min-h-screen bg-linear-to-br from-indigo-50 via-white to-violet-100 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>

        {/* video section */}
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>


          {/* subtitle */}
          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}



          {/* timer Area */}
          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Interview Status
              </span>
              {isAIPlaying && <span className='text-sm font-semibold text-indigo-600'>
                {isAIPlaying ? "AI Speaking" : ""}
              </span>}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className='flex justify-center'>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-indigo-600'>1</span>
                <span className='text-xs text-gray-400'>Current Questions</span>
              </div>

              <div>
                <span className='text-2xl font-bold text-indigo-600'>{questions.length}</span>
                <span className='text-xs text-gray-400'>Total Questions</span>
              </div>
            </div>


          </div>


        </div>

        {/* Text section */}

        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <div className='flex items-center gap-3 mb-6'>
            <button onClick={onBack} className='p-2 rounded-full hover:bg-gray-100 transition'>
              <FaArrowLeft className='text-gray-500' />
            </button>
            <h2 className='text-xl sm:text-2xl font-bold text-indigo-600'>
              AI Smart Interview
            </h2>
          </div>

          {!isIntroPhase && (<div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>
              Question {currentIndex + 1} of {questions.length}
            </p>

            <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed'>{currentQuestion?.question}</div>
          </div>)
          }
          <textarea
            placeholder="Type your answer here or speak using the mic..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-500 transition text-gray-800" />
          {liveTranscript && (
            <p className="mt-2 text-sm text-indigo-600 italic px-2">
              🎙️ {liveTranscript}...
            </p>
          )}


          {!feedback ? (<div className='flex items-center gap-4 mt-6'>
            <motion.button
              onClick={toggleMic}
              whileTap={{ scale: 0.9 }}
              className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'>
              {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20}/>}
            </motion.button>

            <motion.button
              onClick={submitAnswer}
              disabled={isSubmitting}
              whileTap={{ scale: 0.95 }}
              className='flex-1 bg-gradient-to-r from-indigo-600 to-violet-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'>
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </motion.button>

          </div>) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-6 bg-indigo-50 border border-indigo-200 p-5 rounded-2xl shadow-sm'>
              <p className='text-indigo-700 font-medium mb-4'>{feedback}</p>
              <button
              onClick={handleNext}
              className='w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'>
                Next Question <BsArrowRight size={18} />
              </button>

            </motion.div>
          )}




        </div>

      </div>

    </div>

  )
}

export default Step2Interview

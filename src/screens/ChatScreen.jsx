import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Bot,
  User,
  Sparkles,
  Droplets,
  CloudRain,
  Thermometer,
  ShieldAlert,
  RotateCcw,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  Radio,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { sendChatMessage, transcribeVoiceAudio, synthesizeVoiceSpeech } from '../services/chatService'

const SUGGESTED_QUESTIONS = {
  en: [
    "What fertilizer should I use for my tomato crop?",
    "Should I water my tomato field now?",
    "What is the soil moisture right now?",
    "What is the organic alternative to Urea?"
  ],
  ta: [
    "என் தக்காளி பயிருக்கு என்ன உரம் இட வேண்டும்?",
    "இன்று என் வயலுக்கு தண்ணீர் பாய்ச்ச வேண்டுமா?",
    "மண்ணின் ஈரப்பதம் இப்போது எவ்வளவு?",
    "யூரியாவிற்கு இயற்கை மாற்று என்ன?"
  ],
  hi: [
    "टमाटर की फसल के लिए कौन सा खाद उपयोग करें?",
    "क्या मुझे आज अपने खेत में पानी देना चाहिए?",
    "मिट्टी में नमी का स्तर क्या है?"
  ],
  te: [
    "టమోటా పంటకు ఏ ఎరువు వేయాలి?",
    "ఈరోజు పొలానికి నీరు పెట్టాలా?",
    "నేలలో తేమ ఎంత ఉంది?"
  ]
}

const LANGUAGES = [
  { code: 'en', name: 'English', speechCode: 'en-US' },
  { code: 'ta', name: 'தமிழ் (Tamil)', speechCode: 'ta-IN' },
  { code: 'hi', name: 'हिन्दी (Hindi)', speechCode: 'hi-IN' },
  { code: 'te', name: 'తెలుగు (Telugu)', speechCode: 'te-IN' }
]

export default function ChatScreen({ initialQuery, onClearInitialQuery }) {
  const [selectedLang, setSelectedLang] = useState('en')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 வணக்கம் / Hello! I am your **AgriSense Agricultural Copilot**.\n\nI monitor your live tomato farm sensors, rain forecasts, and crop health to give you quick, reliable guidance.\n\n🎙️ Press the mic button to speak in Tamil, Hindi, Telugu, or English!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      telemetry: null,
      language: 'en'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [activePlayingId, setActivePlayingId] = useState(null)
  const [pendingActionConfirmation, setPendingActionConfirmation] = useState(null)

  const messagesEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const currentAudioRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, isRecording, pendingActionConfirmation])

  // Handle initial query from another screen
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery)
      if (onClearInitialQuery) onClearInitialQuery()
    }
  }, [initialQuery])

  // Cleanup audio playback and recording timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) recognitionRef.current.abort()
      if (currentAudioRef.current) currentAudioRef.current.pause()
      if (window.speechSynthesis) window.speechSynthesis.cancel()
    }
  }, [])

  // Send message handler (maintains STICKY conversation language state)
  const handleSend = async (textToSend, autoSpeak = false) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: selectedLang
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)

    // Build conversation history with sticky language tags
    const conversationHistory = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
      language: m.language || selectedLang,
      intent: m.intent || ''
    }))

    try {
      const res = await sendChatMessage(query, {
        language: selectedLang,
        conversationHistory
      })

      // If backend resolved sticky language to Tamil/Hindi/Telugu, sync local state
      if (res.language && res.language !== selectedLang && ['ta', 'hi', 'te', 'en'].includes(res.language)) {
        setSelectedLang(res.language)
      }

      const botReplyText = res.reply || res.answer || "No response received."
      const botMsgId = Date.now() + 1

      const botMsg = {
        id: botMsgId,
        sender: 'bot',
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        telemetry: res.telemetry_used || res.data,
        intent: res.intent,
        domain: res.domain,
        sourcesUsed: res.sources_used,
        routingReason: res.routing_reason,
        citedTopics: res.cited_topics,
        suggestedActions: res.suggested_actions || res.follow_up_suggestions,
        language: res.language || selectedLang
      }
      setMessages(prev => [...prev, botMsg])

      // If sent via voice, automatically play speech back in user's language
      if (autoSpeak) {
        handlePlayVoice(botMsgId, botReplyText, res.language || selectedLang)
      }
    } catch (err) {
      console.error("Chat error:", err)
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: selectedLang === 'ta'
          ? "⚠️ மன்னிக்கவும், சர்வரை தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
          : "⚠️ Sorry, I could not reach the backend server. Please verify your connection.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: selectedLang
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  // Speech-to-Text (STT) Voice Recording
  const startRecording = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const currentLangObj = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0]

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition()
        recognition.lang = currentLangObj.speechCode
        recognition.interimResults = true
        recognition.continuous = false

        recognition.onstart = () => {
          setIsRecording(true)
          setRecordingSeconds(0)
          timerRef.current = setInterval(() => {
            setRecordingSeconds(s => s + 1)
          }, 1000)
        }

        recognition.onresult = (event) => {
          let transcript = ''
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript
          }
          if (transcript) {
            setInput(transcript)
          }
        }

        recognition.onerror = (event) => {
          console.warn("[WebSpeech] Recognition error:", event.error)
          stopRecordingFallback()
        }

        recognition.onend = () => {
          stopRecordingTimer()
          setIsRecording(false)
          // If transcript was captured, automatically send it
          if (input && input.trim()) {
            handleSend(input.trim(), true)
          }
        }

        recognitionRef.current = recognition
        recognition.start()
        return
      } catch (e) {
        console.warn("[WebSpeech] Initialization fallback:", e)
      }
    }

    // MediaRecorder Fallback if WebSpeech is not available
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setLoading(true)
        try {
          const res = await transcribeVoiceAudio(audioBlob, selectedLang)
          if (res.requires_repeat) {
            // Low confidence repeat prompt
            setMessages(prev => [...prev, {
              id: Date.now(),
              sender: 'bot',
              text: res.repeat_message || "I could not hear clearly. Please repeat.",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              language: selectedLang
            }])
            return
          }

          if (res.requires_action_confirmation) {
            setPendingActionConfirmation({
              prompt: res.confirmation_prompt,
              action: "MOTOR_ON"
            })
            return
          }

          const spokenText = res.transcript || res.text
          if (spokenText) {
            setInput(spokenText)
            handleSend(spokenText, true)
          }
        } catch (err) {
          console.error("Audio upload error:", err)
        } finally {
          setLoading(false)
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1)
      }, 1000)
    } catch (err) {
      console.error("Microphone permission denied:", err)
      alert("Microphone permission is required for voice messaging.")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    stopRecordingTimer()
    setIsRecording(false)
  }

  const stopRecordingFallback = () => {
    stopRecordingTimer()
    setIsRecording(false)
  }

  const stopRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // Text-to-Speech (TTS) Voice Synthesis Playback
  const handlePlayVoice = async (msgId, text, langOverride = null) => {
    const targetLang = langOverride || selectedLang

    if (activePlayingId === msgId) {
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }
      setActivePlayingId(null)
      return
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel()
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }

    const cleanText = text.replace(/[*#`]/g, '').trim()
    setActivePlayingId(msgId)

    // Option 1: Browser SpeechSynthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText)
      const currentLangObj = LANGUAGES.find(l => l.code === targetLang) || LANGUAGES[0]
      utterance.lang = currentLangObj.speechCode
      utterance.rate = 0.95

      utterance.onend = () => setActivePlayingId(null)
      utterance.onerror = () => playBackendTTS(msgId, cleanText, targetLang)

      window.speechSynthesis.speak(utterance)
      return
    }

    // Option 2: Backend TTS Endpoint fallback
    await playBackendTTS(msgId, cleanText, targetLang)
  }

  const playBackendTTS = async (msgId, cleanText, targetLang) => {
    try {
      const res = await synthesizeVoiceSpeech(cleanText, targetLang)
      if (res.audio_base64 || res.audio_url) {
        const audioSrc = res.audio_base64 || res.audio_url
        const audio = new Audio(audioSrc)
        currentAudioRef.current = audio
        audio.onended = () => setActivePlayingId(null)
        audio.onerror = () => setActivePlayingId(null)
        await audio.play()
      } else {
        setActivePlayingId(null)
      }
    } catch (e) {
      console.warn("Backend TTS failed:", e)
      setActivePlayingId(null)
    }
  }

  const confirmAction = async () => {
    setPendingActionConfirmation(null)
    handleSend(selectedLang === 'ta' ? "ஆம், மோட்டாரை இயக்குங்கள்." : "Yes, turn on irrigation.")
  }

  const cancelAction = () => {
    setPendingActionConfirmation(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', background: '#f8fafc' }}>
      {/* Header with Sticky Language Selector & Agent Scope */}
      <div className="screen-header" style={{ borderBottom: '1px solid #e2e8f0', background: '#fff', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <Bot size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: '700', color: '#0f172a' }}>AgriSense Copilot</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', fontWeight: '500' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }}></span>
                Tomato Agronomy Only
              </div>
            </div>
          </div>

          {/* Sticky Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', padding: '4px 10px', borderRadius: 14 }}>
            <Globe size={14} color="#64748b" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 12,
                fontWeight: '600',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Telemetry Pill Bar */}
      <div style={{ background: '#fff', padding: '8px 16px', display: 'flex', gap: 12, overflowX: 'auto', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', padding: '4px 10px', borderRadius: 20, fontSize: 12, color: '#166534', flexShrink: 0 }}>
          <Droplets size={14} color="#16a34a" />
          <span>Moisture: <strong>28%</strong> (Low)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', padding: '4px 10px', borderRadius: 20, fontSize: 12, color: '#1e40af', flexShrink: 0 }}>
          <CloudRain size={14} color="#3b82f6" />
          <span>Rain (6h): <strong>82%</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff7ed', padding: '4px 10px', borderRadius: 20, fontSize: 12, color: '#9a3412', flexShrink: 0 }}>
          <Thermometer size={14} color="#ea580c" />
          <span>Temp: <strong>31°C</strong></span>
        </div>
      </div>

      {/* Action Safety Confirmation Banner */}
      {pendingActionConfirmation && (
        <div style={{ margin: '10px 16px 0', padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b45309', fontWeight: '600', fontSize: 13 }}>
            <AlertTriangle size={18} />
            <span>{pendingActionConfirmation.prompt}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={cancelAction}
              style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid #d97706', background: 'transparent', color: '#b45309', fontSize: 12, cursor: 'pointer', fontWeight: '600' }}
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              style={{ padding: '6px 14px', borderRadius: 10, border: 'none', background: '#d97706', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: '600' }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '100%'
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: 18,
                borderTopRightRadius: msg.sender === 'user' ? 4 : 18,
                borderTopLeftRadius: msg.sender === 'bot' ? 4 : 18,
                background: msg.sender === 'user' ? '#16a34a' : '#fff',
                color: msg.sender === 'user' ? '#fff' : '#1e293b',
                boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(22, 163, 74, 0.2)' : '0 2px 10px rgba(0,0,0,0.05)',
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none'
              }}
            >
              {/* Header with Domain / Intent and Audio Speak button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                {msg.intent && msg.intent !== 'GREETING' ? (
                  <span style={{ fontSize: 10, fontWeight: '700', padding: '2px 8px', borderRadius: 12, background: msg.sender === 'user' ? 'rgba(255,255,255,0.2)' : (msg.domain === 'OUT_OF_DOMAIN' ? '#fee2e2' : '#e0f2fe'), color: msg.sender === 'user' ? '#fff' : (msg.domain === 'OUT_OF_DOMAIN' ? '#991b1b' : '#0369a1'), textTransform: 'uppercase' }}>
                    {msg.domain === 'OUT_OF_DOMAIN' ? '⛔ Out of Domain' : `🎯 ${msg.intent.replace(/_/g, ' ')}`}
                  </span>
                ) : <span />}

                {msg.sender === 'bot' && (
                  <button
                    onClick={() => handlePlayVoice(msg.id, msg.text, msg.language)}
                    title="Listen to response"
                    style={{
                      border: 'none',
                      background: activePlayingId === msg.id ? '#dcfce7' : '#f1f5f9',
                      color: activePlayingId === msg.id ? '#16a34a' : '#64748b',
                      borderRadius: 12,
                      padding: '3px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: '600'
                    }}
                  >
                    {activePlayingId === msg.id ? (
                      <>
                        <VolumeX size={14} className="pulse" />
                        <span>Playing...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Message text */}
              {msg.text}

              {/* Suggested Follow-up Actions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                    💡 Quick Actions:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(typeof act === 'string' ? act : act.title || JSON.stringify(act))}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: 14,
                          fontSize: 12,
                          color: '#0f172a',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        👉 {typeof act === 'string' ? act : act.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, padding: '0 4px' }}>
              {msg.time}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '12px 16px', borderRadius: 16, border: '1px solid #e2e8f0', width: 'fit-content' }}>
            <Loader2 className="spin" size={18} color="#16a34a" />
            <span style={{ fontSize: 13, color: '#64748b' }}>Checking sensors and agronomic rules...</span>
          </div>
        )}

        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 16px', borderRadius: 16, width: 'fit-content' }}>
            <span className="record-pulse" style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></span>
            <span style={{ fontSize: 13, fontWeight: '600', color: '#b91c1c' }}>
              Listening in {LANGUAGES.find(l => l.code === selectedLang)?.name}... ({recordingSeconds}s)
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 16px 10px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {(SUGGESTED_QUESTIONS[selectedLang] || SUGGESTED_QUESTIONS.en).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                padding: '8px 12px',
                borderRadius: 20,
                fontSize: 12,
                color: '#334155',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              💬 {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box with Voice & Send Controls */}
      <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <input
            type="text"
            placeholder={isRecording ? "Listening to your voice..." : `Ask in ${LANGUAGES.find(l => l.code === selectedLang)?.name || 'English'}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 24,
              border: isRecording ? '2px solid #ef4444' : '1px solid #cbd5e1',
              fontSize: 14,
              outline: 'none',
              background: isRecording ? '#fff5f5' : '#f8fafc'
            }}
          />

          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Stop recording" : "Speak voice message"}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: isRecording ? '#ef4444' : '#f1f5f9',
              color: isRecording ? '#fff' : '#475569',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isRecording ? '0 0 12px rgba(239, 68, 68, 0.5)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {isRecording ? <MicOff size={20} className="pulse" /> : <Mic size={20} />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: input.trim() && !loading ? '#16a34a' : '#cbd5e1',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              boxShadow: input.trim() && !loading ? '0 4px 12px rgba(22, 163, 74, 0.3)' : 'none'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <style>{`
        .spin {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .record-pulse {
          animation: pulse-red 1s infinite alternate;
        }
        @keyframes pulse-red {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.2); opacity: 1; }
        }
        .pulse {
          animation: pulse-icon 1s infinite alternate;
        }
        @keyframes pulse-icon {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

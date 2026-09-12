import React, { useState, useRef } from 'react'
import { Camera, Image as ImageIcon, Sparkles, Sun, Target, Loader2, AlertOctagon, RotateCcw, CheckCircle2 } from 'lucide-react'
import { analyzeCrop } from '../services/cropAnalysis'
import { useFarmSimulation } from '../simulation/SimulationContext'

export default function ScanScreen({ onAnalyze }) {
  const { farmState } = useFarmSimulation()
  const [loading, setLoading] = useState(false)
  const [rejection, setRejection] = useState(null)
  const [selectedPreview, setSelectedPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setSelectedPreview(previewUrl)
    setRejection(null)
    setLoading(true)

    try {
      // Pass the actual file plus environmental contextual data from simulation
      const result = await analyzeCrop(file, {
        soilMoisture: farmState.sensors.soil_moisture,
        temperature: farmState.sensors.temperature,
        humidity: farmState.sensors.humidity,
        rainProbability: farmState.weather.rain_probability
      })

      if (result.is_valid_crop === false) {
        // Stage 1 OOD rejection
        setRejection(result)
      } else {
        // Valid crop -> proceed to results with preview
        onAnalyze({ ...result, imagePreviewUrl: previewUrl })
      }
    } catch (error) {
      console.error("Failed to analyze crop:", error)
      alert("Failed to analyze crop. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setRejection(null)
    setSelectedPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="screen-header">
        <h1 style={{ flex: 1, textAlign: 'center' }}>Scan Crop</h1>
      </div>

      <div className="scan-screen">
        {/* Rejection State Modal / View */}
        {rejection ? (
          <div className="animate-in" style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #fee2e2',
            padding: 24,
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)',
            marginBottom: 20
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertOctagon size={36} />
            </div>

            <h2 style={{ fontSize: 20, color: '#991b1b', margin: '0 0 8px', fontWeight: '700' }}>
              {rejection.title || "Image Not Suitable"}
            </h2>

            <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.5, margin: '0 0 16px' }}>
              {rejection.message}
            </p>

            {rejection.detected_category && (
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 13,
                color: '#374151',
                marginBottom: 18,
                textAlign: 'left'
              }}>
                <span style={{ fontWeight: '600', color: '#111827' }}>Detected pattern: </span>
                <span style={{ textTransform: 'capitalize' }}>{rejection.detected_category}</span>
              </div>
            )}

            {rejection.guidance && (
              <div style={{
                textAlign: 'left',
                background: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: 12,
                padding: 14,
                marginBottom: 20
              }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#854d0e', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Recommended Guidance:
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, color: '#713f12', fontSize: 13, lineHeight: 1.6 }}>
                  {rejection.guidance.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleReset}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
              }}
            >
              <RotateCcw size={18} />
              Try Again with Tomato Leaf
            </button>
          </div>
        ) : (
          <>
            {/* Viewfinder */}
            <div className="scan-viewfinder animate-in">
              <div style={{
                width: '100%',
                height: '100%',
                background: selectedPreview ? '#000' : 'linear-gradient(135deg, #2d5a27 0%, #4a8c3f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {selectedPreview ? (
                  <img
                    src={selectedPreview}
                    alt="Selected leaf"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  /* Simulated leaf image */
                  <div style={{
                    width: '70%',
                    height: '70%',
                    background: 'linear-gradient(145deg, #5ca04e 0%, #3d7a32 40%, #2d6625 80%)',
                    borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
                    position: 'relative',
                    opacity: 0.9
                  }}>
                    {/* Leaf veins */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '10%',
                      right: '10%',
                      height: 2,
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: 2
                    }}></div>
                    {/* Disease spots */}
                    <div style={{ position: 'absolute', top: '30%', left: '40%', width: 16, height: 16, background: '#8B6914', borderRadius: '50%', opacity: 0.7 }}></div>
                    <div style={{ position: 'absolute', top: '55%', left: '55%', width: 12, height: 12, background: '#8B6914', borderRadius: '50%', opacity: 0.6 }}></div>
                    <div style={{ position: 'absolute', top: '40%', left: '65%', width: 10, height: 10, background: '#8B6914', borderRadius: '50%', opacity: 0.5 }}></div>
                  </div>
                )}

                {loading && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    zIndex: 10
                  }}>
                    <Loader2 className="spin" size={48} style={{ marginBottom: 16, color: '#4ade80' }} />
                    <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Validating & Analyzing...</h3>
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Stage 1: Crop Validator ➔ Stage 2: Disease ViT</p>
                  </div>
                )}
              </div>
              <div className="scan-corners"></div>
              <div className="scan-corners-bottom"></div>
            </div>

            {/* Instructions */}
            <div className="scan-instructions animate-in" style={{ animationDelay: '0.1s' }}>
              <h3>Take a clear photo of the tomato leaf</h3>
              <div className="scan-tip">
                <Sun />
                <span>Ensure good natural lighting</span>
              </div>
              <div className="scan-tip">
                <Target />
                <span>Focus on a single leaf & affected area</span>
              </div>
              <div className="scan-tip">
                <Sparkles />
                <span>Keep camera steady (avoid blur/shadows)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="scan-actions animate-in" style={{ animationDelay: '0.2s' }}>
              <button className="btn-capture" onClick={handleUploadClick} disabled={loading}>
                <Camera />
                Capture Photo
              </button>
              <button className="btn-upload" onClick={handleUploadClick} disabled={loading}>
                <ImageIcon />
                Upload from Gallery
              </button>
            </div>
          </>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <style>{`
        .spin {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'

type AnimationType = 'zoom-in' | 'zoom-out' | 'pan-right' | 'pan-left' | 'rotate' | 'fade' | 'slide-up' | 'slide-down'

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [animation, setAnimation] = useState<AnimationType>('zoom-in')
  const [duration, setDuration] = useState(3)
  const [generating, setGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setVideoUrl(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateVideo = async () => {
    if (!image || !canvasRef.current) return

    setGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = image

    img.onload = async () => {
      canvas.width = 1920
      canvas.height = 1080

      const fps = 30
      const totalFrames = duration * fps
      const stream = canvas.captureStream(fps)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      })

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        setGenerating(false)
      }

      mediaRecorder.start()

      for (let frame = 0; frame <= totalFrames; frame++) {
        const progress = frame / totalFrames

        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.save()

        const imgAspect = img.width / img.height
        const canvasAspect = canvas.width / canvas.height
        let drawWidth = canvas.width
        let drawHeight = canvas.height

        if (imgAspect > canvasAspect) {
          drawHeight = canvas.width / imgAspect
        } else {
          drawWidth = canvas.height * imgAspect
        }

        const x = (canvas.width - drawWidth) / 2
        const y = (canvas.height - drawHeight) / 2

        ctx.translate(canvas.width / 2, canvas.height / 2)

        switch (animation) {
          case 'zoom-in':
            const zoomIn = 1 + progress * 0.5
            ctx.scale(zoomIn, zoomIn)
            break
          case 'zoom-out':
            const zoomOut = 1.5 - progress * 0.5
            ctx.scale(zoomOut, zoomOut)
            break
          case 'pan-right':
            ctx.translate(-drawWidth * 0.2 + progress * drawWidth * 0.4, 0)
            break
          case 'pan-left':
            ctx.translate(drawWidth * 0.2 - progress * drawWidth * 0.4, 0)
            break
          case 'rotate':
            ctx.rotate(progress * Math.PI * 2)
            break
          case 'fade':
            ctx.globalAlpha = progress
            break
          case 'slide-up':
            ctx.translate(0, drawHeight * 0.3 - progress * drawHeight * 0.6)
            break
          case 'slide-down':
            ctx.translate(0, -drawHeight * 0.3 + progress * drawHeight * 0.6)
            break
        }

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
        ctx.restore()

        await new Promise(resolve => setTimeout(resolve, 1000 / fps))
      }

      mediaRecorder.stop()
    }
  }

  const downloadVideo = () => {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `animated-video-${Date.now()}.webm`
    a.click()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '3rem',
          textAlign: 'center',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🎬 Free Image to Video Generator
        </h1>
        <p style={{
          textAlign: 'center',
          fontSize: '1.2rem',
          marginBottom: '3rem',
          opacity: 0.9
        }}>
          Create unlimited animated videos from your images
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '2px dashed rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Animation Effect
            </label>
            <select
              value={animation}
              onChange={(e) => setAnimation(e.target.value as AnimationType)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="zoom-in" style={{ color: '#000' }}>Zoom In</option>
              <option value="zoom-out" style={{ color: '#000' }}>Zoom Out</option>
              <option value="pan-right" style={{ color: '#000' }}>Pan Right</option>
              <option value="pan-left" style={{ color: '#000' }}>Pan Left</option>
              <option value="rotate" style={{ color: '#000' }}>Rotate</option>
              <option value="fade" style={{ color: '#000' }}>Fade In</option>
              <option value="slide-up" style={{ color: '#000' }}>Slide Up</option>
              <option value="slide-down" style={{ color: '#000' }}>Slide Down</option>
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Duration: {duration} seconds
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '5px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <button
            onClick={generateVideo}
            disabled={!image || generating}
            style={{
              width: '100%',
              padding: '1.2rem',
              borderRadius: '10px',
              border: 'none',
              background: image && !generating
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: image && !generating ? 'pointer' : 'not-allowed',
              transition: 'transform 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              if (image && !generating) {
                e.currentTarget.style.transform = 'scale(1.02)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {generating ? '🎬 Generating Video...' : '✨ Generate Video'}
          </button>
        </div>

        {image && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Preview</h2>
            <img
              src={image}
              alt="Uploaded"
              style={{
                width: '100%',
                borderRadius: '10px',
                maxHeight: '400px',
                objectFit: 'contain',
                background: '#000'
              }}
            />
          </div>
        )}

        {videoUrl && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem'
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Generated Video</h2>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              loop
              style={{
                width: '100%',
                borderRadius: '10px',
                marginBottom: '1rem',
                background: '#000'
              }}
            />
            <button
              onClick={downloadVideo}
              style={{
                width: '100%',
                padding: '1.2rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              ⬇️ Download Video
            </button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
          opacity: 0.8,
          fontSize: '0.9rem'
        }}>
          <p>✨ Unlimited generations • No sign-up required • 100% free</p>
        </div>
      </div>
    </div>
  )
}

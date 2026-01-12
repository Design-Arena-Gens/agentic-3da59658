import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Image to Video Generator',
  description: 'Convert your images to videos with unlimited effects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}

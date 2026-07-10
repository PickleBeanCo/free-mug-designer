import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f4f4f9' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

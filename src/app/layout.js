import './globals.css'

export const metadata = {
  title: 'Habit Tracker Pro',
  description: 'Track your habits with calendar and streaks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
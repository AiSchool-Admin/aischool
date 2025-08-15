import './globals.css'

export const metadata = {
  title: 'AiSchool - منصة التعليم الذكي',
  description: 'منصة تعليمية ذكية تستخدم الذكاء الاصطناعي',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  )
}
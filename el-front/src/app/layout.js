import './globals.css'; // <- ESTA LÍNEA ES CLAVE

export const metadata = {
  title: 'Easy Lead',
  description: 'MVP Académico',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
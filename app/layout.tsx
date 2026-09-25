import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f7f4ee',
};

export const metadata: Metadata = {
  title: 'CorpServices - Gestão de Ordens de Serviço, Chamados e Suprimentos',
  description: 'Plataforma corporativa de gestão de ordens de serviço (OS), triagem inteligente com IA, solicitações de compra e estoque, auditoria, assinaturas digitais e relatórios gerenciais em tempo real.',
  openGraph: {
    title: 'CorpServices - Gestão de Ordens de Serviço, Chamados e Suprimentos',
    description: 'Plataforma corporativa de gestão de ordens de serviço (OS), triagem inteligente com IA, solicitações de compra e estoque, auditoria, assinaturas digitais e relatórios gerenciais em tempo real.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CorpServices - Gestão de Ordens de Serviço, Chamados e Suprimentos',
    description: 'Plataforma corporativa de gestão de ordens de serviço (OS), triagem inteligente com IA, solicitações de compra e estoque, auditoria, assinaturas digitais e relatórios gerenciais em tempo real.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

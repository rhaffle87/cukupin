import React from 'react'
import Link from 'next/link'
import { Brand } from '@/components/ui/Brand'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Brand />
        <nav>
          <Link href="/auth/login" className="button secondary small">Masuk</Link>
          <Link href="/auth/login" className="button primary small">Daftar</Link>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <p className="eyebrow">PERSONAL FINANCE, SIMPLIFIED</p>
          <h1>Yang penting bukan banyaknya.<br /><em>Yang penting cukup.</em></h1>
          <p className="hero-subtitle">
            Cukupin membantu kamu melihat arus uang dengan lebih jernih, 
            satu bulan demi satu bulan, tanpa rasa bersalah.
          </p>
          <div className="cta-group">
            <Link href="/auth/login" className="button primary large">Mulai ruang uangmu — Gratis</Link>
          </div>
          <p className="social-proof">
            <span className="avatars">
              <span className="avatar">R</span>
              <span className="avatar">S</span>
              <span className="avatar">A</span>
            </span>
            Bergabunglah dengan <strong>ratusan pengguna</strong> lainnya yang telah beralih ke pencatatan yang menenangkan.
          </p>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-links">
          <Link href="/privacy">Kebijakan Privasi</Link>
          <span>&middot;</span>
          <Link href="#">Syarat & Ketentuan</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} cukupin. All rights reserved.</p>
      </footer>

      {/* Basic styling for the landing page */}
      <style dangerouslySetInnerHTML={{ __html: `
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--paper);
          color: var(--ink);
        }
        .landing-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .landing-header nav {
          display: flex;
          gap: 12px;
        }
        .hero-section {
          max-width: 800px;
          margin: 120px auto;
          padding: 0 24px;
          text-align: center;
        }
        .hero-section h1 {
          font-size: 3rem;
          line-height: 1.1;
          letter-spacing: -0.04em;
          margin: 24px 0;
        }
        .hero-section em {
          color: var(--green);
          font-style: italic;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--muted);
          max-width: 500px;
          margin: 0 auto 40px;
          line-height: 1.5;
        }
        .cta-group {
          margin-bottom: 48px;
        }
        .social-proof {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 0.9rem;
          color: var(--muted);
        }
        .avatars {
          display: flex;
        }
        .avatars .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--card);
          border: 2px solid var(--paper);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          margin-left: -12px;
        }
        .avatars .avatar:first-child {
          margin-left: 0;
          background: var(--green);
          color: white;
        }
        .avatars .avatar:nth-child(2) {
          background: var(--blue);
          color: white;
        }
        .landing-footer {
          margin-top: auto;
          padding: 40px 24px;
          text-align: center;
          font-size: 0.85rem;
          color: var(--muted);
        }
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;
        }
        .footer-links a {
          color: var(--ink);
          text-decoration: none;
        }
        .footer-links a:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .hero-section {
            margin: 60px auto;
          }
          .hero-section h1 {
            font-size: 2.2rem;
          }
          .social-proof {
            flex-direction: column;
          }
        }
      `}} />
    </div>
  )
}

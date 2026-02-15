import Link from 'next/link';
import { Eye, Sparkles, Zap, Shield } from 'lucide-react';
import AuroraBackground from '@/components/ui/AuroraBackground';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-deep overflow-hidden">
      <AuroraBackground />

      {/* Header */}
      <header className="relative z-10 nfv-glass-strong border-b border-frost-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-nfv-aurora">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl nfv-text-aurora">
              NutriFitVision
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">
              Recursos
            </a>
            <a href="#pricing" className="text-text-secondary hover:text-text-primary transition-colors">
              Planos
            </a>
            <Link
              href="/login"
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 rounded-lg bg-nfv-aurora text-white font-medium hover:shadow-nfv transition-all"
            >
              Começar Grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full nfv-glass border border-frost-border mb-6 animate-nfv-fade-up">
            <Sparkles className="w-4 h-4 text-aurora-cyan" />
            <span className="text-sm font-medium text-text-secondary">
              Análise Nutricional com IA
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-heading font-bold mb-6 animate-nfv-fade-up">
            Transforme a{' '}
            <span className="nfv-text-aurora">Análise Nutricional</span>
            {' '}com Visão Computacional
          </h1>

          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto animate-nfv-fade-up">
            Avaliações precisas e automáticas usando inteligência artificial e visão computacional.
            Economize tempo e ofereça resultados profissionais aos seus clientes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-nfv-fade-up">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-nfv-aurora text-white font-semibold text-lg hover:shadow-nfv transition-all animate-nfv-glow-pulse"
            >
              Começar Grátis
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl nfv-glass border border-frost-border text-text-primary font-semibold text-lg hover:border-aurora-cyan transition-all"
            >
              Conheça os Recursos
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-heading font-bold text-center mb-12">
            Recursos <span className="nfv-text-aurora">Poderosos</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="nfv-glass rounded-2xl p-8 border border-frost-border hover:border-aurora-cyan transition-all">
              <div className="w-12 h-12 rounded-xl bg-aurora-cyan/10 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-aurora-cyan" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Visão Computacional</h3>
              <p className="text-text-secondary">
                Análise automática de postura e biomecânica usando IA de última geração.
              </p>
            </div>

            <div className="nfv-glass rounded-2xl p-8 border border-frost-border hover:border-aurora-blue transition-all">
              <div className="w-12 h-12 rounded-xl bg-aurora-blue/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-aurora-blue" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Resultados Instantâneos</h3>
              <p className="text-text-secondary">
                Relatórios completos gerados em segundos, prontos para compartilhar.
              </p>
            </div>

            <div className="nfv-glass rounded-2xl p-8 border border-frost-border hover:border-aurora-purple transition-all">
              <div className="w-12 h-12 rounded-xl bg-aurora-purple/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-aurora-purple" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">100% Seguro</h3>
              <p className="text-text-secondary">
                Dados criptografados e armazenados com segurança máxima. LGPD compliant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto nfv-glass rounded-3xl p-12 text-center border border-frost-border">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Pronto para <span className="nfv-text-aurora">Começar?</span>
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Junte-se a centenas de profissionais que já usam NutriFitVision
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 rounded-xl bg-nfv-aurora text-white font-semibold text-lg hover:shadow-nfv transition-all"
          >
            Criar Conta Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-frost-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-aurora-cyan" />
              <span className="font-heading font-bold nfv-text-aurora">
                NutriFitVision
              </span>
            </div>
            <p className="text-sm text-text-muted">
              © 2026 NutriFitVision. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

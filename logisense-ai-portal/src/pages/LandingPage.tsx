import { Link } from 'react-router-dom';
import { features } from '@/lib/mockData';
import {
  AlertTriangle, GitBranch, Truck, Warehouse, Shield, UserCheck,
  Clock, Brain, Link as LinkIcon, TrendingUp, Globe, ShieldAlert,
  Package, ArrowRight
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle, GitBranch, Truck, Warehouse, Shield, UserCheck,
  Clock, Brain, Link: LinkIcon, TrendingUp, Globe, ShieldAlert, Package,
};

const stats = [
  '1,000 Active Shipments',
  '47 SLA Breaches Prevented Today',
  '2.4 tonnes CO₂ Saved',
  '100% Decisions On-Chain',
];

const agentFlow = [
  { name: 'Observer', role: 'Detect anomalies' },
  { name: 'Reasoner', role: 'Evaluate risk & options' },
  { name: 'Red Team', role: 'Stress test decisions' },
  { name: 'Actor', role: 'Execute interventions' },
  { name: 'Learner', role: 'Retrain & improve' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">LogiSense AI</span>
          </div>
          <Link to="/dashboard" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <h1 className="text-5xl font-semibold text-foreground leading-[1.1] tracking-tight text-balance">
          Observe. Reason.<br />Act. Learn.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
          The first agentic AI system for autonomous logistics — 13 features, 5 agent types, full on-chain audit.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Open Dashboard
          </Link>
          <button className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors">
            View Docs
          </button>
        </div>

        {/* Stat bar */}
        <div className="mt-12 flex flex-wrap gap-6 border-t border-border pt-6">
          {stats.map((stat) => (
            <span key={stat} className="text-[13px] text-muted-foreground tabular-nums">
              {stat}
            </span>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-semibold text-foreground mb-6">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = iconMap[f.icon] || Package;
            return (
              <div
                key={f.id}
                className="border border-border bg-card rounded-lg p-4 hover:border-muted-foreground/30 hover:shadow-card transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground">{f.id} {f.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{f.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Agent Architecture */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-semibold text-foreground mb-6">Agent Architecture</h2>
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {agentFlow.map((agent, i) => (
            <div key={agent.name} className="flex items-center gap-2">
              <div className="border border-border bg-card rounded-lg px-5 py-3 text-center hover:border-muted-foreground/30 transition-colors">
                <div className="text-[13px] font-medium text-foreground">{agent.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{agent.role}</div>
              </div>
              {i < agentFlow.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-[12px] text-muted-foreground">
            Cyber Cypher 5.0 · Advanced Track · Built with Claude Sonnet 4, LangGraph, Polygon, React
          </p>
        </div>
      </footer>
    </div>
  );
}

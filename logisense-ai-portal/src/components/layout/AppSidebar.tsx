import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, GitBranch, Truck, Warehouse as WarehouseIcon,
  UserCheck, Brain, Link as LinkIcon, TrendingUp, Globe, ShieldAlert,
  Boxes, Settings, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';
import { useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';

const navSections = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/shipments', label: 'Shipments', icon: Package },
      { path: '/cascade', label: 'Cascade Tree', icon: GitBranch },
      { path: '/carriers', label: 'Carriers', icon: Truck },
      { path: '/warehouses', label: 'Warehouses', icon: WarehouseIcon },
      { path: '/inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/decisions', label: 'Decisions', icon: UserCheck, badge: true },
      { path: '/explainability', label: 'XAI Engine', icon: Brain },
      { path: '/learning', label: 'Learning', icon: TrendingUp },
      { path: '/risk', label: 'Risk Intel', icon: Globe },
      { path: '/rto', label: 'RTO & Fraud', icon: ShieldAlert, rtoBadge: true },
    ],
  },
  {
    label: 'Trust',
    items: [
      { path: '/blockchain', label: 'Blockchain', icon: LinkIcon },
    ],
  },
  {
    label: 'Config',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pendingApprovals = useGlobalStore((s) => s.pendingApprovals);

  return (
    <aside
      className={`flex flex-col border-r border-border bg-surface transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'} min-h-screen shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground leading-tight">LogiSense AI</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Agentic Logistics</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <div className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 mx-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.badge && pendingApprovals > 0 && (
                        <span className="ml-auto text-[10px] bg-warning/15 text-warning px-1.5 py-0.5 rounded-full font-medium">
                          {pendingApprovals}
                        </span>
                      )}
                      {item.rtoBadge && (
                        <span className="ml-auto text-[10px] bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full font-medium">
                          2
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}

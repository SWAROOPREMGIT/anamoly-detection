import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Scan,
  Radio,
  Bell,
  BarChart3,
  Camera,
  Shield,
  Activity,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    path: '/detection',
    label: 'AI Detection',
    icon: Scan,
    badge: 'Neural',
  },
  {
    path: '/monitoring',
    label: 'Live Surveillance',
    icon: Radio,
    badge: 'Live',
  },
  {
    path: '/alerts',
    label: 'Security Alerts',
    icon: Bell,
    badge: null,
  },
  {
    path: '/analytics',
    label: 'Deep Analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    path: '/cameras',
    label: 'Camera Fleet',
    icon: Camera,
    badge: null,
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-2xl flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-white/[0.06] justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400" />
            </div>

            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-white font-mono text-base">
                    ANOMALY<span className="text-cyan-400">GUARD</span>
                  </span>
                </div>
                <span className="text-[10px] tracking-widest uppercase font-mono text-zinc-400">
                  Neural Defense v2.4
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-6 space-y-1.5">
          <div className="px-3 pb-2">
            {!collapsed ? (
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold">
                Core Systems
              </span>
            ) : (
              <div className="w-4 h-0.5 bg-zinc-800 mx-auto rounded-full" />
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-zinc-400'
                        }`}
                      />
                    </div>

                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1 overflow-hidden">
                        <span className="truncate tracking-wide">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border ${
                              item.badge === 'Live'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-white/[0.06] space-y-3">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Inference Engine
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                ACTIVE
              </span>
            </div>
            <div className="w-full bg-zinc-800/60 rounded-full h-1 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1 rounded-full"
                animate={{ width: ['40%', '85%', '60%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full py-2 flex items-center justify-center rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.04] transition-colors"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-300 ${
              collapsed ? 'rotate-0' : 'rotate-180'
            }`}
          />
        </button>
      </div>
    </aside>
  );
}

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, prefix = '', suffix = '', trend, color, delay = 0 }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-xl p-6 hover:shadow-xl transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg shadow-${color.split(' ')[2]}/30 relative group-hover:scale-110 transition-transform duration-300`}>
          <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm opacity-50"></div>
          <Icon size={26} className="text-white relative z-10" />
        </div>
        {trend && (
          <span
            className={`text-sm font-medium ${trend.isPositive ? 'text-accent-green' : 'text-accent-red'
              }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>

      <h3 className="text-2xl font-bold text-gray-100 mb-1">
        {prefix}{displayValue.toLocaleString()}{suffix}
      </h3>
      <p className="text-sm text-gray-400">{title}</p>
    </motion.div>
  );
}

"use client"

import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsData {
  name: string
  value: number
  trend?: 'up' | 'down' | 'stable'
}

interface AnalyticsBarProps {
  data: AnalyticsData[]
  title?: string
  description?: string
  color?: string
}

export function AnalyticsBar({ 
  data, 
  title = "Analytics Overview", 
  description = "Performance metrics comparison",
  color = "#8884d8"
}: AnalyticsBarProps) {
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      default:
        return '➡️'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  stroke="#888888"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="text-xs"
                  stroke="#888888"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Count']}
                />
                <Bar 
                  dataKey="value" 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  radius={[8, 8, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={color}
                      fillOpacity={0.8 + (index * 0.05)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                className="text-center p-2 rounded-lg bg-secondary/50"
              >
                <div className="text-lg">{getTrendIcon(item.trend)}</div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.value.toLocaleString()}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

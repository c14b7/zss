"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface BudgetTransaction {
  $id: string
  title: string
  amount: number
  category: string
  type: "income" | "expense"
  date: string
  description?: string
  $createdAt: string
  $updatedAt: string
}

interface BudgetCategoryChartProps {
  transactions: BudgetTransaction[]
  type: "income" | "expense"
}

interface CategoryData {
  name: string
  value: number
  percentage: number
  color: string
}

// Kolory dla wydatków (czerwone odcienie)
const EXPENSE_COLORS = [
  "#dc2626", // Red-600
  "#b91c1c", // Red-700
  "#991b1b", // Red-800
  "#7f1d1d", // Red-900
  "#fca5a5", // Red-300
  "#f87171", // Red-400
  "#ef4444", // Red-500
  "#fee2e2", // Red-100
  "#fecaca", // Red-200
  "#450a0a", // Red-950
]

// Kolory dla przychodów (zielone odcienie)
const INCOME_COLORS = [
  "#16a34a", // Green-600
  "#15803d", // Green-700
  "#166534", // Green-800
  "#14532d", // Green-900
  "#86efac", // Green-300
  "#4ade80", // Green-400
  "#22c55e", // Green-500
  "#dcfce7", // Green-100
  "#bbf7d0", // Green-200
  "#052e16", // Green-950
]

export function BudgetCategoryChart({ transactions, type }: BudgetCategoryChartProps) {
  const { chartData, totalAmount } = useMemo(() => {
    // Grupowanie transakcji według kategorii
    const categoryTotals = new Map<string, number>()
    
    transactions.forEach(transaction => {
      const currentTotal = categoryTotals.get(transaction.category) || 0
      categoryTotals.set(transaction.category, currentTotal + transaction.amount)
    })
    
    const total = Array.from(categoryTotals.values()).reduce((sum, value) => sum + value, 0)
    
    // Konwersja do formatu wykresu
    const colors = type === "income" ? INCOME_COLORS : EXPENSE_COLORS
    const chartDataArray: CategoryData[] = Array.from(categoryTotals.entries())
      .map(([category, amount], index) => ({
        name: category,
        value: amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value) // Sortowanie od największej do najmniejszej
    
    return {
      chartData: chartDataArray,
      totalAmount: total
    }
  }, [transactions, type])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryData
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">
            {data.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Kwota: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Udział: {data.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ name, percentage }: { name: string; percentage: number }) => {
    if (percentage < 5) return null // Nie pokazuj etykiet dla małych segmentów
    return `${percentage.toFixed(0)}%`
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Brak danych</p>
          <p className="text-sm">
            Brak {type === "income" ? "przychodów" : "wydatków"} do wyświetlenia
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Wykres kołowy */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Lista kategorii */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            Szczegóły kategorii
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Łącznie: {formatCurrency(totalAmount)}
          </p>
        </div>
        
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {chartData.map((item, index) => (
            <div 
              key={item.name}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(item.value)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

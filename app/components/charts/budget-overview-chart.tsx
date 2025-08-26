"use client"

import { useMemo } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

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

interface BudgetOverviewChartProps {
  transactions: BudgetTransaction[]
}

interface ChartDataItem {
  month: string
  monthName: string
  income: number
  expenses: number
  balance: number
}

export function BudgetOverviewChart({ transactions }: BudgetOverviewChartProps) {
  const chartData = useMemo(() => {
    // Grupowanie transakcji według miesięcy
    const monthlyData = new Map<string, { income: number; expenses: number }>()
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0 })
      }
      
      const monthData = monthlyData.get(monthKey)!
      
      if (transaction.type === "income") {
        monthData.income += transaction.amount
      } else {
        monthData.expenses += transaction.amount
      }
    })
    
    // Konwersja do formatu wykresu
    const chartDataArray: ChartDataItem[] = []
    const sortedMonths = Array.from(monthlyData.keys()).sort()
    
    // Zapewnienie że mamy dane dla ostatnich 6 miesięcy
    const currentDate = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const monthData = monthlyData.get(monthKey) || { income: 0, expenses: 0 }
      
      chartDataArray.push({
        month: monthKey,
        monthName: date.toLocaleDateString("pl-PL", { month: "short", year: "2-digit" }),
        income: monthData.income,
        expenses: monthData.expenses,
        balance: monthData.income - monthData.expenses
      })
    }
    
    return chartDataArray
  }, [transactions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Brak danych do wyświetlenia</p>
          <p className="text-sm">Dodaj transakcje, aby zobaczyć wykres</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-slate-200 dark:stroke-slate-700" 
          />
          <XAxis 
            dataKey="monthName"
            className="fill-slate-600 dark:fill-slate-400"
            fontSize={12}
          />
          <YAxis 
            className="fill-slate-600 dark:fill-slate-400"
            fontSize={12}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#16a34a", strokeWidth: 2, fill: "#16a34a" }}
            name="Przychody"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#dc2626", strokeWidth: 2, fill: "#dc2626" }}
            name="Wydatki"
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#2563eb"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#2563eb", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: "#2563eb", strokeWidth: 2, fill: "#2563eb" }}
            name="Saldo"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

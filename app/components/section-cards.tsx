import { IconTrendingDown, IconTrendingUp, IconUsers, IconBuildingCommunity, IconFileText, IconCurrencyDollar } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type DashboardStats } from "@/lib/appwrite"

interface SectionCardsProps {
  stats: DashboardStats | null;
}

export function SectionCards({ stats }: SectionCardsProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} mln zł`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)} tys. zł`;
    }
    return `${amount} zł`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pl-PL').format(num);
  };

  if (!stats) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <CardDescription>Ładowanie...</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                ---
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Budżet</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.budget.total)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +8.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            ok <IconCurrencyDollar className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Wykonanie budżetu: {stats.budget.percentage}%
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sprawy klasowe</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.cases.total)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.cases.change >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.cases.change >= 0 ? '+' : ''}{stats.cases.change}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Obsłużone w tym miesiącu <IconFileText className="size-4" />
          </div>
          <div className="text-muted-foreground">Średni czas: {stats.cases.avgTime} dni</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Inwestycje</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.projects.active}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{stats.projects.growth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Aktywne projekty <IconBuildingCommunity className="size-4" />
          </div>
          <div className="text-muted-foreground">Wartość: {formatCurrency(stats.projects.totalValue)}</div>
        </CardFooter>
      </Card>
    </div>
  )
}

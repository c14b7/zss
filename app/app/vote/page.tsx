import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import voteData from "./data.json"

export default function CardDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{voteData.title}</CardTitle>
          <CardDescription>{voteData.description}</CardDescription>
          <CardAction>{voteData.category}</CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {voteData.options.map((option) => (
            <AlertDialog key={option.value}>
              <AlertDialogTrigger asChild>
                <Button variant={option.variant as any} className="w-full">
                  {option.label} ({option.value > 0 ? '+' : ''}{option.value})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Potwierdzenie głosu</AlertDialogTitle>
                  <AlertDialogDescription>
                    {option.description} - głos: {option.value > 0 ? '+' : ''}{option.value}
                    <br />
                    <br />
                    Tej akcji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction>
                    Potwierdź głos: {option.label}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </CardContent>
        <CardFooter>
          <div className="w-full text-sm text-muted-foreground">
            <p>Całkowita liczba głosów: {voteData.totalVotes}</p>
            <p className="mt-1">
              Za: {voteData.results["1"]} | 
              Przeciw: {voteData.results["-1"]} | 
              Wstrzymało się: {voteData.results["0"]}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

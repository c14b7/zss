"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const text_1 = "NEURAL.CORE"

export default function Page() {
    return(
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <CardTitle className="text-3xl font-bold text-primary">
                        {text_1}
                    </CardTitle>
                    <div className="h-px w-20 bg-border mx-auto"></div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Moduł jest jeszcze w fazie rozwoju
                    </p>
                    
                    <div className="relative">
                        <p className="text-lg font-mono">
                            Szykuje się coś{" "}
                            <span className="glitch-text text-destructive font-bold">
                                [CLASSIFIED]
                            </span>
                        </p>
                    </div>
                    
                    <div className="flex justify-center space-x-1 pt-4">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
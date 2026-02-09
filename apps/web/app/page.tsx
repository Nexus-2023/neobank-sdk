"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DocHeader,
  DocFooter,
  CoreTab,
  ReactTab,
  ArchitectureTab,
} from "./_components"

export default function SDKDocumentation() {
  return (
    <div className="min-h-screen bg-background">
      <DocHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="core">
          <TabsList className="mb-8">
            <TabsTrigger value="core">Core SDK</TabsTrigger>
            <TabsTrigger value="react">React Hooks</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="core">
            <CoreTab />
          </TabsContent>
          <TabsContent value="react">
            <ReactTab />
          </TabsContent>
          <TabsContent value="architecture">
            <ArchitectureTab />
          </TabsContent>
        </Tabs>
      </main>

      <DocFooter />
    </div>
  )
}

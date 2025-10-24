import { SidebarLayout } from "@/components/sidebar-layout"

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SidebarLayout>{children}</SidebarLayout>
}
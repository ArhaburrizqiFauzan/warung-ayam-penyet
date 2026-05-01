import { Home, ShoppingCart, CreditCard, Package, FileText, SquarePen, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const collapsed = state === 'collapsed';

  const ownerItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Pemesanan", url: "/pemesanan", icon: ShoppingCart },
    { title: "Pembayaran", url: "/pembayaran", icon: CreditCard },
    { title: "Stok", url: "/stok", icon: Package },
    { title: "Laporan", url: "/laporan", icon: FileText },
    { title: "Edit Menu", url: "/pengaturan", icon: SquarePen },
  ];

  const cashierItems = [
    { title: "Pemesanan", url: "/pemesanan", icon: ShoppingCart },
    { title: "Pembayaran", url: "/pembayaran", icon: CreditCard },
  ];

  // Fix: role dari BE adalah 'pemilik', bukan 'owner'
  const items = user?.role === 'pemilik' ? ownerItems : cashierItems;

  return (
    <Sidebar
      className="transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? '4.5rem' : '12rem',
        transitionProperty: 'width',
        transitionDuration: '300ms',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <img
              src="/warung-ayam-geprek.png"
              alt="Logo"
              className="w-10 h-10 object-contain rounded-lg"
            />
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h2 className="font-bold text-foreground whitespace-nowrap">Warung Ayam</h2>
            <p className="text-xs text-muted-foreground whitespace-nowrap">Sistem Kasir</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className={`transition-all duration-300 overflow-hidden ${collapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
            <SidebarGroupLabel className="text-muted-foreground">
              Menu Utama
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-primary text-primary-foreground font-medium"
                    >
                      <item.icon className="shrink-0 h-5 w-5" />
                      <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className={`transition-all duration-300 overflow-hidden ${collapsed ? 'h-0 opacity-0 mb-0' : 'h-auto opacity-100 mb-3'}`}>
          {user && (
            <div>
              <p className="text-sm font-medium text-foreground whitespace-nowrap">{user.name}</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {user.role === 'pemilik' ? 'Pemilik' : 'Kasir'}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={logout}
        >
          <LogOut className="shrink-0 h-4 w-4" />
          <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            Keluar
          </span>
        </Button>
        <SidebarTrigger className="w-full mt-2" />
      </SidebarFooter>
    </Sidebar>
  );
}
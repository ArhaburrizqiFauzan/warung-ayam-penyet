import { Home, ShoppingCart, CreditCard, Package, FileText, Settings, LogOut } from "lucide-react";
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
    { title: "Pengaturan", url: "/pengaturan", icon: Settings },
  ];

  const cashierItems = [
    { title: "Pemesanan", url: "/pemesanan", icon: ShoppingCart },
    { title: "Pembayaran", url: "/pembayaran", icon: CreditCard },
  ];

  const items = user?.role === 'owner' ? ownerItems : cashierItems;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              <img
                src="/warung-ayam-geprek.png"
                alt="Logo Warung Ayam Penyet"
                className="w-10 h-10 object-contain rounded-lg"
              />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Warung Ayam</h2>
              <p className="text-xs text-muted-foreground">Sistem Kasir</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto">
            <img
              src="/warung-ayam-geprek.png"
              alt="Logo Warung Ayam Penyet"
              className="w-10 h-10 object-contain rounded-lg"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-muted-foreground">
              Menu Utama
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-primary text-primary-foreground font-medium"
                    >
                      <item.icon className={collapsed ? "mx-auto" : "mr-2 h-5 w-5"} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {!collapsed && user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {user.role === 'owner' ? 'Pemilik' : 'Kasir'}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className={collapsed ? "mx-auto" : "mr-2 h-4 w-4"} />
          {!collapsed && <span>Keluar</span>}
        </Button>
        <SidebarTrigger className="w-full mt-2" />
      </SidebarFooter>
    </Sidebar>
  );
}

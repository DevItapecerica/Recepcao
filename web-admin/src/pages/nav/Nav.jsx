import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { useThemeContext } from "@/context/theme/ThemeContext";
import { useAuth } from "@/context/auth/AuthContext";
import { useProfile } from "@/context/profile/ProfileContext";

const adminItems = [
  ["Dashboard", "/Admin", ["user", "recepcionist", "admin", "superadmin"]], ["Visitantes", "/Admin/Visitors", ["user", "recepcionist", "admin", "superadmin"]],
  ["Usuários", "/Admin/Users", ["admin", "superadmin"]], ["Visitas", "/Admin/Visits", ["user", "recepcionist", "admin", "superadmin"]],
  ["Configurações", "/Admin/Configurations", ["user", "recepcionist", "admin", "superadmin"]],
];
const linkClass = ({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-surface-muted text-primary" : "text-muted hover:bg-surface-muted hover:text-font-primary"}`;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { isAuth } = useAuth();
  const { user, image } = useProfile();
  const { toggleTheme } = useThemeContext();
  const items = isAuth ? adminItems.filter(([, , roles]) => roles.includes(user?.role)) : [["Entrar", "/"], ["Termos", "/Terms"], ["Privacidade", "/Privacity"]];
  const links = items.map(([name, path]) => <NavLink key={path} to={path} end={path === "/Admin" || path === "/"} className={linkClass} onClick={() => setOpen(false)}>{name}</NavLink>);

  return <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
      <NavLink to={isAuth ? "/Admin" : "/"} className="flex shrink-0 items-center gap-3"><img src="/Brasao.png" alt="Brasão municipal" className="h-9 w-auto" /><div className="hidden leading-tight sm:block"><strong className="block text-sm">Recepção</strong><span className="text-xs text-muted">Prefeitura Municipal</span></div></NavLink>
      <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Navegação principal">{links}</nav>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={() => toggleTheme()} className="grid size-10 place-items-center rounded-lg text-muted hover:bg-surface-muted" aria-label="Alternar tema"><i className="pi pi-sun" /></button>
        {isAuth && <NavLink to="/Singout" className="hidden rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-muted sm:block">Sair</NavLink>}
        {isAuth && (image ? <img src={image} alt="Usuário" className="size-9 rounded-full object-cover" /> : <Avatar label={user?.name?.[0]?.toUpperCase() || "U"} shape="circle" />)}
        <button type="button" onClick={() => setOpen((value) => !value)} className="grid size-10 place-items-center rounded-lg text-muted hover:bg-surface-muted lg:hidden" aria-expanded={open} aria-label="Abrir menu"><i className={`pi ${open ? "pi-times" : "pi-bars"}`} /></button>
      </div>
    </div>
    {open && <nav className="border-t border-border bg-surface p-3 lg:hidden" aria-label="Navegação móvel"><div className="mx-auto grid max-w-7xl gap-1">{links}{isAuth && <NavLink to="/Singout" className={linkClass}>Sair</NavLink>}</div></nav>}
  </header>;
}

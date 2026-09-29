import Link from "next/link";
import { requireWedding } from "@/lib/wedding";
import { signOut } from "./actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { wedding } = await requireWedding();
  return (
    <>
      <nav className="nav">
        <strong>{wedding?.couple_names ?? "Nuptia"}</strong>
        <Link href="/dashboard">Accueil</Link>
        {wedding && <Link href="/dashboard/guests">Invités</Link>}
        {wedding && <Link href="/dashboard/settings">Site et thème</Link>}
        {wedding && <Link href="/dashboard/program">Programme</Link>}
        <form action={signOut} style={{ marginLeft: "auto" }}>
          <button className="btn secondary" type="submit">Se déconnecter</button>
        </form>
      </nav>
      <div className="wrap">{children}</div>
    </>
  );
}

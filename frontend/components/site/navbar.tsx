import { getNavbarLinks } from '@/lib/navbar';
import { NavbarClient } from './navbar-client';

export default async function Navbar() {
  const links = await getNavbarLinks().catch(() => []);
  return <NavbarClient links={links} />;
}

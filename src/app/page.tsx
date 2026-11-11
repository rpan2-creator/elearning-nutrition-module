import LunchBallet from "@/components/home/LunchBallet";
import { Facts, FourRoles, Route, Statement } from "@/components/home/Story";

export default function Home() {
  return (
    <main>
      <LunchBallet />
      <Statement />
      <Facts />
      <FourRoles />
      <Route />
    </main>
  );
}

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => (
  <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary selection:text-on-primary">
    <Navbar />
    <main className="pt-[72px]">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;

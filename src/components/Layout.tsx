import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

const Layout = () => (
  <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary selection:text-on-primary">
    <ScrollToTop />
    <Navbar />
    <main className="pt-[72px]">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;

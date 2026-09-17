import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { bindAnalyticsListeners, trackPageView } from "@/lib/analytics";

/** Records a privacy-friendly page view (path, source, device, dwell time) per route. */
const PageViewTracker = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    bindAnalyticsListeners();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
};

export default PageViewTracker;

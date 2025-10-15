import React from "react";
import { Link } from "react-router-dom";

const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t mt-12">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FoodDE. All rights reserved.</p>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/how-it-works" className="hover:underline">How it works</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/help" className="hover:underline">Help</Link>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;



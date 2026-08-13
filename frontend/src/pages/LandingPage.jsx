import { useState, useEffect } from "react";
import { ReactLenis } from "lenis/react";
import { api } from "../lib/api";
import { fetchContent } from "../lib/firestore";
import { Navbar } from "../components/qwickads/Navbar";
import { Hero } from "../components/qwickads/Hero";
import { EditorialMarquee } from "../components/qwickads/Marquee";
import { ScreenShowcase } from "../components/qwickads/ScreenShowcase";
import { NetworkImpact } from "../components/qwickads/NetworkImpact";
import { HowItWorks } from "../components/qwickads/HowItWorks";
import { LiveSimulation } from "../components/qwickads/LiveSimulation";
import { Industries } from "../components/qwickads/Industries";
import { VideoSection } from "../components/qwickads/VideoSection";
import { Testimonials } from "../components/qwickads/Testimonials";
import { WhyQwickAds } from "../components/qwickads/WhyQwickAds";
import { Footer } from "../components/qwickads/Footer";
import { LeadDialog } from "../components/qwickads/LeadDialog";

export default function LandingPage() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadTitle, setLeadTitle] = useState("Start Your Campaign");
  const [content, setContent] = useState({ hero: [], showcase: [], testimonials: [], stats: [] });

  const openCampaign = () => { setLeadTitle("Start Your Campaign"); setLeadOpen(true); };
  const openDemo = () => { setLeadTitle("Book A Demo"); setLeadOpen(true); };

  useEffect(() => {
    document.title = "QwickAds — Your Brand Travels With Every Passenger";
    const fetchAll = async () => {
      try {
        const [hero, showcase, testimonials, stats] = await Promise.all([
          fetchContent("hero-slides"),
          fetchContent("showcase"),
          fetchContent("testimonials"),
          fetchContent("stats"),
        ]);
        setContent({ hero, showcase, testimonials, stats });
      } catch (e) {
        console.error("Error fetching content:", e);
        /* fall back to bundled defaults inside each section */
      }
    };
    fetchAll();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true }}>
      <div className="grain relative min-h-screen bg-[#080808] text-white antialiased">
        <Navbar onCta={openCampaign} />
        <main>
          <Hero onStart={openCampaign} onDemo={openDemo} slides={content.hero} />
          <EditorialMarquee />
          <ScreenShowcase items={content.showcase} />
          <NetworkImpact stats={content.stats} />
          <HowItWorks />
          <LiveSimulation />
          <Industries />
          <div className="py-8 md:py-12" />
          <VideoSection />
          <Testimonials items={content.testimonials} />
          <WhyQwickAds />
          <Footer onStart={openCampaign} onDemo={openDemo} />
        </main>
        <LeadDialog open={leadOpen} onOpenChange={setLeadOpen} title={leadTitle} />
      </div>
    </ReactLenis>
  );
}

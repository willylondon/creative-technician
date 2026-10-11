import { ArrowDownRight, Check } from "lucide-react";
import { offers } from "@/lib/offers";

export default function ServicesSection() {
  return (
    <section className="services-section" id="services" data-motion="section">
      <div className="site-container">
        <div className="section-marker"><span>01</span><p>Services &amp; pricing</p></div>
        <div className="profile-head">
          <h2>Ways to<br /><span className="services-accent">work together.</span></h2>
          <p>
            Clear scopes and honest starting prices. Every project begins with a short call and a written proposal, so you know exactly what you get before anything is billed.
          </p>
        </div>

        <p className="offer-swipe-hint" aria-hidden="true">Swipe to compare →</p>
        <div className="offer-grid" tabIndex={0} role="region" aria-label="Service packages">
          {offers.map((offer, index) => (
            <article className="offer-card" key={offer.id}>
              <div className="discipline-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{offer.timeline}</span></div>
              <p className="mono-label">{offer.label}</p>
              <h3>{offer.title}</h3>
              <p className="offer-audience">{offer.audience}</p>
              <ul className="offer-includes">
                {offer.includes.map((item) => (
                  <li key={item}><Check aria-hidden="true" />{item}</li>
                ))}
              </ul>
              <div className="offer-price">
                <small>Starting at</small>
                <strong>{offer.price}</strong>
                <span>{offer.priceNote} · {offer.priceUsd}</span>
              </div>
              <a className="offer-cta data-hover" href="#contact" data-service={offer.id}>
                {offer.cta} <ArrowDownRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>

        <p className="offer-footnote">
          Prices in Jamaican dollars; USD amounts are approximate. Final quotes depend on scope — not sure which fits? <a href="#contact" data-service="other">Describe the problem</a> and I’ll recommend the simplest option.
        </p>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  return (
    <div className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <p className="about-kicker">ABOUT INDIA TECHNOLOGY GUIDE</p>

          <h1>
            Technology,
            <span> explained for India.</span>
          </h1>

          <p className="about-hero-text">
            India Technology Guide is a technology publication and learning
            platform built to make technology easier to understand and more
            useful for everyday readers, students, developers, and technology
            enthusiasts.
          </p>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="about-section about-intro">
        <div className="about-section-label">
          <span>01</span>
          <p>WHO WE ARE</p>
        </div>

        <div className="about-section-content">
          <h2>
            Making technology easier to understand.
          </h2>

          <p>
            Technology is changing faster than ever. From artificial
            intelligence and software development to apps, gadgets, and
            emerging technologies, keeping up can sometimes feel overwhelming.
          </p>

          <p>
            India Technology Guide exists to make that journey simpler. We
            create clear, practical, and easy-to-understand technology content
            designed to help readers understand what is happening in the
            technology world and how it can be useful in their everyday lives.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="about-mission">
        <div className="about-mission-inner">
          <p className="about-kicker">OUR MISSION</p>

          <h2>
            Technology should be understandable,
            <span> not intimidating.</span>
          </h2>

          <p>
            Our mission is to bridge the gap between rapidly changing
            technology and the people who want to understand it. We focus on
            useful information, practical knowledge, and straightforward
            explanations.
          </p>
        </div>
      </section>

      {/* WHAT WE COVER */}
      <section className="about-section about-cover">
        <div className="about-section-label">
          <span>02</span>
          <p>WHAT WE COVER</p>
        </div>

        <div className="about-section-content">
          <h2>
            From everyday technology to emerging ideas.
          </h2>

          <div className="about-topic-grid">

            <div className="about-topic-card">
              <span>01</span>
              <h3>Artificial Intelligence</h3>
              <p>
                AI, machine learning, generative AI, and the technologies
                shaping the future.
              </p>
            </div>

            <div className="about-topic-card">
              <span>02</span>
              <h3>Programming & Development</h3>
              <p>
                Programming, web development, software engineering, and
                practical developer guides.
              </p>
            </div>

            <div className="about-topic-card">
              <span>03</span>
              <h3>Software & Apps</h3>
              <p>
                Useful software, applications, digital tools, and the latest
                developments in the software world.
              </p>
            </div>

            <div className="about-topic-card">
              <span>04</span>
              <h3>Technology Guides</h3>
              <p>
                Step-by-step guides, tutorials, explainers, and practical
                solutions to everyday technology problems.
              </p>
            </div>

            <div className="about-topic-card">
              <span>05</span>
              <h3>Gadgets & Devices</h3>
              <p>
                Technology products, devices, features, and the innovations
                behind modern gadgets.
              </p>
            </div>

            <div className="about-topic-card">
              <span>06</span>
              <h3>Emerging Technology</h3>
              <p>
                New technologies, trends, ideas, and developments that could
                shape tomorrow's digital world.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="about-section about-audience">
        <div className="about-section-label">
          <span>03</span>
          <p>WHO WE SERVE</p>
        </div>

        <div className="about-section-content">
          <h2>
            Built for curious minds.
          </h2>

          <div className="about-audience-list">
            <div>
              <strong>Students</strong>
              <span>Learn technology through simple explanations and guides.</span>
            </div>

            <div>
              <strong>Developers</strong>
              <span>Discover practical programming and development resources.</span>
            </div>

            <div>
              <strong>Technology Enthusiasts</strong>
              <span>Stay informed about the technologies shaping the future.</span>
            </div>

            <div>
              <strong>Everyday Users</strong>
              <span>Understand the technology you use every day.</span>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="about-philosophy">
        <div className="about-philosophy-inner">
          <p className="about-kicker">OUR PHILOSOPHY</p>

          <blockquote>
            “Technology moves fast.
            <span> Understanding it shouldn't be difficult.</span>”
          </blockquote>

          <p>
            We believe good technology content doesn't need unnecessary
            complexity. It should be clear, useful, practical, and accessible
            to the people who need it.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div>
          <p className="about-kicker">KEEP EXPLORING</p>

          <h2>
            Curious about what's next?
          </h2>

          <p>
            Explore our latest technology articles, guides, and insights.
          </p>

          <Link to="/" className="about-cta-button">
            Explore Articles
            <span>→</span>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default About;
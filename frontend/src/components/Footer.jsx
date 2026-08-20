import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <h4 className="footer-title">India Technology Guide</h4>
          </div>

          <div className="footer-nav" aria-label="Footer navigation">
            <a href="/about">About Us</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 India Technology Guide. All Rights Reserved.</p>

          <div className="footer-social" aria-label="Social links">
            <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
            <a href="#" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

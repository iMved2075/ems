const Footer = () => {
  return (
    <div>
        <hr />
        <footer className="footer flex justify-around items-center mt-10">
            <div className="footer-content">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
            </div>
            <div className="footer-links flex gap-4">
                <a href="#privacy-policy">Privacy Policy</a>
                <a href="/security-audit">Security Audit</a>
                <a href="/system-status">System Status</a>
            </div>
        </footer>
    </div>
  )
}

export default Footer;

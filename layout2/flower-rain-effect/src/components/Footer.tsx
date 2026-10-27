import { Link } from "react-router-dom"

const Footer: React.FC = () => {
    return (
        <>
            {/* <!-- ====================================== Footer ===================================== --> */}
            <footer>
                <div className="rights-reserved">
                    <h2>All rights reserved by
                        <a href="https://1.envato.market/website-portfolio" target="_blank" rel='noreferrer'> The_Krishna.</a>
                    </h2>
                    <div className="home-media-icon-main-head">
                        <Link to="/">Terms & Conditions</Link>
                        <Link to="/">Privacy Policy</Link>
                    </div>
                </div>
            </footer>

        </>
    )
}

export default Footer
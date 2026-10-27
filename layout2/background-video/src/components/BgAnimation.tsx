import React from 'react'

const BgAnimation: React.FC = () => {
    return (
        <>
            {/* <!-- ====================================== Background Animation ===================================== --> */}
            <video autoPlay muted loop className="background-snow-video">
                <source src="./video/video1.mp4" type="video/mp4" />
            </video>
        </>
    )
}

export default BgAnimation
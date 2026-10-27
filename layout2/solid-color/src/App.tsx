import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './assets/css/swap.css';
import './assets/css/style.css';
import './assets/css/media_query.css';
import "swiper/css";
import "swiper/css/effect-fade";
import ModeButton from "./components/ModeButton.tsx";
import Home from "./pages/Home.tsx";
import BottomTopBtn from "./components/BottomTopBtn.tsx";
import Preloader from "./components/Preloader.tsx";
import useSmoothScroll from "./hooks/useSmoothScroll.ts";
function App() {
  useSmoothScroll();
  return (
    <>
      <Preloader />
      <ModeButton />
      <BottomTopBtn />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;

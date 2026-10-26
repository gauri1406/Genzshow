import React from "react";

import HeroSection from "../components/HeroSection";
import PickForMe from "../components/PickForMe";
import FeaturedSection from "../components/FeaturedSection";
import TrailersSection from "../components/TrailersSection";
import GenZDNACard from "../components/GenZDNACard";

const Home = () => {
    return (
        <>
            <HeroSection />

            <PickForMe />
            <GenZDNACard />

            <FeaturedSection />

            <TrailersSection />
        </>
    );
};

export default Home;
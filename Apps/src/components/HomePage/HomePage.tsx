import HeroSection from "./HeroSection"
import CategoriesSection from "./CategoriesSection"
import TopRatedProviders from "./TopRatedProviders"
import ContactCTA from "./ContactCTA"


export default function HomePage(){
    return(
        <div>
            <HeroSection/>
            <CategoriesSection />
            <TopRatedProviders />
            <ContactCTA />
        </div>
    )
}
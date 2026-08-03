import ServiceHero from "./ServiceHero"
import ServiceSection from "./ServiceSection"
import ContactCTA from "../HomePage/ContactCTA"
export default function ServicePage (){
    return(
        <div>
            <ServiceHero />
            <ServiceSection />
            <ContactCTA />
        </div>
    )
}
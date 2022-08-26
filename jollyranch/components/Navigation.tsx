import React, {FC} from "react";

const navigationItems = [
    {
        id: "home",
        title: "Home",
        href: "https://www.reptilian-renegade.com/"
    },
    {
        id: "staking",
        title: "Staking",
        href: "https://staking.reptilian-renegade.com/"
    },
    {
        id: "raffle",
        title: "Raffle",
        href: "https://raffle.reptilian-renegade.com/"
    },
    {
        id: "portal",
        title: "Portal",
        href: "https://portal.reptilian-renegade.com/"
    }
];
interface NavigationProps {
    activeId: string;
}
/**
 * Component that contains the global menu
 */
const Navigation: FC<NavigationProps>  = ({activeId}) => {

    return (
        <div
            className="bg-black/80 pl-4 block fixed flex z-100 inset-0 bottom-auto md:h-20 backdrop-blur-sm"
            style={{zIndex:998}}
        >
            <div className="flex lg:basis-1/6 xl:lg:basis-1/4 items-center">
                <a
                    href="https://www.reptilian-renegade.com/"
                    className="py-2 md:py-0 pr-4"
                >
                    <img alt="Reptilian Renegade" src="/images/logo.png" className="w-24 md:w-28  xl:w-32 " />
                </a>
            </div>
            <div className="flex sm:flex-grow md:basis-1/2 gap-3 md:gap-6 xl:gap-10 items-center md:flex-grow lg:place-content-center">
                {navigationItems.map((item) => (
                    <a
                        key={item.id}
                        href={item.href}
                        className={`relative indicator whitespace-nowrap flex items-center h-full font-jangkuy text-xs md:text-xl ${activeId === item.id ? 'text-accent' : 'text-secondary-content  hover:text-accent'}`}>
                        {item.title}
                    </a>
                ))}
            </div>
            <div className="lg:basis-1/4  items-center place-content-end pr-4 hidden sm:flex">
                <a href="https://discord.gg/reptilianrenegade" target="_blank" rel="noopener noreferrer">
                    <img src="/images/discord.svg" className="w-4 md:w-6 m-1 md:m-2" />
                </a>
                <a href="https://twitter.com/ReptilianRenegg" target="_blank" rel="noopener noreferrer">
                    <img src="/images/twitter.svg" className="w-4 md:w-6 m-1 md:m-2" />
                </a>
                <a href="https://magiceden.io/creators/reptilian_renegade" target="_blank" rel="noopener noreferrer">
                    <img src="/images/me.svg" className="w-4 md:w-7 m-1 md:m-2" />
                </a>
            </div>
        </div>
    );
}

export default Navigation;

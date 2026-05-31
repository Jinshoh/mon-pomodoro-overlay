
import { Pomodoro } from "./pomodoro.tsx";
import { useTime } from "../provider/pomodoro.tsx";
import { Settings } from "./settings.tsx";

export const TabletView = () => {
    const { channel } = useTime();

    return (
        <div className="tablet-layout">
            <Settings />
            <div className="tablet-left">
                <Pomodoro isTablet={true} />
            </div>
            <div className="tablet-right">
                {channel ? (
                    <iframe
                        src={`https://www.twitch.tv/embed/${channel}/chat?parent=${window.location.hostname}&darkpopout`}
                        height="100%"
                        width="100%"
                        style={{ border: 'none', borderRadius: '16px' }}
                    ></iframe>
                ) : (
                    <div className="tablet-no-channel">
                        <h2>Veuillez configurer votre chaîne dans les paramètres de l'overlay classique d'abord.</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

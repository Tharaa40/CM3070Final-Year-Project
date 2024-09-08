import React, { createContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    const [backgroundSound, setBackgroundSound] = useState(null);
    const [musicEnabled, setMusicEnabled] = useState(false);
    const [volume, setVolume] = useState(1.0);

    // const [soundEffect, setSoundEffect] = useState(null);
    // const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(false);

    useEffect(() => {
        const loadAndPlayMusic = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/sounds/lofi-study.mp3'),
                    { isLooping: true, volume }
                );
                setBackgroundSound(sound);

                if (musicEnabled) {
                    await sound.playAsync();
                }
            } catch (error) {
                console.error('Error loading or playing sound: ', error);
            }
        };

        if (musicEnabled) {
            loadAndPlayMusic();
        } else if (backgroundSound) {
            backgroundSound.stopAsync();
            backgroundSound.unloadAsync();
            setBackgroundSound(null);
        }

        return () => {
            if (backgroundSound) {
                backgroundSound.unloadAsync();
            }
        };
    }, [musicEnabled, volume]);

    // useEffect(() => { //added this
    //     const playSoundEffect = async () => {
    //         if (soundEffectsEnabled) {
    //             try {
    //                 const { sound } = await Audio.Sound.createAsync(
    //                     require('../assets/sounds/lofi-orchestra.mp3')
    //                 );
    //                 setSoundEffect(sound);
    //                 await sound.playAsync();
    //                 sound.setOnPlaybackStatusUpdate((status) => {
    //                     if (status.didJustFinish) {
    //                         sound.unloadAsync();
    //                         setSoundEffect(null);
    //                     }
    //                 });
    //             } catch (error) {
    //                 console.error('Error playing sound effect: ', error);
    //             }
    //         } else if (soundEffect) {
    //             soundEffect.unloadAsync();
    //             setSoundEffect(null);
    //         }
    //     };

    //     playSoundEffect();

    // }, [soundEffectsEnabled]);

    return (
        // <MusicContext.Provider value={{ musicEnabled, setMusicEnabled, volume, setVolume }}>
        //     {children}
        // </MusicContext.Provider>

        <MusicContext.Provider value={{ 
            musicEnabled, setMusicEnabled, 
            volume, setVolume
        }}>
            {children}
        </MusicContext.Provider>
    );
};

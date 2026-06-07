window.onload = function () {

    const cardStates = {};

    Amplitude.init({
        "volume": 100,
        "songs": [
            { "name": "Fear",       "artist": "BEROX", "url": "beats/BEROX-Fear.mp3",       "bpm": "", "key": "" },
            { "name": "Love",       "artist": "BEROX", "url": "beats/BEROX-Love.mp3",       "bpm": "", "key": "" },
            { "name": "Redemption", "artist": "BEROX", "url": "beats/BEROX-Redemption.mp3", "bpm": "", "key": "" },
            { "name": "Sky",        "artist": "BEROX", "url": "beats/BEROX-Sky.mp3",        "bpm": "", "key": "" },
            { "name": "Whence",     "artist": "BEROX", "url": "beats/BEROX-Whence.mp3",     "bpm": "", "key": "" }
        ],
        "callbacks": {
            'play': function () {
                const idx   = String(Amplitude.getActiveIndex());
                const state = cardStates[idx];
                if (state) {
                    Amplitude.setVolume(state.isMuted ? 0 : state.volume);
                }
            }
        }
    });

    const updateSliderStyle = (slider, mousePercent = null) => {
        const value         = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        const colorPlayed   = '#D9121C';
        const colorGhost    = '#666';
        const colorUnplayed = '#444';

        slider.style.background = (mousePercent !== null && mousePercent > value)
            ? `linear-gradient(to right,
                ${colorPlayed}   0%,
                ${colorPlayed}   ${value}%,
                ${colorGhost}    ${value}%,
                ${colorGhost}    ${mousePercent}%,
                ${colorUnplayed} ${mousePercent}%,
                ${colorUnplayed} 100%)`
            : `linear-gradient(to right,
                ${colorPlayed}   0%,
                ${colorPlayed}   ${value}%,
                ${colorUnplayed} ${value}%,
                ${colorUnplayed} 100%)`;
    };

    const beatCards = document.querySelectorAll('.beat');

    function updateCardIcons(card, vol, muted) {
        const spanMute = card.querySelector('.amplitude-mute');
        const spanDown = card.querySelector('.amplitude-volume-down');
        const spanUp   = card.querySelector('.amplitude-volume-up');
        if (!spanMute || !spanDown || !spanUp) return;

        spanMute.classList.remove('icon-visible');
        spanDown.classList.remove('icon-visible');
        spanUp.classList.remove('icon-visible');

        if (vol === 0 || muted) {
            spanMute.classList.add('icon-visible');
        } else if (vol < 50) {
            spanDown.classList.add('icon-visible');
        } else {
            spanUp.classList.add('icon-visible');
        }
    }

    beatCards.forEach(card => {
        const songIndex = card.querySelector('.amplitude-play-pause')
                              .getAttribute('data-amplitude-song-index');
        const spanMute  = card.querySelector('.amplitude-mute');
        const spanDown  = card.querySelector('.amplitude-volume-down');
        const spanUp    = card.querySelector('.amplitude-volume-up');
        const volSlider = card.querySelector('.amplitude-volume-slider');

        cardStates[songIndex] = { volume: 100, isMuted: false, lastVolume: 100 };

        function toggleMute() {
            const state = cardStates[songIndex];

            if (!state.isMuted && state.volume > 0) {
                state.lastVolume = state.volume;
                state.isMuted    = true;
                state.volume     = 0;
            } else {
                state.volume  = state.lastVolume > 0 ? state.lastVolume : 100;
                state.isMuted = false;
            }

            if (volSlider) {
                volSlider.value = state.volume;
                updateSliderStyle(volSlider);
            }

            if (Amplitude.getActiveIndex() == songIndex) {
                Amplitude.setVolume(state.isMuted ? 0 : state.volume);
            }

            updateCardIcons(card, state.volume, state.isMuted);
        }

        if (spanMute) spanMute.addEventListener('click', toggleMute);
        if (spanDown) spanDown.addEventListener('click', toggleMute);
        if (spanUp)   spanUp.addEventListener('click', toggleMute);

        if (volSlider) {
            volSlider.value = 100;
            updateSliderStyle(volSlider);

            volSlider.addEventListener('input', function () {
                const val   = parseInt(this.value);
                const state = cardStates[songIndex];

                state.volume  = val;
                state.isMuted = val === 0;
                if (val > 0) state.lastVolume = val;

                if (Amplitude.getActiveIndex() == songIndex) {
                    Amplitude.setVolume(val);
                }

                updateSliderStyle(this);
                updateCardIcons(card, val, state.isMuted);
            });

            volSlider.addEventListener('mousemove', e => {
                const rect    = volSlider.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                updateSliderStyle(volSlider, percent);
            });

            volSlider.addEventListener('mouseleave', () => {
                updateSliderStyle(volSlider, null);
            });
        }

        updateCardIcons(card, 100, false);
    });

    document.querySelectorAll('.amplitude-song-slider').forEach(slider => {

        slider.addEventListener('mousemove', e => {
            const rect    = slider.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            updateSliderStyle(slider, percent);
        });

        slider.addEventListener('mouseleave', () => {
            updateSliderStyle(slider, null);
        });

        slider.addEventListener('input', function () {
            const songIndex = this.getAttribute('data-amplitude-song-index');
            if (songIndex !== null && Amplitude.getActiveIndex() == songIndex) {
                Amplitude.setSongPlayedPercentage(this.value);
            }
            updateSliderStyle(this);
        });
    });

    setInterval(() => {
        const activeIndex = Amplitude.getActiveIndex();
        const songSlider  = document.querySelector(
            `.amplitude-song-slider[data-amplitude-song-index="${activeIndex}"]`
        );

        if (songSlider && Amplitude.getPlayerState() === 'playing' && !songSlider.matches(':hover')) {
            songSlider.value = Amplitude.getSongPlayedPercentage();
            updateSliderStyle(songSlider);
        }
    }, 100);
};
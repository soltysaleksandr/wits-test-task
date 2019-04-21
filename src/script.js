import './assets/scss/style.scss';
import { debounce } from './debounce';


class App {
    constructor() {
        this.pages = [{
                name: 'screen-1',
                link: './src/components/screen-1.html',
                element: null,
            },
            {
                name: 'screen-2',
                link: './src/components/screen-2.html',
                element: null,
            }
        ]
        this._screen = 'screen-1';

        this.currentElem = null;
        this.mainElem = document.querySelector('.main-container');
        this.animatedScrollElem = document.querySelector('.animate-block');

        this.updateScreen = this.updateScreen.bind(this);

        this.init();
    }

    get screen() {
        return this._screen;
    }

    set screen(value) {
        this._screen = value;

        this.render();
    }

    init() {
        this.get()
            .then(() => this.render());
        this.initListeners();
    }

    initListeners() {
        this.scrollHandle('screen-1', 'up');
        this.scrollHandle('screen-2', 'down');

        this.animatedScrollElem.addEventListener('animationend', (e) => {
            this.animatedScrollElem.classList.remove('animate-block_active', 'animate-block_active_up', 'animate-block_active_down');
        })
    }

    get() {

        return Promise.all(
            this.pages.map((item, index) => {
                const { name, link, } = item;
                const parser = new DOMParser();
                return fetch(link)
                    .then(response => response.text())
                    .then(data => parser.parseFromString(data, 'text/html'))
                    .then(parsedDocument => this.pages[index].element = parsedDocument.getElementById(name))
                    .catch((err) => console.error(err))
            })
        )
    }



    scrollHandle(screen, direction) {
        const upadateScreenDebounced = debounce(this.updateScreen, 1400);

        document.addEventListener('wheel', (e) => {
            let wheelDirection;
            if (direction === 'up') { wheelDirection = e.wheelDeltaY >= 0; }
            if (direction === 'down') { wheelDirection = e.wheelDeltaY <= 0; }
            if (wheelDirection && this.screen !== screen) {
                this.animatedScrollElem.classList.add('animate-block_active', 'animate-block_active_' + direction);
                upadateScreenDebounced(screen);
            }
        })
    }

    animate() {
        this.animatedElems = document.querySelectorAll('.animate');
        this.animatedElems.forEach((item, index) => {
            setTimeout(() => item.classList.add('animate_fade-in'), 300 * index);

            item.addEventListener('animationend', (e) => {
                item.style.opacity = '1';
                item.classList.remove('animate_fade-in');
            })
        });
    }

    updateScreen(value) {
        this.screen = value;
        this.animatedElems.forEach((item) => item.style.opacity = '0');
    }

    render() {
        this.currentElem = this.pages.find(item => item.name === this.screen).element;
        this.mainElem.replaceWith(this.currentElem);
        document.body.dataset.screen = this.screen;

        this.mainElem = document.querySelector('.main-container');

        this.animate();
    }
}

console.log(new App());
import { Config } from './config.ts';

//@ts-ignore
import Deck, { VERSION } from './reveal.js';

/**
 * Expose the Reveal class to the window. To create a
 * new instance:
 * let deck = new Reveal( document.querySelector( '.reveal' ), {
 *   controls: false
 * } );
 * deck.initialize().then(() => {
 *   // reveal.js is ready
 * });
 */
let Reveal: {
	initialize: (options?: Config) => Promise<void>;
	[key: string]: any;
} = Deck;

/**
 * The below is a thin shell that mimics the pre 4.0
 * reveal.js API and ensures backwards compatibility.
 * This API only allows for one Reveal instance per
 * page, whereas the new API above lets you run many
 * presentations on the same page.
 *
 * Reveal.initialize( { controls: false } ).then(() => {
 *   // reveal.js is ready
 * });
 */

type RevealApiFunction = (...args: any[]) => any;

let enqueuedAPICalls: RevealApiFunction[] = [];

Reveal.initialize = (options?: Config) => {
	// Create our singleton reveal.js instance
	Object.assign(Reveal, new Deck(document.querySelector('.reveal'), options));

	// Invoke any enqueued API calls
	enqueuedAPICalls.map((method) => method(Reveal));

	return Reveal.initialize();
};

/**
 * The pre 4.0 API let you add event listener before
 * initializing. We maintain the same behavior by
 * queuing up premature API calls and invoking all
 * of them when Reveal.initialize is called.
 */
['configure', 'on', 'off', 'addEventListener', 'removeEventListener', 'registerPlugin'].forEach(
	(method) => {
		Reveal[method] = (...args: any) => {
			enqueuedAPICalls.push((deck) => deck[method].call(null, ...args));
		};
	}
);

Reveal.isReady = () => false;

Reveal.VERSION = VERSION;

export default Reveal;

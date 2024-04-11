/**
 * @fileoverview This file contains the Svelte store definitions for messages and isConnected.
 * @module stores/store
 */

import { writable } from 'svelte/store';

/**
 * A writable Svelte store that holds an array of messages.
 * @type {import('svelte/store').Writable<Array>}
 */
export const messages = writable([]);

/**
 * A writable Svelte store that holds the connection status.
 * @type {import('svelte/store').Writable<boolean>}
 */
export const isConnected = writable(false);
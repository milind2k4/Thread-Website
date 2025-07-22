// Import required modules
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PostParser } from './js/core/PostParser.js';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadData() {
    try {
        const data = await readFile(join(__dirname, 'sampleResponse.json'), 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading JSON file:', error);
        throw error;
    }
}

import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

// Set up JSDOM for DOMParser
const { window } = new JSDOM('', { url: 'http://localhost' });
global.window = window;
global.document = window.document;
global.DOMParser = window.DOMParser;



// Set fetch globally for node-fetch
global.fetch = fetch;

async function testPostParser() {
    // const redditSearch = new RedditSearch();
    
    try {
        // const threads = await redditSearch.searchThread('Rent-a-Girlfriend Season 4', '2');
        // if (!threads || threads.length === 0) {
        //     throw new Error('No threads found');
        // }

        // const firstThread = threads[0];
        // const response = await fetch(`${firstThread.url}.json`);
        // console.log(response);
        
        const data = await loadData();

        console.log('\nParsing post and comments...');
        const post = PostParser.parsePost(data);
        console.log(post.comments[0]);     

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testPostParser();
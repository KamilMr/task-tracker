#!/usr/bin/env node

import React from 'react';
import {program} from 'commander';

import {clearTerminal} from './utils.js';

program.version('1.0.0');

import {render} from 'ink';
import App from './app.js';

clearTerminal();
render(<App />);

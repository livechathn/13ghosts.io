// terminal.js — 13Ghosts.io Terminal Typing System
// Shared across all pages. No dependencies.

/**
 * Type text character by character into an element.
 * Appends a blinking cursor automatically.
 * @param {HTMLElement} element  Target element (will be cleared)
 * @param {string}      text     Text to type
 * @param {number}      speed    Base ms per character (default 50)
 * @param {Function}    callback Optional callback when done
 */
function typeText(element, text, speed, callback) {
    speed = speed !== undefined ? speed : 50;
    var i = 0;
    element.textContent = '';

    var cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    element.appendChild(cursor);

    function tick() {
        if (i < text.length) {
            cursor.before(text.charAt(i));
            i++;
            setTimeout(tick, speed + Math.random() * 28);
        } else if (typeof callback === 'function') {
            setTimeout(callback, 220);
        }
    }
    tick();
}

/**
 * Build a terminal prompt line with typed command + optional output.
 * @param {HTMLElement} container  Where to append
 * @param {string}      promptStr  e.g. '[13G] ~ $'
 * @param {string}      command    e.g. 'scan --deep /dev/possessed'
 * @param {string[]}    output     Lines to appear after command
 * @param {number}      speed      Typing speed in ms
 * @param {Function}    callback   Called when all output is done
 */
function typePrompt(container, promptStr, command, output, speed, callback) {
    speed = speed !== undefined ? speed : 45;
    output = output || [];

    var lineEl = document.createElement('div');

    var promptSpan = document.createElement('span');
    promptSpan.className = 'term-prompt';
    promptSpan.textContent = promptStr + ' ';
    lineEl.appendChild(promptSpan);

    var cmdSpan = document.createElement('span');
    cmdSpan.className = 'term-cmd';
    lineEl.appendChild(cmdSpan);
    container.appendChild(lineEl);

    typeText(cmdSpan, command, speed, function () {
        if (!output.length) {
            if (typeof callback === 'function') callback();
            return;
        }
        output.forEach(function (line, idx) {
            setTimeout(function () {
                var out = document.createElement('div');
                out.className = 'term-out';
                out.textContent = line;
                container.appendChild(out);
                if (idx === output.length - 1 && typeof callback === 'function') {
                    callback();
                }
            }, 180 * (idx + 1));
        });
    });
}

// ─── Auto-init via data attributes ───
// Elements with data-typetext will be typed on DOMContentLoaded.
// data-typespeed: ms per char (default 55)
// data-typedelay: ms before starting (default 0)

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-typetext]').forEach(function (el) {
        var text  = el.getAttribute('data-typetext');
        var speed = parseInt(el.getAttribute('data-typespeed') || '55', 10);
        var delay = parseInt(el.getAttribute('data-typedelay') || '0', 10);
        setTimeout(function () {
            typeText(el, text, speed);
        }, delay);
    });
});
